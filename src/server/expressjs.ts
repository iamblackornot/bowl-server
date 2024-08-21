import cors from 'cors';
import express from "express";
import cookieParser from 'cookie-parser'

import rootRoute from '../routes/root';
import playersGetRoute from '../routes/players/get';
import playerAddRoute from '../routes/players/add';
import gameCreateRoute from "../routes/game/create";
import logRoute from "../routes/log";
import gameScoreRoute from '../routes/game/score';
import gameEndRoute from '../routes/game/end';
import loginRoute from '../routes/auth/login';
import validateRoute from '../routes/auth/validate';
import logoutRoute from '../routes/auth/logout';
import refreshRoute from '../routes/auth/refresh';
import gameValidateRoute from '../routes/game/validate';

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
        this.expressApp.use(cors({origin: allowedOrigin, credentials: true}));
        this.expressApp.use(express.json());
        this.expressApp.use(cookieParser());

        this.expressApp.use(rootRoute);
        this.expressApp.use(logRoute);

        this.expressApp.use(playersGetRoute);
        this.expressApp.use(playerAddRoute);

        this.expressApp.use(gameCreateRoute);
        this.expressApp.use(gameScoreRoute);
        this.expressApp.use(gameEndRoute);
        this.expressApp.use(gameValidateRoute);

        this.expressApp.use(loginRoute);
        this.expressApp.use(logoutRoute);
        this.expressApp.use(refreshRoute);
        this.expressApp.use(validateRoute);
    }

    public instance = () => this.expressApp;
}