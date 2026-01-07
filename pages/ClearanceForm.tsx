import React, { useState, useRef } from 'react';
import { StudentProfile, OLevelSubject } from '../types';
import { createOrUpdateStudent, uploadDocument } from '../services/db';
import { Input, Select } from '../components/Input';

interface ClearanceFormProps {
  student: StudentProfile;
  onSuccess: () => void;
}

const SECTIONS = [
  'Personal Details',
  'Next of Kin',
  'Biodata',
  'JAMB Details',
  'Schools',
  "O'Level Results",
  'Documents',
];

// --- Drag & Drop Uploader Component ---
const FileUploader: React.FC<{ 
    label: string; 
    fileUrl?: string; 
    onUpload: (file: File) => void;
    isUploading: boolean;
}> = ({ label, fileUrl, onUpload, isUploading }) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div 
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input 
                ref={inputRef}
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf" 
                className="hidden" 
                onChange={handleChange}
                disabled={isUploading}
            />
            
            <div className="flex flex-col items-center justify-center space-y-2">
                {fileUrl ? (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-sm font-medium">Uploaded Successfully</span>
                    </div>
                ) : (
                    <div className="bg-indigo-100 p-2 rounded-full">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    </div>
                )}
                
                <p className="font-medium text-gray-700">{label}</p>
                
                {fileUrl ? (
                    <div className="flex flex-col items-center gap-2 mt-2">
                        {fileUrl.endsWith('.pdf') ? (
                             <span className="text-xs text-gray-500 border p-1 rounded">PDF Document</span>
                        ) : (
                            <img src={fileUrl} alt="Preview" className="h-20 w-auto object-cover rounded shadow-sm border" />
                        )}
                        <button 
                            type="button"
                            onClick={onButtonClick}
                            className="text-xs text-indigo-600 hover:underline mt-1"
                        >
                            Change File
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-500">
                            Drag & drop or <button type="button" onClick={onButtonClick} className="text-indigo-600 font-semibold hover:underline">browse</button>
                        </p>
                        <p className="text-xs text-gray-400">Supported: JPG, PNG, PDF (Max 2MB)</p>
                    </>
                )}
                
                {isUploading && <p className="text-sm text-indigo-500 animate-pulse">Uploading...</p>}
            </div>
        </div>
    );
};

