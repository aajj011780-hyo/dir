import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import type { DiaryEntry } from './types/diary';

// User's provided Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAeCxHOGqbRZydeeo40lDhUdB5Gief_w7c",
  authDomain: "guestbook-cec41.firebaseapp.com",
  projectId: "guestbook-cec41",
  storageBucket: "guestbook-cec41.firebasestorage.app",
  messagingSenderId: "611046307160",
  appId: "1:611046307160:web:4a641064d5ae0211e8e12d",
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

const COLLECTION_NAME = 'warm_diaries';
const LOCAL_STORAGE_KEY = 'warm_diaries_backup_v1';

// Local storage helpers for 100% data safety
export function getLocalDiaries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to read localStorage:', e);
    return [];
  }
}

export function saveLocalDiaries(diaries: DiaryEntry[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(diaries));
  } catch (e) {
    console.warn('Failed to write to localStorage:', e);
  }
}

/**
 * Save or update a diary entry in Firestore & LocalStorage
 */
export async function saveDiary(entry: DiaryEntry): Promise<{ source: 'firestore' | 'local' }> {
  // Always update local cache first
  const localList = getLocalDiaries();
  const existingIdx = localList.findIndex((d) => d.id === entry.id);
  if (existingIdx >= 0) {
    localList[existingIdx] = entry;
  } else {
    localList.unshift(entry);
  }
  saveLocalDiaries(localList);

  try {
    const diaryDocRef = doc(db, COLLECTION_NAME, entry.id);
    await setDoc(diaryDocRef, {
      ...entry,
      updatedAt: Date.now(),
    });
    return { source: 'firestore' };
  } catch (error: any) {
    console.warn('Firestore write failed, saved safely to local storage:', error?.message);
    return { source: 'local' };
  }
}

/**
 * Delete a diary entry
 */
export async function deleteDiary(id: string): Promise<void> {
  const localList = getLocalDiaries().filter((d) => d.id !== id);
  saveLocalDiaries(localList);

  try {
    const diaryDocRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(diaryDocRef);
  } catch (error: any) {
    console.warn('Firestore delete failed, updated locally:', error?.message);
  }
}

/**
 * Toggle action suggestion completion
 */
export async function toggleDiaryAction(id: string, completed: boolean): Promise<void> {
  const localList = getLocalDiaries().map((d) =>
    d.id === id ? { ...d, actionCompleted: completed } : d
  );
  saveLocalDiaries(localList);

  try {
    const diaryDocRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(diaryDocRef, { actionCompleted: completed });
  } catch (error: any) {
    console.warn('Firestore update failed, updated locally:', error?.message);
  }
}

/**
 * Subscribe to diary updates (Real-time Firestore + Local fallback)
 */
export function subscribeToDiaries(
  onData: (diaries: DiaryEntry[], isSyncedWithCloud: boolean) => void
): () => void {
  // Initial immediate local emit
  const initialLocal = getLocalDiaries();
  onData(initialLocal, false);

  try {
    const diariesQuery = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      diariesQuery,
      (snapshot) => {
        const cloudDiaries: DiaryEntry[] = [];
        snapshot.forEach((docSnap) => {
          cloudDiaries.push(docSnap.data() as DiaryEntry);
        });

        // Merge cloud with local in case any offline items exist
        const localItems = getLocalDiaries();
        const mergedMap = new Map<string, DiaryEntry>();

        cloudDiaries.forEach((d) => mergedMap.set(d.id, d));
        localItems.forEach((d) => {
          if (!mergedMap.has(d.id)) {
            mergedMap.set(d.id, d);
          }
        });

        const mergedList = Array.from(mergedMap.values()).sort(
          (a, b) => b.createdAt - a.createdAt
        );

        saveLocalDiaries(mergedList);
        onData(mergedList, true);
      },
      (error) => {
        console.warn('Firestore snapshot error (using local storage fallback):', error.message);
        onData(getLocalDiaries(), false);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Firestore setup error (using local storage fallback):', err);
    onData(getLocalDiaries(), false);
    return () => {};
  }
}
