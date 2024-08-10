import express, { Router } from 'express';
import httpStatus from 'http-status-codes';
import app from '../../app';
import { ICreateGamePayload } from '../../models/game';

const gameCreateRoute: Router = express.Router();

gameCreateRoute.post('/game/create', async (req, resp) => 
{
    const params: ICreateGamePayload = req.body;

    if(!params || params.bowls <= 0 || params.ends <= 0 
     || params.type < 0 || params.type > 3 || params.teams.length === 0) {
        resp.status(httpStatus.BAD_REQUEST).send();
        return;
    }

    const createRes = await app.getDataProvider().createGame(params);

    if(!createRes.success) 
    {
        resp.status(httpStatus.INTERNAL_SERVER_ERROR).send(createRes.errorMessage);
        return;
    }

    const liveRes = await app.getDataProvider().getLiveGame();

    if(!liveRes.success || !liveRes.data) 
    {
        resp.status(httpStatus.INTERNAL_SERVER_ERROR).send(liveRes.errorMessage);
        return;
    }

    app.getWebsocketServer()?.broadcastGame(liveRes.data);

    resp.status(httpStatus.OK).send();
});

export default gameCreateRoute;