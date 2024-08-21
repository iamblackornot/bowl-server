import express, { Router } from 'express';
import httpStatus from 'http-status-codes';
import app from '../../app';
import authMiddleware from '../../auth/middleware';
import { validateGameState } from '../../data/validate';

const gameValidateRoute: Router = express.Router();

gameValidateRoute.post('/game/validate', authMiddleware, async (req, resp) => 
{
    const res = await app.getDataProvider().getLiveGame();

    if(!res.success || !res.data) 
    {
        resp.status(httpStatus.INTERNAL_SERVER_ERROR).send(res.errorMessage);
        return;
    }

    const summary = validateGameState(res.data);
    resp.status(httpStatus.OK).send(summary);
});

export default gameValidateRoute;