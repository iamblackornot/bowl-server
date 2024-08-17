import { Footprint } from './../../models/footprint';
import express, { Router } from 'express';
import httpStatus from 'http-status-codes';
import app from '../../app';

const loginRoute: Router = express.Router();

loginRoute.post('/auth/login', async (req, resp) => 
{
    if(!req.body || !req.body.username || !req.body.password) {
        resp.status(httpStatus.BAD_REQUEST).send();
        return;
    }

    if(!req.ip) {
        resp.status(httpStatus.BAD_REQUEST).send("hidden ip address");
        return;
    }

    if(!req.headers['user-agent']) {
        resp.status(httpStatus.BAD_REQUEST).send("hidden user agent");
        return;
    }

    const footprint: Footprint = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const res = await app.getAuthProvider().login(req.body.username, req.body.password, footprint);
    
    if(!res.success) {
        resp.status(httpStatus.UNAUTHORIZED).json({message: res.errorMessage}).send();
        return;
    }

    resp.cookie("refreshToken", res.data!.refresh, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
    });
    
    resp.status(httpStatus.OK).send(res.data);
});

export default loginRoute;