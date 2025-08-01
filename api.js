// db-firebase.js

// Import fungsi yang diperlukan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc,
    getDoc, 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ===============================================================
// ||         PENTING: GANTI DENGAN KONFIGURASI ANDA            ||
// ===============================================================
// Tempel (paste) objek firebaseConfig yang Anda salin dari Firebase di sini
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "nama-proyek.firebaseapp.com",
    projectId: "nama-proyek",
    storageBucket: "nama-proyek.appspot.com",
    messagingSenderId: "...",
    appId: "1:..."
};
// ===============================================================

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- FUNGSI AUTENTIKASI ---

async function registerUser(profileData, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, profileData.email, password);
    const user = userCredential.user;
    // Simpan data profil ke koleksi 'users' dengan ID dari Auth
    await setDoc(doc(db, "users", user.uid), profileData);
    return userCredential;
}

async function loginUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Simpan status login di sessionStorage agar tidak hilang saat refresh
    sessionStorage.setItem('userLoggedIn', 'true');
    return userCredential;
}

function logoutUser() {
    sessionStorage.removeItem('userLoggedIn');
    signOut(auth);
    window.location.href = 'loginpage.html';
}

function getCurrentUser() {
    return auth.currentUser;
}

// --- FUNGSI PROFIL ---

async function getUserProfile(userId) {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
        return userDocSnap.data();
    }
    return null;
}

// --- FUNGSI TRANSAKSI ---

async function addTransaction(userId, transactionData) {
    const historyCollectionRef = collection(db, "users", userId, "transactions");
    return await addDoc(historyCollectionRef, {
        ...transactionData,
        tanggalPemesanan: serverTimestamp()
    });
}

async function getTransactionHistory(userId) {
    const history = [];
    const historyCollectionRef = collection(db, "users", userId, "transactions");
    const q = query(historyCollectionRef, orderBy("tanggalPemesanan", "desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
    });
    return history;
}

// Ekspor semua fungsi
export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    onAuthStateChanged,
    getUserProfile,
    addTransaction,
    getTransactionHistory
};
    logoutUser,
    getCurrentUser,
    addTransaction,
    getTransactionHistory
};
