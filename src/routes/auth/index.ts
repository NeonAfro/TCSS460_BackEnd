import express, { Router } from 'express';

import { signinRouter } from './login';
import { registerRouter } from './register';
import { forgotPasswordRouter } from './forgotPassword';

const authRoutes: Router = express.Router();

authRoutes.use(signinRouter, registerRouter, forgotPasswordRouter);

export { authRoutes };
