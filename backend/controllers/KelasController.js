import Kelas from "../models/KelasModel.js";

export const getAllKelas = async (req, res) => {
  try {
    const kelas = await Kelas.findAll();
    res.status(200).json(kelas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getKelasById = async (req, res) => {
  try {
    const kelas = await Kelas.findByPk(req.params.id);
    if (!kelas) return res.status(404).json({ message: "Kelas not found" });
    res.status(200).json(kelas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createKelas = async (req, res) => {
  try {
    const kelas = await Kelas.create(req.body);
    res.status(201).json(kelas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateKelas = async (req, res) => {
  try {
    const kelas = await Kelas.findByPk(req.params.id);
    if (!kelas) return res.status(404).json({ message: "Kelas not found" });
    await kelas.update(req.body);
    res.status(200).json({ message: "Kelas updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteKelas = async (req, res) => {
  try {
    const kelas = await Kelas.findByPk(req.params.id);
    if (!kelas) return res.status(404).json({ message: "Kelas not found" });
    await kelas.destroy();
    res.status(200).json({ message: "Kelas deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 