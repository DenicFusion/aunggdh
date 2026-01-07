import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { getSystemSettings, getStudentByEmail, createOrUpdateStudent } from '../services/db';
import { SystemSettings, StudentProfile, INITIAL_STUDENT_STATE } from '../types';
import { Input } from '../components/Input';
import { ClearanceForm } from './ClearanceForm';

// Paystack types
declare const PaystackPop: any;

export const PublicFlow: React.FC = () => {
  const [step, setStep] = useState<'landing' | 'init' | 'form' | 'success'>('landing');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);

  useEffect(() => {
    getSystemSettings().then(setSettings);
  }, []);

  const handleStart = () => {
      setStep('init');
  };

  const initPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    // Check if student exists
    let student = await getStudentByEmail(email);
    
    if (student && student.payment_status === 'paid') {
        setCurrentStudent(student);
        setStep('form');
        return;
    }

    // Init Paystack
    const paystack = new PaystackPop();
    paystack.newTransaction({
        key: settings.paystack_public_key,
        email: email,
        amount: settings.clearance_fee * 100, // Kobo
        ref: ''+Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            custom_fields: [
                {
                    display_name: "Payment For",
                    variable_name: "payment_for",
                    value: "A&U NG Clearance"
                },
                {
                    display_name: "Session",
                    variable_name: "session",
                    value: settings.session_year
                }
            ]
        },
        onSuccess: async (transaction: any) => {
            // Payment success
            const newStudent: StudentProfile = student || {
                ...INITIAL_STUDENT_STATE,
                surname: name.split(' ')[1] || '',
                first_name: name.split(' ')[0] || '',
                email: email,
                post_utme_phone: phone,
                created_at: new Date().toISOString(),
                id: crypto.randomUUID()
            };
            
            newStudent.payment_status = 'paid';
            newStudent.payment_reference = transaction.reference;
            
            await createOrUpdateStudent(newStudent);
            setCurrentStudent(newStudent);
            setStep('form');
        },
        onCancel: () => {
            alert('Payment cancelled.');
        }
    });
  };

  if (!settings) return <div className="h-screen flex items-center justify-center font-medium text-gray-600">Loading A&U NG Portal...</div>;

  return (
    <Layout>
      {step === 'landing' && (
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center py-12">
          <div className="bg-indigo-50 p-6 rounded-full mb-8 shadow-sm">
            <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 max-w-3xl leading-tight">
            Welcome to A&U NG
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-indigo-600 mb-6">
            Official 100 Level Clearance & Admission Acceptance Portal
          </p>
          <p className="text-gray-600 text-lg mb-12 max-w-2xl leading-relaxed">
            Congratulations on your admission! Start your clearance process for the <strong>{settings.session_year}</strong> academic session securely online.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mb-16">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Session</p>
                <p className="text-2xl font-bold text-gray-800">{settings.session_year}</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-green-300 transition-colors">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Acceptance Fee</p>
                <p className="text-2xl font-bold text-green-600">₦{settings.clearance_fee.toLocaleString()}</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:border-red-300 transition-colors">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Deadline</p>
                <p className="text-2xl font-bold text-red-600">{settings.payment_deadline}</p>
            </div>
          </div>

          <button 
            onClick={handleStart}
            className="bg-indigo-600 text-white px-10 py-5 rounded-xl text-xl font-bold hover:bg-indigo-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 mb-12"
          >
            Start Clearance Process
          </button>
        </div>
      )}

      {step === 'init' && (
        <div className="max-w-md mx-auto mt-12 px-4 mb-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Student Verification</h2>
                    <p className="text-gray-500 text-sm mt-2">Enter your details to initiate payment</p>
                </div>
                <form onSubmit={initPayment}>
                    <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Surname Firstname" />
                    <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jamb.email@example.com" />
                    <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    
                    <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 mb-8 border border-yellow-100">
                        You will be redirected to Paystack to complete the <strong>₦{settings.clearance_fee.toLocaleString()}</strong> payment securely.
                    </div>

                    <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg">
                        Pay & Proceed
                    </button>
                    <button onClick={() => setStep('landing')} type="button" className="w-full mt-4 text-gray-500 text-sm hover:text-gray-700 font-medium">
                        Cancel
                    </button>
                </form>
            </div>
        </div>
      )}

      {step === 'form' && currentStudent && (
        <div className="max-w-5xl mx-auto mt-8 px-4 pb-20">
            <ClearanceForm 
                student={currentStudent} 
                onSuccess={() => setStep('success')} 
            />
        </div>
      )}

      {step === 'success' && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
               <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
                   <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
               </div>
               <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Submission Successful!</h2>
               <p className="text-xl text-gray-600 max-w-lg leading-relaxed mb-8">
                   Your clearance data and documents have been submitted to the A&U NG Admission Office. Please check your email regularly for updates.
               </p>
               <button onClick={() => window.location.reload()} className="px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                   Return to Home
               </button>
          </div>
      )}
    </Layout>
  );
};