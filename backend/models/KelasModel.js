import { DataTypes } from "sequelize";
import dbContext from "../config/Database.js"; // Import the database connection
import User from "./UserModel.js";

const Kelas = dbContext.define('kelas', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nama_kelas: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  kode_kelas: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  cover_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  id_pembuat: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
},{
  freezeTableName: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

export default Kelas;