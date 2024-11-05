// express is the framework we're going to use to handle requests
import express, { Request, Response, Router, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

const key = {
    secret: process.env.JSON_WEB_TOKEN,
};

import {
    pool,
    validationFunctions,
    credentialingFunctions,
} from '../../core/utilities';

const isStringProvided = validationFunctions.isStringProvided;
const generateHash = credentialingFunctions.generateHash;
const generateSalt = credentialingFunctions.generateSalt;

const forgotPasswordRouter: Router = express.Router();

export interface IUserRequest extends Request {
    id: number;
}

const isValidNewPassword = (password: string): boolean =>
    isStringProvided(password) &&
    password.length >= 8 &&
    password.length <= 24 &&
    /[!@#$%^&*()_+=-]/.test(password) &&
    /\d/.test(password);

const isValidPhone = (phone: string): boolean =>
    isStringProvided(phone) && phone.length >= 10;

const isValidEmail = (email: string): boolean =>
    isStringProvided(email) && email.includes('@');

/**
 * @api {put} /forgotPassword Request to create new password
 *
 * @apiDescription Request to create new password (forgot password)
 * 
 * <ul> <b>Password:</b>
 *      <li> Must be between 8 to 16 characters long</li>
 *      <li> Must include both uppercase and lowercase letters </li>
 *      <li> Must contain at least one numeric digit and special character </li>
 * </ul>
 * 
 *
 * @apiName PutForgotPassword
 * @apiGroup Auth
 *
 * @apiBody {String} username a username *unique 
 * @apiBody {String} email a users email *unique
 * @apiBody {String} phone a users phonenumber *unique
 * @apiBody {String} newPassword a users new password
 * @apiBody {String} confirmNewPassword confirmation of new password
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Invalid Username) {String} message "Invalid or missing username  - please refer to registration documentation"
 * @apiError (400: Invalid Email) {String} message "Invalid or missing email - please refer to registration documentation"
 * @apiError (400: Invalid PhoneNumber) {String} message "Invalid or missing phone number - please refer to registration documentation"
 * @apiError (400: Invalid NewPassword) {String} message "Invalid or missing new password  - please refer to documentation"
 * @apiError (400: Invalid ConfirmPassword) {String} message "Invalid or missing confirmation password  - please refer to documentation"
 */
forgotPasswordRouter.put(
    '/forgotPassword',
    (request: Request, response: Response, next: NextFunction) => {
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaulte to false
    if ( // username, email, new password must be provided
        isStringProvided(request.body.username) &&
        isStringProvided(request.body.email) &&
        isStringProvided(request.body.newpassword) &&
        isStringProvided(request.body.phone)
    ){
        next();
    } else{
        response.status(400).send({
            message: 'Missing required information',
        })
    }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if(isValidNewPassword(request.body.newpassword)) {
            next();
            return;
        } else {
            response.status(400).send({
                message:
                    'Invalid password  - please refer to documentation',
            }); 
            return;
        }
    },
    // Check if User exists within the database
    (request: IUserRequest, response: Response, next: NextFunction) => {
        const theQuery = 
        'SELECT Account(username, email, phone) FROM VALUES ($1, $2, $3) RETURNING account_id';
        const values = [
            request.body.username,
            request.body.email,
            request.body.phone
        ];
        console.dir({ ...request.body, password: '******' });
        pool.query(theQuery, values)
            .then((result) => {
                if(result.rows.length == 0){
                    response.status(400).send({
                        message: 'User does not exist within the database with the provided inputs'
                    })
                } else {
                    request.id = result.rows[0].account_id;
                    next();
                }
            })
            .catch((error) => {
                    console.error('DB Query error on account retrieval');
                    console.error(error);
                    response.status(500).send({
                        message: 'server error - contact support',
                    });
            
            });
    },
    (request: IUserRequest, response: Response) => {
        if (!request.id) {
            response.status(500).send({ message: 'Server error - contact support' });
            return;
        }

        const salt = generateSalt(32);
        const saltedHash = generateHash(request.body.newPassword, salt);

        const updateQuery = `
            UPDATE Account_Credential SET salted_hash = $1, salt = $2 WHERE account_id = $3
        `;
        const values = [saltedHash, salt, request.id];

        pool.query(updateQuery, values)
            .then(() => {
                const resetToken = jwt.sign(
                    { id: request.id },
                    key.secret,
                    { expiresIn: '15m' } // Token expires in 15 minutes
                );

                response.status(200).send({
                    message: 'Password updated successfully',
                    resetToken, // Optionally send this to confirm success
                });
            })
            .catch((error) => {
                console.error('Error updating password in the database');
                console.error(error);
                response.status(500).send({
                    message: 'Server error - contact support',
                });
            });
    }
);
export { forgotPasswordRouter };