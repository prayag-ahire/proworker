import express from "express"
import { Request,Response } from "express";

const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const Clientauth = require('./Routes/Client/ClientAuth');
const WorkerList = require('./Routes/Client/WorkerList');
const clientOrders = require('./Routes/Client/orders');
const workerAvailability = require('./Routes/Client/WorkerAvailability');
const Booking = require('./Routes/Client/Booking');
const reschedule = require('./Routes/Client/Reschedule');
const client_Profile = require('./Routes/Client/Profile');
const client_Settings = require('./Routes/Client/Settings');
const review = require('./Routes/Client/Reviews');



const workerAuth = require('./Routes/Worker/WorkerAuth');





// test api
app.get("/api/v1/user",(req:Request,res:Response)=>{
    res.send({"testing":"This is main route testing"})
})


//client routes
app.use("/api/v1/client",Clientauth);
app.use("/api/v1/client",WorkerList);
app.use("/api/v1/client",clientOrders);
app.use("/api/v1/client",workerAvailability);
app.use("/api/v1/client",Booking);
app.use("/api/v1/client",reschedule);
app.use("/api/v1/client",client_Profile);
app.use("/api/v1/client",client_Settings);
app.use("/api/v1/client",review);



//worker routes
app.use("/api/v1/worker",workerAuth);


app.listen(3000);

