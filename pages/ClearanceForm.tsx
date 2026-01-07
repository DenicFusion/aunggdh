import React, { useState, useEffect } from 'react';
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

export const ClearanceForm: React.FC<ClearanceFormProps> = ({ student: initialStudent, onSuccess }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [student, setStudent] = useState<StudentProfile>(initialStudent);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

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


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'doc_olevel_url' | 'doc_age_declaration_url' | 'doc_lga_url') => {
    if (e.target.files && e.target.files[0]) {
      setUploading(field);
      try {
        const url = await uploadDocument(e.target.files[0]);
        setStudent(prev => ({ ...prev, [field]: url }));
      } catch (err) {
        alert("Upload failed");
      } finally {
        setUploading(null);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createOrUpdateStudent(student);
      onSuccess();
    } catch (err) {
      alert("Failed to submit clearance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setActiveSection(prev => Math.min(prev + 1, SECTIONS.length - 1));
  const prevStep = () => setActiveSection(prev => Math.max(prev - 1, 0));

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Progress Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-wrap gap-2 justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">{SECTIONS[activeSection]}</h2>
        <div className="flex space-x-1">
          {SECTIONS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 w-8 rounded-full ${idx <= activeSection ? 'bg-indigo-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
        {activeSection === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="col-span-2 mt-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-2">Account Recovery Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <Input name="jamb_email" label="JAMB Email" value={student.jamb_email || ''} onChange={handleInputChange} />
                    <Input name="jamb_password_placeholder" label="JAMB Password (For Record)" type="password" value={student.jamb_password_placeholder || ''} onChange={handleInputChange} />
                    <Input name="email" label="Personal Email" value={student.email} disabled />
                    <Input name="email_password_placeholder" label="Email Password (For Record)" type="password" value={student.email_password_placeholder || ''} onChange={handleInputChange} />
                </div>
            </div>
          </div>
        )}

        {activeSection === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="nok_name" label="Next of Kin Name" value={student.nok_name} onChange={handleInputChange} required />
            <Input name="nok_phone" label="Next of Kin Phone" value={student.nok_phone} onChange={handleInputChange} required />
            <Input name="nok_relationship" label="Relationship" value={student.nok_relationship} onChange={handleInputChange} required />
            <div className="md:col-span-2">
                <Input name="nok_address" label="Next of Kin Address" value={student.nok_address} onChange={handleInputChange} required />
            </div>
          </div>
        )}

        {activeSection === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h3 className="md:col-span-2 font-semibold text-gray-700">Father's Details</h3>
                <Input name="father_name" label="Father's Name" value={student.father_name} onChange={handleInputChange} required />
                <Input name="father_phone" label="Father's Phone" value={student.father_phone} onChange={handleInputChange} required />
                <div className="md:col-span-2">
                    <Input name="father_address" label="Father's Address" value={student.father_address} onChange={handleInputChange} required />
                </div>
            </div>
            <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <h3 className="md:col-span-2 font-semibold text-gray-700">Mother's Details</h3>
                <Input name="mother_name" label="Mother's Name" value={student.mother_name} onChange={handleInputChange} required />
                <Input name="mother_phone" label="Mother's Phone" value={student.mother_phone} onChange={handleInputChange} required />
                <div className="md:col-span-2">
                    <Input name="mother_address" label="Mother's Address" value={student.mother_address} onChange={handleInputChange} required />
                </div>
            </div>
          </div>
        )}

        {activeSection === 3 && (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="jamb_exam_centre" label="JAMB Exam Centre" value={student.jamb_exam_centre} onChange={handleInputChange} required />
                    <Input name="jamb_reg_number" label="JAMB Reg Number" value={student.jamb_reg_number} disabled className="bg-gray-50" />
                </div>
                <h3 className="font-semibold text-gray-700 mt-4">JAMB Scores</h3>
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
        )}

        {activeSection === 4 && (
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Primary School</h3>
                    <Input name="primary_school_name" label="School Name" value={student.primary_school_name} onChange={handleInputChange} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="number" name="primary_entry_year" label="Entry Year" value={student.primary_entry_year} onChange={handleInputChange} required />
                        <Input type="number" name="primary_exit_year" label="Exit Year" value={student.primary_exit_year} onChange={handleInputChange} required />
                    </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Secondary School</h3>
                    <Input name="secondary_school_name" label="School Name" value={student.secondary_school_name} onChange={handleInputChange} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="number" name="secondary_entry_year" label="Entry Year" value={student.secondary_entry_year} onChange={handleInputChange} required />
                        <Input type="number" name="secondary_exit_year" label="Exit Year" value={student.secondary_exit_year} onChange={handleInputChange} required />
                    </div>
                </div>
            </div>
        )}

        {activeSection === 5 && (
            <div className="space-y-8">
                {/* Sitting 1 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">First Sitting (Mandatory)</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <Select label="Exam Name" options={['WAEC', 'NECO', 'NABTEB', 'GCE']} value={student.olevel_sitting_1.exam_name} onChange={(e) => handleOLevelMetaChange(1, 'exam_name', e.target.value)} />
                        <Input label="Exam Number" value={student.olevel_sitting_1.exam_number} onChange={(e) => handleOLevelMetaChange(1, 'exam_number', e.target.value)} />
                        <Input label="Exam Year" type="number" value={student.olevel_sitting_1.exam_year} onChange={(e) => handleOLevelMetaChange(1, 'exam_year', e.target.value)} />
                        <Input label="Exam Centre" value={student.olevel_sitting_1.exam_centre} onChange={(e) => handleOLevelMetaChange(1, 'exam_centre', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {student.olevel_sitting_1.subjects.map((sub, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input placeholder="Subject" className="border rounded px-2 py-1 w-2/3 text-sm" value={sub.subject} onChange={(e) => handleOLevelSubjectChange(1, idx, 'subject', e.target.value)} />
                                <select className="border rounded px-2 py-1 w-1/3 text-sm" value={sub.grade} onChange={(e) => handleOLevelSubjectChange(1, idx, 'grade', e.target.value)}>
                                    <option value="">Gr</option>
                                    {['A1','B2','B3','C4','C5','C6','D7','E8','F9'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" id="sitting2" checked={student.has_second_sitting} onChange={(e) => setStudent({...student, has_second_sitting: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                    <label htmlFor="sitting2" className="text-gray-700 font-medium">I have a Second Sitting</label>
                </div>

                {student.has_second_sitting && student.olevel_sitting_2 && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-indigo-100">
                    <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Second Sitting</h3>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <Select label="Exam Name" options={['WAEC', 'NECO', 'NABTEB', 'GCE']} value={student.olevel_sitting_2.exam_name} onChange={(e) => handleOLevelMetaChange(2, 'exam_name', e.target.value)} />
                        <Input label="Exam Number" value={student.olevel_sitting_2.exam_number} onChange={(e) => handleOLevelMetaChange(2, 'exam_number', e.target.value)} />
                        <Input label="Exam Year" type="number" value={student.olevel_sitting_2.exam_year} onChange={(e) => handleOLevelMetaChange(2, 'exam_year', e.target.value)} />
                        <Input label="Exam Centre" value={student.olevel_sitting_2.exam_centre} onChange={(e) => handleOLevelMetaChange(2, 'exam_centre', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {student.olevel_sitting_2.subjects.map((sub, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input placeholder="Subject" className="border rounded px-2 py-1 w-2/3 text-sm" value={sub.subject} onChange={(e) => handleOLevelSubjectChange(2, idx, 'subject', e.target.value)} />
                                <select className="border rounded px-2 py-1 w-1/3 text-sm" value={sub.grade} onChange={(e) => handleOLevelSubjectChange(2, idx, 'grade', e.target.value)}>
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
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                    <strong>Note:</strong> Allowed formats: JPG, PNG, PDF. Max size 2MB per file.
                </div>

                <div className="space-y-4">
                    {[
                        { key: 'doc_olevel_url', label: "O'Level Result Slip" },
                        { key: 'doc_age_declaration_url', label: "Birth Cert / Age Declaration" },
                        { key: 'doc_lga_url', label: "LGA Identification" }
                    ].map(doc => (
                        <div key={doc.key} className="border p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-700">{doc.label}</h4>
                                {/* @ts-ignore */}
                                {student[doc.key] ? (
                                    <span className="text-xs text-green-600 font-semibold">✓ Uploaded</span>
                                ) : (
                                    <span className="text-xs text-gray-500">Not uploaded</span>
                                )}
                            </div>
                            <label className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors ${uploading === doc.key ? 'bg-gray-200 text-gray-500' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>
                                {uploading === doc.key ? 'Uploading...' : 'Choose File'}
                                <input type="file" accept=".jpg,.png,.pdf" className="hidden" onChange={(e) => handleFileUpload(e, doc.key as any)} disabled={!!uploading} />
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
        <button 
          onClick={prevStep} 
          disabled={activeSection === 0}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {activeSection === SECTIONS.length - 1 ? (
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            {loading ? 'Submitting...' : 'Submit Final Clearance'}
          </button>
        ) : (
          <button 
            onClick={nextStep}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Next Step
          </button>
        )}
      </div>
    </div>
  );
};
