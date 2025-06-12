import Submission from "../models/SubmissionModel.js";

export const getAllSubmission = async (req, res) => {
  try {
    const submission = await Submission.findAll();
    res.status(200).json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    res.status(200).json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createSubmission = async (req, res) => {
  try {
    await Submission.create(req.body);
    res.status(201).json({ message: "Submission created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    await submission.update(req.body);
    res.status(200).json({ message: "Submission updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    await submission.destroy();
    res.status(200).json({ message: "Submission deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 