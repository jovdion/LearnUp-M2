// URL backend
const BASE_URL = 'http://localhost:5000';

const appRoot = document.getElementById('app');

function getInitials(name) {
    if (!name) return 'U';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

let kelasData = [];
let materiData = [];
let tugasData = [];
let user = JSON.parse(localStorage.getItem('user')) || null;
let userKelasData = [];
let submissionData = [];

async function fetchKelas() {
    const res = await fetch(`${BASE_URL}/kelas`);
    kelasData = await res.json();
}

async function fetchMateri() {
    const res = await fetch(`${BASE_URL}/materis`);
    materiData = await res.json();
}

async function fetchTugas() {
    const res = await fetch(`${BASE_URL}/tugas`);
    tugasData = await res.json();
}

async function fetchUserKelas() {
    if (!user) return;
    const res = await fetch(`${BASE_URL}/user_kelas`);
    userKelasData = await res.json();
}

async function fetchSubmissions() {
    const res = await fetch(`${BASE_URL}/submissions`);
    submissionData = await res.json();
}

async function isTeacherInKelas(userId, kelasId) {
    if (!userId || !kelasId) return false;
    try {
        const res = await fetch(`${BASE_URL}/user_kelas/${userId}/${kelasId}`);
        if (!res.ok) return false;
        const data = await res.json();
        return data.role === 'teacher';
    } catch {
        return false;
    }
}

async function renderKelasListAsync() {
    await fetchUserKelas();
    // Ambil hanya kelas yang ada relasi dengan user
    const userKelasRelasi = userKelasData.filter(uk => uk.user_id == user.id);
    const kelasIds = userKelasRelasi.map(uk => uk.kelas_id);
    // Fetch detail kelas satu per satu
    const kelasUser = await Promise.all(kelasIds.map(async id => {
        const res = await fetch(`${BASE_URL}/kelas/${id}`);
        if (!res.ok) return null;
        return await res.json();
    }));
    const kelasUserFiltered = kelasUser.filter(Boolean);
    appRoot.innerHTML = `
        <div class="main-area">
            <div style="display:flex;gap:1rem;margin-bottom:2rem;">
                <button id="btn-create-class" style="background:#4285f4;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-weight:600;cursor:pointer;">Create Class</button>
                <button id="btn-join-class" style="background:#4285f4;color:#fff;border:none;padding:0.7rem 1.5rem;border-radius:8px;font-weight:600;cursor:pointer;">Join Class</button>
            </div>
            <section id="section-beranda">
                <h2>Daftar Kelas</h2>
                <div class="card-list" id="kelas-list"></div>
            </section>
        </div>
    `;
    const kelasList = document.getElementById('kelas-list');
    if (kelasUserFiltered.length === 0) {
        kelasList.innerHTML = '<div style="color:#888;">Belum ada kelas.</div>';
    } else {
        kelasUserFiltered.forEach(kelas => {
            const div = document.createElement('div');
            div.className = 'card';
            div.style.cursor = 'pointer';
            div.innerHTML = `
                <h3>${kelas.nama_kelas}</h3>
                <p style="color:#5f6368;font-size:0.98rem;">Kode: ${kelas.kode_kelas}</p>
                <div class="card-footer">
                    <span class="profile-circle">${getInitials(kelas.id_pembuat ? kelas.id_pembuat.toString() : '?')}</span>
                    <button class="leave-class-btn" data-id="${kelas.id}" style="margin-left:auto;background:#fff;color:#d32f2f;border:1px solid #d32f2f;padding:0.3rem 0.8rem;border-radius:6px;cursor:pointer;">Leave</button>
                </div>
            `;
            div.onclick = (e) => {
                if (e.target.classList.contains('leave-class-btn')) return;
                history.pushState({}, '', `?kelas=${kelas.id}`);
                renderRoute();
            };
            kelasList.appendChild(div);
        });
        // Leave class handler
        document.querySelectorAll('.leave-class-btn').forEach(btn => {
            btn.onclick = async function(e) {
                e.stopPropagation();
                await fetch(`${BASE_URL}/user_kelas/${user.id}/${btn.getAttribute('data-id')}`, { method: 'DELETE' });
                await renderKelasListAsync();
            };
        });
    }
    document.getElementById('btn-create-class').onclick = function() {
        appRoot.innerHTML = `<div class='main-area' style='max-width:400px;margin:4rem auto;'>
            <button id='back-to-list' style='background:none;border:none;color:#4285f4;font-size:1.2rem;cursor:pointer;margin-bottom:1.5rem;'>&larr; Back</button>
            <h2>Buat Kelas Baru</h2>
            <form id='form-create-class' style='display:flex;flex-direction:column;gap:1.2rem;'>
                <input type='text' id='create-nama' placeholder='Nama Kelas' required style='padding:0.8rem 1rem;font-size:1rem;border-radius:8px;border:1px solid #ccc;'>
                <input type='text' id='create-deskripsi' placeholder='Deskripsi' style='padding:0.8rem 1rem;font-size:1rem;border-radius:8px;border:1px solid #ccc;'>
                <button type='submit' style='background:#4285f4;color:#fff;border:none;padding:0.8rem 1rem;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;'>Buat</button>
            </form>
        </div>`;
        document.getElementById('back-to-list').onclick = () => renderKelasListAsync();
        document.getElementById('form-create-class').onsubmit = async function(e) {
            e.preventDefault();
            const nama_kelas = document.getElementById('create-nama').value;
            const deskripsi = document.getElementById('create-deskripsi').value;
            const kode_kelas = 'KLS' + Math.floor(Math.random()*100000);
            // Buat kelas
            const res = await fetch(`${BASE_URL}/kelas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_kelas, deskripsi, kode_kelas, id_pembuat: user.id })
            });
            const kelasBaru = await res.json();
            // Tambah relasi teacher
            await fetch(`${BASE_URL}/user_kelas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, kelas_id: kelasBaru.id, role: 'teacher' })
            });
            await renderKelasListAsync();
        };
    };
    document.getElementById('btn-join-class').onclick = function() {
        appRoot.innerHTML = `<div class='main-area' style='max-width:400px;margin:4rem auto;'>
            <button id='back-to-list' style='background:none;border:none;color:#4285f4;font-size:1.2rem;cursor:pointer;margin-bottom:1.5rem;'>&larr; Back</button>
            <h2>Gabung Kelas</h2>
            <form id='form-join-class' style='display:flex;flex-direction:column;gap:1.2rem;'>
                <input type='text' id='join-kode' placeholder='Kode Kelas' required style='padding:0.8rem 1rem;font-size:1rem;border-radius:8px;border:1px solid #ccc;'>
                <button type='submit' style='background:#4285f4;color:#fff;border:none;padding:0.8rem 1rem;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;'>Gabung</button>
            </form>
            <div id='join-error' style='color:#d32f2f;text-align:center;display:none;'></div>
        </div>`;
        document.getElementById('back-to-list').onclick = () => renderKelasListAsync();
        document.getElementById('form-join-class').onsubmit = async function(e) {
            e.preventDefault();
            const kode = document.getElementById('join-kode').value;
            // Cari kelas by kode
            let kelas = null;
            // Cek semua kelas (karena kode kelas unik)
            const allKelasRes = await fetch(`${BASE_URL}/kelas`);
            const allKelas = await allKelasRes.json();
            kelas = allKelas.find(k => k.kode_kelas === kode);
            if (!kelas) {
                document.getElementById('join-error').innerText = 'Kode kelas tidak ditemukan!';
                document.getElementById('join-error').style.display = 'block';
                return;
            }
            // Tambah relasi student
            await fetch(`${BASE_URL}/user_kelas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, kelas_id: kelas.id, role: 'student' })
            });
            await renderKelasListAsync();
        };
    };
}

function renderDetailKelas(kelas) {
    appRoot.innerHTML = `
        <div class='main-area'>
            <button id='back-to-dashboard' style='background:none;border:none;color:#4285f4;font-size:1.2rem;cursor:pointer;margin-bottom:1.5rem;'>&larr; Back</button>
            <div style='background:#4285f4;border-radius:16px 16px 0 0;padding:2rem 2rem 1.5rem 2rem;margin-bottom:1.5rem;display:flex;flex-direction:column;align-items:flex-start;box-shadow:0 2px 8px #0001;'>
                <div style='color:#fff;font-size:1.5rem;font-weight:600;margin-bottom:0.5rem;'>${kelas.nama_kelas}</div>
                <div style='color:#e3eafc;font-size:1rem;margin-bottom:0.7rem;'>${kelas.deskripsi || ''}</div>
                <div style='color:#fff;font-size:1rem;font-weight:500;background:#3367d6;padding:0.3rem 1rem;border-radius:8px;letter-spacing:1px;'>Kode Kelas: <span style="font-family:monospace;font-size:1.1em;">${kelas.kode_kelas || '-'}</span></div>
            </div>
            <div class='tabs' style='display:flex;gap:1rem;margin-bottom:2rem;border-bottom:1px solid #e0e0e0;padding-bottom:0.5rem;'>
                <button class='tab-btn active' data-tab='materi' style='background:none;border:none;color:#4285f4;padding:0.5rem 1rem;cursor:pointer;font-size:14px;font-weight:500;border-bottom:2px solid #4285f4;'>Materi</button>
                <button class='tab-btn' data-tab='tugas' style='background:none;border:none;color:#5f6368;padding:0.5rem 1rem;cursor:pointer;font-size:14px;font-weight:500;'>Tugas</button>
                <button class='tab-btn' data-tab='anggota' style='background:none;border:none;color:#5f6368;padding:0.5rem 1rem;cursor:pointer;font-size:14px;font-weight:500;'>Anggota</button>
            </div>
            <div id='materi-content' class='tab-content active' style='display:block;'></div>
            <div id='tugas-content' class='tab-content' style='display:none;'></div>
            <div id='anggota-content' class='tab-content' style='display:none;'></div>
        </div>
    `;

    document.getElementById('back-to-dashboard').onclick = () => {
        history.pushState({}, '', '/');
        renderKelasListAsync();
    };

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
                b.style.color = '#5f6368';
                b.style.borderBottom = 'none';
            });
            btn.classList.add('active');
            btn.style.color = '#4285f4';
            btn.style.borderBottom = '2px solid #4285f4';

            // Update tab content
            document.querySelectorAll('.tab-content').forEach(c => {
                c.style.display = 'none';
                c.classList.remove('active');
            });
            const activeContent = document.getElementById(`${btn.dataset.tab}-content`);
            activeContent.style.display = 'block';
            activeContent.classList.add('active');
            
            if (btn.dataset.tab === 'materi') {
                renderMateriList(kelas.id);
            } else if (btn.dataset.tab === 'tugas') {
                renderTugasList(kelas.id);
            } else if (btn.dataset.tab === 'anggota') {
                renderAnggotaList(kelas.id);
            }
        };
    });

    // Initial render
    renderMateriList(kelas.id);
}

async function renderAnggotaList(kelasId) {
    const anggotaContent = document.getElementById('anggota-content');
    anggotaContent.innerHTML = '<div style="text-align:center;padding:2rem;">Loading...</div>';

    try {
        // Fetch user_kelas untuk mendapatkan daftar anggota
        const res = await fetch(`${BASE_URL}/user_kelas?kelas_id=${kelasId}`);
        if (!res.ok) throw new Error('Failed to fetch anggota');
        const userKelas = await res.json();
        console.log('[Frontend] user_kelas fetched:', userKelas);

        // Fetch semua user yang terkait
        const userIds = userKelas.map(uk => uk.user_id);
        const usersRes = await fetch(`${BASE_URL}/users`);
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        const allUsers = await usersRes.json();

        // Filter dan kelompokkan user berdasarkan role
        const teachers = allUsers.filter(u => 
            userKelas.some(uk => uk.user_id === u.id && uk.role === 'teacher')
        );
        const students = allUsers.filter(u => 
            userKelas.some(uk => uk.user_id === u.id && uk.role === 'student')
        );
        console.log('[Frontend] teachers:', teachers);
        console.log('[Frontend] students:', students);

        anggotaContent.innerHTML = `
            <div style='display:flex;flex-direction:column;gap:2rem;'>
                <div>
                    <h3 style='color:#202124;font-size:18px;margin-bottom:1rem;'>Guru</h3>
                    <div style='display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem;'>
                        ${teachers.map(teacher => `
                            <div style='background:#fff;border-radius:8px;padding:1rem;box-shadow:0 1px 2px #0001;display:flex;align-items:center;gap:1rem;'>
                                <div style='width:40px;height:40px;background:#4285f4;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:500;'>
                                    ${getInitials(teacher.name)}
                                </div>
                                <div>
                                    <div style='font-weight:500;color:#202124;'>${teacher.name}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <h3 style='color:#202124;font-size:18px;margin-bottom:1rem;'>Murid</h3>
                    <div style='display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem;'>
                        ${students.map(student => `
                            <div style='background:#fff;border-radius:8px;padding:1rem;box-shadow:0 1px 2px #0001;display:flex;align-items:center;gap:1rem;'>
                                <div style='width:40px;height:40px;background:#4285f4;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:500;'>
                                    ${getInitials(student.name)}
                                </div>
                                <div>
                                    <div style='font-weight:500;color:#202124;'>${student.name}</div>
                                    <div style='color:#5f6368;font-size:14px;'>${student.email}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        anggotaContent.innerHTML = `
            <div style='text-align:center;padding:2rem;color:#d32f2f;'>
                Gagal memuat daftar anggota
            </div>
        `;
    }
}

async function renderRoute() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('profile')) {
        renderProfile();
        return;
    }
    const kelasId = params.get('kelas');
    if (kelasId) {
        let kelas = kelasData.find(k => k.id == kelasId);
        if (!kelas) {
            const res = await fetch(`${BASE_URL}/kelas/${kelasId}`);
            if (res.ok) {
                kelas = await res.json();
            }
        }
        if (kelas) {
            renderDetailKelas(kelas);
        } else {
            appRoot.innerHTML = '<div class="main-area"><p>Kelas tidak ditemukan.</p></div>';
        }
    } else {
        renderKelasListAsync();
    }
}

window.onpopstate = renderRoute;

function renderLogin() {
    appRoot.innerHTML = `
        <div class='main-area' style='max-width:400px;margin:4rem auto;'>
            <h2 style='text-align:center;margin-bottom:2rem;'>Login</h2>
            <form id='login-form' style='display:flex;flex-direction:column;gap:1.2rem;'>
                <input type='email' id='login-email' placeholder='Email' required style='padding:0.8rem 1rem;font-size:1rem;border-radius:8px;border:1px solid #ccc;'>
                <input type='password' id='login-password' placeholder='Password' required style='padding:0.8rem 1rem;font-size:1rem;border-radius:8px;border:1px solid #ccc;'>
                <button type='submit' style='background:#4285f4;color:#fff;border:none;padding:0.8rem 1rem;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;'>Login</button>
                <div id='login-error' style='color:#d32f2f;text-align:center;display:none;'></div>
            </form>
            <div style='text-align:center;margin-top:1.5rem;'>Belum punya akun? <a href='#' id='register-link' style='color:#4285f4;cursor:pointer;'>Register</a></div>
        </div>
    `;
    document.getElementById('login-form').onsubmit = async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const res = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) throw new Error('Login gagal');
            const data = await res.json();
            user = data.user || { email };
            localStorage.setItem('user', JSON.stringify(user));
            renderApp();
        } catch (err) {
            document.getElementById('login-error').innerText = 'Email atau password salah!';
            document.getElementById('login-error').style.display = 'block';
        }
    };
    document.getElementById('register-link').onclick = function(e) {
        e.preventDefault();
        renderRegister();
    };
}

