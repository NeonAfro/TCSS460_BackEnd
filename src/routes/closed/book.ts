import express, { NextFunction, Request, Response, Router } from 'express';
import { IBook, IRatings, IUrlIcon } from '../../core/models';
import { pool, validationFunctions } from '../../core/utilities';

const bookRouter: Router = express.Router();
const { isStringProvided, isNumberProvided } = validationFunctions;

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

interface IBookRequest extends Request {
    body: IBook;
}

/**
 * @apiDefine DBError
 * @apiError (500: Database Error) {String} message "server error - contact support"
 */

/**
 * @apiDefine JWT
 * @apiHeader {String} Authorization The string "Bearer " + a valid JSON Web Token (JWT).
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
 * @apiUse JWT
 *
 * @apiQuery {number} limit the number of entry objects to return. Note, if a value less than
 * 0 is provided or a non-numeric value is provided or no value is provided, the default limit
 * amount of 10 will be used.
 *
 * @apiQuery {number} offset the number to offset the lookup of entry objects to return. Note,
 * if a value less than 0 is provided or a non-numeric value is provided or no value is provided,
 * the default offset of 0 will be used.
 *
 * @apiSuccess (200: OK) {Object[]} entries List of all book entries.
 * @apiSuccess (200: OK) {Number} entries.id Unique identifier of the book.
 * @apiSuccess (200: OK) {Object} entries.IBook Individual book entry.
 * @apiSuccess (200: OK) {Number} entries.IBook.isbn13 13-digit ISBN number of the book.
 * @apiSuccess (200: OK) {String} entries.IBook.authors List of author(s) of the book.
 * @apiSuccess (200: OK) {Number} entries.IBook.publication_year Year the book was published.
 *
 * @apiSuccess (200: OK) {Object} entries.IBook.ratings Ratings
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_avg Average rating of the book.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_count Total ratings count.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_1_star Count of 1-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_2_star Count of 2-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_3_star Count of 3-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_4_star Count of 4-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_5_star Count of 5-star ratings.
 *
 * @apiSuccess (200: OK) {Object} entries.IBook.icons Icons
 * @apiSuccess (200: OK) {String} entries.IBook.icons.image_url URL of the book's cover image.
 * @apiSuccess (200: OK) {String} entries.IBook.icons.image_small_url Small image URL.
 *
 * @apiSuccess (200: OK) {Object} pagination metadata results from this paginated query
 * @apiSuccess (200: OK) {number} pagination.totalRecords the most recent count on the total amount of entries. May be stale.
 * @apiSuccess (200: OK) {number} pagination.limit the number of entry objects to returned.
 * @apiSuccess (200: OK) {number} pagination.offset the number used to offset the lookup of entry objects.
 * @apiSuccess (200: OK) {number} pagination.nextPage the offset that should be used on a preceding call to this route.
 *
 * @apiUse ForbiddenJWT
 * @apiUse InvalidJWT
 * @apiUse DBError
 *
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

        response.status(200).send({
            entries: rows.map(format),
            pagination: {
                totalRecords: count,
                limit,
                offset,
                nextPage: limit + offset,
            },
        });
        return;
    } catch (error) {
        console.error('Error executing query:', error);
        response.status(500).send({
            message: 'Internal server error',
        });
    }
});

/**
 * @api {get} /book/author/:author Request to get all books by author
 * @apiName GetBooksByAuthor
 * @apiGroup book
 *
 * @apiUse JWT
 *
 * @apiParam {String} author The author to look up.
 *
 * @apiSuccess (200: OK) {Object[]} entries List of all book entrie(s) from the author.
 * @apiSuccess (200: OK) {Number} entries.id Unique identifier of the book.
 * @apiSuccess (200: OK) {Object} entries.IBook Individual book entry.
 * @apiSuccess (200: OK) {Number} entries.IBook.isbn13 13-digit ISBN number of the book.
 * @apiSuccess (200: OK) {String} entries.IBook.authors List of author(s) of the book.
 * @apiSuccess (200: OK) {Number} entries.IBook.publication_year Year the book was published.
 *
 * @apiSuccess (200: OK) {Object} entries.IBook.ratings Ratings
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_avg Average rating of the book.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_count Total ratings count.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_1_star Count of 1-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_2_star Count of 2-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_3_star Count of 3-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_4_star Count of 4-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_5_star Count of 5-star ratings.
 *
 * @apiSuccess (200: OK) {Object} entries.IBook.icons Icons
 * @apiSuccess (200: OK) {String} entries.IBook.icons.image_url URL of the book's cover image.
 * @apiSuccess (200: OK) {String} entries.IBook.icons.image_small_url Small image URL.
 *
 * @apiError (404: Name Not Found) {string} message "Author not found"
 *
 * @apiUse DBError
 */
