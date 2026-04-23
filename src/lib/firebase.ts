import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.AIzaSyAvi29kQe8RADPNipNFpEQS18YXgtWsPqI ?? '',
  appId: process.env.1:862491854517:web:c2018b0e2f14ee3c5de0fc ?? '',
  projectId: process.env.myhoopapp-60fc9 ?? '',
  authDomain: `${process.env.myhoopapp-60fc9}.firebaseapp.com`,
  storageBucket: `${process.env.myhoopapp-60fc9}.appspot.com`,
  databaseURL: `https://${process.env.myhoopapp-60fc9}-default-rtdb.firebaseio.com`,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
