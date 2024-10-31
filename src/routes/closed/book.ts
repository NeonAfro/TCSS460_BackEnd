/**
 * @apiDefine DBError
 * @apiError (500: Database Error) {String} message "Error on Server Side"
 */

/**
 * @api {get} /book/all Request to get all book
 * @apiName GetAllbook
 * @apiGroup book
 *
 * @apiSuccess {Object[]} entry the book object containing information of the book <code>name</code>
 *
 * @apiUse DBError
 */

/**
 * @api {get} /book/:author Request to get all book by author
 * @apiName GetBookByAuthor
 * @apiGroup book
 *
 * @apiSuccess {Object[]} entry the book object containing information of the book from author <code>author</code>
 * @apiParam {string} author the author to look up.
 *
 * @apiError (404: Name Not Found) {string} message "Author not found"
 * @apiUse DBError
 */

/**
 * @api {get} /book/:isbn Request to get all book by isbn
 * @apiName GetBookByISBN
 * @apiGroup book
 *
 * @apiSuccess {Object[]} entry the book object containing information of the book from author <code>author</code>
 * @apiParam {string} isbn the isbn to look up.
 *
 * @apiError (404: Name Not Found) {string} message "Author not found"
 * @apiUse DBError
 */

/**
 * @api {get} /book/:ISBN Request to get all book by ISBN
 * @apiName GetBookByISBN
 * @apiGroup book
 *
 * @apiSuccess {Object[]} entry the book object containing information of the book from ISBN <code>author</code>
 * @apiParam {string} ISBN the ISBN to look up.
 *
 * @apiError (404: Name Not Found) {string} message "Author not found"
 * @apiUse DBError
 */

/**
 * @api {get} /book/:title Request to get all book by Title
 * @apiName GetBookByTitle
 * @apiGroup book
 *
 * @apiSuccess {Object[]} entry the book object containing information of the book from title <code>author</code>
 * @apiParam {string} title the title to look up.
 *
 * @apiError (404: Name Not Found) {string} message "Author not found"
 * @apiUse DBError
 */

/**
 * @api {get} /book/:rating Request to get all book by rating
 * @apiName GetBookByRating
 * @apiGroup book
 *
 * @apiSuccess {Object[]} entry the book object containing information of the book from title <code>author</code>
 * @apiParam {string} rating the rating to look up.
 *
 * @apiError (404: Name Not Found) {string} message "Author not found"
 * @apiUse DBError
 */

/**
 * @api {get} /book Request to retrieve entries by year
 *
 * @apiDescription Request to retrieve all the entries of <code>year</code>
 *
 * @apiName GetAllBookByYear
 * @apiGroup book
 *
 * @apiQuery {number} year the year in which to retrieve all entries in that year
 *
 * @apiSuccess {String[]} entries the aggregate of all entries with <code>priority</code> as the following string:
 *      "{<code>priority</code>} - [<code>name</code>] says: <code>message</code>"
 *
 * @apiError (400: Invalid Priority) {String} message "Invalid or missing Priority  - please refer to documentation"
 * @apiError (404: No messages) {String} message "No Priority <code>priority</code> messages found"
 * @apiUse DBError
 */

/**
 * @api {post} /newBook Request to add a new book
 *
 * @apiDescription Request to add a new book with title, author, published date, ISBN, and an optional message.
 *
 * @apiName PostBook
 * @apiGroup book
 *
 * @apiBody {string} title the new book title
 * @apiBody {string} author the new book author
 * @apiBody {string} date the new published date
 * @apiBody {number} isbn the new isbn
 * @apiBody {string} [message] An optional message or note associated with the book
 *
 * @apiSuccess (201: Created) {Object} entry the details of the newly created book entry
 * @apiSuccess (201: Created) {String} entry.title Title of the new book
 * @apiSuccess (201: Created) {String} entry.author Author of the new book
 * @apiSuccess (201: Created) {String} entry.date Publication date of the book
 * @apiSuccess (201: Created) {Number} entry.isbn ISBN number of the book
 * @apiSuccess (201: Created) {String} [entry.message] Optional message associated with the book
 *
 * @apiError (400: Bad Request) {String} message "Book with isbn already exists"
 * @apiError (400: Missing Parameters) {String} message "Missing required information - please refer to documentation"
 * @apiUse DBError
 */

/**
 * @api {put} /updateRating Request to change an entry
 *
 * @apiDescription Request to replace or change the rating of a book
 *
 * @apiName PutBookRating
 * @apiGroup book
 *
 * @apiBody {String} title the title of the book entry
 * @apiBody {String} author the author of the book entry
 * @apiBody {number} rating the rating that the book rating will be updated to
 * @apiBody {string} [message] An optional message or note associated with the book rating
 *
 * @apiSuccess (200: OK) {Object} entry Details of the updated book entry.
 * @apiSuccess (200: OK) {String} entry.title The title of the updated book.
 * @apiSuccess (200: OK) {String} entry.author The author of the updated book.
 * @apiSuccess (200: OK) {Number} entry.rating The new rating of the book.
 * @apiSuccess (200: OK) {String} [entry.message] The optional message associated with the book rating.
 *
 * @apiError (404: Not Found) {String} message "Book not found" if the specified book does not exist.
 * @apiError (400: Bad Request) {String} message "Missing required information - please refer to documentation" if required parameters are missing.
 * @apiUse DBError
 */

/**
 * @api {delete} /deleteBook Request to delete a book by ISBN
 *
 * @apiDescription Request to delete a specific book entry by providing its ISBN.
 *
 * @apiName DeleteBookByISBN
 * @apiGroup book
 *
 * @apiQuery {Number} isbn The ISBN of the book to be deleted.
 *
 * @apiSuccess (200: OK) {String} message "Book with ISBN <code>isbn</code> has been successfully deleted."
 *
 * @apiError (404: Not Found) {String} message "Book not found" if no book with the specified ISBN exists.
 * @apiError (400: Bad Request) {String} message "Invalid or missing ISBN - please refer to documentation" if the ISBN parameter is missing or invalid.
 * @apiUse DBError
 */

/**
 * @api {delete} /deleteBooks Request to delete a range of books
 *
 * @apiDescription Request to delete a range or series of book entries by specifying start and end dates or a range of ISBNs.
 *
 * @apiName DeleteBookByRange
 * @apiGroup book
 *
 * @apiQuery {String} [startDate] The publication date to start deleting books from, in YYYY-MM-DD format.
 * @apiQuery {String} [endDate] The publication date to delete books until, in YYYY-MM-DD format.
 * @apiQuery {Number} [startISBN] The starting ISBN in the range to delete.
 * @apiQuery {Number} [endISBN] The ending ISBN in the range to delete.
 *
 * @apiSuccess (200: OK) {String} message "Successfully deleted <code>count</code> books within the specified range."
 *
 * @apiError (404: Not Found) {String} message "No books found in the specified range" if no books match the given criteria.
 * @apiError (400: Bad Request) {String} message "Invalid or missing range parameters - please refer to documentation" if neither a date range nor an ISBN range is provided or if the parameters are invalid.
 * @apiUse DBError
 */
