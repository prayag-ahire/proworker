import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

// Client Routes
import Clientauth from './Routes/Client/ClientAuth';
import WorkerList from './Routes/Client/WorkerList';
import clientOrders from './Routes/Client/orders';
import workerAvailability from './Routes/Client/WorkerAvailability';
import Booking from './Routes/Client/Booking';
import reschedule from './Routes/Client/Reschedule';
import client_Profile from './Routes/Client/Profile';
import client_Settings from './Routes/Client/settings';
import review from './Routes/Client/Reviews';

// Worker routes
import workerHome from './Routes/Worker/Home';
import workerOrders from './Routes/Worker/Orders';
import worker_Profile from './Routes/Worker/profile';
import workerReschedule from './Routes/Worker/Reschedule';
import worker_Settings from './Routes/Worker/settings';
import workerAuth from './Routes/Worker/WorkerAuth';
import WorkerSchedule from './Routes/Worker/WorkerSchedule';

// test api
app.get("/api/v1/user", (req: Request, res: Response) => {
    res.send({ "testing": "This is main route testing" });
});

// client routes
app.use("/api/v1/client", Clientauth);
app.use("/api/v1/client", WorkerList);
app.use("/api/v1/client", clientOrders);
app.use("/api/v1/client", workerAvailability);
app.use("/api/v1/client", Booking);
app.use("/api/v1/client", reschedule);
app.use("/api/v1/client", client_Profile);
app.use("/api/v1/client", client_Settings);
app.use("/api/v1/client", review);

// worker routes
app.use("/api/v1/worker", workerHome);
app.use("/api/v1/worker", workerOrders);
app.use("/api/v1/worker", worker_Profile);
app.use("/api/v1/worker", workerReschedule);
app.use("/api/v1/worker", worker_Settings);
app.use("/api/v1/worker", workerAuth);
app.use("/api/v1/worker", WorkerSchedule);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
