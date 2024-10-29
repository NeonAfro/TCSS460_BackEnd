/**
 * @api {get} /book/all Request to get all book
 * @apiName GetAllbook
 * @apiGroup book
 *
 * @apiSuccess {Object[]} entry the book object containing information of the book <code>name</code>
 *
 * @apiError (500 Internal Server Error) {String} message "Internal Server Error"
 */

/**
 * @api {get} /book/:author Request to get all book by author
 * @apiName GetBookByAuthor
 * @apiGroup book
 *
 * @apiSuccess {Object[]} entry the book object containing information of the book from author <code>author</code>
 * @apiParam {string} author the author to look up.
 *
 * @apiError (500 Internal Server Error) {String} message "Internal Server Error"
 * @apiError (404: Name Not Found) {string} message "Author not found"
 */

/**
 * @api {get} /book/:isbn Request to get all book by isbn
 * @apiName GetBookByISBN
 * @apiGroup book
 *
 * @apiSuccess {Object[]} entry the book object containing information of the book from author <code>author</code>
 * @apiParam {string} isbn the isbn to look up.
 *
 * @apiError (500 Internal Server Error) {String} message "Internal Server Error"
 * @apiError (404: Name Not Found) {string} message "Author not found"
 */

/**
 * @api {get} /book/:ISBN Request to get all book by ISBN
 * @apiName GetBookByISBN
 * @apiGroup book
 *
 * @apiSuccess {Object[]} entry the book object containing information of the book from ISBN <code>author</code>
 * @apiParam {string} ISBN the ISBN to look up.
 *
 * @apiError (500 Internal Server Error) {String} message "Internal Server Error"
 * @apiError (404: Name Not Found) {string} message "Author not found"
 */

/**
 * @api {get} /book/:title Request to get all book by Title
 * @apiName GetBookByTitle
 * @apiGroup book
 *
 * @apiSuccess {Object[]} entry the book object containing information of the book from title <code>author</code>
 * @apiParam {string} title the title to look up.
 *
 * @apiError (500 Internal Server Error) {String} message "Internal Server Error"
 * @apiError (404: Name Not Found) {string} message "Author not found"
 */

/**
 * @api {get} /book/:rating Request to get all book by rating
 * @apiName GetBookByRating
 * @apiGroup book
 *
 * @apiSuccess {Object[]} entry the book object containing information of the book from title <code>author</code>
 * @apiParam {string} rating the rating to look up.
 *
 * @apiError (500 Internal Server Error) {String} message "Internal Server Error"
 * @apiError (404: Name Not Found) {string} message "Author not found"
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
 */

/**
 * @api {post} /message Request to add an entry
 *
 * @apiDescription Request to add a message and someone's name to the DB
 *
 * @apiName PostMessage
 * @apiGroup Message
 *
 * @apiBody {string} name someone's name *unique
 * @apiBody {string} message a message to store with the name
 * @apiBody {number} priority a message priority [1-3]
 *
 * @apiSuccess (Success 201) {String} entry the string:
 *      "{<code>priority</code>} - [<code>name</code>] says: <code>message</code>"
 *
 * @apiError (400: Name exists) {String} message "Name exists"
 * @apiError (400: Missing Parameters) {String} message "Missing required information - please refer to documentation"
 * @apiError (400: Invalid Priority) {String} message "Invalid or missing Priority  - please refer to documentation"
 */

/**
 * @api {delete} /message/:name Request to remove an entry by name
 *
 * @apiDescription Request to remove an entry associated with <code>name</code> in the DB
 *
 * @apiName DeleteMessage
 * @apiGroup Message
 *
 * @apiParam {String} name the name associated with the entry to delete
 *
 * @apiSuccess {String} entry the string
 *      "Deleted: {<code>priority</code>} - [<code>name</code>] says: <code>message</code>"
 *
 * @apiError (404: Name Not Found) {String} message "Name not found"
 */

/**
 * @api {put} /message Request to change an entry
 *
 * @apiDescription Request to replace the message entry in the DB for name
 *
 * @apiName PutMessage
 * @apiGroup Message
 *
 * @apiBody {String} name the name entry
 * @apiBody {String} message a message to replace with the associated name
 *
 * @apiSuccess {String} entry the string
 *      "Updated: {<code>priority</code>} - [<code>name</code>] says: <code>message</code>"
 *
 * @apiError (404: Name Not Found) {String} message "Name not found"
 * @apiError (400: Missing Parameters) {String} message "Missing required information" *
 */
