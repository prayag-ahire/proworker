import express from "express"
import { Request,Response } from "express";

const cors = require("cors");
const UserRouter = require('./Routes/UserAuth');
const workerRouter = require('./Routes/Worker/WorkerAuth');

const app = express();
app.use(cors());
app.use(express.json());


// test api
app.get("/api/v1/user",(req:Request,res:Response)=>{
    res.send({"testing":"This is main route testing"})
})



app.use("/api/v1/client",UserRouter);

app.use("api/v1/worker",workerRouter);

app.listen(3000);

