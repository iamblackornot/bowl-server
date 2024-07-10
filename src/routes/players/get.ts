import express, { Router } from 'express';
import app from '../../app';

const playersGetRoute: Router = express.Router();

playersGetRoute.get('/players', async (req, resp) => 
{
    const res = await app.database.getPlayers();

    if(!res.success) 
    {
        resp.status(500).send(res.errorMessage);
        return;
    }

    resp.status(200).json(res.data);
});

export default playersGetRoute;