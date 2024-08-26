import express, { Router } from 'express';
import httpStatus from 'http-status-codes';
import app from '../../app';

const gameHistoryRoute: Router = express.Router();

gameHistoryRoute.get('/game/history', async (req, resp) => 
{
    const page = parseInt(req.query?.page as string);
    const pageSize = parseInt(req.query?.pageSize as string);

    if(!page || !pageSize || page <= 0 || pageSize <= 0) {
        resp.status(httpStatus.BAD_REQUEST).send();
        return;
    }

    const res = await app.getDataProvider().getGames(page, pageSize);

    if(!res.success) 
    {
        resp.status(httpStatus.INTERNAL_SERVER_ERROR).send(res.errorMessage);
        return;
    }

    resp.status(httpStatus.OK).send(res.data);
});

export default gameHistoryRoute;