// models/SubmissionModel.js
import { DataTypes } from "sequelize";
import dbContext from "../config/Database.js";
import User from "./UserModel.js";
import Tugas from "./TugasModel.js";

const Submission = dbContext.define('submissions', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  file_attachment: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nilai: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tugas_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: Tugas,
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: User,
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

export default Submission;