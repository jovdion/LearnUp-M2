import Materi from "../models/MateriModel.js";

export const getAllMateri = async (req, res) => {
  try {
    const materi = await Materi.findAll();
    res.status(200).json(materi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMateriById = async (req, res) => {
  try {
    const materi = await Materi.findByPk(req.params.id);
    if (!materi) return res.status(404).json({ message: "Materi not found" });
    res.status(200).json(materi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createMateri = async (req, res) => {
  try {
    await Materi.create(req.body);
    res.status(201).json({ message: "Materi created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMateri = async (req, res) => {
  try {
    const materi = await Materi.findByPk(req.params.id);
    if (!materi) return res.status(404).json({ message: "Materi not found" });
    await materi.update(req.body);
    res.status(200).json({ message: "Materi updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMateri = async (req, res) => {
  try {
    const materi = await Materi.findByPk(req.params.id);
    if (!materi) return res.status(404).json({ message: "Materi not found" });
    await materi.destroy();
    res.status(200).json({ message: "Materi deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 