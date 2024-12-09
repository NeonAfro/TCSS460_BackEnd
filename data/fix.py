# Orignally created by Abraham Engebretson
# Modified by Jeremiah Brenio

import csv, re, time
from difflib import get_close_matches # String matching library
from googletrans import Translator  # pip install googletrans==4.0.0-rc1

translator = Translator()

isbnSet = set()
arrRepeatISBNs = []
arrNegativePubYears = []
numNonEnglishTitles = 0
numComplexMatches = 0
numSimpleMatches = 0
numNonMatches = 0

# Regular expression to detect non-English alphabet characters
# u0000-u007F: Basic Latin for example: a, b, c, 1, 2, 3
# u00C0-u017F: Latin-1 Supplement for example: é, ñ, ü
non_english_pattern = re.compile(r"[^\u0000-\u007F\u00C0-\u017F\s,.'’]")

# csv format:
# book_id,isbn13,authors,original_publication_year,original_title,title,
# average_rating,ratings_count,ratings_1,ratings_2,ratings_3,ratings_4,ratings_5,image_url,small_image_url
# discrepencies starts after 75 rows

with open("books.csv", newline="", encoding="utf-8") as oldBooks:
    with open("new-books.csv", "w", newline="", encoding="utf-8") as newBooks:
        oldReader = csv.reader(oldBooks, delimiter=',', quotechar='"')
        newReader = csv.writer(newBooks, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        count = 0
        origTitleList = []
        origTransTitleList = {} # Dict of translated titles to their original foreign titles
        for row in oldReader:
            # skip/write header
            if count == 0:
                count += 1
                newReader.writerow(row)
                continue
            
            newRow = row.copy()
            
            isbn = row[1]
            if isbn in isbnSet:
                arrRepeatISBNs.append(count + 1)
                while isbn in isbnSet:
                    isbn = str(int(isbn) + 1) # Increment the ISBN by 1 if it's a repeat
                newRow[1] = isbn
            else:
                isbnSet.add(isbn)
            
            pubYear = int(row[3])
            if pubYear < 0:
                arrNegativePubYears.append(count + 1)
                pubYear = pubYear * -1  # Multiply by -1 for negative publication years
            newRow[3] = str(pubYear)
            
            # skip first 74 rows while fixing isbn and pubYear
            if count <= 74:
                count += 1
                newReader.writerow(newRow)
                continue
            #if count >= 80: break
            
            origTitle = row[4]
            title = row[5]
            
            # Check if the original title contains non-English characters i.e russian, japanese, etc
            if non_english_pattern.search(origTitle):
                translated_title = translator.translate(origTitle, dest='en').text
                print(f"Translating {origTitle}...")
                time.sleep(1)  # Add a 1-second delay after each translation to avoid Google's rate limit exception
                origTransTitleList[translated_title] = origTitle
                origTitle = translated_title
                print(f"Translated title: {origTitle}")
                numNonEnglishTitles += 1
                
            origTitleList.insert(0, origTitle)

            simpleCheck = False
            for titleIdx in origTitleList:
                if titleIdx in title or title in titleIdx:
                    print(f"Simple Match [{titleIdx}] FOR [{title}] AT ROW {count}")
                    if titleIdx in origTransTitleList:
                        origTitle = origTransTitleList[titleIdx] # Get the original foreign title
                        origTransTitleList.pop(titleIdx)
                        origTitleList.remove(titleIdx)
                    else:
                        origTitle = titleIdx
                        origTitleList.remove(titleIdx)
                    numSimpleMatches += 1
                    simpleCheck = True
                    break
            
            # If the title is not a simple substring of the original title
            # then use get_close_matches to find the closest match
            if not simpleCheck:
                
                # trial/error'd minimum score for apporiximately best match
                BEST_CUTOFF = 0.6 # less = more matches less accurate; more = less matches more accurate
                matches = get_close_matches(title, origTitleList, n=1, cutoff=BEST_CUTOFF)
                if matches:
                    print(f"Complex Match [{matches[0]}] FOR [{title}] AT ROW {count}")
                    if matches[0] in origTransTitleList:
                        origTitle = origTransTitleList[matches[0]] # Get the original foreign title
                        origTransTitleList.pop(matches[0])
                        origTitleList.remove(matches[0])
                    else:
                        origTitle = matches[0]
                        origTitleList.remove(matches[0])
                    numComplexMatches += 1
                else:
                    print(f"No match found FOR [{title}], will replace [{origTitle}] with [{title}] AT ROW {count}")
                    origTitle = title
                    numNonMatches += 1
            
            newRow[4] = origTitle

            newReader.writerow(newRow)
            print(f"Processed {count} rows...")
            count += 1
            simpleCheck = False
            
print(f"Number of repeat ISBNs (Fixed): {len(arrRepeatISBNs)} at rows {arrRepeatISBNs}")
print(f"\nNumber of Negative Publication Years (Fixed): {len(arrNegativePubYears)} at rows {arrNegativePubYears}")
print("Number of simple match fixes: ", numSimpleMatches)
print("Number of complex match fixes: ", numComplexMatches)
print("Number of non-match fixes: ", numNonMatches)
print("Number of non-English titles: ", numNonEnglishTitles)

# TESTING FOR REPEAT ISBNs AND NEGATIVE PUBLICATION YEARS

isbnSet = set()
numRepeatISBNs = 0
numNegativePubYears = 0

with open("new-books.csv", newline="", encoding="utf-8") as newBooks:
    newReader = csv.reader(newBooks, delimiter=',', quotechar='"')
    count = 0
    print("\nTesting for repeat ISBNs and negative publication years...")
    for row in newReader:
        if count == 0:
            count += 1
            continue

        isbn = row[1]
        if isbn in isbnSet:
            numRepeatISBNs += 1
        else:
            isbnSet.add(isbn)
        
        pubYear = int(row[3])
        if pubYear < 0:
            numNegativePubYears += 1

        count += 1
            
print("\nNumber of repeat ISBNs: ", numRepeatISBNs)
print("\nNumber of Negative Publication Years: ", numNegativePubYears)