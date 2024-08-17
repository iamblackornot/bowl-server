import express, { Router } from 'express';
import httpStatus from 'http-status-codes';
import { log } from 'console';

interface LogParams {
    message: string
};

const logRoute: Router = express.Router();

logRoute.post('/log', async (req, resp) => 
{
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1';
    // console.log(req.ip);

    if(!isLocalhost) {
        resp.status(httpStatus.FORBIDDEN).send();
    }

    const params: LogParams = req.body;

    if(!params || !params.message) {
        resp.status(httpStatus.BAD_REQUEST).send();
        return;
    }

    log(params.message);

    resp.status(httpStatus.OK).send();
});

export default logRoute;