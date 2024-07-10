import MockDataProvider from "./data/mock"
import IDataProvider from "./data/dataprovider"
import http from 'http';
import https from 'https';
import cors from 'cors';
import fs from 'fs';

import rootRoute from './routes/root';

import dotenv from "dotenv";
import express from "express";
import playersGetRoute from './routes/players/get';
import playerAddRoute from './routes/players/add';
import MySQLDataProvider from './data/mysql';
import { initLogger } from "../log";
import logRoute from "./routes/log";

class Application
{
    public database: IDataProvider; 

    constructor()
    {
        this.database = new MockDataProvider();
        dotenv.config();
    }

    private checkEnvVariables(): boolean
    {
        if(!process.env.MYSQL_ENDPOINT) { return false; }
        if(!process.env.MYSQL_USERNAME) { return false; }
        if(!process.env.MYSQL_PASS)     { return false; }
        if(!process.env.MYSQL_DBNAME)   { return false; }

        return true;
    }

    private readSSLCertificates()
    {
        if(!process.env.SSL_KEY_PATH) { return false; }
        if(!process.env.SSL_CERTIFICATE_PATH) { return false; }

        if(!fs.existsSync(process.env.SSL_KEY_PATH)) { return false; }
        if(!fs.existsSync(process.env.SSL_CERTIFICATE_PATH)) { return false; }

        return {
          key: fs.readFileSync(process.env.SSL_KEY_PATH),
          cert: fs.readFileSync(process.env.SSL_CERTIFICATE_PATH),
        };
    }

    private initAPI()
    {
        const expressApp = express();
        const port = parseInt(process.env.PORT || '3111');

        expressApp.options('*', cors());

        const corsOptions = {
            origin: ['https://localhost:5173', 'https://localhost', 'https://posterpresentations.ddns.net'],
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        };

        expressApp.use(cors(corsOptions));

        // expressApp.use(function(req, res, next) {

        //     const origin = (req.headers.origin || "*");
          
        //     res.header("Access-Control-Allow-Origin", origin);
        //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
          
        //     next();
        //   });

        // expressApp.use((req, res, next) => 
        // {
        //     res.header('Access-Control-Allow-Origin', '*');
        //     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        //     next();
        // });
        expressApp.use(express.json());

        expressApp.use(rootRoute);
        expressApp.use(logRoute);
        expressApp.use(playersGetRoute);
        expressApp.use(playerAddRoute);

        const ssl = this.readSSLCertificates();

        if(ssl) {
            https.createServer(ssl, expressApp).listen(port, () => 
            {
                console.log('https is listening at ', port);
            });
        } else {
            http.createServer(expressApp).listen(port, () => 
            {
                console.log('http is listening at', port);
            });
        }
    }

    private initDataProvider()
    {
        this.database = new MySQLDataProvider(
            process.env.MYSQL_ENDPOINT!,
            process.env.MYSQL_USERNAME!,
            process.env.MYSQL_PASS!, 
            process.env.MYSQL_DBNAME!
        );
    }

    public async run()
    {
        initLogger();

        if(!this.checkEnvVariables()) {
            console.log("ENV variables are missing");
            return;

        }

        this.initAPI();
        this.initDataProvider();

        console.log(process.env.MYSQL_USERNAME);
    }
}

const app: Application = new Application();
export default app;

