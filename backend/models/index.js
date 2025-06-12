import User from './UserModel.js';
import Kelas from './KelasModel.js';
import Materi from './MateriModel.js';
import Tugas from './TugasModel.js';
import Submission from './SubmissionModel.js';
import UserKelas from './User_kelasModel.js';

// User-Kelas relationships through UserKelas
User.belongsToMany(Kelas, {
  through: UserKelas,
  foreignKey: 'user_id',
  otherKey: 'kelas_id',
  as: 'enrolledClasses'
});

Kelas.belongsToMany(User, {
  through: UserKelas,
  foreignKey: 'kelas_id',
  otherKey: 'user_id',
  as: 'enrolledUsers'
});

// Kelas relationships
Kelas.hasMany(Materi, {
  foreignKey: 'kelas_id',
  as: 'materiList'
});

Kelas.hasMany(Tugas, {
  foreignKey: 'kelas_id',
  as: 'tugasList'
});

// Tugas relationships
Tugas.belongsTo(Kelas, {
  foreignKey: 'kelas_id',
  as: 'kelasInfo'
});

Tugas.hasMany(Submission, {
  foreignKey: 'tugas_id',
  as: 'submissions'
});

// Submission relationships
Submission.belongsTo(Tugas, {
  foreignKey: 'tugas_id',
  as: 'tugasInfo'
});

Submission.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'submittedBy'
});

// Materi relationships
Materi.belongsTo(Kelas, {
  foreignKey: 'kelas_id',
  as: 'kelasInfo'
});

export { User, Kelas, Materi, Tugas, Submission, UserKelas }; 