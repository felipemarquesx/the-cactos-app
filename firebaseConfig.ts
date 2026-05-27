// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// COLE AQUI AS SUAS CHAVES DO PASSO 1
const firebaseConfig = {
    apiKey: "AIzaSyA_BBnONUEPnIlWn5mituSjJfJ966Bdbeo",
    authDomain: "the-catos-app.firebaseapp.com",
    projectId: "the-catos-app",
    storageBucket: "the-catos-app.firebasestorage.app",
    messagingSenderId: "78571577132",
    appId: "1:78571577132:web:c8ca3078a7d5d57f055689"
};
// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o banco de dados e a autenticação para usar nas telas
export const auth = getAuth(app);
export const db = getFirestore(app);