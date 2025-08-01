// Alamat dasar dari backend API Anda yang sudah online
// Menggunakan domain yang Anda berikan.
const API_BASE_URL = 'http://zenxsu-001-site1.mtempurl.com';

/**
 * Fungsi untuk menangani registrasi pengguna.
 * @param {object} userData - Data lengkap pengguna dari formulir registrasi.
 * @returns {Promise<object>} Respons dari server.
 */
async function registerUser(userData) {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registrasi gagal.');
    }

    return response.json();
}

/**
 * Fungsi untuk menangani login pengguna.
 * @param {string} email - Email pengguna.
 * @param {string} password - Password pengguna.
 * @returns {Promise<object>} Data pengguna jika login berhasil.
 */
async function loginUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login gagal.');
    }

    const userData = await response.json();
    // Simpan data pengguna di localStorage untuk sesi login
    localStorage.setItem('currentUser', JSON.stringify(userData));
    return userData;
}

/**
 * Fungsi untuk logout.
 */
function logoutUser() {
    // Hapus data pengguna dari localStorage
    localStorage.removeItem('currentUser');
    // Arahkan ke halaman login
    window.location.href = 'loginpage.html';
}

/**
 * Mengambil data pengguna yang sedang login dari localStorage.
 * @returns {object|null} Data pengguna atau null jika tidak ada.
 */
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

/**
 * Menambahkan transaksi baru ke database.
 * @param {object} transactionData - Data transaksi.
 * @returns {Promise<object>} Respons dari server.
 */
async function addTransaction(transactionData) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal menyimpan transaksi.');
    }

    return response.json();
}

/**
 * Mengambil riwayat transaksi seorang pengguna.
 * @param {number} userId - ID pengguna.
 * @returns {Promise<Array>} Array berisi riwayat transaksi.
 */
async function getTransactionHistory(userId) {
    const response = await fetch(`${API_BASE_URL}/transactions/${userId}`);
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal mengambil riwayat transaksi.');
    }

    return response.json();
}

// Ekspor fungsi-fungsi agar bisa digunakan di file lain
export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    addTransaction,
    getTransactionHistory
};