function renderRegister() {
    appRoot.innerHTML = `
        <div class='main-area' style='max-width:400px;margin:4rem auto;'>
            <h2 style='text-align:center;margin-bottom:2rem;'>Register</h2>
            <form id='register-form' style='display:flex;flex-direction:column;gap:1.2rem;'>
                <input type='text' id='register-name' placeholder='Nama' required style='padding:0.8rem 1rem;font-size:1rem;border-radius:8px;border:1px solid #ccc;'>
                <input type='email' id='register-email' placeholder='Email' required style='padding:0.8rem 1rem;font-size:1rem;border-radius:8px;border:1px solid #ccc;'>
                <input type='password' id='register-password' placeholder='Password' required style='padding:0.8rem 1rem;font-size:1rem;border-radius:8px;border:1px solid #ccc;'>
                <button type='submit' style='background:#4285f4;color:#fff;border:none;padding:0.8rem 1rem;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;'>Register</button>
                <div id='register-error' style='color:#d32f2f;text-align:center;display:none;'></div>
            </form>
            <div style='text-align:center;margin-top:1.5rem;'><a href='#' id='back-login' style='color:#4285f4;cursor:pointer;'>Kembali ke Login</a></div>
        </div>
    `;
    document.getElementById('register-form').onsubmit = async function(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
            const res = await fetch(`${BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role: 'student' })
            });
            if (!res.ok) throw new Error('Register gagal');
            // Auto login setelah register
            const loginRes = await fetch(`${BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await loginRes.json();
            user = data.user || { email };
            localStorage.setItem('user', JSON.stringify(user));
            renderApp();
        } catch (err) {
            document.getElementById('register-error').innerText = 'Register gagal! Email mungkin sudah terdaftar.';
            document.getElementById('register-error').style.display = 'block';
        }
    };
    document.getElementById('back-login').onclick = function(e) {
        e.preventDefault();
        renderLogin();
    };
}

function renderHeader() {
    const header = document.querySelector('header');
    if (!header) return;
    if (!document.getElementById('profile-btn')) {
        const btn = document.createElement('button');
        btn.id = 'profile-btn';
        btn.textContent = 'Profile';
        btn.style = 'margin-left:1.5rem;background:#fff;color:#4285f4;border:1px solid #4285f4;padding:0.5rem 1.2rem;border-radius:20px;cursor:pointer;font-weight:500;';
        btn.onclick = function() {
            history.pushState({}, '', '?profile');
            renderRoute();
        };
        header.insertBefore(btn, header.querySelector('.profile-circle'));
    }
}

function renderProfile() {
    const initials = getInitials(user.name || 'User');
    appRoot.innerHTML = `
        <div class='main-area' style='display:flex;justify-content:center;align-items:center;min-height:60vh;'>
            <div style='background:#fff;border-radius:16px;box-shadow:0 2px 12px #0002;padding:2.5rem 2.5rem 2rem 2.5rem;max-width:400px;width:100%;'>
                <button id='back-to-dashboard' style='background:none;border:none;color:#4285f4;font-size:1.2rem;cursor:pointer;margin-bottom:1.5rem;'>&larr; Back</button>
                <div style='display:flex;flex-direction:column;align-items:center;margin-bottom:2rem;'>
                    <div style='width:80px;height:80px;background:#4285f4;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:500;margin-bottom:1.5rem;'>${initials}</div>
                    <h2 style='margin:0;color:#202124;font-size:24px;'>${user.name || 'User'}</h2>
                    <div style='color:#5f6368;margin-top:0.5rem;'>${user.email || '-'}</div>
                </div>
                <div id='profile-view'>
                    <button id='edit-profile-btn' style='background:#4285f4;color:#fff;border:none;padding:0.8rem 1.5rem;border-radius:8px;font-weight:600;cursor:pointer;width:100%;font-size:14px;'>Edit Profile</button>
                </div>
                <div id='profile-edit' style='display:none;'></div>
            </div>
        </div>
    `;
    document.getElementById('back-to-dashboard').onclick = () => {
        history.pushState({}, '', '/');
        renderKelasListAsync();
    };
    document.getElementById('edit-profile-btn').onclick = function() {
        document.getElementById('profile-view').style.display = 'none';
        document.getElementById('profile-edit').style.display = '';
        document.getElementById('profile-edit').innerHTML = `
            <form id='form-edit-profile' style='display:flex;flex-direction:column;gap:1.2rem;'>
                <div>
                    <label style='display:block;margin-bottom:0.5rem;color:#5f6368;font-size:14px;'>Nama</label>
                    <input type='text' id='edit-name' value='${user.name || ''}' placeholder='Masukkan nama' required style='width:100%;padding:0.8rem 1rem;font-size:14px;border-radius:8px;border:1px solid #ccc;box-sizing:border-box;'>
                </div>
                <div>
                    <label style='display:block;margin-bottom:0.5rem;color:#5f6368;font-size:14px;'>Password Baru</label>
                    <input type='password' id='edit-password' placeholder='Masukkan password baru (opsional)' style='width:100%;padding:0.8rem 1rem;font-size:14px;border-radius:8px;border:1px solid #ccc;box-sizing:border-box;'>
                </div>
                <div style='display:flex;gap:1rem;'>
                    <button type='submit' style='flex:1;background:#4285f4;color:#fff;border:none;padding:0.8rem 1rem;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;'>Simpan</button>
                    <button type='button' id='cancel-edit-profile' style='flex:1;background:#fff;color:#5f6368;border:1px solid #ccc;padding:0.8rem 1rem;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;'>Batal</button>
                </div>
                <div id='edit-profile-error' style='color:#d32f2f;text-align:center;display:none;font-size:14px;'></div>
            </form>
        `;
        document.getElementById('cancel-edit-profile').onclick = function() {
            renderProfile();
        };
        document.getElementById('form-edit-profile').onsubmit = async function(e) {
            e.preventDefault();
            const name = document.getElementById('edit-name').value;
            const password = document.getElementById('edit-password').value;
            try {
                const body = password ? { name, password } : { name };
                const res = await fetch(`${BASE_URL}/users/${user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (!res.ok) throw new Error('Update gagal');
                user.name = name;
                localStorage.setItem('user', JSON.stringify(user));
                renderProfile();
            } catch (err) {
                document.getElementById('edit-profile-error').innerText = 'Gagal update profile!';
                document.getElementById('edit-profile-error').style.display = 'block';
            }
        };
    };
}

function renderApp() {
    // Update header
    const profile = document.getElementById('profile-circle');
    const logoutBtn = document.getElementById('logout-btn');
    if (user) {
        profile.innerText = user.name ? user.name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U');
        logoutBtn.style.display = '';
    } else {
        profile.innerText = 'J';
        logoutBtn.style.display = 'none';
    }
    // Render main content
    if (!user) {
        renderLogin();
        return;
    }
    const params = new URLSearchParams(window.location.search);
    const kelasId = params.get('kelas');
    if (!kelasId) {
        renderKelasListAsync();
    } else {
        renderRoute();
    }
    renderHeader();
}

document.getElementById('logout-btn').onclick = function() {
    user = null;
    localStorage.removeItem('user');
    history.replaceState({}, '', '/');
    renderApp();
};

async function renderMateriList(kelasId) {
    const materiContent = document.getElementById('materi-content');
    materiContent.innerHTML = '<div style="text-align:center;padding:2rem;">Loading...</div>';

    try {
        const isTeacher = await isTeacherInKelas(user.id, kelasId);
        const materiKelas = materiData.filter(m => m.kelas_id === kelasId);
        
        let html = `
            <div style="background:#fff;border-radius:12px;padding:2rem 1.5rem;box-shadow:0 2px 8px #0001;">
                <div style="font-size:1.2rem;font-weight:600;margin-bottom:1rem;">Materi</div>`;
        
        if (isTeacher) {
            html += `
                <form id="form-tambah-materi" style="margin-bottom:1.5rem;display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
                    <input type="text" id="materi-judul" placeholder="Judul materi" required style="padding:0.5rem 1rem;border-radius:6px;border:1px solid #ccc;">
                    <input type="text" id="materi-deskripsi" placeholder="Deskripsi" style="padding:0.5rem 1rem;border-radius:6px;border:1px solid #ccc;">
                    <button type="submit" style="background:#4285f4;color:#fff;border:none;padding:0.5rem 1.2rem;border-radius:6px;cursor:pointer;">Tambah Materi</button>
                </form>`;
        }
        
        html += `
            <ul style="padding-left:1.2rem;">
                ${materiKelas.length === 0 ? '<li style=\'color:#888\'>Belum ada materi</li>' : materiKelas.map(m => `
                    <li style='margin-bottom:0.7rem;position:relative;padding-right:110px;'>
                        <b>${m.judul}</b><br><span style='color:#555;font-size:0.97rem;'>${m.deskripsi || ''}</span>
                        ${isTeacher ? `
                            <div style='position:absolute;right:0;top:0;display:flex;gap:0.3rem;'>
                                <button data-id="${m.id}" class="edit-materi-btn" style="background:#fff;color:#4285f4;border:1px solid #4285f4;padding:0.2rem 0.7rem;border-radius:6px;cursor:pointer;font-size:0.95em;">Edit</button>
                                <button data-id="${m.id}" class="hapus-materi-btn" style="background:#fff;color:#d32f2f;border:1px solid #d32f2f;padding:0.2rem 0.7rem;border-radius:6px;cursor:pointer;font-size:0.95em;">Delete</button>
                            </div>
                        ` : ''}
                    </li>`).join('')}
            </ul>
        </div>`;
        
        materiContent.innerHTML = html;

        if (isTeacher) {
            document.getElementById('form-tambah-materi').onsubmit = async function(e) {
                e.preventDefault();
                const judul = document.getElementById('materi-judul').value;
                const deskripsi = document.getElementById('materi-deskripsi').value;
                await fetch(`${BASE_URL}/materis`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ judul, deskripsi, kelas_id: kelasId })
                });
                await fetchMateri();
                renderMateriList(kelasId);
            };

            materiContent.querySelectorAll('.hapus-materi-btn').forEach(btn => {
                btn.onclick = async function(e) {
                    e.stopPropagation();
                    if (confirm('Hapus materi ini?')) {
                        await fetch(`${BASE_URL}/materis/${btn.getAttribute('data-id')}`, { method: 'DELETE' });
                        await fetchMateri();
                        renderMateriList(kelasId);
                    }
                };
            });

            materiContent.querySelectorAll('.edit-materi-btn').forEach(btn => {
                btn.onclick = function(e) {
                    e.stopPropagation();
                    const materiId = btn.getAttribute('data-id');
                    const materi = materiKelas.find(m => m.id == materiId);
                    if (!materi) return;
                    
                    const li = btn.closest('li');
                    li.innerHTML = `
                        <form class='form-edit-materi' style='display:flex;gap:0.5rem;align-items:center;'>
                            <input type='text' value='${materi.judul}' id='edit-judul' style='padding:0.3rem 0.7rem;border-radius:6px;border:1px solid #ccc;'>
                            <input type='text' value='${materi.deskripsi || ''}' id='edit-deskripsi' style='padding:0.3rem 0.7rem;border-radius:6px;border:1px solid #ccc;'>
                            <button type='submit' style='background:#4285f4;color:#fff;border:none;padding:0.3rem 0.9rem;border-radius:6px;cursor:pointer;'>Simpan</button>
                            <button type='button' class='cancel-edit-materi' style='background:#fff;color:#888;border:1px solid #ccc;padding:0.3rem 0.9rem;border-radius:6px;cursor:pointer;'>Batal</button>
                        </form>`;

                    li.querySelector('.form-edit-materi').onsubmit = async function(ev) {
                        ev.preventDefault();
                        const judul = li.querySelector('#edit-judul').value;
                        const deskripsi = li.querySelector('#edit-deskripsi').value;
                        await fetch(`${BASE_URL}/materis/${materiId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ judul, deskripsi })
                        });
                        await fetchMateri();
                        renderMateriList(kelasId);
                    };

                    li.querySelector('.cancel-edit-materi').onclick = function() {
                        renderMateriList(kelasId);
                    };
                };
            });
        }
    } catch (err) {
        materiContent.innerHTML = `
            <div style='text-align:center;padding:2rem;color:#d32f2f;'>
                Gagal memuat materi
            </div>
        `;
    }
}

