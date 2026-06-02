// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { 
    browserLocalPersistence, 
    getReactNativePersistence, 
    initializeAuth 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Configura a autenticação com persistência baseada na plataforma
const persistence = Platform.OS === 'web' 
    ? browserLocalPersistence 
    : getReactNativePersistence(AsyncStorage);

export const auth = initializeAuth(app, { persistence });

// Exporta o banco de dados
export const db = getFirestore(app);