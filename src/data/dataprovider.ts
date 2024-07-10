import IPlayer from "../models/player";
import Result from "./result";

export default interface IDataProvider
{
    addPlayer(name: string): Promise<Result<IPlayer>>
    getPlayer(id: number): Promise<Result<IPlayer>>
    getPlayers() : Promise<Result<IPlayer[]>>

}