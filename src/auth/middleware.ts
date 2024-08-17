import httpStatus from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import app from '../app';

export default async function authMiddleware (req: Request, resp: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        return resp.status(httpStatus.UNAUTHORIZED).send();
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
        return resp.status(httpStatus.UNAUTHORIZED).send();
    }

    const res = await app.getAuthProvider().validateAccessToken(accessToken);
    if (!res.success) {
        if(!res.errorMessage)
            return resp.status(httpStatus.UNAUTHORIZED).send();
        else
            return resp.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: res.errorMessage});
    }

    next();
};