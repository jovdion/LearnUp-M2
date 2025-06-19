import Submission from "../models/SubmissionModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log('Upload directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).single('file');

export const getAllSubmission = async (req, res) => {
  try {
    const submission = await Submission.findAll();
    res.status(200).json(submission);
  } catch (err) {
    console.error('Error getting submissions:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    res.status(200).json(submission);
  } catch (err) {
    console.error('Error getting submission by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createSubmission = async (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: err.message });
    }

    try {
      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log('File uploaded:', req.file);

      const { tugas_id, user_id } = req.body;
      if (!tugas_id || !user_id) {
        console.error('Missing required fields:', { tugas_id, user_id });
        return res.status(400).json({ message: "Missing required fields" });
      }

      const submission = await Submission.create({
        file_attachment: req.file.filename,
        tugas_id,
        user_id
      });

      console.log('Submission created:', submission);
      res.status(201).json(submission);
    } catch (err) {
      console.error('Error creating submission:', err);
      res.status(500).json({ error: err.message });
    }
  });
};

export const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    // If there's a new file, handle the upload
    if (req.file) {
      // Delete old file
      const oldFilePath = path.join(__dirname, '..', 'uploads', submission.file_attachment);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      submission.file_attachment = req.file.filename;
    }

    // Update other fields
    if (req.body.nilai !== undefined) {
      submission.nilai = req.body.nilai;
    }

    await submission.save();
    res.status(200).json(submission);
  } catch (err) {
    console.error('Error updating submission:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    // Delete the file
    const filePath = path.join(__dirname, '..', 'uploads', submission.file_attachment);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await submission.destroy();
    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (err) {
    console.error('Error deleting submission:', err);
    res.status(500).json({ error: err.message });
  }
}; 