bookRouter.get(
    '/author/:author',
    async (request: Request, response: Response) => {
        // Implementation here
        try {
            const theQuery = `SELECT * 
        FROM books WHERE authors=$1 
        ORDER BY id`;

            const values = [request.params.author];

            const { rows } = await pool.query(theQuery, values);

            if (rows.length === 0) {
                response.status(404).send({
                    message: 'Author not Found',
                });
                return;
            }

            const formattedRows = rows.map(format);
            console.log('rows:', formattedRows);

            response.status(200).send({
                entries: rows.map(format),
            });
        } catch (error) {
            console.error('Error executing query:', error);
            response.status(500).send({
                message: 'Internal Server Error',
            });
        }
    }
);

/**
 * @api {get} /book/isbn/:isbn Request to get all books by ISBN
 * @apiName GetBooksByISBN
 * @apiGroup book
 *
 * @apiUse JWT
 *
 * @apiParam {String} isbn The ISBN to look up.
 *
 * @apiSuccess (200: OK) {Object[]} entries List of all book entrie(s) (should be one entry) with the specified ISBN.
 * @apiSuccess (200: OK) {Number} entries.id Unique identifier of the book.
 * @apiSuccess (200: OK) {Object} entries.IBook Individual book entry.
 * @apiSuccess (200: OK) {Number} entries.IBook.isbn13 13-digit ISBN number of the book.
 * @apiSuccess (200: OK) {String} entries.IBook.authors List of author(s) of the book.
 * @apiSuccess (200: OK) {Number} entries.IBook.publication_year Year the book was published.
 *
 * @apiSuccess (200: OK) {Object} entries.IBook.ratings Ratings
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_avg Average rating of the book.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_count Total ratings count.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_1_star Count of 1-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_2_star Count of 2-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_3_star Count of 3-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_4_star Count of 4-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_5_star Count of 5-star ratings.
 *
 * @apiSuccess (200: OK) {Object} entries.IBook.icons Icons
 * @apiSuccess (200: OK) {String} entries.IBook.icons.image_url URL of the book's cover image.
 * @apiSuccess (200: OK) {String} entries.IBook.icons.image_small_url Small image URL.
 *
 * @apiError (404: Not Found) {string} message "ISBN not found"
 *
 * @apiUse DBError
 */
bookRouter.get('/isbn/:isbn', async (request: Request, response: Response) => {
    // Implementation here
    try {
        const theQuery = `SELECT * 
        FROM books WHERE isbn13=$1
        ORDER BY id`;

        const values = [request.params.isbn];

        const { rows } = await pool.query(theQuery, values);

        if (rows.length === 0) {
            response.status(404).send({
                message: 'ISBN not found',
            });
            return;
        }

        const formattedRows = rows.map(format);
        console.log('rows:', formattedRows);

        response.send({
            entries: rows.map(format),
        });
    } catch (error) {
        console.error('Error executing query:', error);
        response.status(500).send({
            message: 'Internal Server Error',
        });
    }
});

/**
 * @api {get} /book/title/:title Request to get all books by Title
 * @apiName GetBooksByTitle
 * @apiGroup book
 *
 * @apiUse JWT
 *
 * @apiParam {String} title The title to look up.
 *
 * @apiSuccess (200: OK) {Object[]} entries List of all book entrie(s) with the specified title.
 * @apiSuccess (200: OK) {Number} entries.id Unique identifier of the book.
 * @apiSuccess (200: OK) {Object} entries.IBook Individual book entry.
 * @apiSuccess (200: OK) {Number} entries.IBook.isbn13 13-digit ISBN number of the book.
 * @apiSuccess (200: OK) {String} entries.IBook.authors List of author(s) of the book.
 * @apiSuccess (200: OK) {Number} entries.IBook.publication_year Year the book was published.
 *
 * @apiSuccess (200: OK) {Object} entries.IBook.ratings Ratings
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_avg Average rating of the book.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_count Total ratings count.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_1_star Count of 1-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_2_star Count of 2-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_3_star Count of 3-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_4_star Count of 4-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_5_star Count of 5-star ratings.
 *
 * @apiSuccess (200: OK) {Object} entries.IBook.icons Icons
 * @apiSuccess (200: OK) {String} entries.IBook.icons.image_url URL of the book's cover image.
 * @apiSuccess (200: OK) {String} entries.IBook.icons.image_small_url Small image URL.
 *
 * @apiError (404: Not Found) {string} message "Title not found"
 *
 * @apiUse DBError
 */
