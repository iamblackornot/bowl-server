export interface IUser {
    id: number;
    username: string;
    password: string;
}

export const UserNotFound: IUser = {
    id: -1,
    username: "not found",
    password: "not found",
}