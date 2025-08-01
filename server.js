// server.js

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs'); 
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- KONFIGURASI KONEKSI DATABASE UNTUK HOSTING ---
// Informasi ini diambil dari panel hosting SmarterASP.NET Anda.
const db = mysql.createConnection({
    host: 'mysql1003.site4now.net',
    user: 'db_abc712_bus',
    password: 'BUS_TREPEL001', // Password yang Anda berikan
    database: 'db_abc712_bus'
});

db.connect(err => {
    if (err) {
        console.error('!!! KESALAHAN KONEKSI DATABASE !!!');
        console.error('Pastikan detail koneksi (host, user, password, database) sudah benar.');
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('>>> Berhasil terhubung ke database MySQL di hosting!');
});

// --- API ENDPOINTS ---

// 1. Endpoint untuk Registrasi Pengguna
app.post('/register', async (req, res) => {
    console.log('\n--- Menerima permintaan di /register ---');
    console.log('Data yang diterima:', req.body);

    const { nama, email, password, alamat, umur, tanggalLahir, jenisKelamin, noHp } = req.body;
    
    if (!nama || !email || !password) {
        console.log('Respon: Gagal, data wajib tidak lengkap.');
        return res.status(400).send('Nama, email, dan password wajib diisi.');
    }

    const sanitizedData = {
        nama,
        email,
        alamat: alamat || null,
        umur: umur || null,
        tanggalLahir: tanggalLahir || null,
        jenisKelamin: jenisKelamin || null,
        noHp: noHp || null
    };

    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        sanitizedData.password = hashedPassword;

        console.log('Menjalankan query INSERT ke tabel users...');
        db.query('INSERT INTO users SET ?', sanitizedData, (err, result) => {
            if (err) {
                console.error('!!! KESALAHAN SQL !!!');
                console.error('SQL Error:', err); 
                return res.status(500).send('Gagal mendaftarkan pengguna karena kesalahan database.');
            }
            console.log('>>> SUKSES: Pengguna berhasil didaftarkan dengan ID:', result.insertId);
            res.status(201).json({ message: 'Pengguna berhasil didaftarkan!', userId: result.insertId });
        });
    } catch (error) {
        console.error('!!! KESALAHAN HASHING PASSWORD !!!');
        console.error('Hashing Error:', error);
        res.status(500).send('Terjadi kesalahan pada server.');
    }
});

// 2. Endpoint untuk Login Pengguna
app.post('/login', (req, res) => {
    console.log('\n--- Menerima permintaan di /login ---');
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).send('Kesalahan pada server.');
        }
        if (results.length === 0) {
            return res.status(401).send('Email atau password salah.');
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send('Email atau password salah.');
        }
        
        const { password: _, ...userData } = user;
        console.log('>>> SUKSES: Login berhasil untuk user:', userData.email);
        res.status(200).json(userData);
    });
});

// 3. Endpoint untuk Menambah Transaksi
app.post('/transactions', (req, res) => {
    console.log('\n--- Menerima permintaan di /transactions ---');
    const { userId, lokasi, tujuan, bus, harga, tanggal } = req.body;
    const newTransaction = { user_id: userId, lokasi, tujuan, bus, harga, tanggal };

    db.query('INSERT INTO transactions SET ?', newTransaction, (err, result) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).send('Gagal menyimpan transaksi.');
        }
        console.log('>>> SUKSES: Transaksi berhasil disimpan dengan ID:', result.insertId);
        res.status(201).json({ message: 'Transaksi berhasil disimpan!', transactionId: result.insertId });
    });
});

// 4. Endpoint untuk Mengambil Riwayat Transaksi
app.get('/transactions/:userId', (req, res) => {
    console.log(`\n--- Menerima permintaan di /transactions/${req.params.userId} ---`);
    const { userId } = req.params;
    db.query('SELECT * FROM transactions WHERE user_id = ? ORDER BY tanggalPemesanan DESC', [userId], (err, results) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).send('Gagal mengambil riwayat.');
        }
        console.log(`>>> SUKSES: Ditemukan ${results.length} transaksi.`);
        res.status(200).json(results);
    });
});

// Menjalankan server
// Port akan ditentukan oleh hosting, jadi kita tidak perlu menentukannya secara manual di sini.
// Biasanya hosting akan membaca variabel process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n================================================`);
    console.log(`   Server berjalan di port ${PORT}`);
    console.log(`================================================`);
});