bookRouter.get(
    '/title/:title',
    async (request: Request, response: Response) => {
        // Implementation here
        try {
            const theQuery = `SELECT * 
        FROM books WHERE title ILIKE $1
        ORDER BY id`;

            const values = [`%${request.params.title}%`];

            const { rows } = await pool.query(theQuery, values);

            if (rows.length === 0) {
                response.status(404).send({
                    message: 'Title not found',
                });
                return;
            }

            const formattedRows = rows.map(format);
            console.log('rows:', formattedRows);

            response.send({
                entries: rows.map(format),
            });
        } catch (error) {
            console.error('Error executing query:', error);
            response.status(500).send({
                message: 'Internal Server Error',
            });
        }
    }
);

/**
 * @api {get} /book/rating/:rating Request to get all books by rating
 * @apiName GetBooksByRating
 * @apiGroup book
 *
 * @apiUse JWT
 *
 * @apiParam {String} rating The rating to look up.
 *
 * @apiSuccess (200: OK) {Object[]} entries List of all book entrie(s) with the specified rating.
 * @apiSuccess (200: OK) {Number} entries.id Unique identifier of the book.
 * @apiSuccess (200: OK) {Object} entries.IBook Individual book entry.
 * @apiSuccess (200: OK) {Number} entries.IBook.isbn13 13-digit ISBN number of the book.
 * @apiSuccess (200: OK) {String} entries.IBook.authors List of author(s) of the book.
 * @apiSuccess (200: OK) {Number} entries.IBook.publication_year Year the book was published.
 *
 * @apiSuccess (200: OK) {Object} entries.IBook.ratings Ratings
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_avg Average rating of the book.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_count Total ratings count.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_1_star Count of 1-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_2_star Count of 2-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_3_star Count of 3-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_4_star Count of 4-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_5_star Count of 5-star ratings.
 *
 * @apiSuccess (200: OK) {Object} entries.IBook.icons Icons
 * @apiSuccess (200: OK) {String} entries.IBook.icons.image_url URL of the book's cover image.
 * @apiSuccess (200: OK) {String} entries.IBook.icons.image_small_url Small image URL.
 *
 * @apiError (404: Not Found) {string} message "Books with given rating not found"
 *
 * @apiUse DBError
 */
bookRouter.get(
    '/rating/:rating',
    async (request: Request, response: Response) => {
        // Implementation here
        try {
            const theQuery = `SELECT * 
        FROM books WHERE rating_avg BETWEEN $1 AND $2
        ORDER BY id`;

            const value = parseFloat(request.params.rating);
            const lowerBound = value - 0.2;
            const upperBound = value + 0.2;

            const values = [lowerBound, upperBound];

            const { rows } = await pool.query(theQuery, values);

            if (rows.length === 0) {
                response.status(404).send({
                    message: 'Books with given rating not found',
                });
                return;
            }

            const formattedRows = rows.map(format);
            console.log('rows:', formattedRows);

            response.send({
                entries: rows.map(format),
            });
        } catch (error) {
            console.error('Error executing query:', error);
            response.status(500).send({
                message: 'Internal Server Error',
            });
        }
    }
);

