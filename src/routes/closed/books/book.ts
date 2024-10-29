/**
 * @api {get} /books/all Request to get all books
 * @apiName getAllBooks
 * @apiGroup books
 *
 * @apiSuccess {Object[]} entry the books object containing information of the book <code>name</code>
 *
 * @apiError (500 Internal Server Error) {String} message "Internal Server Error"
 */

/**
 * @api {get} /books/:author Request to get all books by author
 * @apiName getBooksByAuthor
 * @apiGroup books
 *
 * @apiSuccess {Object[]} entry the books object containing information of the book from author <code>author</code>
 * @apiParam {string} author the author to look up.
 *
 * @apiError (500 Internal Server Error) {String} message "Internal Server Error"
 * @apiError (404: Name Not Found) {string} message "Author not found"
 */