export const ClearanceForm: React.FC<ClearanceFormProps> = ({ student: initialStudent, onSuccess }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [student, setStudent] = useState<StudentProfile>(initialStudent);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleJAMBScoreChange = (index: number, field: 'subject' | 'score', value: string | number) => {
    const newScores = [...student.jamb_score_details];
    newScores[index] = { ...newScores[index], [field]: value };
    setStudent(prev => ({ ...prev, jamb_score_details: newScores }));
  };

  const handleOLevelSubjectChange = (sitting: 1 | 2, index: number, field: 'subject' | 'grade', value: string) => {
    const key = sitting === 1 ? 'olevel_sitting_1' : 'olevel_sitting_2';
    // @ts-ignore
    const sittingData = { ...student[key] };
    sittingData.subjects[index] = { ...sittingData.subjects[index], [field]: value };
    // @ts-ignore
    setStudent(prev => ({ ...prev, [key]: sittingData }));
  };

    const handleOLevelMetaChange = (sitting: 1 | 2, field: string, value: string) => {
        const key = sitting === 1 ? 'olevel_sitting_1' : 'olevel_sitting_2';
        // @ts-ignore
        const sittingData = { ...student[key], [field]: value };
        // @ts-ignore
        setStudent(prev => ({ ...prev, [key]: sittingData }));
    }


  const onFileUpload = async (file: File, field: 'doc_olevel_url' | 'doc_age_declaration_url' | 'doc_lga_url') => {
      setUploadingField(field);
      try {
        const url = await uploadDocument(file);
        setStudent(prev => ({ ...prev, [field]: url }));
      } catch (err) {
        alert("Upload failed. Please try again.");
      } finally {
        setUploadingField(null);
      }
  };

  const handleSubmit = async () => {
    // Basic validation check
    if (!student.doc_olevel_url || !student.doc_age_declaration_url || !student.doc_lga_url) {
        alert("Please upload all required documents before submitting.");
        return;
    }

    setLoading(true);
    try {
      await createOrUpdateStudent(student);
      onSuccess();
    } catch (err) {
      alert("Failed to submit clearance. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection(prev => Math.min(prev + 1, SECTIONS.length - 1));
  };
  
  const prevStep = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Progress Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-800">{SECTIONS[activeSection]}</h2>
            <span className="text-sm text-gray-500">Step {activeSection + 1} of {SECTIONS.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((activeSection + 1) / SECTIONS.length) * 100}%` }}
            ></div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {activeSection === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input name="surname" label="Surname" value={student.surname} onChange={handleInputChange} required />
            <Input name="first_name" label="First Name" value={student.first_name} onChange={handleInputChange} required />
            <Input name="middle_name" label="Middle Name" value={student.middle_name} onChange={handleInputChange} />
            <Input name="jamb_reg_number" label="JAMB Reg Number" value={student.jamb_reg_number} onChange={handleInputChange} required />
            <Select name="gender" label="Gender" options={['Male', 'Female']} value={student.gender} onChange={handleInputChange} required />
            <Input type="date" name="dob" label="Date of Birth" value={student.dob} onChange={handleInputChange} required />
            <Input name="place_of_birth" label="Place of Birth" value={student.place_of_birth} onChange={handleInputChange} required />
            <Input name="state_of_origin" label="State of Origin" value={student.state_of_origin} onChange={handleInputChange} required />
            <Input name="lga" label="LGA" value={student.lga} onChange={handleInputChange} required />
            <Input name="home_town" label="Home Town" value={student.home_town} onChange={handleInputChange} required />
            <Select name="religion" label="Religion" options={['Christianity', 'Islam', 'Other']} value={student.religion} onChange={handleInputChange} required />
            <Input name="contact_address" label="Contact Address" value={student.contact_address} onChange={handleInputChange} required />
            <Select name="marital_status" label="Marital Status" options={['Single', 'Married']} value={student.marital_status} onChange={handleInputChange} required />
            <div className="col-span-1 md:col-span-2 mt-4 pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-4 bg-indigo-50 p-2 rounded">Account Recovery Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Input name="jamb_email" label="JAMB Email" value={student.jamb_email || ''} onChange={handleInputChange} />
                    <Input name="jamb_password_placeholder" label="JAMB Password (For Record)" type="password" value={student.jamb_password_placeholder || ''} onChange={handleInputChange} />
                    <Input name="email" label="Personal Email" value={student.email} disabled className="bg-gray-100 text-gray-500 cursor-not-allowed" />
                    <Input name="email_password_placeholder" label="Email Password (For Record)" type="password" value={student.email_password_placeholder || ''} onChange={handleInputChange} />
                </div>
            </div>
          </div>
        )}

        {activeSection === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input name="nok_name" label="Next of Kin Name" value={student.nok_name} onChange={handleInputChange} required />
            <Input name="nok_phone" label="Next of Kin Phone" value={student.nok_phone} onChange={handleInputChange} required />
            <Input name="nok_relationship" label="Relationship" value={student.nok_relationship} onChange={handleInputChange} required />
            <div className="md:col-span-2">
                <Input name="nok_address" label="Next of Kin Address" value={student.nok_address} onChange={handleInputChange} required />
            </div>
          </div>
        )}

        {activeSection === 2 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <h3 className="md:col-span-2 font-bold text-gray-700 border-b pb-2">Father's Details</h3>
                <Input name="father_name" label="Father's Name" value={student.father_name} onChange={handleInputChange} required />
                <Input name="father_phone" label="Father's Phone" value={student.father_phone} onChange={handleInputChange} required />
                <div className="md:col-span-2">
                    <Input name="father_address" label="Father's Address" value={student.father_address} onChange={handleInputChange} required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <h3 className="md:col-span-2 font-bold text-gray-700 border-b pb-2">Mother's Details</h3>
                <Input name="mother_name" label="Mother's Name" value={student.mother_name} onChange={handleInputChange} required />
                <Input name="mother_phone" label="Mother's Phone" value={student.mother_phone} onChange={handleInputChange} required />
                <div className="md:col-span-2">
                    <Input name="mother_address" label="Mother's Address" value={student.mother_address} onChange={handleInputChange} required />
                </div>
            </div>
          </div>
        )}

        {activeSection === 3 && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input name="jamb_exam_centre" label="JAMB Exam Centre" value={student.jamb_exam_centre} onChange={handleInputChange} required />
                    <Input name="jamb_reg_number" label="JAMB Reg Number" value={student.jamb_reg_number} disabled className="bg-gray-100" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">JAMB Subject Scores</h3>
                    <div className="bg-gray-50 p-6 rounded-lg grid gap-4">
                        {student.jamb_score_details.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-end">
                                <Input 
                                    label={`Subject ${idx + 1}`} 
                                    value={item.subject} 
                                    onChange={(e) => handleJAMBScoreChange(idx, 'subject', e.target.value)}
                                    disabled={idx === 0} // English is usually compulsory
                                />
                                <Input 
                                    label="Score" 
                                    type="number"
                                    value={item.score} 
                                    onChange={(e) => handleJAMBScoreChange(idx, 'score', parseInt(e.target.value) || 0)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeSection === 4 && (
            <div className="space-y-8">
                <div>
                    <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Primary School Education</h3>
                    <div className="bg-gray-50 p-6 rounded-lg grid gap-6">
                        <Input name="primary_school_name" label="School Name" value={student.primary_school_name} onChange={handleInputChange} required />
                        <div className="grid grid-cols-2 gap-6">
                            <Input type="number" name="primary_entry_year" label="Entry Year" value={student.primary_entry_year} onChange={handleInputChange} required />
                            <Input type="number" name="primary_exit_year" label="Exit Year" value={student.primary_exit_year} onChange={handleInputChange} required />
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Secondary School Education</h3>
                    <div className="bg-gray-50 p-6 rounded-lg grid gap-6">
                        <Input name="secondary_school_name" label="School Name" value={student.secondary_school_name} onChange={handleInputChange} required />
                        <div className="grid grid-cols-2 gap-6">
                            <Input type="number" name="secondary_entry_year" label="Entry Year" value={student.secondary_entry_year} onChange={handleInputChange} required />
                            <Input type="number" name="secondary_exit_year" label="Exit Year" value={student.secondary_exit_year} onChange={handleInputChange} required />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeSection === 5 && (
            <div className="space-y-8">
                {/* Sitting 1 */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">First Sitting (Mandatory)</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <Select label="Exam Name" options={['WAEC', 'NECO', 'NABTEB', 'GCE']} value={student.olevel_sitting_1.exam_name} onChange={(e) => handleOLevelMetaChange(1, 'exam_name', e.target.value)} />
                        <Input label="Exam Number" value={student.olevel_sitting_1.exam_number} onChange={(e) => handleOLevelMetaChange(1, 'exam_number', e.target.value)} />
                        <Input label="Exam Year" type="number" value={student.olevel_sitting_1.exam_year} onChange={(e) => handleOLevelMetaChange(1, 'exam_year', e.target.value)} />
                        <Input label="Exam Centre" value={student.olevel_sitting_1.exam_centre} onChange={(e) => handleOLevelMetaChange(1, 'exam_centre', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        {student.olevel_sitting_1.subjects.map((sub, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <span className="text-sm font-mono text-gray-500 w-6">{idx + 1}.</span>
                                <input placeholder="Subject" className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={sub.subject} onChange={(e) => handleOLevelSubjectChange(1, idx, 'subject', e.target.value)} />
                                <select className="border border-gray-300 rounded px-3 py-2 w-24 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={sub.grade} onChange={(e) => handleOLevelSubjectChange(1, idx, 'grade', e.target.value)}>
                                    <option value="">Gr</option>
                                    {['A1','B2','B3','C4','C5','C6','D7','E8','F9'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg">
                    <input type="checkbox" id="sitting2" checked={student.has_second_sitting} onChange={(e) => setStudent({...student, has_second_sitting: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                    <label htmlFor="sitting2" className="text-gray-900 font-semibold cursor-pointer">I have a Second Sitting</label>
                </div>

                {student.has_second_sitting && student.olevel_sitting_2 && (
                    <div className="bg-gray-50 p-6 rounded-lg border border-indigo-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Second Sitting</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <Select label="Exam Name" options={['WAEC', 'NECO', 'NABTEB', 'GCE']} value={student.olevel_sitting_2.exam_name} onChange={(e) => handleOLevelMetaChange(2, 'exam_name', e.target.value)} />
                        <Input label="Exam Number" value={student.olevel_sitting_2.exam_number} onChange={(e) => handleOLevelMetaChange(2, 'exam_number', e.target.value)} />
                        <Input label="Exam Year" type="number" value={student.olevel_sitting_2.exam_year} onChange={(e) => handleOLevelMetaChange(2, 'exam_year', e.target.value)} />
                        <Input label="Exam Centre" value={student.olevel_sitting_2.exam_centre} onChange={(e) => handleOLevelMetaChange(2, 'exam_centre', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        {student.olevel_sitting_2.subjects.map((sub, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <span className="text-sm font-mono text-gray-500 w-6">{idx + 1}.</span>
                                <input placeholder="Subject" className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={sub.subject} onChange={(e) => handleOLevelSubjectChange(2, idx, 'subject', e.target.value)} />
                                <select className="border border-gray-300 rounded px-3 py-2 w-24 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={sub.grade} onChange={(e) => handleOLevelSubjectChange(2, idx, 'grade', e.target.value)}>
                                    <option value="">Gr</option>
                                    {['A1','B2','B3','C4','C5','C6','D7','E8','F9'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
                )}
            </div>
        )}

        {activeSection === 6 && (
            <div className="space-y-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span><strong>Requirement:</strong> Please upload clear, scanned copies of your original documents. Accepted formats: JPG, PNG, PDF. Max size 2MB per file.</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUploader 
                        label="O'Level Result Slip" 
                        fileUrl={student.doc_olevel_url} 
                        onUpload={(f) => onFileUpload(f, 'doc_olevel_url')} 
                        isUploading={uploadingField === 'doc_olevel_url'}
                    />
                    <FileUploader 
                        label="Birth Cert / Age Declaration" 
                        fileUrl={student.doc_age_declaration_url} 
                        onUpload={(f) => onFileUpload(f, 'doc_age_declaration_url')} 
                        isUploading={uploadingField === 'doc_age_declaration_url'}
                    />
                    <FileUploader 
                        label="LGA Identification Letter" 
                        fileUrl={student.doc_lga_url} 
                        onUpload={(f) => onFileUpload(f, 'doc_lga_url')} 
                        isUploading={uploadingField === 'doc_lga_url'}
                    />
                </div>
            </div>
        )}
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <button 
          onClick={prevStep} 
          disabled={activeSection === 0}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          Previous
        </button>
        {activeSection === SECTIONS.length - 1 ? (
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:shadow-lg disabled:bg-green-400 transition-all font-bold flex items-center"
          >
            {loading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Submitting...
                </>
            ) : 'Submit Final Clearance'}
          </button>
        ) : (
          <button 
            onClick={nextStep}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:shadow-lg transition-all font-medium"
          >
            Next Step
          </button>
        )}
      </div>
    </div>
  );
};