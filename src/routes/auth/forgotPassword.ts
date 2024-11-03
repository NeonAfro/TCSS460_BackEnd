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
const isNumberProvided = validationFunctions.isNumberProvided;
const generateHash = credentialingFunctions.generateHash;
const generateSalt = credentialingFunctions.generateSalt;

const forgotPasswordRouter: Router = express.Router();

export interface IUserRequest extends Request {
    id: number;
}

// password must be between 4 and 24 in length
const isValidPassword = (password: string): boolean =>
    isStringProvided(password) && password.length > 3 && password.length <= 24;

const isValidEmail = (email: string): boolean =>
    isStringProvided(email) && email.includes('@');
const emailMiddlewareCheck = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    if (isValidEmail(request.body.email)) {
        next();
    } else {
        response.status(400).send({
            message:
                'Invalid or missing email  - please refer to documentation',
        });
    }
};

/**
 * @api {put} /forgotPassword Request to create new password (forgot password)
 *
 * @apiDescription Document this route. !**Document the password rules here**!
 * !**Document the role rules here**!
 *
 * @apiName PutForgotPassword
 * @apiGroup Auth
 *
 * @apiBody {String} username a username *unique 
 * @apiBody {String} email a users email *unique
 * @apiBody {String} newPassword a users new password
 * @apiBody {String} confirmNewPassword confirmation of new password
 * // confirmation password /= new password, oldPassword is not correct, password rules are met
 * 
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Invalid Username) {String} message "Invalid or missing username  - please refer to the documentation"
 * @apiError (400: Invalid Email) {String} message "Invalid or missing email - please refer to documentation"
 * @apiError (400: Invalid NewPassword) {String} message "Invalid or missing new passwrod  - please refer to documentation"
 * @apiError (400: Invalid ConfirmPassword) {String} message "Invalid or missing confirmation password  - please refer to documentation"
 */
forgotPasswordRouter.put('/forgotPassword', emailMiddlewareCheck,
(request: Request, response: Response, next: NextFunction) => {
    if (
        isStringProvided
    ){

    }
});
registerRouter.post(
    '/register',
    emailMiddlewareCheck, // these middleware functions may be defined elsewhere!
    (request: Request, response: Response, next: NextFunction) => {