document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.querySelectorAll('.nav-toggle');
    navToggle.forEach(btn => {
        btn.addEventListener('click', function () {
            const topnav = document.getElementById('topnav');
            if (!topnav) return;
            const open = topnav.classList.toggle('open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    });

    const laporanDropdown = document.querySelector('.nav-item.dropdown');
    if (laporanDropdown) {
        const btn = laporanDropdown.querySelector('.dropbtn');
        btn && btn.addEventListener('click', function (e) {
            e.stopPropagation();
            document.querySelectorAll('.nav-item.dropdown').forEach(other => {
                if (other !== laporanDropdown) other.classList.remove('open');
            });
        });
    }

    document.addEventListener('click', function () {
        document.querySelectorAll('.nav-item.dropdown').forEach(d => d.classList.remove('open'));
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const user = dataPengguna.find(u => u.email === email && u.password === password);
            if (!user) {
                showAlert('Kesalahan login', 'Email atau password yang Anda masukkan salah.');
                return;
            }
            try { localStorage.setItem('sitta_logged', '1'); localStorage.setItem('sitta_user', email); } catch (err) { }
            window.location.href = 'dashboard.html';
        });

        const btnLupa = document.getElementById('btnLupa');
        const btnDaftar = document.getElementById('btnDaftar');
        const modalLupa = document.getElementById('modalLupa');
        const modalDaftar = document.getElementById('modalDaftar');
        function openModal(modal) {
            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('open');
        }
        function closeModal(modal) {
            modal.setAttribute('aria-hidden', 'true');
            modal.classList.remove('open');
        }
        if (btnLupa) btnLupa.addEventListener('click', () => openModal(modalLupa));
        if (btnDaftar) btnDaftar.addEventListener('click', () => openModal(modalDaftar));
        document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', e => {
            const modal = e.target.closest('.modal');
            if (modal) closeModal(modal);
        }));

        // Form handlers for UI-only modals (no backend integration)
        const formLupa = document.getElementById('formLupa');
        const formDaftar = document.getElementById('formDaftar');

        if (formLupa) {
            formLupa.addEventListener('submit', function (e) {
                e.preventDefault();
                const email = document.getElementById('modLupaEmail').value.trim();
                if (email) {
                    showAlert('Permintaan Reset', 'Jika akun dengan email ' + escapeHtml(email) + ' ada, instruksi reset akan dikirim.');
                } else {
                    showAlert('Permintaan Reset', 'Jika email terdaftar, instruksi reset akan dikirim.');
                }
                closeModal(modalLupa);
                formLupa.reset();
            });
        }

        if (formDaftar) {
            formDaftar.addEventListener('submit', function (e) {
                e.preventDefault();
                const nama = document.getElementById('inDaftarNama').value.trim();
                const email = document.getElementById('inDaftarEmail').value.trim();
                const password = document.getElementById('inDaftarPassword').value || '';
                const role = document.getElementById('inDaftarRole').value.trim();
                const lokasi = document.getElementById('inDaftarLokasi').value.trim();

                // UI-only: add the user to in-memory dataPengguna for demonstration
                try {
                    if (Array.isArray(dataPengguna)) {
                        const newId = dataPengguna.reduce((m, u) => Math.max(m, u.id || 0), 0) + 1;
                        dataPengguna.push({ id: newId, nama: nama || '', email: email || '', password: password, role: role || '', lokasi: lokasi || '' });
                    }
                } catch (err) {
                    console.error('Tambah pengguna gagal:', err);
                }

                showAlert('Pendaftaran', 'Pendaftaran berhasil (UI saja).');
                closeModal(modalDaftar);
                formDaftar.reset();
            });
        }
    }

    function showAlert(title, message) {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.innerHTML = `<div class="custom-alert" role="dialog" aria-modal="true">
            <h3>${escapeHtml(title || 'Pesan')}</h3>
            <p>${escapeHtml(message || '')}</p>
            <div style="text-align:center"><button class="btn primary" data-ok>OK</button></div>
        </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('[data-ok]').addEventListener('click', function () {
            overlay.remove();
        });
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function isLoggedIn() {
        try { return localStorage.getItem('sitta_logged') === '1'; } catch (e) { return false; }
    }

    function applyTabAccessControl() {
        const topnav = document.getElementById('topnav');
        if (!topnav) return;
        const links = Array.from(topnav.querySelectorAll('a'));
        const logged = isLoggedIn();
        links.forEach(a => {
            if (a.id === 'btnLogout') {
                a.style.display = logged ? '' : 'none';
                return;
            }
            if (!logged) {
                a.classList.add('disabled');
                a.addEventListener('click', preventAndPrompt);
            } else {
                a.classList.remove('disabled');
                a.removeEventListener('click', preventAndPrompt);
            }
        });
    }

    function preventAndPrompt(e) {
        e.preventDefault();
        showAlert('Akses Terbatas', 'Silakan login terlebih dahulu untuk mengakses menu ini.');
    }

    applyTabAccessControl();

    function getLoggedUser() {
        try {
            const email = localStorage.getItem('sitta_user');
            if (!email) return null;
            if (typeof dataPengguna !== 'undefined' && Array.isArray(dataPengguna)) {
                return dataPengguna.find(u => u.email === email) || null;
            }
            return null;
        } catch (e) { return null; }
    }

    function updateGreeting() {
        const dashText = document.getElementById('dashboardGreetingText');
        const dashTime = document.getElementById('dashboardGreetingTime');
        const now = new Date();
        const h = now.getHours();
        let greet = 'Selamat'
        if (h >= 4 && h < 11) greet = 'Selamat Pagi';
        else if (h >= 11 && h < 15) greet = 'Selamat Siang';
        else if (h >= 15 && h < 18) greet = 'Selamat Sore';
        else greet = 'Selamat Malam';

        const user = getLoggedUser();
        const namePart = user && user.nama ? ' ' + user.nama : '';

        if (dashText) dashText.textContent = greet + namePart;
        if (dashTime) dashTime.textContent = now.toLocaleString();
    }
    updateGreeting();

    setInterval(updateGreeting, 60 * 1000);

    const btnCariDO = document.getElementById('btnCariDO');
    if (btnCariDO) {
        btnCariDO.addEventListener('click', function () {
            const nom = document.getElementById('inputDO').value.trim();
            const target = document.getElementById('hasilTracking');
            target.innerHTML = '';
            if (!nom) { target.innerHTML = '<em>Masukkan nomor DO terlebih dahulu.</em>'; return; }
            const d = dataTracking[nom];
            if (!d) {
                target.innerHTML = '<p>Data tidak ditemukan untuk nomor DO tersebut.</p>';
                return;
            }
            const html = [];
            html.push(`<h3>DO: ${d.nomorDO}</h3>`);
            html.push(`<p><strong>Nama:</strong> ${d.nama}</p>`);
            html.push(`<p><strong>Status:</strong> ${d.status}</p>`);
            html.push(`<p><strong>Ekspedisi:</strong> ${d.ekspedisi} — <strong>Tanggal:</strong> ${d.tanggalKirim}</p>`);
            html.push(`<p><strong>Paket:</strong> ${d.paket} — <strong>Total:</strong> ${d.total}</p>`);
            html.push('<h4>Riwayat Perjalanan</h4>');
            html.push('<ul class="timeline">');
            d.perjalanan.forEach(p => {
                html.push(`<li><time>${p.waktu}</time><div>${p.keterangan}</div></li>`);
            });
            html.push('</ul>');
            target.innerHTML = html.join('');
        });
    }

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    const tbl = document.getElementById('tblStok');
    if (tbl) {
        const tbody = tbl.querySelector('tbody');
        function renderRow(item) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.kodeLokasi}</td>
				<td>${item.kodeBarang}</td>
				<td>${item.namaBarang}</td>
				<td>${item.jenisBarang}</td>
				<td>${item.edisi}</td>
				<td>${item.stok}</td>
				<td>${item.cover ? '<img src="' + item.cover + '" alt="cover" class="thumb">' : ''}</td>`;
            return tr;
        }
        function renderTable() {
            tbody.innerHTML = '';
            dataBahanAjar.forEach(item => tbody.appendChild(renderRow(item)));
        }
        renderTable();

        const btnTambah = document.getElementById('btnTambah');
        const formTambah = document.getElementById('formTambah');
        if (btnTambah && formTambah) btnTambah.addEventListener('click', function (e) {
            e.preventDefault();
            const kodeLokasi = document.getElementById('inKodeLokasi').value.trim();
            const kodeBarang = document.getElementById('inKodeBarang').value.trim();
            const namaBarang = document.getElementById('inNamaBarang').value.trim();
            const jenisBarang = document.getElementById('inJenis').value.trim();
            const edisi = document.getElementById('inEdisi').value.trim() || '1';
            const stokVal = document.getElementById('inStok').value;
            const stok = stokVal === '' ? 0 : parseInt(stokVal, 10);

            let coverInput = document.getElementById('inCover').value.trim();
            coverInput = coverInput.replace(/^\/+|^\.\//, '').replace(/^assets\/img\//, '');
            const cover = coverInput ? ('assets/img/' + coverInput) : '';

            if (!kodeLokasi || !kodeBarang || !namaBarang || !jenisBarang) {
                showAlert('Data Tidak Lengkap', 'Lengkapi semua field wajib (Kode Lokasi, Kode Barang, Nama, Jenis).');
                return;
            }

            const newItem = { kodeLokasi, kodeBarang, namaBarang, jenisBarang, edisi, stok, cover };
            dataBahanAjar.push(newItem);
            renderTable();

            formTambah.reset();
            document.getElementById('inKodeLokasi').focus();
        });
    }

    const btnLogout2 = document.getElementById('btnLogout');
    if (btnLogout2) {
        btnLogout2.addEventListener('click', function (e) {
            e.preventDefault();
            try { localStorage.removeItem('sitta_logged'); localStorage.removeItem('sitta_user'); } catch (err) { }
            window.location.href = 'index.html';
        });
    }

});