async function renderTugasList(kelasId) {
    const tugasContent = document.getElementById('tugas-content');
    tugasContent.innerHTML = '<div style="text-align:center;padding:2rem;">Loading...</div>';

    try {
        const isTeacher = await isTeacherInKelas(user.id, kelasId);
        const tugasKelas = tugasData.filter(t => t.kelas_id === kelasId);
        
        let html = `
            <div style="background:#fff;border-radius:12px;padding:2rem 1.5rem;box-shadow:0 2px 8px #0001;">
                <div style="font-size:1.2rem;font-weight:600;margin-bottom:1rem;">Tugas</div>`;
        
        if (isTeacher) {
            html += `
                <form id="form-tambah-tugas" style="margin-bottom:1.5rem;display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
                    <input type="text" id="tugas-judul" placeholder="Judul tugas" required style="padding:0.5rem 1rem;border-radius:6px;border:1px solid #ccc;">
                    <input type="text" id="tugas-deskripsi" placeholder="Deskripsi" style="padding:0.5rem 1rem;border-radius:6px;border:1px solid #ccc;">
                    <button type="submit" style="background:#4285f4;color:#fff;border:none;padding:0.5rem 1.2rem;border-radius:6px;cursor:pointer;">Tambah Tugas</button>
                </form>`;
        }
        
        html += `
            <ul style="padding-left:1.2rem;">
                ${tugasKelas.length === 0 ? '<li style=\'color:#888\'>Belum ada tugas</li>' : tugasKelas.map(t => {
                    const submission = submissionData.find(s => s.tugas_id === t.id && s.user_id === user.id);
                    return `
                    <li style='margin-bottom:0.7rem;position:relative;padding-right:110px;'>
                        <b>${t.judul}</b><br><span style='color:#555;font-size:0.97rem;'>${t.deskripsi || ''}</span>
                        ${isTeacher ? `
                            <div style='position:absolute;right:0;top:0;display:flex;gap:0.3rem;'>
                                <button data-id="${t.id}" class="view-submissions-btn" style="background:#fff;color:#4285f4;border:1px solid #4285f4;padding:0.2rem 0.7rem;border-radius:6px;cursor:pointer;font-size:0.95em;">View Submissions</button>
                                <button data-id="${t.id}" class="edit-tugas-btn" style="background:#fff;color:#4285f4;border:1px solid #4285f4;padding:0.2rem 0.7rem;border-radius:6px;cursor:pointer;font-size:0.95em;">Edit</button>
                                <button data-id="${t.id}" class="hapus-tugas-btn" style="background:#fff;color:#d32f2f;border:1px solid #d32f2f;padding:0.2rem 0.7rem;border-radius:6px;cursor:pointer;font-size:0.95em;">Delete</button>
                            </div>
                        ` : `
                            <div style='position:absolute;right:0;top:0;display:flex;gap:0.3rem;'>
                                ${submission ? `
                                    <span style="color:#4caf50;font-size:0.95em;">Submitted</span>
                                    ${submission.nilai ? `<span style="color:#4285f4;font-size:0.95em;">Score: ${submission.nilai}</span>` : ''}
                                ` : `
                                    <button data-id="${t.id}" class="submit-tugas-btn" style="background:#4285f4;color:#fff;border:none;padding:0.2rem 0.7rem;border-radius:6px;cursor:pointer;font-size:0.95em;">Submit</button>
                                `}
                            </div>
                        `}
                    </li>`;
                }).join('')}
            </ul>
        </div>`;
        
        tugasContent.innerHTML = html;

        if (isTeacher) {
            document.getElementById('form-tambah-tugas').onsubmit = async function(e) {
                e.preventDefault();
                const judul = document.getElementById('tugas-judul').value;
                const deskripsi = document.getElementById('tugas-deskripsi').value;
                await fetch(`${BASE_URL}/tugas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ judul, deskripsi, kelas_id: kelasId, deadline: new Date() })
                });
                await fetchTugas();
                renderTugasList(kelasId);
            };

            tugasContent.querySelectorAll('.view-submissions-btn').forEach(btn => {
                btn.onclick = function(e) {
                    e.stopPropagation();
                    const tugasId = btn.getAttribute('data-id');
                    renderSubmissionsList(tugasId);
                };
            });

            tugasContent.querySelectorAll('.hapus-tugas-btn').forEach(btn => {
                btn.onclick = async function(e) {
                    e.stopPropagation();
                    if (confirm('Hapus tugas ini?')) {
                        await fetch(`${BASE_URL}/tugas/${btn.getAttribute('data-id')}`, { method: 'DELETE' });
                        await fetchTugas();
                        renderTugasList(kelasId);
                    }
                };
            });

            tugasContent.querySelectorAll('.edit-tugas-btn').forEach(btn => {
                btn.onclick = function(e) {
                    e.stopPropagation();
                    const tugasId = btn.getAttribute('data-id');
                    const tugas = tugasKelas.find(t => t.id == tugasId);
                    if (!tugas) return;
                    
                    const li = btn.closest('li');
                    li.innerHTML = `
                        <form class='form-edit-tugas' style='display:flex;gap:0.5rem;align-items:center;'>
                            <input type='text' value='${tugas.judul}' id='edit-judul' style='padding:0.3rem 0.7rem;border-radius:6px;border:1px solid #ccc;'>
                            <input type='text' value='${tugas.deskripsi || ''}' id='edit-deskripsi' style='padding:0.3rem 0.7rem;border-radius:6px;border:1px solid #ccc;'>
                            <button type='submit' style='background:#4285f4;color:#fff;border:none;padding:0.3rem 0.9rem;border-radius:6px;cursor:pointer;'>Simpan</button>
                            <button type='button' class='cancel-edit-tugas' style='background:#fff;color:#888;border:1px solid #ccc;padding:0.3rem 0.9rem;border-radius:6px;cursor:pointer;'>Batal</button>
                        </form>`;

                    li.querySelector('.form-edit-tugas').onsubmit = async function(ev) {
                        ev.preventDefault();
                        const judul = li.querySelector('#edit-judul').value;
                        const deskripsi = li.querySelector('#edit-deskripsi').value;
                        await fetch(`${BASE_URL}/tugas/${tugasId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ judul, deskripsi })
                        });
                        await fetchTugas();
                        renderTugasList(kelasId);
                    };

                    li.querySelector('.cancel-edit-tugas').onclick = function() {
                        renderTugasList(kelasId);
                    };
                };
            });
        } else {
            tugasContent.querySelectorAll('.submit-tugas-btn').forEach(btn => {
                btn.onclick = function(e) {
                    e.stopPropagation();
                    const tugasId = btn.getAttribute('data-id');
                    showSubmitForm(tugasId);
                };
            });
        }
    } catch (err) {
        tugasContent.innerHTML = `
            <div style='text-align:center;padding:2rem;color:#d32f2f;'>
                Gagal memuat tugas
            </div>
        `;
    }
}

