import express, { Router } from 'express';
import httpStatus from 'http-status-codes';
import app from '../../app';
import { IScorePayload } from '../../models/game';
import authMiddleware from '../../auth/middleware';

const gameScoreRoute: Router = express.Router();

gameScoreRoute.post('/game/score', authMiddleware, async (req, resp) => 
{
    const params: IScorePayload = req.body;

    if(!params || params.gameId <= 0 || params.teamIndex < 0
     || params.end < 0 || params.value < 0) {
        resp.status(httpStatus.BAD_REQUEST).send();
        return;
    }

    const res = await app.getDataProvider().updateScore(params);

    if(!res.success) 
    {
        resp.status(httpStatus.INTERNAL_SERVER_ERROR).send(res.errorMessage);
        return;
    }

    app.getWebsocketServer()?.broadcastScore(params);

    resp.status(httpStatus.OK).send();
});

export default gameScoreRoute;