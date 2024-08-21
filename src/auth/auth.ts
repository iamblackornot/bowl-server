import { Footprint } from './../models/footprint';
import { UserNotFound } from './../models/user';
import bcrypt from 'bcrypt'
import {createSecretKey, KeyObject} from 'crypto'
import { jwtDecrypt, JWTPayload, jwtVerify, SignJWT } from 'jose';

import IDataProvider from '../data/dataprovider';
import Result from '../data/result';
import { IToken, TokenPayload } from '../models/token';
import { log } from '../../log';

export default class AuthProvider {
    private dataProvider: IDataProvider;
    private accessSecret: KeyObject;
    private refreshSecret: KeyObject;

    constructor(dataProvider: IDataProvider) {
        this.dataProvider = dataProvider;
        this.accessSecret = createSecretKey(Buffer.from(process.env.JWT_ACCESS_SECRET || ""));
        this.refreshSecret = createSecretKey(Buffer.from(process.env.JWT_REFRESH_SECRET || ""));
    }

    public async createUser(username: string, password: string): Promise<Result<number>> {
        const hash = await bcrypt.hash(password, 3);
        return await this.dataProvider.addUser(username, hash);
    }

    public async login(username: string, password: string, footprint: Footprint): Promise<Result<IToken>> {

        const res = await this.dataProvider.getUser(username);

        if(!res.success) 
            return new Result<IToken>(false, null, res.errorMessage);
        if(!res.data || res.data.id === UserNotFound.id) 
            return new Result<IToken>(false, null, "wrong user or password");

        const equalPass = await bcrypt.compare(password, res.data.password);
        if(!equalPass) 
            return new Result<IToken>(false, null, "wrong user or password");

        return this.generateTokens({ userId: res.data.id, username, footprint });
    }

    public async logout(token: string): Promise<void> {
        const res = await this.dataProvider.removeTokenRecord(token);
        if(!res.success) {
            log(`failed to remove token record, reason: ${res.errorMessage}`);
        }
    }

    public async tokenRefresh(refreshToken: string): Promise<Result<IToken>> {

        const validateRes = await this.validateRefreshToken(refreshToken);

        if(!validateRes.success || !validateRes.data) {
            await this.dataProvider.removeTokenRecord(refreshToken);
            return new Result(false);
        }

        const checkRecordRes = await this.dataProvider.checkTokenRecord(refreshToken, validateRes.data.userId)
        if(!checkRecordRes.success) {
            return new Result<IToken>(false, null, checkRecordRes.errorMessage);
        }

        await this.dataProvider.removeTokenRecord(refreshToken);

        return this.generateTokens(validateRes.data);
    }

    public async validateAccessToken(token: string): Promise<Result<TokenPayload>> {
        return this.validateToken(token, this.accessSecret);
    }

    public async validateRefreshToken(token: string): Promise<Result<TokenPayload>> {
        return this.validateToken(token, this.refreshSecret);
    }

    private async validateToken(token: string, secret: KeyObject): Promise<Result<TokenPayload>> {
        try {
            const res = await jwtVerify(token, secret);
            return new Result(true, (res.payload as unknown) as TokenPayload);
        } catch(error: any) {
            if(!error?.code && (error.code !== "ERR_JWT_EXPIRED" || error.code !== "ERR_JWT_INVALID")) {
                console.log(error);
            }
            return new Result(false);
        }
    }

    private async generateTokens(payload: TokenPayload): Promise<Result<IToken>> {

        const access = await new SignJWT({ ...payload })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('15min')
            .sign(this.accessSecret);

        const refresh = await new SignJWT({ ...payload })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30d')
            .sign(this.refreshSecret);

        const res = await this.dataProvider.addTokenRecord(refresh, payload.userId, payload.footprint);
        if(!res.success) return new Result<IToken>(false, null, res.errorMessage);

        return new Result(true, { access, refresh, username: payload.username });
    }
}