import cors from 'cors';
import express from "express";

import rootRoute from '../routes/root';
import playersGetRoute from '../routes/players/get';
import playerAddRoute from '../routes/players/add';
import gameCreateRoute from "../routes/game/create";
import logRoute from "../routes/log";
import gameScoreRoute from '../routes/game/score';

export default class Express
{
    private expressApp: express.Application;

    constructor()
    {
        this.expressApp = express();

        const allowedOrigin: string = 
            process.env.CORS_ALLOWED_ORIGIN 
         && process.env.CORS_ALLOWED_ORIGIN.length > 0 
          ? process.env.CORS_ALLOWED_ORIGIN
          : "*";
          
        console.log("allowed origin:", allowedOrigin);
        this.expressApp.use(cors({origin: allowedOrigin}));
        this.expressApp.use(express.json());

        this.expressApp.use(rootRoute);
        this.expressApp.use(logRoute);

        this.expressApp.use(playersGetRoute);
        this.expressApp.use(playerAddRoute);

        this.expressApp.use(gameCreateRoute);
        this.expressApp.use(gameScoreRoute);
    }

    public instance = () => this.expressApp;
}