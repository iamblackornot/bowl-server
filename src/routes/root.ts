import express, { Router } from 'express';

const rootRoute: Router = express.Router();

rootRoute.get('/', (req, res) => 
{
    res.status(200).send("bowl server is running");
});

export default rootRoute;