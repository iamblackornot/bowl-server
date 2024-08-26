import IPlayer from "./player";

export enum GameType {
    NoGame = -1,
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

export type IScorePayload = {
    gameId: number;
    teamIndex: number;
    end: number;
    value: number;
};
export interface IGameCommon {
    id: number;
    type: GameType;
    created: Date;
    teams: IPlayer[][];
    ends: number;
    bowls: number;
}

export interface IGame extends IGameCommon {
    scores: number[][];
}

export interface IGameSummary extends IGameCommon {
    id: number;
    type: GameType;
    created: Date;
    ended: Date;
    teams: IPlayer[][];
    ends: number;
    bowls: number;
    finalScores: number[];
}

export interface GameSummaryPayload  {
    games: IGameSummary[];
    page: number;
    totalGames: number;
}

export const noGame: IGame = {
    id: -1,
    type: GameType.NoGame,
    created: new Date(Date.now()),
    teams: [],
    ends: 0,
    bowls: 0,
    scores: [],
} 

export interface ValidationSummary {
    problems: string[];
}

export interface GameTypeInfo {
    teamSize: number;
    teamCount: number;
    name: string;
}

export const gameInfoByType: Map<GameType, GameTypeInfo> = new Map<GameType, GameTypeInfo>([
    [GameType.Cutthroat, {teamSize: 1, teamCount: 3, name: "cutthroat"}],
    [GameType.OneVsOne, {teamSize: 1, teamCount: 2, name: "singles"}],
    [GameType.TwoVsTwo, {teamSize: 2, teamCount: 2, name: "doubles"}],
    [GameType.ThreeVsThree, {teamSize: 3, teamCount: 2, name: "triples"}],
]);