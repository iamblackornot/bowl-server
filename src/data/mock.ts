import IPlayer from "../models/player";
import IDataProvider from "./dataprovider";
import Result from "./result";

export default class MockDataProvider implements IDataProvider
{
    addPlayer(name: string): Promise<Result<IPlayer>> {
        return Promise.resolve(new Result<IPlayer>(true, { id: 1, name }));
    }
    getPlayer(id: number): Promise<Result<IPlayer>> {
        return Promise.resolve(new Result<IPlayer>(true, { id, name: "jopich" }));
    }
    getPlayers(): Promise<Result<IPlayer[]>> {
        const players: IPlayer[] = [
            { id: 0, name: "chika" },
            { id: 1, name: "krem" },
        ];
        
        return Promise.resolve(new Result<IPlayer[]>(true, players));
    }
}