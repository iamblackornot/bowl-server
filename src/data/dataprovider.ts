import { Footprint } from "../models/footprint";
import { ICreateGamePayload, IGame, IScorePayload } from "../models/game";
import IPlayer from "../models/player";
import { IUser } from "../models/user";
import Result from "./result";

export default interface IDataProvider
{
    addPlayer(name: string): Promise<Result<IPlayer>>
    getPlayer(id: number): Promise<Result<IPlayer>>
    getPlayers() : Promise<Result<IPlayer[]>>

    createGame(params: ICreateGamePayload): Promise<Result<null>>
    getLiveGame(): Promise<Result<IGame>>
    updateScore(params: IScorePayload): Promise<Result<null>>
    endGame(id: number): Promise<Result<null>>

    addUser(username: string, password: string): Promise<Result<number>>
    getUser(username: string): Promise<Result<IUser>>

    addTokenRecord(token: string, userId: number, footprint: Footprint): Promise<Result<null>>
    checkTokenRecord(token: string, userId: number): Promise<Result<null>>
    removeTokenRecord(token: string): Promise<Result<null>>
}