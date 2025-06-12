import Tugas from "../models/TugasModel.js";

export const getAllTugas = async (req, res) => {
  try {
    const tugas = await Tugas.findAll();
    res.status(200).json(tugas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTugasById = async (req, res) => {
  try {
    const tugas = await Tugas.findByPk(req.params.id);
    if (!tugas) return res.status(404).json({ message: "Tugas not found" });
    res.status(200).json(tugas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createTugas = async (req, res) => {
  try {
    await Tugas.create(req.body);
    res.status(201).json({ message: "Tugas created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTugas = async (req, res) => {
  try {
    const tugas = await Tugas.findByPk(req.params.id);
    if (!tugas) return res.status(404).json({ message: "Tugas not found" });
    await tugas.update(req.body);
    res.status(200).json({ message: "Tugas updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTugas = async (req, res) => {
  try {
    const tugas = await Tugas.findByPk(req.params.id);
    if (!tugas) return res.status(404).json({ message: "Tugas not found" });
    await tugas.destroy();
    res.status(200).json({ message: "Tugas deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 