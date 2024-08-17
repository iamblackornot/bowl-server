import express, { Router } from 'express';
import httpStatus from 'http-status-codes';
import app from '../../app';
import { noGame } from '../../models/game';
import authMiddleware from '../../auth/middleware';

const gameEndRoute: Router = express.Router();

gameEndRoute.post('/game/end', authMiddleware, async (req, resp) => 
{
    const { id } = req.body;

    if(!id || id < 0) {
        resp.status(httpStatus.BAD_REQUEST).send();
        return;
    }

    const res = await app.getDataProvider().endGame(id);

    if(!res.success) 
    {
        resp.status(httpStatus.INTERNAL_SERVER_ERROR).send(res.errorMessage);
        return;
    }

    app.getWebsocketServer()?.broadcastGame(noGame);
    resp.status(httpStatus.OK).send();
});

export default gameEndRoute;