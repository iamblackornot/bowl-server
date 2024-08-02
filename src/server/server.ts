import http from 'http';
import https from 'https';
import { SSLParams } from '../app';
import Express from './expressjs';

type HttpsServer = https.Server<typeof http.IncomingMessage, typeof http.ServerResponse> | http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
type HttpServer = http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> | http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
export type Server = HttpsServer | HttpServer;

export function createServer(params: SSLParams, expressApp: Express)
{
    const port = parseInt(process.env.PORT || '3111');

    if(params) {
        return https.createServer(params, expressApp.instance()).listen(port, () => 
        {
            console.log('https is listening at', port);
        });
    }

    return http.createServer(expressApp.instance()).listen(port, () => 
    {
        console.log('http is listening at', port);
    });
}