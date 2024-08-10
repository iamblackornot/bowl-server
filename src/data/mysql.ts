import mysql, { PoolConnection, QueryResult, RowDataPacket } from 'mysql2/promise';
import Result from './result';
import IDataProvider from './dataprovider';
import IPlayer from '../models/player';
import { ICreateGamePayload, IGame, IScorePayload, noGame } from '../models/game';

interface CountRow extends RowDataPacket {
    count: number;
}

interface TeamsRow extends RowDataPacket {
    team_index: number;
    id: number;
    name: string;
}

interface ScoresRow extends RowDataPacket {
    game_id: number;
    team_index: number;
    end: number;
    score: number;
}

export default class MySQLDataProvider implements IDataProvider {
    private pool: mysql.Pool;

    constructor(endpoint: string, user: string, pass: string, dbname: string) {
        this.pool = mysql.createPool({
            host: endpoint,
            user: user,
            password: pass,
            database: dbname,
            waitForConnections: true,
            connectionLimit: 5,
            maxIdle: 5,
            idleTimeout: 60000,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            multipleStatements: true,
            timezone: 'Z',
        });
    }

    public async addPlayer(name: string): Promise<Result<IPlayer>> {
        const insertRes = await this.query("INSERT INTO players (name) VALUES(?)", [name]);

        if(!insertRes.success) {
            return new Result<IPlayer>(false, null, insertRes.errorMessage);
        }

        if(!this.isResultSetHeader(insertRes.data)) {
            return new Result<IPlayer>(false, null, "Bad Query");
        }

        const getRes = await this.getPlayer(insertRes.data.insertId);

        if(!getRes.success) {
            return new Result<IPlayer>(false, null, getRes.errorMessage);
        }

        return new Result<IPlayer>(true, getRes.data);
    }

    public async getPlayer(id: number): Promise<Result<IPlayer>> {
        const res = await this.query("SELECT * FROM players WHERE id = ?", id);

        if(!res.success) {
            return new Result<IPlayer>(false, null, res.errorMessage);
        }

        return new Result<IPlayer>(true, (res.data as IPlayer[])[0]);
    }

    public async getPlayers(): Promise<Result<IPlayer[]>> {
        const res = await this.query("SELECT * FROM players ORDER BY name ASC");

        if(!res.success) {
            return new Result<IPlayer[]>(false, null, res.errorMessage);
        }

        return new Result<IPlayer[]>(true, res.data as IPlayer[]);
    }

    public async createGame(params: ICreateGamePayload): Promise<Result<null>> {
        const conn = await this.pool.getConnection();

        try
        {
            await conn.beginTransaction();
            
            let res = await conn.execute("SELECT COUNT(*) as count FROM live;");
            const liveCount = (res[0] as CountRow[])[0].count;
            
            if(liveCount !== 0) {
                await this.abortConnection(conn);
                return new Result<null>(false, null, "live game is already running");
            }
            
            res = await conn.query("INSERT INTO games (created, type, ends, bowls)" + 
                                     "VALUES (UTC_TIMESTAMP(), ?, ?, ?);", [ params.type, params.ends, params.bowls ]);

            if(!this.isResultSetHeader(res[0])) {
                await this.abortConnection(conn);
                return new Result<null>(false, null, "Bad Query");
            }

            const gameId = res[0].insertId;
            res = await conn.query("INSERT INTO live (game_id) VALUES (?) ON DUPLICATE KEY UPDATE dummy=dummy;", gameId);

            if(!this.isResultSetHeader(res[0])) {
                await this.abortConnection(conn);
                return new Result<null>(false, null, "Bad Query");
            }

            if(res[0].affectedRows === 0) {
                await this.abortConnection(conn);
                return new Result<null>(false, null, "live game is already running");
            }

            const teamArrays = [];

            for(let teamIndex = 0; teamIndex < params.teams.length; ++teamIndex) {
                for(const playerId of params.teams[teamIndex]) {
                    teamArrays.push([ gameId, teamIndex, playerId ]);
                }
            }
            
            await conn.query("INSERT INTO teams (game_id, team_index, player_id) VALUES ?", [teamArrays]);

            await conn.commit();
            conn.release();

            return new Result<null>(true);
        } 
        catch(err: any) 
        {
            await this.abortConnection(conn);
            const res = this.handleError(err);
            return new Result(false, null, res.errorMessage);
        }
    }

