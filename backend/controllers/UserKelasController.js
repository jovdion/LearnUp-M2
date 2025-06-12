import UserKelas from "../models/User_kelasModel.js";
import Kelas from "../models/KelasModel.js";

export const getAllUserKelas = async (req, res) => {
  try {
    const where = {};
    if (req.query.kelas_id) {
      where.kelas_id = req.query.kelas_id;
    }
    if (req.query.user_id) {
      where.user_id = req.query.user_id;
    }
    console.log('[UserKelas] Fetch with filter:', where);
    const userKelas = await UserKelas.findAll({ where });
    console.log('[UserKelas] Result:', userKelas.map(uk => uk.toJSON()));
    res.status(200).json(userKelas);
  } catch (err) {
    console.error('[UserKelas] ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getUserKelasById = async (req, res) => {
  try {
    const userKelas = await UserKelas.findOne({
      where: {
        user_id: req.params.id_user,
        kelas_id: req.params.id_kelas
      }
    });
    if (!userKelas) return res.status(404).json({ message: "UserKelas not found" });
    res.status(200).json(userKelas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUserKelas = async (req, res) => {
  try {
    const { user_id, kelas_id, role } = req.body;
    console.log('Creating user_kelas relation:', { user_id, kelas_id, role });

    // Validasi input
    if (!user_id || !kelas_id || !role) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({ message: "user_id, kelas_id, dan role harus diisi" });
    }

    // Cek apakah relasi sudah ada
    const existingRelation = await UserKelas.findOne({
      where: {
        user_id,
        kelas_id
      }
    });

    if (existingRelation) {
      console.log('User already in class:', { user_id, kelas_id });
      return res.status(400).json({ message: "User sudah terdaftar di kelas ini" });
    }

    // Cek apakah user adalah pembuat kelas (untuk role teacher)
    if (role === 'teacher') {
      const kelas = await Kelas.findByPk(kelas_id);
      if (!kelas) {
        console.log('Class not found:', kelas_id);
        return res.status(404).json({ message: "Kelas tidak ditemukan" });
      }
      if (kelas.id_pembuat !== parseInt(user_id)) {
        console.log('User is not class creator:', { user_id, creator_id: kelas.id_pembuat });
        return res.status(403).json({ message: "Hanya pembuat kelas yang bisa menjadi teacher" });
      }
    }

    // Buat relasi baru
    const newRelation = await UserKelas.create({ user_id, kelas_id, role });
    console.log('Created new relation:', newRelation);
    res.status(201).json({ message: "UserKelas created successfully" });
  } catch (err) {
    console.error('Error in createUserKelas:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateUserKelas = async (req, res) => {
  try {
    const userKelas = await UserKelas.findOne({
      where: {
        user_id: req.params.id_user,
        kelas_id: req.params.id_kelas
      }
    });
    if (!userKelas) return res.status(404).json({ message: "UserKelas not found" });
    await userKelas.update(req.body);
    res.status(200).json({ message: "UserKelas updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUserKelas = async (req, res) => {
  try {
    const userKelas = await UserKelas.findOne({
      where: {
        user_id: req.params.id_user,
        kelas_id: req.params.id_kelas
      }
    });
    if (!userKelas) return res.status(404).json({ message: "UserKelas not found" });
    await userKelas.destroy();
    res.status(200).json({ message: "UserKelas deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cleanupInvalidRelations = async (req, res) => {
  try {
    // Hapus semua relasi user_kelas
    await UserKelas.destroy({
      where: {},
      truncate: true
    });
    res.status(200).json({ message: "All user_kelas relations have been cleaned up" });
  } catch (err) {
    console.error('Error in cleanupInvalidRelations:', err);
    res.status(500).json({ error: err.message });
  }
}; 