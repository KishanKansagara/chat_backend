import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('Missing required environment variable: FIREBASE_PROJECT_ID');
}

const app = getApps()[0] ?? initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID
});

export const firestore = getFirestore(app);
