import fs from 'fs';
import dotenv from "dotenv";

import MockDataProvider from "./data/mock"
import IDataProvider from "./data/dataprovider"
import MySQLDataProvider from './data/mysql';
import { initLogger } from "../log";
import Express from './server/expressjs';
import { createServer } from './server/server';
import WebSocketServer from './server/websocket';
import AuthProvider from './auth/auth';

export type SSLParams = false | {
    key: Buffer;
    cert: Buffer;
}

class Application
{
    private database: IDataProvider;
    private auth: AuthProvider;
    private websocket?: WebSocketServer;

    constructor()
    {
        this.database = new MockDataProvider();
        this.auth = new AuthProvider(this.database);
        dotenv.config();
    }

    private checkEnvVariables(): boolean
    {
        if(!process.env.MYSQL_ENDPOINT)   { return false; }
        if(!process.env.MYSQL_USERNAME)   { return false; }
        if(!process.env.MYSQL_PASS)       { return false; }
        if(!process.env.MYSQL_DBNAME)     { return false; }
        if(!process.env.WS_PING_INTERVAL) { return false; }

        if(!process.env.JWT_ACCESS_SECRET)  { return false; }
        if(!process.env.JWT_REFRESH_SECRET) { return false; }
        
        return true;
    }

    private readSSLCertificates(): SSLParams
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

    private initDataProvider()
    {
        this.database = new MySQLDataProvider(
            process.env.MYSQL_ENDPOINT!,
            process.env.MYSQL_USERNAME!,
            process.env.MYSQL_PASS!, 
            process.env.MYSQL_DBNAME!
        );
    }

    public getDataProvider = () => this.database;
    public getWebsocketServer = () => this.websocket;
    public getAuthProvider = () => this.auth;

    public async run()
    {
        initLogger();

        if(!this.checkEnvVariables()) {
            console.log("ENV variables are missing");
            return;

        }

        this.initDataProvider();
        this.auth = new AuthProvider(this.database);

        const expressApp = new Express();
        const server = createServer(this.readSSLCertificates(), expressApp);
        this.websocket = new WebSocketServer(server, this.database);

        console.log(process.env.MYSQL_USERNAME);
    }
}

const app: Application = new Application();
export default app;

