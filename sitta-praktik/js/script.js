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
                alert('email/password yang anda masukkan salah');
                return;
            }
            // Simulasikan login sukses: arahkan ke dashboard
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

    // Dashboard / header greeting (separate text and time)
    function updateGreeting() {
        const dashText = document.getElementById('dashboardGreetingText');
        const dashTime = document.getElementById('dashboardGreetingTime');
        const now = new Date();
        const h = now.getHours();
        let greet = 'Selamat';
        if (h >= 4 && h < 11) greet = 'Selamat Pagi';
        else if (h >= 11 && h < 15) greet = 'Selamat Siang';
        else if (h >= 15 && h < 18) greet = 'Selamat Sore';
        else greet = 'Selamat Malam';
        if (dashText) dashText.textContent = greet;
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
            const cover = document.getElementById('inCover').value.trim();

            // validasi sederhana
            if (!kodeLokasi || !kodeBarang || !namaBarang || !jenisBarang) {
                alert('Lengkapi semua field wajib (Kode Lokasi, Kode Barang, Nama, Jenis).');
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

});