/**
 * @api {get} /book/year/:year Request to retrieve entries by year
 *
 * @apiDescription Request to retrieve all the entries of <code>year</code>
 *
 * @apiName GetAllBooksByYear
 * @apiGroup book
 *
 * @apiUse JWT
 *
 * @apiParam {Number} year The year in which to retrieve all entries.
 *
 * @apiSuccess (200: OK) {Object[]} entries List of all book entrie(s) with the specified year.
 * @apiSuccess (200: OK) {Number} entries.id Unique identifier of the book.
 * @apiSuccess (200: OK) {Object} entries.IBook Individual book entry.
 * @apiSuccess (200: OK) {Number} entries.IBook.isbn13 13-digit ISBN number of the book.
 * @apiSuccess (200: OK) {String} entries.IBook.authors List of author(s) of the book.
 * @apiSuccess (200: OK) {Number} entries.IBook.publication_year Year the book was published.
 *
 * @apiSuccess (200: OK) {Object} entries.IBook.ratings Ratings
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_avg Average rating of the book.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_count Total ratings count.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_1_star Count of 1-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_2_star Count of 2-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_3_star Count of 3-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_4_star Count of 4-star ratings.
 * @apiSuccess (200: OK) {Number} entries.IBook.ratings.rating_5_star Count of 5-star ratings.
 *
 * @apiSuccess (200: OK) {Object} entries.IBook.icons Icons
 * @apiSuccess (200: OK) {String} entries.IBook.icons.image_url URL of the book's cover image.
 * @apiSuccess (200: OK) {String} entries.IBook.icons.image_small_url Small image URL.
 *
 * @apiError (404: Not Found) {String} message "No Books with the publication year given was found"
 *
 * @apiUse DBError
 */
bookRouter.get('/year/:year', async (request: Request, response: Response) => {
    // Implementation here
    try {
        const theQuery = `SELECT * 
        FROM books WHERE publication_year=$1
        ORDER BY id`;

        const values = [request.params.year];

        const { rows } = await pool.query(theQuery, values);

        if (rows.length === 0) {
            response.status(404).send({
                message: 'No Books with the publication year given was found',
            });
            return;
        }

        const formattedRows = rows.map(format);
        console.log('rows:', formattedRows);

        response.send({
            entries: rows.map(format),
        });
        return;
    } catch (error) {
        console.error('Error executing query:', error);
        response.status(500).send({
            message: 'Internal Server Error',
        });
    }
});

// URL for default book cover image
const defaultImageURL =
    'https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png';
const defaultImageSmallURL =
    'https://s.gr-assets.com/assets/nophoto/book/50x75-a91bf249278a81aabab721ef782c4a74.png';

//Post middleware function to check valid book post
function mwValidBookBody(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const {
        title,
        author,
        isbn,
        date,
        original_title = title,
        rating_1_star = 0,
        rating_2_star = 0,
        rating_3_star = 0,
        rating_4_star = 0,
        rating_5_star = 0,
        image_url = defaultImageURL, // default if undefined
        image_small_url = defaultImageSmallURL, // default if undefined
    } = request.body;

    if (!isStringProvided(title) || title.length < 3) {
        return response.status(400).send({
            message: 'Title is required and should be at least 3 characters',
        });
    }
    if (!isStringProvided(original_title) || original_title.length < 3) {
        return response.status(400).send({
            message: 'Original Title should be at least 3 characters',
        });
    }
    if (!isStringProvided(author)) {
        return response.status(400).send({ message: 'Author is required' });
    }
    if (!isNumberProvided(isbn) || isbn.toString().length !== 13 || isbn < 0) {
        return response
            .status(400)
            .send({ message: 'ISBN must be a positive 13-digit number' });
    }
    if (
        !isNumberProvided(date) ||
        date < 1000 ||
        date > new Date().getFullYear()
    ) {
        //are there any books published before 1000 in our db?
        return response.status(400).send({
            message:
                'Date must be a valid year between 1000 and the current year',
        });
    }
    if (
        !isNumberProvided(rating_1_star) ||
        !isNumberProvided(rating_2_star) ||
        !isNumberProvided(rating_3_star) ||
        !isNumberProvided(rating_4_star) ||
        !isNumberProvided(rating_5_star) ||
        rating_1_star < 0 ||
        rating_2_star < 0 ||
        rating_3_star < 0 ||
        rating_4_star < 0 ||
        rating_5_star < 0
    ) {
        return response.status(400).send({
            message: 'Ratings must be positive integers or zero',
        });
    }
    if (!isStringProvided(image_url) || !image_url.startsWith('http')) {
        return response.status(400).send({
            message: 'Image URL should be a URL or include http prefix',
        });
    }
    if (
        !isStringProvided(image_small_url) ||
        !image_small_url.startsWith('http')
    ) {
        return response.status(400).send({
            message: 'Small Image URL should be a URL or include http prefix',
        });
    }

    next();
}

