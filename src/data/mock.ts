import { ICreateGamePayload, IGame, IScorePayload } from "../models/game";
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
    createGame(params: ICreateGamePayload): Promise<Result<null>> {
        return Promise.resolve(new Result(true));
    }

    getLiveGame(): Promise<Result<IGame>> {
        return Promise.resolve(new Result(true));
    }

    updateScore(params: IScorePayload): Promise<Result<null>> {
        return Promise.resolve(new Result(true));
    }
}