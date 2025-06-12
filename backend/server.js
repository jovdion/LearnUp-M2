import express from "express";
import dotenv from "dotenv";
import KelasRoute from "./routes/KelasRoute.js";
import UserRoute from "./routes/UserRoute.js";
import MateriRoute from "./routes/MateriRoute.js";
import TugasRoute from "./routes/TugasRoute.js";
import SubmissionRoute from "./routes/SubmissionRoute.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(KelasRoute);
app.use(UserRoute);
app.use(MateriRoute);
app.use(TugasRoute);
app.use(SubmissionRoute);

app.listen(5000, () => console.log('Server running at port 5000')); 