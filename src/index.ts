import express from "express"
import { Request,Response } from "express";

const cors = require("cors");
const UserAuth = require('./Routes/UserAuth');
const workerAuth = require('./Routes/Worker/WorkerAuth');
const Profile = require('./Routes/Worker/profile');
const WorkerList = require('./Routes/Client/WorkerList');

const app = express();
app.use(cors());
app.use(express.json());


// test api
app.get("/api/v1/user",(req:Request,res:Response)=>{
    res.send({"testing":"This is main route testing"})
})


// this is the client api for worker list 
app.use("/api/v1/client",WorkerList);

// this is the worker api for worker login , logout , and signup
app.use("api/v1/worker",workerAuth);

// this is the worker api for worker profile
app.use("api/v1/worker",Profile);

app.listen(3000);

