import express, { Router } from 'express';
import httpStatus from 'http-status-codes';
import app from '../../app';

const validateRoute: Router = express.Router();

validateRoute.post('/auth/validate', async (req, resp) => 
{
    if(!req.body || !req.body.accessToken) {
        resp.status(httpStatus.BAD_REQUEST).send();
        return;
    }

    const res = await app.getAuthProvider().validateAccessToken(req.body.accessToken);
    
    if(!res.success) {
        resp.status(httpStatus.OK).json({valid: false}).send();
        return;
    }

    resp.status(httpStatus.OK).json({valid: true}).send();
});

export default validateRoute;