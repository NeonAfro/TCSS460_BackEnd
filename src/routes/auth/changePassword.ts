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

export interface Auth {
    email: string;
    password: string;
}

const isStringProvided = validationFunctions.isStringProvided;
const generateHash = credentialingFunctions.generateHash;
const generateSalt = credentialingFunctions.generateSalt;

const changePasswordRouter: Router = express.Router();

export interface IUserRequest extends Request {
    id: number;
}

const isValidNewPassword = (newPassword: string): boolean =>
    isStringProvided(newPassword) &&
    newPassword.length >= 8 &&
    newPassword.length <= 24 &&
    /[!@#$%^&*()_+=-]/.test(newPassword) &&
    /\d/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[A-Z]/.test(newPassword);

/**
 * @api {put} /changePassword Request to create new password
 *
 * @apiDescription Request to Change Password
 *
 * <ul> <b>Password:</b>
 *      <li> Must be between 8 to 24 characters long</li>
 *      <li> Must include both uppercase and lowercase letters </li>
 *      <li> Must contain at least one numeric digit and special character </li>
 * </ul>
 *
 *
 * @apiName PutChangePassword
 * @apiGroup Change Password
 *
 * @apiBody {String} username a username *unique
 * @apiBody {String} oldPassword a users current password
 * @apiBody {String} newPassword a users new password
 * @apiBody {String} confirmNewPassword confirmation of new password
 *
 * @apiSuccess (200: OK) {String} message "Password updated successfully"
 *
 * @apiError (400: Missing Parameters) {String} message "Missing a parameter"
 * @apiError (400: Password Mismatch) {String} message "The passwords do not match"
 * @apiError (400: Invalid NewPassword) {String} message "Invalid New Password  - please refer to documentation"
 * @apiError (404: User does not exist) {String} message "User does not exist"
 * @apiError (400: Invalid OldPassword) {String} message "Old Password is not correct for User"
 * @apiError (500: Server Error) {String} message "Server error - contact support"
 */
changePasswordRouter.put(
    '/changePassword',
    (request: Request, response: Response, next: NextFunction) => {
        //Verify that the caller supplied all the parameters
        //In js, empty strings or null values evaulte to false
        if (
            // username, email, new password must be provided
            isStringProvided(request.body.username) &&
            isStringProvided(request.body.oldPassword) &&
            isStringProvided(request.body.newPassword) &&
            isStringProvided(request.body.confirmNewPassword)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Missing a parameter',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidNewPassword(request.body.newPassword)) {
            if (request.body.newPassword == request.body.confirmNewPassword) {
                next();
                return;
            } else {
                response.status(400).send({
                    message: 'The passwords do not match',
                });
            }
            return;
        } else {
            response.status(400).send({
                message:
                    'Invalid new password  - please refer to documentation',
            });
            return;
        }
    },
    // Check if User exists within the database
    (request: IUserRequest, response: Response, next: NextFunction) => {
        const theQuery = `SELECT salted_hash, salt, Account_Credential.account_id, account.email, account.firstname, account.lastname, account.phone, account.username, account.account_role FROM Account_Credential
        INNER JOIN Account ON
        Account_Credential.account_id=Account.account_id 
        WHERE Account.username=$1`;
        const values = [request.body.username];

        pool.query(theQuery, values)
            .then((result) => {
                if (result.rows.length === 0) {
                    response.status(404).send({
                        message: 'User does not exist',
                    });
                    return;
                } else if (result.rowCount > 1) {
                    //log the error
                    console.error(
                        'DB Query error on sign in: too many results returned'
                    );
                    response.status(500).send({
                        message: 'server error - contact support',
                    });
                    return;
                }

                // Retrieve the stored hash and salt
                const { account_id, salted_hash, salt } = result.rows[0];

                // Verify the provided password with the stored hash and salt
                const providedHash = generateHash(
                    request.body.oldPassword,
                    salt
                );
                if (providedHash !== salted_hash) {
                    response.status(400).send({
                        message: 'Old Password is not correct for User',
                    });
                    return;
                }

                // Password is correct, set the user id in the request and move to the next middleware
                request.id = account_id;
                next();
            })
            .catch((error) => {
                console.error('DB Query error on account retrieval');
                console.error(error);
                response.status(500).send({
                    message: 'DB server error - contact support',
                });
            });
    },
    (request: IUserRequest, response: Response) => {
        if (!request.id) {
            response
                .status(500)
                .send({ message: 'Server error - contact support' });
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
export { changePasswordRouter };
