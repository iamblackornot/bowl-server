import MockDataProvider from "./data/mock"
import IDataProvider from "./data/dataprovider"
import http from 'http';

import rootRoute from './routes/root';

import dotenv from "dotenv";
import express from "express";
import playersGetRoute from './routes/players/get';
import playerAddRoute from './routes/players/add';
import MySQLDataProvider from './data/mysql';

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

    private initAPI()
    {
        const expressApp = express();
        const port = parseInt(process.env.PORT || '3111');

        expressApp.use(express.json());
        expressApp.use((req, res, next) => 
        {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });

        expressApp.use(rootRoute);
        expressApp.use(playersGetRoute);
        expressApp.use(playerAddRoute);

        http.createServer(expressApp).listen(port, () => 
        {
            console.log('http is listening at', port);
        });
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
        if(!this.checkEnvVariables()) {
            console.log("ENV variables are missing");
            return;

        }

        this.initAPI();
        this.initDataProvider();

        console.log(process.env.MYSQL_USERNAME);

        const testdb = new MySQLDataProvider(
            process.env.MYSQL_ENDPOINT!,
            process.env.MYSQL_USERNAME!,
            process.env.MYSQL_PASS!, 
            process.env.MYSQL_DBNAME!
        );
    }
}

const app: Application = new Application();
export default app;

