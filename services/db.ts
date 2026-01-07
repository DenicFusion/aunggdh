import { SystemSettings, StudentProfile, INITIAL_SETTINGS, INITIAL_STUDENT_STATE } from '../types';

// NOTE: In a real production app, this file would import { createClient } from '@supabase/supabase-js'
// and all methods would be async calls to Supabase tables.
// Since we don't have the user's API keys, we are using localStorage to mimic the persistence.

const STORAGE_KEYS = {
  SETTINGS: 'uni_portal_settings',
  STUDENTS: 'uni_portal_students',
  ADMIN_SESSION: 'uni_portal_admin_session',
};

// --- Settings Service ---

export const getSystemSettings = async (): Promise<SystemSettings> => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (stored) return JSON.parse(stored);
  // Initialize if not present
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  return INITIAL_SETTINGS;
};

export const updateSystemSettings = async (settings: SystemSettings): Promise<void> => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  // In real app: await supabase.from('settings').upsert(settings);
};

// --- Student Service ---

export const getStudentByEmail = async (email: string): Promise<StudentProfile | null> => {
  const students = await getAllStudents();
  return students.find(s => s.email === email) || null;
};

export const getAllStudents = async (): Promise<StudentProfile[]> => {
  const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  return stored ? JSON.parse(stored) : [];
};

export const createOrUpdateStudent = async (student: StudentProfile): Promise<StudentProfile> => {
  const students = await getAllStudents();
  const index = students.findIndex(s => s.email === student.email);
  
  if (index >= 0) {
    students[index] = { ...students[index], ...student };
  } else {
    // Generate a mock ID
    student.id = crypto.randomUUID();
    students.push(student);
  }
  
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  return student;
};

export const submitClearanceForm = async (student: StudentProfile): Promise<void> => {
  await createOrUpdateStudent(student);
};

// --- Payment Service ---

export const verifyPayment = async (reference: string): Promise<boolean> => {
  // In real app, call Edge Function: await supabase.functions.invoke('verify-payment', { body: { reference } })
  // For demo, we assume valid if reference exists
  return !!reference;
};

// --- Admin Auth ---

export const adminLogin = async (key: string): Promise<boolean> => {
  // In real app, check against secure logic or RLS policy via Edge Function
  if (key === 'Admin123') {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
    return true;
  }
  return false;
};

export const isAdminLoggedIn = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
};

export const adminLogout = () => {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
};

// --- File Storage ---
// Mocking file upload returning a placeholder URL
export const uploadDocument = async (file: File): Promise<string> => {
  // In real app: await supabase.storage.from('documents').upload(...)
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve(URL.createObjectURL(file)); 
      }, 1000);
  });
}
