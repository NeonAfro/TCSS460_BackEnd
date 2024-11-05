import express, { Request, Response, Router } from 'express';
import { IBook, IRatings, IUrlIcon } from '../../core/models';
import { pool, validationFunctions } from '../../core/utilities';

const bookRouter: Router = express.Router();

const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;
const format = (row) => ({
    id: row.id,
    IBook: {
        isbn13: row.isbn13,
        authors: row.authors,
        publication: row.publication_year,
        original_title: row.original_title,
        title: row.title,
        ratings: {
            average: row.rating_avg,
            count: row.rating_count,
            rating_1: row.rating_1_star,
            rating_2: row.rating_2_star,
            rating_3: row.rating_3_star,
            rating_4: row.rating_4_star,
            rating_5: row.rating_5_star,
        } as IRatings,
        icons: {
            large: row.image_url,
            small: row.image_small_url,
        } as IUrlIcon,
    },
});

/**
 * @apiDefine DBError
 * @apiError (500: Database Error) {String} message "server error - contact support"
 */

/**
 * @apiDefine JWT
 * @apiHeader {String} Authorization The string "Bearer " + a valid JSON Web Token (JWT).
 */

/**
 * @apiDefine JSONError
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 */

/**
 * @apiDefine InvalidJWT
 * @apiError (401: Unauthorized) {String} message "Invalid or missing JWT token"
 */

/**
 * @apiDefine ForbiddenJWT
 * @apiError (403: Forbidden) {String} message "Token is not valid"
 */

/**
 * @api {get} /book/all Request to get all books
 * @apiName GetAllBooks
 * @apiGroup book
 *
 * @apiSuccess (200: OK) {Object[]} entry List of all book entries.
 * @apiSuccess (200: OK) {Object} entry Individual book entry.
 * @apiSuccess (200: OK) {Number} entry.id Unique identifier of the book.
 * @apiSuccess (200: OK) {Number} entry.isbn13 13-digit ISBN number of the book.
 * @apiSuccess (200: OK) {String} entry.authors List of authors of the book.
 * @apiSuccess (200: OK) {Number} entry.publication_year Year the book was published.
 * @apiSuccess (200: OK) {String} entry.original_title Original title of the book, if different.
 * @apiSuccess (200: OK) {String} entry.title Title of the book.
 * @apiSuccess (200: OK) {Number} entry.rating_avg Average rating of the book.
 * @apiSuccess (200: OK) {Number} entry.rating_count Total number of ratings the book has received.
 * @apiSuccess (200: OK) {Number} entry.rating_1_star Count of 1-star ratings.
 * @apiSuccess (200: OK) {Number} entry.rating_2_star Count of 2-star ratings.
 * @apiSuccess (200: OK) {Number} entry.rating_3_star Count of 3-star ratings.
 * @apiSuccess (200: OK) {Number} entry.rating_4_star Count of 4-star ratings.
 * @apiSuccess (200: OK) {Number} entry.rating_5_star Count of 5-star ratings.
 * @apiSuccess (200: OK) {String} entry.image_url URL for the book's cover image.
 * @apiSuccess (200: OK) {String} entry.image_small_url URL for the smaller version of the book's cover image.
 *
 * @apiUse DBError
 */
bookRouter.get('/all', async (request: Request, response: Response) => {
    try {
        const theQuery = `SELECT *
        FROM books 
        ORDER BY id
        LIMIT $1
        OFFSET $2`;

        const limit: number =
            isNumberProvided(request.query.limit) && +request.query.limit > 0
                ? +request.query.limit
                : 10;
        const offset: number =
            isNumberProvided(request.query.offset) && +request.query.offset >= 0
                ? +request.query.offset
                : 0;

        const values = [limit, offset];

        const { rows } = await pool.query(theQuery, values);

        const result = await pool.query(
            'SELECT count(*) AS exact_count FROM books;'
        );
        const count = result.rows[0].exact_count;

        const formattedRows = rows.map(format);
        console.log('rows:', formattedRows);

        response.send({
            entries: rows.map(format),
            pagination: {
                totalRecords: count,
                limit,
                offset,
                nextPage: limit + offset,
            },
        });
    } catch (error) {
        console.error('Error executing query:', error);
        response.status(500).send({
            message: 'Internal server error',
        });
    }
});