    public async getLiveGame(): Promise<Result<IGame>> {
        let res = await this.query("SELECT games.* FROM live LEFT JOIN games ON live.game_id = games.id");

        if(!res.success) {
            return new Result<IGame>(false, noGame, res.errorMessage);
        }

        const game = (res.data as IGame[])[0];

        if(!game) {
            return new Result<IGame>(true, noGame, res.errorMessage);
        }

        res = await this.query("SELECT teams.team_index, players.* FROM teams " + 
                               "LEFT JOIN players ON teams.player_id = players.id " + 
                               "WHERE game_id = ? ORDER BY team_index", game.id);

        if(!res.success) {
            return new Result<IGame>(false, noGame, res.errorMessage);
        }

        game.teams = [];
        const rows = res.data as TeamsRow[];

        for(const row of rows) {
            if(row.team_index >= game.teams.length) {
                game.teams.push([]);
            }
            
            game.teams[row.team_index].push({ id: row.id, name: row.name });
        }

        game.scores = this.createZeroScores(game.ends, game.teams.length);

        res = await this.query("SELECT * FROM scores " + 
            "WHERE game_id = ?", game.id);

        if(!res.success) {
            return new Result<IGame>(false, noGame, res.errorMessage);
        }

        const scoreEntries = (res.data as ScoresRow[]);

        for(const entry of scoreEntries) {
            game.scores[entry.team_index][entry.end] = entry.score;
        }

        return new Result<IGame>(true, game);
    }

    public async updateScore(params: IScorePayload): Promise<Result<null>> {

        if(params.value !== 0) {
            const res = await this.query("INSERT INTO scores (game_id, team_index, end, score) VALUES (?, ?, ?, ?) " + 
                                        "ON DUPLICATE KEY UPDATE score = ?;", 
                                        [params.gameId, params.teamIndex, params.end, params.value, params.value]);

            if(!res.success) {
                return new Result(false, null, res.errorMessage);
            }
        }
        else
        {
            await this.query("DELETE FROM scores WHERE game_id = ? AND team_index = ? AND end = ?",
                            [params.gameId, params.teamIndex, params.end])
        }

        return new Result(true);
    }

    private createZeroScores(ends: number, teamCount: number): number[][] {
        return Array(teamCount).fill([]).map(() => Array(ends + 1).fill(0));
    }

    private isResultSetHeader(obj: any): obj is mysql.ResultSetHeader {
        return 'affectedRows' in obj && 'insertId' in obj;
    }

    private async query(sqlStatement: string, args?: any): Promise<Result<QueryResult>> {
        const conn = await this.pool.getConnection();
        const res = this.query_conn(conn, sqlStatement, args);
        conn.release();
        return res;
    }
    private async query_conn(conn: PoolConnection, sqlStatement: string, args: any): Promise<Result<QueryResult>> {
        try {
            const res = await conn.query(sqlStatement, args);
            return new Result<QueryResult>(true, res[0]);
        } catch (err: any) {
            return this.handleError(err);
        }
    }
    private handleError(err: any) {
        let message: string = "ERR: MySQL database query failed";

        switch (err?.code) {
            case 'ER_DUP_ENTRY':
                message = "ERR: Duplicate entry";
                break;
            default:
                console.log("MySQL database query failed, reason: ", err);
        }

        return new Result<QueryResult>(false, null, message);
    }
    private async abortConnection(conn: PoolConnection) {
        if(conn) {
            await conn.query("UNLOCK TABLES;");
            await conn.rollback();
            conn.release();
        }
    }
}
