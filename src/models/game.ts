import IPlayer from "./player";

export enum GameType {
    Cutthroat = 0,
    OneVsOne = 1,
    TwoVsTwo = 2,
    ThreeVsThree = 3,
}

export interface ICreateGamePayload {
    type: GameType;
    teams: number[][];
    ends: number;
    bowls: number;
}

export interface IGame {
    id: number;
    type: GameType;
    created: Date;
    teams: IPlayer[][];
    ends: number;
    bowls: number;
}

export const noGame: IGame = {
    id: -1,
    type: 0,
    created: new Date(Date.now()),
    teams: [],
    ends: 0,
    bowls: 0,
} 