/**
 * @api {post} /book Request to add a new book
 *
 * @apiDescription Request to add a new book
 *
 * @apiName PostBook
 * @apiGroup book
 *
 * @apiUse JWT
 *
 * @apiBody {string} title the new book title - must be at least 3 characters
 * @apiBody {string} author the new book author - comma separated if multiple authors
 * @apiBody {string} date the new published date - must be a valid year between 1000 and the current year
 * @apiBody {number} isbn the new isbn - must be a unique 13-digit number
 * @apiBody {string} [original_title] the original title of the book - default is title
 * @apiBody {number} [rating_1_star] the number of 1-star ratings - default is 0
 * @apiBody {number} [rating_2_star] the number of 2-star ratings - default is 0
 * @apiBody {number} [rating_3_star] the number of 3-star ratings - default is 0
 * @apiBody {number} [rating_4_star] the number of 4-star ratings - default is 0
 * @apiBody {number} [rating_5_star] the number of 5-star ratings - default is 0
 * @apiBody {string} [image_url] the URL of the book's cover image - default is a placeholder image
 * @apiBody {string} [image_small_url] the URL of the book's small cover image - default is a placeholder image
 *
 * @apiSuccess (201: Created) {Object[]} entries Object of newly created book.
 * @apiSuccess (201: Created) {Number} entries.id Unique identifier of the book.
 * @apiSuccess (201: Created) {Object} entries.IBook Individual book entry.
 * @apiSuccess (201: Created) {Number} entries.IBook.isbn13 13-digit ISBN number of the book.
 * @apiSuccess (201: Created) {String} entries.IBook.authors List of author(s) of the book.
 * @apiSuccess (201: Created) {Number} entries.IBook.publication_year Year the book was published.
 *
 * @apiSuccess (201: Created) {Object} entries.IBook.ratings Ratings
 * @apiSuccess (201: Created) {Number} entries.IBook.ratings.rating_avg Average rating of the book.
 * @apiSuccess (201: Created) {Number} entries.IBook.ratings.rating_count Total ratings count.
 * @apiSuccess (201: Created) {Number} entries.IBook.ratings.rating_1_star Count of 1-star ratings.
 * @apiSuccess (201: Created) {Number} entries.IBook.ratings.rating_2_star Count of 2-star ratings.
 * @apiSuccess (201: Created) {Number} entries.IBook.ratings.rating_3_star Count of 3-star ratings.
 * @apiSuccess (201: Created) {Number} entries.IBook.ratings.rating_4_star Count of 4-star ratings.
 * @apiSuccess (201: Created) {Number} entries.IBook.ratings.rating_5_star Count of 5-star ratings.
 *
 * @apiSuccess (201: Created) {Object} entries.IBook.icons Icons
 * @apiSuccess (201: Created) {String} entries.IBook.icons.image_url URL of the book's cover image.
 * @apiSuccess (201: Created) {String} entries.IBook.icons.image_small_url Small image URL.
 *
 * @apiSuccess (201: Created) {String} message "Book added successfully"
 *
 * @apiError (400: Invalid Title) {String} message "Title is required and should be at least 3 characters"
 * @apiError (400: Invalid Original Title) {String} message "Original Title should be at least 3 characters"
 * @apiError (400: Invalid Author) {String} message "Author is required"
 * @apiError (400: Invalid ISBN) {String} message "ISBN must be a positive 13-digit number"
 * @apiError (400: Invalid Year) {String} message "Date must be a valid year between 1000 and the current year"
 * @apiError (400: Invalid Ratings) {String} message "Ratings must be positive integers or zero"
 * @apiError (400: Invalid Image URL) {String} message "Image URL should be a URL or include http prefix"
 * @apiError (400: Invalid Small Image URL) {String} message "Small Image URL should be a URL or include http prefix"
 * @apiError (400: Book Exists) {String} message "Book with isbn already exists"
 * @apiError (400: Bad Request) {String} message "Missing required information"
 * @apiUse DBError
 */
