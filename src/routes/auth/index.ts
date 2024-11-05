import express, { Router } from 'express';

import { signinRouter } from './login';
import { registerRouter } from './register';
import { forgotPasswordRouter } from './forgotPassword';
import { changePasswordRouter } from './changePassword';

const authRoutes: Router = express.Router();

authRoutes.use(
    signinRouter,
    registerRouter,
    forgotPasswordRouter,
    changePasswordRouter
);

export { authRoutes };
