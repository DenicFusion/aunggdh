// Helper to safely access Env vars in both Vite and Next.js/Standard environments
const getEnv = (key: string, viteKey?: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && viteKey && import.meta.env[viteKey]) {
     // @ts-ignore
     return import.meta.env[viteKey];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
  }
  return '';
};

export interface SystemSettings {
  id: string;
  session_year: string;
  clearance_fee: number;
  payment_deadline: string;
  paystack_public_key: string;
  paystack_secret_key: string; 
  payments_enabled: boolean;
  submissions_enabled: boolean;
}

export interface OLevelSubject {
  subject: string;
  grade: string;
}

export interface OLevelResult {
  exam_name: string;
  exam_number: string;
  exam_year: string;
  exam_centre: string;
  subjects: OLevelSubject[];
}

export interface StudentProfile {
  id: string; // Supabase UUID
  created_at: string;
  payment_status: 'pending' | 'paid';
  payment_reference?: string;
  
  // Section 1: Personal
  surname: string;
  first_name: string;
  middle_name: string;
  jamb_reg_number: string;
  gender: 'Male' | 'Female' | '';
  dob: string;
  place_of_birth: string;
  state_of_origin: string;
  lga: string;
  home_town: string;
  religion: string;
  post_utme_phone: string;
  email: string; // Post-UTME Email
  email_password_placeholder?: string; // Not real password storage
  jamb_email?: string;
  jamb_password_placeholder?: string;
  contact_address: string;
  marital_status: string;

  // Section 2: Next of Kin
  nok_name: string;
  nok_address: string;
  nok_phone: string;
  nok_relationship: string;

  // Section 3: Biodata (Parents)
  father_name: string;
  father_phone: string;
  father_address: string;
  mother_name: string;
  mother_phone: string;
  mother_address: string;

  // Section 4: JAMB Details
  jamb_exam_centre: string;
  jamb_score_details: { subject: string; score: number }[]; // Array of 4
  
  // Section 5: Educational History
  primary_school_name: string;
  primary_entry_year: string;
  primary_exit_year: string;
  secondary_school_name: string;
  secondary_entry_year: string;
  secondary_exit_year: string;

  // Section 6: O'Level
  olevel_sitting_1: OLevelResult;
  has_second_sitting: boolean;
  olevel_sitting_2?: OLevelResult;

  // Section 7: Documents (URLs)
  doc_olevel_url?: string;
  doc_age_declaration_url?: string;
  doc_lga_url?: string;
}

export const INITIAL_SETTINGS: SystemSettings = {
  id: '1',
  session_year: getEnv('NEXT_PUBLIC_SESSION_YEAR', 'VITE_SESSION_YEAR') || '2025/2026',
  clearance_fee: Number(getEnv('NEXT_PUBLIC_CLEARANCE_FEE', 'VITE_CLEARANCE_FEE')) || 99000,
  payment_deadline: getEnv('NEXT_PUBLIC_PAYMENT_DEADLINE', 'VITE_PAYMENT_DEADLINE') || '2025-12-31',
  // Default to a placeholder if not found, but logic will check if it's set
  paystack_public_key: getEnv('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY', 'VITE_PAYSTACK_PUBLIC_KEY') || 'pk_live_DEMO_KEY_REPLACE_ME',
  paystack_secret_key: getEnv('PAYSTACK_SECRET_KEY', 'VITE_PAYSTACK_SECRET_KEY') || '',
  payments_enabled: true,
  submissions_enabled: true,
};

export const INITIAL_STUDENT_STATE: StudentProfile = {
  id: '',
  created_at: new Date().toISOString(),
  payment_status: 'pending',
  surname: '',
  first_name: '',
  middle_name: '',
  jamb_reg_number: '',
  gender: '',
  dob: '',
  place_of_birth: '',
  state_of_origin: '',
  lga: '',
  home_town: '',
  religion: '',
  post_utme_phone: '',
  email: '',
  contact_address: '',
  marital_status: 'Single',
  nok_name: '',
  nok_address: '',
  nok_phone: '',
  nok_relationship: '',
  father_name: '',
  father_phone: '',
  father_address: '',
  mother_name: '',
  mother_phone: '',
  mother_address: '',
  jamb_exam_centre: '',
  jamb_score_details: [
    { subject: 'Use of English', score: 0 },
    { subject: '', score: 0 },
    { subject: '', score: 0 },
    { subject: '', score: 0 },
  ],
  primary_school_name: '',
  primary_entry_year: '',
  primary_exit_year: '',
  secondary_school_name: '',
  secondary_entry_year: '',
  secondary_exit_year: '',
  olevel_sitting_1: {
    exam_name: 'WAEC',
    exam_number: '',
    exam_year: '',
    exam_centre: '',
    subjects: Array(9).fill({ subject: '', grade: '' }),
  },
  has_second_sitting: false,
  olevel_sitting_2: {
    exam_name: 'NECO',
    exam_number: '',
    exam_year: '',
    exam_centre: '',
    subjects: Array(9).fill({ subject: '', grade: '' }),
  },
};