/**
 * @api {get} /book/:author Request to get all books by author
 * @apiName GetBooksByAuthor
 * @apiGroup book
 *
 * @apiParam {String} author The author to look up.
 *
 * @apiSuccess (200: OK) {Object[]} entry List of book objects by the specified author.
 *
 * @apiError (404: Name Not Found) {string} message "Author not found"
 * @apiUse DBError
 */
bookRouter.get('/:author', (request: Request, response: Response) => {
    // Implementation here
});

/**
 * @api {get} /book/:isbn Request to get all books by ISBN
 * @apiName GetBooksByISBN
 * @apiGroup book
 *
 * @apiParam {String} isbn The ISBN to look up.
 *
 * @apiSuccess (200: OK) {Object} entry The book object containing information of the book with the specified ISBN.
 *
 * @apiError (404: Name Not Found) {string} message "ISBN not found"
 * @apiUse DBError
 */
bookRouter.get('/:isbn', (request: Request, response: Response) => {
    // Implementation here
});

/**
 * @api {get} /book/:title Request to get all books by Title
 * @apiName GetBooksByTitle
 * @apiGroup book
 *
 * @apiParam {String} title The title to look up.
 *
 * @apiSuccess (200: OK) {Object} entry The book object containing information of the book with the specified title.
 *
 * @apiError (404: Name Not Found) {string} message "Title not found"
 * @apiUse DBError
 */
bookRouter.get('/:title', (request: Request, response: Response) => {
    // Implementation here
});

/**
 * @api {get} /book/:rating Request to get all books by rating
 * @apiName GetBooksByRating
 * @apiGroup book
 *
 * @apiParam {String} rating The rating to look up.
 *
 * @apiSuccess (200: OK) {Object[]} entry List of book objects with the specified rating.
 *
 * @apiError (404: Name Not Found) {string} message "Rating not found"
 * @apiUse DBError
 */
bookRouter.get('/:rating', (request: Request, response: Response) => {
    // Implementation here
});

/**
 * @api {get} /book Request to retrieve entries by year
 *
 * @apiDescription Request to retrieve all the entries of <code>year</code>
 *
 * @apiName GetAllBooksByYear
 * @apiGroup book
 *
 * @apiQuery {Number} year The year in which to retrieve all entries.
 *
 * @apiSuccess (200: OK) {String[]} entries The aggregate of all entries with the specified year.
 *
 * @apiError (400: Invalid Priority) {String} message "Invalid or missing Priority  - please refer to documentation"
 * @apiError (404: No messages) {String} message "No Priority <code>priority</code> messages found"
 * @apiUse DBError
 */
bookRouter.get('/', (request: Request, response: Response) => {
    // Implementation here
    // needs query parameters
});

/**
 * @api {post} /book Request to add a new book
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
bookRouter.post('/', (request: Request, response: Response) => {
    // Implementation here
});

/**
 * @api {put} /book Request to change an entry
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
bookRouter.put('/', (request: Request, response: Response) => {
    // Implementation here
});

/**
 * @api {delete} /book/:isbn Request to delete a book by ISBN
 *
 * @apiDescription Request to delete a specific book entry by providing its ISBN.
 *
 * @apiName DeleteBooksByISBN
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
bookRouter.delete('/:isbn', (request: Request, response: Response) => {
    // Implementation here
});

/**
 * @api {delete} /book Request to delete a range of books by year or ISBN
 *
 * @apiDescription Request to delete a range or series of book entries by specifying start and end dates or a range of ISBNs.
 *
 * @apiName DeleteBooksByRange
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
bookRouter.delete('/', (request: Request, response: Response) => {
    // Implementation here
    // needs query parameters
});

export { bookRouter };
