/** Redacted for now, can work on later */
// // express is the framework we're going to use to handle requests
// import express, { Request, Response, Router, NextFunction } from 'express';

// import jwt from 'jsonwebtoken';

// const key = {
//     secret: process.env.JSON_WEB_TOKEN,
// };

// import {
//     pool,
//     validationFunctions,
//     credentialingFunctions,
// } from '../../core/utilities';

// const isStringProvided = validationFunctions.isStringProvided;
// const generateHash = credentialingFunctions.generateHash;
// const generateSalt = credentialingFunctions.generateSalt;

// const changePasswordRouter: Router = express.Router();

// // password must be between 4 and 24 in length
// const isValidPassword = (password: string): boolean =>
//     isStringProvided(password) && password.length > 3 && password.length <= 24;


// /**
//  * @api {post} /changePassword Request to register a user
//  *
//  * @apiDescription Document this route. !**Document the password rules here**!
//  * !**Document the role rules here**!
//  *
//  * @apiName PutChangePassword
//  * @apiGroup Auth
//  *
//  * @apiBody {String} oldPassword a users old password
//  * @apiBody {String} newPassword a users new password
//  * @apiBody {String} confirmNewPassword confirmation of new password
//  * // confirmation password /= new password, oldPassword is not correct, password rules are met
//  * 
//  * @apiError (400: Missing Parameters) {String} message "Missing required information"
//  * @apiError (400: Invalid OldPassword) {String} message "Invalid or missing old password  - please refer to documentation"
//  * @apiError (400: Invalid NewPassword) {String} message "Invalid or missing new passwrod  - please refer to documentation"
//  * @apiError (400: Invalid ConfirmPassword) {String} message "Invalid or missing confirmation password  - please refer to documentation"
//  */
// changePasswordRouter.put('/changePassword')
// registerRouter.post(
//     '/register',
//     emailMiddlewareCheck, // these middleware functions may be defined elsewhere!
//     (request: Request, response: Response, next: NextFunction) => {