bookRouter.post(
    '/',
    mwValidBookBody,
    async (request: Request, response: Response) => {
        const {
            title,
            author,
            isbn,
            date,
            original_title = title,
            rating_1_star = 0,
            rating_2_star = 0,
            rating_3_star = 0,
            rating_4_star = 0,
            rating_5_star = 0,
            image_url = defaultImageURL, // default if undefined
            image_small_url = defaultImageSmallURL, // default if undefined
        } = request.body;

        try {
            // Check for existing book by ISBN
            const checkQuery = 'SELECT * FROM books WHERE isbn13 = $1';
            const { rowCount } = await pool.query(checkQuery, [isbn]);

            if (rowCount > 0) {
                // ISBN already exists, so we return a 400 response
                console.error('Attempt to add duplicate ISBN:', isbn);
                return response.status(400).send({
                    message: 'Book with ISBN already exists',
                });
            }
            const maxQuery = 'SELECT MAX(id) AS max_id FROM books';
            const maxResult = await pool.query(maxQuery);
            const newID =
                maxResult.rows[0].max_id !== null
                    ? maxResult.rows[0].max_id + 1
                    : 1;

            const rating_count =
                rating_1_star +
                rating_2_star +
                rating_3_star +
                rating_4_star +
                rating_5_star;

            const weightedSum =
                rating_1_star * 1 +
                rating_2_star * 2 +
                rating_3_star * 3 +
                rating_4_star * 4 +
                rating_5_star * 5;

            // Prevent division by zero
            const rating_avg =
                rating_count > 0 ? weightedSum / rating_count : 0;

            // Insert the new book into the database
            const insertQuery = `
                INSERT INTO books (title, authors, isbn13, publication_year, id, original_title, 
                    rating_avg,
                    rating_count,
                    rating_1_star,
                    rating_2_star,
                    rating_3_star,
                    rating_4_star,
                    rating_5_star,
                    image_url,
                    image_small_url) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *;
            `;
            const values = [
                title,
                author,
                isbn,
                date,
                newID,
                original_title,
                rating_avg,
                rating_count,
                rating_1_star,
                rating_2_star,
                rating_3_star,
                rating_4_star,
                rating_5_star,
                image_url,
                image_small_url,
            ];
            const { rows } = await pool.query(insertQuery, values);

            response.status(201).send({
                entries: rows.map(format),
                message: 'Book added successfully',
            });
        } catch (error) {
            console.error('Database error on POST /book:', error);
            response.status(500).send({
                message: 'Internal server error - please contact support',
            });
        }
    }
);

//MW func for putting new rating
function mwValidBookRating(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { title, author } = request.body;

    if (!isStringProvided(title) || title.length < 3) {
        return response.status(400).send({
            message: 'Title is required and should be at least 3 characters',
        });
    }
    if (!isStringProvided(author)) {
        return response.status(400).send({
            message: 'Author is required',
        });
    }

    next();
}

/**
 * @api {put} /book/rate/:id Request to change an entry rating
 *
 * @apiDescription Request to replace or change the rating of a book
 *
 * @apiName PutBookRating
 * @apiGroup book
 *
 * @apiUse JWT
 *
 * @apiParam {number} id of book to be updated.
 * @apiBody {number} [rating_1_star] the number of 1-star ratings to add to the book.
 * @apiBody {number} [rating_2_star] the number of 2-star ratings to add to the book.
 * @apiBody {number} [rating_3_star] the number of 3-star ratings to add to the book.
 * @apiBody {number} [rating_4_star] the number of 4-star ratings to add to the book.
 * @apiBody {number} [rating_5_star] the number of 5-star ratings to add to the book.
 *
 * @apiSuccess (201: OK) {Object[]} entries Object of newly updated book - should be one.
 * @apiSuccess (201: OK) {Number} entries.id Unique identifier of the book.
 * @apiSuccess (201: OK) {Object} entries.IBook Individual book entry.
 * @apiSuccess (201: OK) {Number} entries.IBook.isbn13 13-digit ISBN number of the book.
 * @apiSuccess (201: OK) {String} entries.IBook.authors List of author(s) of the book.
 * @apiSuccess (201: OK) {Number} entries.IBook.publication_year Year the book was published.
 *
 * @apiSuccess (201: OK) {Object} entries.IBook.ratings Ratings
 * @apiSuccess (201: OK) {Number} entries.IBook.ratings.rating_avg new Average rating of the book.
 * @apiSuccess (201: OK) {Number} entries.IBook.ratings.rating_count new Total ratings count.
 * @apiSuccess (201: OK) {Number} entries.IBook.ratings.rating_1_star Count of new 1-star ratings.
 * @apiSuccess (201: OK) {Number} entries.IBook.ratings.rating_2_star Count of new 2-star ratings.
 * @apiSuccess (201: OK) {Number} entries.IBook.ratings.rating_3_star Count of new 3-star ratings.
 * @apiSuccess (201: OK) {Number} entries.IBook.ratings.rating_4_star Count of new 4-star ratings.
 * @apiSuccess (201: OK) {Number} entries.IBook.ratings.rating_5_star Count of new 5-star ratings.
 *
 * @apiSuccess (201: OK) {Object} entries.IBook.icons Icons
 * @apiSuccess (201: OK) {String} entries.IBook.icons.image_url URL of the book's cover image.
 * @apiSuccess (201: OK) {String} entries.IBook.icons.image_small_url Small image URL.
 * @apiSuccess (201: OK) {String} message "Book added successfully"
 *
 * @apiError (400: Bad Request) {String} message "No valid rating fields provided for update"
 * @apiError (404: Not Found) {String} message "Book not found" if the specified book of id does not exist.
 * @apiUse DBError
 */
