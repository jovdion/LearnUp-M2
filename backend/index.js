import express from 'express';
import cors from 'cors';
import UserRoute from './routes/UserRoute.js';
import KelasRoute from './routes/KelasRoute.js';
import UserKelasRoute from './routes/User_kelasRoute.js';
import MateriRoute from './routes/MateriRoute.js';
import TugasRoute from './routes/TugasRoute.js';
import SubmissionRoute from './routes/SubmissionRoute.js';
import './models/index.js';
import dbContext from './config/Database.js';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use(UserRoute);
app.use(KelasRoute);
app.use(UserKelasRoute);
app.use(MateriRoute);
app.use(TugasRoute);
app.use(SubmissionRoute);

app.get("/", (req, res) => {
  res.send("Hello, this is the backend!");
});

// Sync database
dbContext.sync().then(() => {
  console.log('All tables created');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
