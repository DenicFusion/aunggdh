import React, { useState, useEffect } from 'react';
import { getAllStudents } from '../services/db';
import { StudentProfile } from '../types';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  useEffect(() => {
    getAllStudents().then(setStudents);
  }, []);

  const filtered = students.filter(s => 
    s.surname.toLowerCase().includes(search.toLowerCase()) || 
    s.first_name.toLowerCase().includes(search.toLowerCase()) ||
    s.jamb_reg_number.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
    alert(`Copied: ${text}`);
  };

  const copyAll = (student: StudentProfile) => {
      const text = Object.entries(student).map(([k, v]) => `${k}: ${v}`).join('\n');
      navigator.clipboard.writeText(text);
      alert('All details copied to clipboard');
  };

  const DetailRow = ({ label, value }: { label: string, value: any }) => (
      <div className="flex justify-between border-b border-gray-100 py-2 hover:bg-gray-50 group">
          <span className="text-gray-600 text-sm font-medium">{label}</span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-900 text-sm max-w-xs truncate">{value || '-'}</span>
            <button onClick={() => copyToClipboard(String(value))} className="opacity-0 group-hover:opacity-100 text-indigo-600 p-1 hover:bg-indigo-50 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H10a2 2 0 01-2-2z" /></svg>
            </button>
          </div>
      </div>
  );

  return (
    <div className="p-8 h-screen overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Submissions</h1>
        <div className="relative">
            <input 
                type="text" 
                placeholder="Search students..." 
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
             <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {selectedStudent ? (
          <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-200 relative">
              <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <button onClick={() => setSelectedStudent(null)} className="text-sm text-indigo-600 hover:text-indigo-800 mb-1 flex items-center">
                        ← Back to List
                    </button>
                    <h2 className="text-2xl font-bold">{selectedStudent.surname} {selectedStudent.first_name}</h2>
                    <p className="text-gray-500 text-sm">{selectedStudent.jamb_reg_number}</p>
                  </div>
                  <button onClick={() => copyAll(selectedStudent)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium">
                      Copy All Data
                  </button>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                      <h3 className="text-lg font-bold text-indigo-900 mb-4 border-b pb-2">Personal Information</h3>
                      <DetailRow label="Surname" value={selectedStudent.surname} />
                      <DetailRow label="First Name" value={selectedStudent.first_name} />
                      <DetailRow label="Middle Name" value={selectedStudent.middle_name} />
                      <DetailRow label="Email" value={selectedStudent.email} />
                      <DetailRow label="Phone" value={selectedStudent.post_utme_phone} />
                      <DetailRow label="State" value={selectedStudent.state_of_origin} />
                      <DetailRow label="LGA" value={selectedStudent.lga} />
                      <DetailRow label="Address" value={selectedStudent.contact_address} />
                  </section>
                  <section>
                      <h3 className="text-lg font-bold text-indigo-900 mb-4 border-b pb-2">Academic & Next of Kin</h3>
                      <DetailRow label="JAMB Reg" value={selectedStudent.jamb_reg_number} />
                      <DetailRow label="JAMB Score" value={selectedStudent.jamb_score_details.reduce((a,b) => a + (b.score||0), 0)} />
                      <DetailRow label="NOK Name" value={selectedStudent.nok_name} />
                      <DetailRow label="NOK Phone" value={selectedStudent.nok_phone} />
                      <DetailRow label="Payment Ref" value={selectedStudent.payment_reference} />
                      <DetailRow label="Documents" value={selectedStudent.doc_olevel_url ? 'Available' : 'Missing'} />
                  </section>
                  <section className="md:col-span-2">
                    <h3 className="text-lg font-bold text-indigo-900 mb-4 border-b pb-2">O'Level Results</h3>
                    <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                        {selectedStudent.olevel_sitting_1.subjects.filter(s=>s.subject).map(s => (
                            <div key={s.subject} className="flex gap-4"><span>{s.subject}:</span> <b>{s.grade}</b></div>
                        ))}
                    </div>
                  </section>
              </div>
          </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JAMB Reg</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{student.jamb_reg_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.surname} {student.first_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.state_of_origin}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {student.payment_status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button onClick={() => setSelectedStudent(student)} className="text-indigo-600 hover:text-indigo-900">View Details</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};
