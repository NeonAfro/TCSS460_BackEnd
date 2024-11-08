import express, { Router } from 'express';

import { checkToken } from '../../core/middleware';
import { tokenTestRouter } from './tokenTest';
import { bookRouter } from './book';
import { changePasswordRouter } from './changePassword';

const closedRoutes: Router = express.Router();

closedRoutes.use('/jwt_test', checkToken, tokenTestRouter);
closedRoutes.use('/book', checkToken, bookRouter);
closedRoutes.use(checkToken, changePasswordRouter);

export { closedRoutes };