bookRouter.put(
    '/rate/:id',
    //mwValidBookRating,
    async (request: Request, response: Response) => {
        const { id } = request.params;
        const {
            rating_1_star = 0,
            rating_2_star = 0,
            rating_3_star = 0,
            rating_4_star = 0,
            rating_5_star = 0,
        } = request.body;

        const checkQuery = 'SELECT * FROM books WHERE id = $1';
        const { rows } = await pool.query(checkQuery, [id]);

        if (rows.length === 0) {
            response.status(404).send({
                message: 'Book not found',
            });
            return;
        }

        const oldRatingsCount = rows[0].rating_count;
        const old1Star = rows[0].rating_1_star;
        const old2Star = rows[0].rating_2_star;
        const old3Star = rows[0].rating_3_star;
        const old4Star = rows[0].rating_4_star;
        const old5Star = rows[0].rating_5_star;
        console.error(oldRatingsCount);
        console.error(rows);
        const newRatingsCount =
            +oldRatingsCount +
            +rating_1_star +
            +rating_2_star +
            +rating_3_star +
            +rating_4_star +
            +rating_5_star;

        const weightedSum =
            (+rating_1_star + +old1Star) * 1 +
            (+rating_2_star + +old2Star) * 2 +
            (+rating_3_star + +old3Star) * 3 +
            (+rating_4_star + +old4Star) * 4 +
            (+rating_5_star + +old5Star) * 5;

        // Prevent division by zero
        const rating_avg =
            +newRatingsCount > 0 ? +weightedSum / +newRatingsCount : 0;

        // If no rating fields were provided, return a 400 error
        if (request.body.length === 0) {
            response.status(400).send({
                message: 'No valid rating fields provided for update',
            });
            return;
        }
        const theQuery = `UPDATE books SET
        rating_avg = $1,
        rating_count = $2,
        rating_1_star = rating_1_star + $3,
        rating_2_star = rating_2_star + $4,
        rating_3_star = rating_3_star + $5,
        rating_4_star = rating_4_star + $6,
        rating_5_star = rating_5_star + $7
        WHERE id = $8 
        RETURNING *`;

        const values = [
            rating_avg,
            newRatingsCount,
            rating_1_star,
            rating_2_star,
            rating_3_star,
            rating_4_star,
            rating_5_star,
            id,
        ];

        try {
            const { rows } = await pool.query(theQuery, values);

            if (rows.length === 0) {
                response.status(404).send({ message: 'Book not found' });
                return;
            }

            const formattedRows = rows.map(format);
            //console.log('rows:', formattedRows);

            response.status(200).send({
                entries: formattedRows,
                message: 'Book ratings updated successfully',
            });
        } catch (error) {
            console.error('Error executing update query:', error);
            response.status(500).send({
                message: 'Internal server error',
            });
        }
    }
);

//middleware function for delete by ISBN function
function mwValidBookDeleteISBN(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { isbn } = request.params; // body or params?

    if (!isNumberProvided(isbn) || isbn.toString().length !== 13) {
        return response
            .status(400)
            .send({ message: 'ISBN must be a 13-digit number' });
    }

    next();
}

/**
 * @api {delete} /book/isbn/:isbn Request to delete a book by ISBN
 *
 * @apiDescription Request to delete a specific book entry by providing its ISBN.
 *
 * @apiName DeleteBooksByISBN
 * @apiGroup book
 *
 * @apiUse JWT
 *
 * @apiParam {Number} isbn The ISBN of the book to be deleted.
 *
 * @apiSuccess (200: OK) {String} message "Book with ISBN <code>isbn</code> has been successfully deleted."
 *
 * @apiError (404: Not Found) {String} message "Book not found" if no book with the specified ISBN exists.
 * @apiError (400: Bad Request) {String} message "Invalid or missing ISBN - please refer to documentation" if the ISBN parameter is missing or invalid.
 *
 * @apiUse DBError
 */
