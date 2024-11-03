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

const changePasswordRouter: Router = express.Router();

//Password must be between 8-24 in length
//Password must also contain 1 special symbol and have at least one digit
const isValidPassword = (password: string): boolean =>
    isStringProvided(password) &&
    password.length >= 8 &&
    password.length <= 24 &&
    /[!@#$%^&*()_+=-]/.test(password) &&
    /\d/.test(password);

/**
 * @api {post} /changePassword Request to changePassword for a user
 *
 * @apiDescription Document this route. !**Document the password rules here**!
 * !**Document the role rules here**!
 *
 * @apiName PostChangePassword
 * @apiGroup Auth
 *
 * @apiBody {String} oldPassword a users old password
 * @apiBody {String} newPassword a users new password
 * @apiBody {String} confirmNewPassword confirmation of new password
 *
 * @apiSuccess (Success 201) {string} accessToken a newly created JWT
 * @apiSuccess (Success 201) {number} id unique user id
 * //old password is incorrect, confirm password is not the same.
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Invalid oldPassword) {String} message "Invalid old password  - please refer to documentation"
 * @apiError (400: Invalid confirmNewPassword) {String} message "Invalid NewPassword  - please refer to documentation"
 * @apiError (400: Invalid confirmNewPassword) {String} message "Invalid confirmNewPassword  - please refer to documentation"
 *
 */

changePasswordRouter.post(
    '/changePassword',
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidPassword(request.body.password)) {
            next();
        } else {
            response.status(400).send({
                message: 'Invalid Password  - please refer to documentation',
            });
        }
    }
);

changePasswordRouter.get('/hash_demo', (request, response) => {
    const password = 'password12345';

    const salt = generateSalt(32);
    const saltedHash = generateHash(password, salt);
    const unsaltedHash = generateHash(password, '');

    response.status(200).send({
        salt: salt,
        salted_hash: saltedHash,
        unsalted_hash: unsaltedHash,
    });
});

export { changePasswordRouter };
