import express, { Router } from 'express';
import httpStatus from 'http-status-codes';
import app from '../../app';
import authMiddleware from '../../auth/middleware';

interface AddPlayerParams {
    name: string
};

const playerAddRoute: Router = express.Router();

playerAddRoute.post('/players/add', authMiddleware, async (req, resp) => 
{
    const params: AddPlayerParams = req.body;

    if(!params || !params.name) {
        resp.status(httpStatus.BAD_REQUEST).send();
        return;
    }

    const res = await app.getDataProvider().addPlayer(params.name);

    if(!res.success) 
    {
        resp.status(httpStatus.INTERNAL_SERVER_ERROR).send(res.errorMessage);
        return;
    }

    resp.status(httpStatus.OK).json(res.data).send();
});

export default playerAddRoute;