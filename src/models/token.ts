import { Footprint } from "./footprint";

export interface IToken {
    username: string;
    access: string;
    refresh: string;
}

export interface TokenPayload {
    username: string;
    userId: number;
    footprint: Footprint;
}