import express, { Router } from 'express';
import app from '../../app';
import authMiddleware from '../../auth/middleware';

const playersGetRoute: Router = express.Router();

playersGetRoute.get('/players', authMiddleware, async (req, resp) => 
{
    const res = await app.getDataProvider().getPlayers();

    if(!res.success) 
    {
        resp.status(500).send(res.errorMessage);
        return;
    }

    resp.status(200).json(res.data);
});

export default playersGetRoute;