bookRouter.delete(
    '/isbn/:isbn',
    mwValidBookDeleteISBN,
    async (request: Request, response: Response) => {
        try {
            const { isbn } = request.params;

            if (!isbn) {
                response.status(400).send({
                    message: 'ISBN not provided',
                });
                return;
            }
            const theQuery = 'DELETE FROM books WHERE isbn13=$1 RETURNING *';

            const { rows } = await pool.query(theQuery, [isbn]);

            if (rows.length === 0) {
                response.status(404).send({
                    message: 'Book not found',
                });
                return;
            }
            const formattedRows = rows.map(format);
            console.log('rows:', formattedRows);

            response.status(200).send({
                entries: rows.map(format),
                message: 'Book by ISBN has been successfully deleted',
            });
            return;
        } catch (error) {
            console.error('Error executing query:', error);
            response.status(500).send({
                message: 'Internal Server Error',
            });
        }
    }
);

//middleware function to check validity of delete by series function
function mwValidBookDeleteSeries(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { seriesName } = request.params; // params is correct

    if (!isStringProvided(seriesName) || seriesName.trim() === '') {
        return response.status(400).send({
            message: 'Series name is required',
        });
    }

    next();
}

// solely exists to catch empty params for /series route
bookRouter.delete('/series', (request, response) => {
    return response.status(400).send({
        message: 'Series name is required',
    });
});

/**
 * @api {delete} /book/series/:seriesName Delete a range of books by series name or a standalone book by exact title.
 *
 * @apiDescription Deletes all books within the specified series by matching series titles that contain the given series name
 * in parentheses, such as "(Series Name, #...)".
 * If no series books are found, it attempts to delete a standalone book with the exact specified title.
 *
 * @apiName DeleteBooksBySeries
 * @apiGroup book
 *
 * @apiUse JWT
 *
 * @apiParam {String} seriesName The name of the series to be deleted or the exact title of a standalone book.
 *
 * @apiSuccess (200: OK) {String} message "Successfully deleted <code>count</code> books within the specified series"
 * or "Successfully deleted the standalone book titled <code>seriesName</code>".
 *
 * @apiError (404: Not Found) {String} message "No books found with the specified series name or title"
 * if no matching books are found.
 * @apiError (400: Bad Request) {String} message "Invalid or missing parameters - please refer to documentation"
 * if the series name parameter is not provided or invalid.
 * @apiUse DBError
 */
bookRouter.delete(
    '/series/:seriesName',
    mwValidBookDeleteSeries,
    async (request: Request, response: Response) => {
        try {
            const { seriesName } = request.params;

            // Define the delete query for series entries with pattern matching
            const seriesQuery = `
                DELETE FROM books 
                WHERE title ILIKE '%(' || $1 || ', #%'
                RETURNING *;
            `;

            // Define the delete query for standalone books by exact title match and no parentheses
            const standaloneQuery = `
                DELETE FROM books 
                WHERE title = $1
                AND title NOT LIKE '%(%)%'
                RETURNING *;
            `;

            // Attempt to delete books as part of a series first
            const { rows: seriesRows } = await pool.query(seriesQuery, [
                seriesName,
            ]);

            if (seriesRows.length > 0) {
                // Successfully deleted books in the series
                return response.status(200).send({
                    message: `Successfully deleted ${seriesRows.length} books within the specified series`,
                    entries: seriesRows.map(format),
                });
            }

            // If no series books were found, attempt to delete a standalone book without parentheses
            const { rows: standaloneRows } = await pool.query(standaloneQuery, [
                seriesName,
            ]);

            if (standaloneRows.length > 0) {
                // Successfully deleted a standalone book
                return response.status(200).send({
                    message: `Successfully deleted the standalone book titled "${seriesName}"`,
                    entries: seriesRows.map(format),
                });
            }

            // If neither a series nor standalone book was found
            return response.status(404).send({
                message:
                    'No books found with the specified series name or title',
            });
        } catch (error) {
            console.error('Error executing query:', error);
            response.status(500).send({
                message: 'Internal server error',
            });
        }
    }
);

export { bookRouter };
