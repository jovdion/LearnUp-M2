import express from "express";
import dotenv from "dotenv";
import KelasRoute from "./routes/KelasRoute.js";
import UserRoute from "./routes/UserRoute.js";
import MateriRoute from "./routes/MateriRoute.js";
import TugasRoute from "./routes/TugasRoute.js";
import SubmissionRoute from "./routes/SubmissionRoute.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Log all requests - place this BEFORE any routes
app.use((req, res, next) => {
  console.log('----------------------------------------');
  console.log('New Request:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('----------------------------------------');
  next();
});

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Serving static files from:', uploadsPath);

// Custom middleware for uploads
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsPath, filename);
  
  console.log('Attempting to serve file:');
  console.log('- Filename:', filename);
  console.log('- Full path:', filePath);
  console.log('- File exists:', fs.existsSync(filePath));
  
  if (fs.existsSync(filePath)) {
    console.log('Sending file...');
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error sending file');
      } else {
        console.log('File sent successfully');
      }
    });
  } else {
    console.log('File not found');
    res.status(404).send('File not found');
  }
});

// API routes
app.use(KelasRoute);
app.use(UserRoute);
app.use(MateriRoute);
app.use(TugasRoute);
app.use(SubmissionRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).json({ error: err.message });
});

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.url);
  res.status(404).json({ error: 'Not Found' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log('----------------------------------------');
  console.log(`Server started at ${new Date().toISOString()}`);
  console.log(`Server running at port ${PORT}`);
  console.log('Uploads directory:', uploadsPath);
  console.log('Available files in uploads:', fs.readdirSync(uploadsPath));
  console.log('----------------------------------------');
}); 