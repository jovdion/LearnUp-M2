// models/UserKelas.js
import { DataTypes } from "sequelize";
import dbContext from "../config/Database.js";
import User from "./UserModel.js"; // Import model User
import Kelas from "./KelasModel.js"; // Import model Kelas

const UserKelas = dbContext.define(
  "user_kelas", // Nama tabel di database
  {
    role: {
      type: DataTypes.ENUM('teacher', 'student'),
      allowNull: false,
    }
  },
  {
    freezeTableName: true, // Mencegah Sequelize mengubah nama tabel (misal: jadi user_kelas_s)
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
);

// Set up associations
User.belongsToMany(Kelas, { 
  through: UserKelas,
  foreignKey: {
    name: 'user_id',
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
});

Kelas.belongsToMany(User, { 
  through: UserKelas,
  foreignKey: {
    name: 'kelas_id',
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
});

// Sync database (hanya untuk pengembangan)
(async () => {
  try {
    await dbContext.sync({ alter: true });
    console.log("Tabel User_Kelas berhasil dibuat/diperbarui.");
  } catch (error) {
    console.error("Gagal menyinkronkan tabel User_Kelas:", error);
  }
})();

export default UserKelas;