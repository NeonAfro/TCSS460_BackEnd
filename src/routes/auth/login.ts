// express is the framework we're going to use to handle requests
import express, { Request, Response, Router, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

import {
    pool,
    validationFunctions,
    credentialingFunctions,
} from '../../core/utilities';

export interface Auth {
    email: string;
    password: string;
}

export interface AuthRequest extends Request {
    auth: Auth;
}

const isStringProvided = validationFunctions.isStringProvided;
const generateHash = credentialingFunctions.generateHash;

const signinRouter: Router = express.Router();

const key = {
    secret: process.env.JSON_WEB_TOKEN,
};

/**
 * @api {post} /login Request to sign a user in the system
 * @apiName PostLogin
 * @apiGroup Login
 *
 * @apiBody {String} email a user's email
 * @apiBody {String} password a user's password
 *
 * @apiSuccess (200: OK) {string} accessToken a newly created JWT Web Token
 * @apiSuccess (200: OK) {Object} user a user object
 * @apiSuccess (200: OK) {string} user.name the username of the user
 * @apiSuccess (200: OK) {string} user.email the email of the user
 * @apiSuccess (200: OK) {string} user.role the role of the user
 * @apiSuccess (200: OK) {number} user.id the id of the user
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Invalid Credentials) {String} message "Invalid Credentials"
 * @apiUse DBError
 * Edison was here
 */
signinRouter.post(
    '/login',
    (request: AuthRequest, response: Response, next: NextFunction) => {
        if (
            isStringProvided(request.body.email) &&
            isStringProvided(request.body.password)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Missing required information',
            });
        }
    },
    (request: AuthRequest, response: Response) => {
        const theQuery = `SELECT salted_hash, salt, Account_Credential.account_id, account.email, account.firstname, account.lastname, account.phone, account.username, account.account_role FROM Account_Credential
                      INNER JOIN Account ON
                      Account_Credential.account_id=Account.account_id 
                      WHERE Account.email=$1`;
        const values = [request.body.email];
        pool.query(theQuery, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    console.error('User not found');
                    response.status(400).send({
                        message: 'Invalid Credentials',
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

                //Retrieve the salt used to create the salted-hash provided from the DB
                const salt = result.rows[0].salt;

                //Retrieve the salted-hash password provided from the DB
                const storedSaltedHash = result.rows[0].salted_hash;

                //Generate a hash based on the stored salt and the provided password
                const providedSaltedHash = generateHash(
                    request.body.password,
                    salt
                );

                //Did our salted hash match their salted hash?
                if (storedSaltedHash === providedSaltedHash) {
                    //credentials match. get a new JWT
                    const accessToken = jwt.sign(
                        {
                            name: result.rows[0].username,
                            role: result.rows[0].account_role,
                            id: result.rows[0].account_id,
                        },
                        key.secret,
                        {
                            expiresIn: '14 days', // expires in 14 days
                        }
                    );
                    //package and send the results
                    // response.json({
                    //     accessToken,
                    //     id: result.rows[0].account_id,
                    // });
                    response.json({
                        accessToken,
                        user: {
                            name: result.rows[0].username,
                            email: result.rows[0].email,
                            role: 'Admin',
                            id: result.rows[0].account_id,
                        },
                    });
                } else {
                    console.error('Credentials did not match');
                    //credentials dod not match
                    response.status(400).send({
                        message: 'Invalid Credentials',
                    });
                }
            })
            .catch((error) => {
                //log the error
                console.error('DB Query error on sign in');
                console.error(error);
                response.status(500).send({
                    message: 'server error - contact support',
                });
            });
    }
);

export { signinRouter };
