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

const isValidPassword = (password: string): boolean =>
    isStringProvided(password) &&
    password.length >= 8 &&
    password.length <= 24 &&
    /[!@#$%^&*()_+=-]/.test(password) &&
    /\d/.test(password);

const isValidPhone = (phone: string): boolean =>
    isStringProvided(phone) && phone.length >= 10;

const isValidEmail = (email: string): boolean =>
    isStringProvided(email) && email.includes('@');

// middleware functions may be defined elsewhere!
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
 * @api {put} /forgotPassword Request to open forgotPassword for a user
 *
 * @apiDescription Requests to create a new password (forgot password)
 *
 *
 * @apiName PutForgotPassword
 * @apiGroup Auth
 *
 * @apiBody {String} texts a users phone
 * @apiBody {String} email a users email
 * @apiBody {String} newPassword a users new password
 * @apiBody {String} confirmNewPassword confirmation of new password
 * // confirmation password /= new password, oldPassword is not correct, password rules are met
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Invalid PhoneNumber) {String} message "Invalid or missing phone number  - please refer to documentation"
 * @apiError (400: Invalid Email) {String} message "Invalid or missing email  - please refer to documentation"
 * @apiError (400: Invalid NewPassword) {String} message "Invalid or missing new password  - please refer to documentation"
 * @apiError (400: Invalid ConfirmPassword) {String} message "Invalid or missing confirmation password  - please refer to documentation"
 */

forgotPasswordRouter.post(
    '/forgotPassword',
    emailMiddlewareCheck, // these middleware functions may be defined elsewhere!
    (request: Request, response: Response, next: NextFunction) => {
        //Verify that the caller supplied all the parameters
        //In js, empty strings or null values evaluate to false
        if (
            isStringProvided(request.body.firstname) &&
            isStringProvided(request.body.lastname) &&
            isStringProvided(request.body.username)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Missing required information',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidPhone(request.body.phone)) {
            next();
            return;
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing phone number  - please refer to documentation',
            });
            return;
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidPassword(request.body.password)) {
            next();
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing password  - please refer to documentation',
            });
        }
    }
);
