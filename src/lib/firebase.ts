import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseConfigObject {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

const LOCAL_STORAGE_KEY = 'mpt_custom_firebase_config';

export function getSavedFirebaseConfig(): FirebaseConfigObject | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved Firebase config from localStorage:', err);
  }

  // Check Vite environment variables
  const envConfig: FirebaseConfigObject = {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env?.VITE_FIREBASE_APP_ID,
    firestoreDatabaseId: import.meta.env?.VITE_FIREBASE_DATABASE_ID,
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return null;
}

export function saveCustomFirebaseConfig(config: FirebaseConfigObject | null) {
  if (typeof localStorage === 'undefined') return;
  if (!config) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } else {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  }
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let isConnectedToLiveFirebase = false;

const activeConfig = getSavedFirebaseConfig();

if (activeConfig && activeConfig.apiKey && activeConfig.projectId) {
  try {
    if (!getApps().length) {
      appInstance = initializeApp(activeConfig);
    } else {
      appInstance = getApps()[0];
    }
    authInstance = getAuth(appInstance);
    dbInstance = activeConfig.firestoreDatabaseId
      ? getFirestore(appInstance, activeConfig.firestoreDatabaseId)
      : getFirestore(appInstance);
    storageInstance = getStorage(appInstance);
    isConnectedToLiveFirebase = true;
    console.info('Connected to live Firebase project:', activeConfig.projectId);
  } catch (err) {
    console.warn('Error initializing live Firebase SDK:', err);
    isConnectedToLiveFirebase = false;
  }
}

export const firebaseApp = appInstance;
export const firebaseAuth = authInstance;
export const firestoreDb = dbInstance;
export const firebaseStorage = storageInstance;
export const isLiveFirebaseActive = () => isConnectedToLiveFirebase;

// Test connection if active
export async function testFirebaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!firestoreDb) {
    return {
      success: false,
      message: 'Running in Standalone Storage Mode. No live Firebase project configured.',
    };
  }
  try {
    await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
    return { success: true, message: 'Successfully connected to live Cloud Firestore.' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('the client is offline')) {
      return { success: false, message: 'Firestore client is offline or network is blocked.' };
    }
    return { success: false, message: `Firestore ping: ${msg}` };
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuthUser = firebaseAuth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuthUser?.uid || null,
      email: currentAuthUser?.email || null,
      emailVerified: currentAuthUser?.emailVerified || null,
      isAnonymous: currentAuthUser?.isAnonymous || null,
      tenantId: currentAuthUser?.tenantId || null,
      providerInfo: currentAuthUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
