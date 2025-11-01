// Central script for SITTA frontend interactions
document.addEventListener('DOMContentLoaded', function () {
    // Navbar toggles and dropdowns (persistent across pages)
    const navToggle = document.querySelectorAll('.nav-toggle');
    navToggle.forEach(btn => {
        btn.addEventListener('click', function () {
            const topnav = document.getElementById('topnav');
            if (!topnav) return;
            const open = topnav.classList.toggle('open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    });

    // Dropdown buttons
    // Only Laporan is a dropdown in the tabbar. Toggle it.
    const laporanDropdown = document.querySelector('.nav-item.dropdown');
    if (laporanDropdown) {
        const btn = laporanDropdown.querySelector('.dropbtn');
        btn && btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = laporanDropdown.classList.toggle('open');
            // close any other dropdowns (if present)
            document.querySelectorAll('.nav-item.dropdown').forEach(other => {
                if (other !== laporanDropdown) other.classList.remove('open');
            });
        });
    }

    // close dropdowns when clicking outside
    document.addEventListener('click', function () {
        document.querySelectorAll('.nav-item.dropdown').forEach(d => d.classList.remove('open'));
    });

    // Login page
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
            // Simulasikan login sukses: set flag dan arahkan ke dashboard
            try { localStorage.setItem('sitta_logged', '1'); localStorage.setItem('sitta_user', email); } catch (err) {}
            window.location.href = 'dashboard.html';
        });

        // Modals
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
    }

    // --- Custom alert dialog (centered) ---
    function showAlert(title, message) {
        // create overlay
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

    // Determine login state
    function isLoggedIn() {
        try { return localStorage.getItem('sitta_logged') === '1'; } catch (e) { return false; }
    }

    // Disable tab clicks and show login prompt if not logged in
    function applyTabAccessControl() {
        const topnav = document.getElementById('topnav');
        if (!topnav) return;
        const links = Array.from(topnav.querySelectorAll('a'));
        const logged = isLoggedIn();
        links.forEach(a => {
            // Skip Logout link from being disabled when logged in
            if (a.id === 'btnLogout') {
                a.style.display = logged ? '' : 'none';
                return;
            }
            if (!logged) {
                a.classList.add('disabled');
                // attach a handler to prompt login
                a.addEventListener('click', preventAndPrompt);
            } else {
                a.classList.remove('disabled');
                // remove our handler if present
                a.removeEventListener('click', preventAndPrompt);
            }
        });
    }

    function preventAndPrompt(e) {
        e.preventDefault();
        showAlert('Akses Terbatas', 'Silakan login terlebih dahulu untuk mengakses menu ini.');
    }

    // Run tab access control on load
    applyTabAccessControl();

    // Dashboard / header greeting (separate text and time)
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
    // update time every minute
    setInterval(updateGreeting, 60 * 1000);

    // Tracking page
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
            // Build result
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

    // Logout handler (present on pages that include #btnLogout)
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            e.preventDefault();
            // Optionally clear session state here (none used currently)
            // Redirect to login page
            window.location.href = 'index.html';
        });
    }

    // Stok page: render table
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
            // ambil nilai dari input
            const kodeLokasi = document.getElementById('inKodeLokasi').value.trim();
            const kodeBarang = document.getElementById('inKodeBarang').value.trim();
            const namaBarang = document.getElementById('inNamaBarang').value.trim();
            const jenisBarang = document.getElementById('inJenis').value.trim();
            const edisi = document.getElementById('inEdisi').value.trim() || '1';
            const stokVal = document.getElementById('inStok').value;
            const stok = stokVal === '' ? 0 : parseInt(stokVal, 10);
            // normalize cover input: user types filename (e.g. cover.jpg) and we store as 'assets/img/filename'
            let coverInput = document.getElementById('inCover').value.trim();
            // remove any leading ./ or / and strip an accidental 'assets/img/' prefix
            coverInput = coverInput.replace(/^\/+|^\.\//, '').replace(/^assets\/img\//, '');
            const cover = coverInput ? ('assets/img/' + coverInput) : '';

            // validasi sederhana
            if (!kodeLokasi || !kodeBarang || !namaBarang || !jenisBarang) {
                showAlert('Data Tidak Lengkap', 'Lengkapi semua field wajib (Kode Lokasi, Kode Barang, Nama, Jenis).');
                return;
            }

            const newItem = { kodeLokasi, kodeBarang, namaBarang, jenisBarang, edisi, stok, cover };
            dataBahanAjar.push(newItem);
            renderTable();

            // reset form
            formTambah.reset();
            document.getElementById('inKodeLokasi').focus();
        });
    }

    // If logout link exists, make it clear login state before redirect
    const btnLogout2 = document.getElementById('btnLogout');
    if (btnLogout2) {
        btnLogout2.addEventListener('click', function (e) {
            e.preventDefault();
            try { localStorage.removeItem('sitta_logged'); localStorage.removeItem('sitta_user'); } catch (err) {}
            window.location.href = 'index.html';
        });
    }

});
