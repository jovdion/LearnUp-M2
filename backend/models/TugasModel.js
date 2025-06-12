// models/TugasModel.js
import { DataTypes } from "sequelize";
import dbContext from "../config/Database.js";
import Kelas from "./KelasModel.js";

const Tugas = dbContext.define('tugas', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  judul: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  file_tugas: {
    type: DataTypes.STRING,
    allowNull: true
  },
  kelas_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: Kelas,
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
}, {
  freezeTableName: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

export default Tugas;