function showSubmitForm(tugasId) {
    const tugas = tugasData.find(t => t.id == tugasId);
    if (!tugas) return;

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 12px; width: 90%; max-width: 500px;">
            <h3 style="margin-top: 0;">Submit Tugas: ${tugas.judul}</h3>
            <form id="submit-form" style="display: flex; flex-direction: column; gap: 1rem;">
                <input type="file" id="file-input" required style="padding: 0.5rem;">
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button type="button" class="cancel-submit" style="background: #fff; color: #666; border: 1px solid #ccc; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Cancel</button>
                    <button type="submit" style="background: #4285f4; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Submit</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.cancel-submit').onclick = () => {
        document.body.removeChild(modal);
    };

    modal.querySelector('#submit-form').onsubmit = async function(e) {
        e.preventDefault();
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('tugas_id', tugasId);
        formData.append('user_id', user.id);

        try {
            const response = await fetch(`${BASE_URL}/submissions`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            await fetchSubmissions();
            document.body.removeChild(modal);
            renderTugasList(tugas.kelas_id);
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to submit task: ' + err.message);
        }
    };
}

async function renderSubmissionsList(tugasId) {
    const tugas = tugasData.find(t => t.id == tugasId);
    if (!tugas) return;

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    const submissions = submissionData.filter(s => s.tugas_id == tugasId);
    console.log('Submissions:', submissions);
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 12px; width: 90%; max-width: 800px; max-height: 80vh; overflow-y: auto;">
            <h3 style="margin-top: 0;">Submissions for: ${tugas.judul}</h3>
            <div style="margin-top: 1rem;">
                ${submissions.length === 0 ? '<p style="color: #666;">No submissions yet</p>' : `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid #eee;">
                                <th style="text-align: left; padding: 0.5rem;">Student</th>
                                <th style="text-align: left; padding: 0.5rem;">File</th>
                                <th style="text-align: left; padding: 0.5rem;">Score</th>
                                <th style="text-align: left; padding: 0.5rem;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${submissions.map(s => {
                                const fileUrl = `${BASE_URL}/uploads/${s.file_attachment}`;
                                console.log('File URL:', fileUrl);
                                return `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 0.5rem;">${s.user_id}</td>
                                    <td style="padding: 0.5rem;">
                                        <a href="${fileUrl}" target="_blank" style="color: #4285f4;" onclick="console.log('Opening file:', '${fileUrl}')">View File</a>
                                    </td>
                                    <td style="padding: 0.5rem;">
                                        ${s.nilai ? s.nilai : '-'}
                                    </td>
                                    <td style="padding: 0.5rem;">
                                        <button class="grade-btn" data-id="${s.id}" style="background: #4285f4; color: #fff; border: none; padding: 0.3rem 0.7rem; border-radius: 4px; cursor: pointer;">Grade</button>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                `}
            </div>
            <div style="margin-top: 1rem; text-align: right;">
                <button class="close-modal" style="background: #fff; color: #666; border: 1px solid #ccc; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-modal').onclick = () => {
        document.body.removeChild(modal);
    };

    modal.querySelectorAll('.grade-btn').forEach(btn => {
        btn.onclick = function() {
            const submissionId = btn.getAttribute('data-id');
            showGradeForm(submissionId);
        };
    });
}

function showGradeForm(submissionId) {
    const submission = submissionData.find(s => s.id == submissionId);
    if (!submission) return;

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 12px; width: 90%; max-width: 400px;">
            <h3 style="margin-top: 0;">Grade Submission</h3>
            <form id="grade-form" style="display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem;">Score (0-100)</label>
                    <input type="number" id="score-input" min="0" max="100" required style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button type="button" class="cancel-grade" style="background: #fff; color: #666; border: 1px solid #ccc; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Cancel</button>
                    <button type="submit" style="background: #4285f4; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Save Grade</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.cancel-grade').onclick = () => {
        document.body.removeChild(modal);
    };

    modal.querySelector('#grade-form').onsubmit = async function(e) {
        e.preventDefault();
        const score = document.getElementById('score-input').value;

        try {
            await fetch(`${BASE_URL}/submissions/${submissionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nilai: parseInt(score) })
            });
            await fetchSubmissions();
            document.body.removeChild(modal);
            const tugas = tugasData.find(t => t.id == submission.tugas_id);
            if (tugas) {
                renderSubmissionsList(tugas.id);
            }
        } catch (err) {
            alert('Failed to save grade');
        }
    };
}

async function createKelas() {
    const nama = document.getElementById('nama-kelas').value;
    const deskripsi = document.getElementById('deskripsi-kelas').value;
    try {
        const res = await fetch(`${BASE_URL}/kelas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama_kelas: nama, deskripsi })
        });
        if (!res.ok) throw new Error('Failed to create kelas');
        const kelas = await res.json();
        
        // Tambahkan user sebagai teacher di kelas baru
        await fetch(`${BASE_URL}/user_kelas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                user_id: user.id, 
                kelas_id: kelas.id,
                role: 'teacher'  // Pastikan role diset sebagai teacher
            })
        });

        await fetchKelas();
        renderKelasListAsync();
    } catch (err) {
        alert('Gagal membuat kelas!');
    }
}

(async function() {
    await fetchKelas();
    await fetchMateri();
    await fetchTugas();
    await fetchUserKelas();
    await fetchSubmissions();
    renderApp();
})(); 