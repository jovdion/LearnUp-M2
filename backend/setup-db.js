import { Sequelize } from 'sequelize';
import db from './config/Database.js';
import User from './models/UserModel.js';
import Kelas from './models/KelasModel.js';
import UserKelas from './models/User_kelasModel.js';
import Materi from './models/MateriModel.js';
import Tugas from './models/TugasModel.js';
import Submission from './models/SubmissionModel.js';

const setupDatabase = async () => {
  try {
    console.log('--- SETUP DATABASE ---');
    // Disable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Foreign key checks disabled.');

    // Hapus semua data di semua tabel
    console.log('Menghapus semua data di tabel...');
    await UserKelas.destroy({ where: {}, truncate: true });
    await Materi.destroy({ where: {}, truncate: true });
    await Tugas.destroy({ where: {}, truncate: true });
    await Submission.destroy({ where: {}, truncate: true });
    await Kelas.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
    console.log('Semua data di tabel sudah dihapus.');

    // Force sync all models (recreate table structure)
    await db.sync({ force: true });
    console.log('Sync ulang struktur tabel selesai.');

    // Re-enable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Foreign key checks enabled.');

    // Create dummy users
    console.log('Membuat dummy users...');
    const users = await User.bulkCreate([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: '12345',
        role: 'admin'
      },
      {
        name: 'John Doe',
        email: 'teacher@example.com',
        password: '12345',
        role: 'teacher'
      },
      {
        name: 'Jane Smith',
        email: 'student@example.com',
        password: '12345',
        role: 'student'
      },
      {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        password: '12345',
        role: 'student'
      },
      {
        name: 'Siti Aminah',
        email: 'siti@example.com',
        password: '12345',
        role: 'student'
      },
      {
        name: 'Dewi Lestari',
        email: 'dewi@example.com',
        password: '12345',
        role: 'teacher'
      },
      {
        name: 'Agus Pratama',
        email: 'agus@example.com',
        password: '12345',
        role: 'student'
      }
    ]);
    console.log('Dummy users:', users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));

    // Create dummy classes
    console.log('Membuat dummy kelas...');
    const classes = await Kelas.bulkCreate([
      {
        nama_kelas: 'Introduction to Programming',
        deskripsi: 'Learn the basics of programming',
        kode_kelas: 'PRG101',
        cover_image: 'https://gstatic.com/classroom/themes/img_code.jpg',
        id_pembuat: users[1].id // Teacher creates this class
      },
      {
        nama_kelas: 'Web Development',
        deskripsi: 'Learn modern web development',
        kode_kelas: 'WEB201',
        cover_image: 'https://gstatic.com/classroom/themes/img_code_thumb.jpg',
        id_pembuat: users[1].id // Teacher creates this class
      },
      {
        nama_kelas: 'Data Structures',
        deskripsi: 'Understanding data structures',
        kode_kelas: 'DS301',
        cover_image: 'https://gstatic.com/classroom/themes/img_breakfast.jpg',
        id_pembuat: users[1].id // Teacher creates this class
      },
      {
        nama_kelas: 'Matematika Dasar',
        deskripsi: 'Kelas Matematika untuk pemula',
        kode_kelas: 'MTK001',
        id_pembuat: users[1].id
      },
      {
        nama_kelas: 'Bahasa Inggris',
        deskripsi: 'Belajar Bahasa Inggris dari dasar',
        kode_kelas: 'ENG001',
        id_pembuat: users[5].id
      },
      {
        nama_kelas: 'Fisika Lanjutan',
        deskripsi: 'Fisika untuk tingkat lanjut',
        kode_kelas: 'FIS002',
        id_pembuat: users[1].id
      },
      {
        nama_kelas: 'Pemrograman Web',
        deskripsi: 'Dasar-dasar web development',
        kode_kelas: 'WEB101',
        id_pembuat: users[5].id
      },
      {
        nama_kelas: 'Kimia Organik',
        deskripsi: 'Kimia organik untuk SMA',
        kode_kelas: 'KIM003',
        id_pembuat: users[1].id
      }
    ]);
    console.log('Dummy kelas:', classes.map(k => ({ id: k.id, nama: k.nama_kelas, kode: k.kode_kelas, id_pembuat: k.id_pembuat })));

    // Assign users to classes
    console.log('Assigning users to classes...');
    await UserKelas.bulkCreate([
      // Kelas 1: Introduction to Programming
      { user_id: users[1].id, kelas_id: classes[0].id, role: 'teacher' }, // John Doe
      { user_id: users[2].id, kelas_id: classes[0].id, role: 'student' }, // Jane Smith
      { user_id: users[3].id, kelas_id: classes[0].id, role: 'student' }, // Budi Santoso

      // Kelas 2: Web Development
      { user_id: users[1].id, kelas_id: classes[1].id, role: 'teacher' }, // John Doe
      { user_id: users[4].id, kelas_id: classes[1].id, role: 'student' }, // Siti Aminah

      // Kelas 3: Data Structures
      { user_id: users[1].id, kelas_id: classes[2].id, role: 'teacher' }, // John Doe
      { user_id: users[6].id, kelas_id: classes[2].id, role: 'student' }, // Agus Pratama

      // Kelas 4: Matematika Dasar
      { user_id: users[1].id, kelas_id: classes[3].id, role: 'teacher' }, // John Doe
      { user_id: users[3].id, kelas_id: classes[3].id, role: 'student' }, // Budi Santoso
      { user_id: users[4].id, kelas_id: classes[3].id, role: 'student' }, // Siti Aminah

      // Kelas 5: Bahasa Inggris (teacher berbeda)
      { user_id: users[5].id, kelas_id: classes[4].id, role: 'teacher' }, // Dewi Lestari
      { user_id: users[2].id, kelas_id: classes[4].id, role: 'student' }, // Jane Smith
      { user_id: users[6].id, kelas_id: classes[4].id, role: 'student' }, // Agus Pratama

      // Kelas 6: Fisika Lanjutan
      { user_id: users[1].id, kelas_id: classes[5].id, role: 'teacher' }, // John Doe
      { user_id: users[3].id, kelas_id: classes[5].id, role: 'student' }, // Budi Santoso

      // Kelas 7: Pemrograman Web (teacher berbeda)
      { user_id: users[5].id, kelas_id: classes[6].id, role: 'teacher' }, // Dewi Lestari
      { user_id: users[4].id, kelas_id: classes[6].id, role: 'student' }, // Siti Aminah

      // Kelas 8: Kimia Organik
      { user_id: users[1].id, kelas_id: classes[7].id, role: 'teacher' }, // John Doe
      { user_id: users[2].id, kelas_id: classes[7].id, role: 'student' }, // Jane Smith
      { user_id: users[6].id, kelas_id: classes[7].id, role: 'student' }, // Agus Pratama
    ]);
    const allUserKelas = await UserKelas.findAll();
    console.log('UserKelas relations:', allUserKelas.map(uk => uk.toJSON()));

    // Create dummy materials
    console.log('Membuat dummy materi...');
    await Materi.bulkCreate([
      {
        judul: 'Introduction to Variables',
        deskripsi: 'Learn about variables and data types',
        file_materi: 'variables.pdf',
        kelas_id: classes[0].id
      },
      {
        judul: 'Control Structures',
        deskripsi: 'Understanding loops and conditions',
        file_materi: 'control-structures.pdf',
        kelas_id: classes[0].id
      },
      {
        judul: 'Pengenalan Matematika',
        deskripsi: 'Materi dasar matematika',
        kelas_id: classes[3].id
      },
      {
        judul: 'Aljabar',
        deskripsi: 'Konsep dasar aljabar',
        kelas_id: classes[3].id
      },
      {
        judul: 'Grammar Dasar',
        deskripsi: 'Materi grammar untuk pemula',
        kelas_id: classes[4].id
      },
      {
        judul: 'Reading Comprehension',
        deskripsi: 'Latihan membaca',
        kelas_id: classes[4].id
      },
      {
        judul: 'Hukum Newton',
        deskripsi: 'Fisika: Hukum Newton',
        kelas_id: classes[5].id
      },
      {
        judul: 'HTML & CSS',
        deskripsi: 'Dasar HTML dan CSS',
        kelas_id: classes[6].id
      },
      {
        judul: 'Struktur Kimia',
        deskripsi: 'Kimia organik: struktur',
        kelas_id: classes[7].id
      }
    ]);
    const allMateri = await Materi.findAll();
    console.log('Materi:', allMateri.map(m => m.toJSON()));

    // Create dummy assignments
    console.log('Membuat dummy tugas...');
    await Tugas.bulkCreate([
      {
        judul: 'Variables Exercise',
        deskripsi: 'Practice working with variables',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        file_tugas: 'variables-exercise.pdf',
        kelas_id: classes[0].id
      },
      {
        judul: 'Loops Practice',
        deskripsi: 'Create programs using loops',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        file_tugas: 'loops-practice.pdf',
        kelas_id: classes[0].id
      },
      {
        judul: 'Latihan Matematika 1',
        deskripsi: 'Kerjakan soal matematika',
        deadline: new Date(),
        kelas_id: classes[3].id
      },
      {
        judul: 'Essay Bahasa Inggris',
        deskripsi: 'Tulis essay pendek',
        deadline: new Date(),
        kelas_id: classes[4].id
      },
      {
        judul: 'Praktikum Fisika',
        deskripsi: 'Laporan praktikum',
        deadline: new Date(),
        kelas_id: classes[5].id
      },
      {
        judul: 'Project Web Sederhana',
        deskripsi: 'Buat website sederhana',
        deadline: new Date(),
        kelas_id: classes[6].id
      },
      {
        judul: 'Ujian Kimia',
        deskripsi: 'Ujian akhir kimia organik',
        deadline: new Date(),
        kelas_id: classes[7].id
      }
    ]);
    const allTugas = await Tugas.findAll();
    console.log('Tugas:', allTugas.map(t => t.toJSON()));

    // Create dummy submissions
    console.log('Membuat dummy submission...');
    await Submission.bulkCreate([
      // ... existing submission seed ...
    ]);
    const allSubmission = await Submission.findAll();
    console.log('Submission:', allSubmission.map(s => s.toJSON()));

    console.log('--- SETUP DATABASE SELESAI ---');
    console.log('\nDatabase setup completed successfully!');
    console.log('Test credentials:');
    console.log('Admin - email: admin@example.com, password: 12345');
    console.log('Teacher - email: teacher@example.com, password: 12345');
    console.log('Student - email: student@example.com, password: 12345');

  } catch (err) {
    console.error('ERROR SETUP DATABASE:', err);
  } finally {
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    process.exit();
  }
};

setupDatabase(); 