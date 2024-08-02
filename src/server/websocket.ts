
import WebSocket from 'ws';
import { Server } from './server';
import { log } from '../../log';
import IDataProvider from '../data/dataprovider';
import { IGame, noGame } from '../models/game';

enum MessageType {
    Error = 0,
    Game = 1,
    Scores = 2,
}

export default class WebSocketServer
{
    private wss: WebSocket.Server;
    private dataProvider: IDataProvider;

    constructor(server: Server, dataProvider: IDataProvider)
    {
        this.dataProvider = dataProvider;
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', async (ws) =>
        {
            ws.on('error', (err) => {
                log(err.toString());
                this.sendError(ws, err.message);
            });
          
            ws.on('message', function message(data) {
                console.log('received: %s', JSON.parse(data.toString()));
            });
          
            const res = await this.dataProvider.getLiveGame();

            if(res.success) {
                this.sendGame(ws, res.data ?? noGame);
            } else {
                this.sendError(ws, res.errorMessage);
            }
        });

        setInterval(this.broadcastPing.bind(this), parseInt(process.env.WS_PING_INTERVAL!) ?? 30000)
    }

    public broadcastGame(game: IGame) {
        for(const client of this.wss.clients) {
            this.sendGame(client, game);
        }
    }

    private broadcastPing() {
        for(const client of this.wss.clients) {
            client.ping();
        }
    }

    private sendGame(ws: WebSocket, game: IGame) {
        const message = {
            type: MessageType.Game,
            payload: game
        }

        ws.send(JSON.stringify(message));   
    }

    private sendError(ws: WebSocket, errorMessage: string) {
        const message = {
            type: MessageType.Error,
            payload: errorMessage,
        }

        ws.send(JSON.stringify(message));   
    }
}