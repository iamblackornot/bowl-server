import express, { Router } from 'express';
import httpStatus from 'http-status-codes';
import app from '../../app';

const refreshRoute: Router = express.Router();

refreshRoute.post('/auth/refresh', async (req, resp) => 
{
    if(!req.cookies.refreshToken) {
        resp.status(httpStatus.UNAUTHORIZED).send();
        return;
    }

    const res = await app.getAuthProvider().tokenRefresh(req.cookies.refreshToken);
    
    if(!res.success) {
        if(!res.errorMessage)
            resp.status(httpStatus.UNAUTHORIZED).send();
        else
            resp.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: res.errorMessage }).send();

        return;
    }

    resp.cookie("refreshToken", res.data!.refresh, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    });

    resp.status(httpStatus.OK).json(res.data).send();
});

export default refreshRoute;