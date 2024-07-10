import mysql, { FieldPacket, QueryResult } from 'mysql2/promise';
import Result from './result';
import IDataProvider from './dataprovider';
import IPlayer from '../models/player';

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

    private isResultSetHeader(obj: any): obj is mysql.ResultSetHeader {
        return 'affectedRows' in obj && 'insertId' in obj;
    }

    private async query(sqlStatement: string, ...args: any): Promise<Result<QueryResult>> {
        try {
            const res = await this.pool.query(sqlStatement, args);
            return new Result<QueryResult>(true, res[0]);
        } catch (err: any) {
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
    }
}
