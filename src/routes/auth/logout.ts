import express, { Router } from 'express';
import httpStatus from 'http-status-codes';
import app from '../../app';

const logoutRoute: Router = express.Router();

logoutRoute.post('/auth/logout', async (req, resp) => 
{

    if(!req.cookies.refreshToken) {
        resp.status(httpStatus.BAD_REQUEST).send();
        return;
    }

    await app.getAuthProvider().logout(req.cookies.refreshToken);
    
    resp.clearCookie("refreshToken");
    resp.status(httpStatus.OK).send();
});

export default logoutRoute;