import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { getSystemSettings, getStudentByEmail, createOrUpdateStudent } from '../services/db';
import { SystemSettings, StudentProfile, INITIAL_STUDENT_STATE } from '../types';
import { Input } from '../components/Input';
import { ClearanceForm } from './ClearanceForm';

export const PublicFlow: React.FC = () => {
  const [step, setStep] = useState<'landing' | 'init' | 'form' | 'success'>('landing');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getSystemSettings().then(setSettings);
  }, []);

  const handleStart = () => {
      setStep('init');
      window.scrollTo(0, 0);
  };

  const initPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) {
        alert("System settings not loaded. Please refresh the page.");
        return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
        // --- VALIDATION BLOCK START ---
        
        // 1. Validate Paystack Key
        const publicKey = settings.paystack_public_key;
        if (!publicKey || publicKey.includes('REPLACE_ME') || publicKey.length < 5) {
            alert("Configuration Error: Paystack Public Key is not set in Admin Settings.\n\nPlease login to /myadmin and set your 'pk_live_...' key.");
            setIsProcessing(false);
            return;
        }

        // 2. Validate Amount
        const amountInKobo = Math.floor(Number(settings.clearance_fee) * 100);
        if (isNaN(amountInKobo) || amountInKobo <= 0) {
            alert("Configuration Error: Clearance fee is invalid. Please check Admin Settings.");
            setIsProcessing(false);
            return;
        }

        // 3. Check for Paystack SDK
        // @ts-ignore
        const PaystackPop = window.PaystackPop;
        if (!PaystackPop || typeof PaystackPop.setup !== 'function') {
            alert("Connection Error: Paystack gateway failed to load.\n\nPlease check your internet connection and ensure you are not using an ad-blocker.");
            setIsProcessing(false);
            return;
        }

        // --- VALIDATION BLOCK END ---

        // 4. Check if student already paid (Idempotency)
        let student = await getStudentByEmail(email);
        
        if (student && student.payment_status === 'paid') {
            setCurrentStudent(student);
            setStep('form');
            setIsProcessing(false);
            return;
        }

        // 5. Initialize Transaction
        const transactionRef = '' + Math.floor((Math.random() * 1000000000) + 1);

        // Standard Paystack V1 Inline Implementation
        const handler = PaystackPop.setup({
            key: publicKey.trim(),
            email: email.trim(),
            amount: amountInKobo,
            currency: 'NGN',
            ref: transactionRef,
            metadata: {
                custom_fields: [
                    {
                        display_name: "Student Name",
                        variable_name: "student_name",
                        value: name
                    },
                    {
                        display_name: "Phone Number",
                        variable_name: "phone_number",
                        value: phone
                    },
                    {
                        display_name: "Session",
                        variable_name: "session",
                        value: settings.session_year
                    }
                ]
            },
            // Strictly defined callback function (not async directly to avoid library validation errors)
            callback: function(response: any) {
                // Execute async logic internally
                const completeProcess = async () => {
                    try {
                        const newStudent: StudentProfile = student || {
                            ...INITIAL_STUDENT_STATE,
                            surname: name.split(' ').slice(1).join(' ') || name.split(' ')[1] || '',
                            first_name: name.split(' ')[0] || '',
                            email: email,
                            post_utme_phone: phone,
                            created_at: new Date().toISOString(),
                            id: crypto.randomUUID()
                        };
                        
                        newStudent.payment_status = 'paid';
                        newStudent.payment_reference = response.reference;
                        
                        await createOrUpdateStudent(newStudent);
                        setCurrentStudent(newStudent);
                        setStep('form');
                    } catch (error) {
                        alert('Payment verified but failed to save record. Please contact support with reference: ' + response.reference);
                    } finally {
                        setIsProcessing(false);
                    }
                };
                completeProcess();
            },
            onClose: function() {
                setIsProcessing(false);
            }
        });

        handler.openIframe();

    } catch (err) {
        console.error("Payment Init Error:", err);
        alert(`System Error: ${err instanceof Error ? err.message : 'Unknown payment initialization error.'}`);
        setIsProcessing(false);
    }
  };

  // Loading State
  if (!settings) return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-indigo-900">
          <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-semibold text-lg">Initializing Secure Portal...</span>
      </div>
  );

  return (
    <Layout>
      {step === 'landing' && (
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center py-16 md:py-24">
          <div className="bg-white p-6 rounded-full mb-10 shadow-lg ring-1 ring-gray-100">
            <svg className="w-16 h-16 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 max-w-4xl leading-tight tracking-tight">
            Welcome to <span className="text-indigo-700">A&U NG</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-600 mb-8 max-w-2xl mx-auto">
            Official 100 Level Clearance & Admission Acceptance Portal
          </p>
          <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Securely complete your clearance for the <strong>{settings.session_year}</strong> academic session. Please ensure you have your documents ready.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-16 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Academic Session</span>
                <span className="text-3xl font-bold text-gray-900">{settings.session_year}</span>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Clearance Fee</span>
                <span className="text-3xl font-bold text-green-600">₦{settings.clearance_fee.toLocaleString()}</span>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Closing Date</span>
                <span className="text-3xl font-bold text-red-500">{settings.payment_deadline}</span>
            </div>
          </div>

          <button 
            onClick={handleStart}
            className="bg-indigo-700 text-white px-12 py-5 rounded-xl text-lg md:text-xl font-bold hover:bg-indigo-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 focus:ring-4 focus:ring-indigo-300"
          >
            Start Clearance Process
          </button>
          
          <div className="mt-20"></div>
        </div>
      )}

      {step === 'init' && (
        <div className="min-h-[80vh] flex flex-col justify-center py-12">
            <div className="max-w-lg mx-auto w-full px-4">
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                    <div className="mb-8 text-center">
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Student Verification</h2>
                        <p className="text-gray-500 mt-2">Enter your valid details to initiate payment.</p>
                    </div>
                    
                    <form onSubmit={initPayment} className="space-y-6">
                        <Input 
                            label="Full Name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            placeholder="Surname Firstname" 
                            className="bg-gray-50 focus:bg-white text-lg"
                        />
                        <Input 
                            label="Email Address" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="jamb.email@example.com"
                             className="bg-gray-50 focus:bg-white text-lg"
                        />
                        <Input 
                            label="Phone Number" 
                            type="tel" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            required 
                             className="bg-gray-50 focus:bg-white text-lg"
                        />
                        
                        <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 flex items-start gap-3">
                             <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-sm text-yellow-800 leading-relaxed">
                                You will be redirected to the secure <strong>Paystack</strong> gateway to complete the <strong>₦{settings.clearance_fee.toLocaleString()}</strong> acceptance fee.
                            </p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg flex items-center justify-center
                                ${isProcessing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5'}
                            `}
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Loading Payment...
                                </>
                            ) : 'Pay & Proceed'}
                        </button>
                        
                        <button 
                            onClick={() => setStep('landing')} 
                            type="button" 
                            className="w-full text-gray-400 text-sm hover:text-gray-600 font-medium transition-colors"
                        >
                            Cancel Transaction
                        </button>
                    </form>
                </div>
            </div>
        </div>
      )}

      {step === 'form' && currentStudent && (
        <div className="max-w-5xl mx-auto mt-12 px-4 pb-24">
            <ClearanceForm 
                student={currentStudent} 
                onSuccess={() => setStep('success')} 
            />
        </div>
      )}

      {step === 'success' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
               <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
                   <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
               </div>
               <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Submission Received!</h2>
               <p className="text-xl text-gray-600 max-w-lg leading-relaxed mb-10">
                   Your clearance data and documents have been successfully submitted to the A&U NG Admission Office.
               </p>
               <button onClick={() => window.location.reload()} className="px-10 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all">
                   Return to Home
               </button>
          </div>
      )}
    </Layout>
  );
};