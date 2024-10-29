// express is the framework we're going to use to handle requests
import express, { Request, Response, Router, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

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
