import React, { useEffect, useState } from 'react';
import { getAllStudents, getSystemSettings } from '../services/db';
import { StudentProfile, SystemSettings } from '../types';

export const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    getAllStudents().then(setStudents);
    getSystemSettings().then(setSettings);
  }, []);

  const totalPayments = students.filter(s => s.payment_status === 'paid').length;
  const totalRevenue = totalPayments * (settings?.clearance_fee || 0);

  const StatCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Submissions" value={students.length} color="text-indigo-600" />
        <StatCard title="Total Paid" value={totalPayments} color="text-green-600" />
        <StatCard title="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} color="text-gray-900" />
        <StatCard title="Session" value={settings?.session_year || '...'} color="text-indigo-400" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {students.slice(-5).reverse().map(student => (
                        <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.surname} {student.first_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {student.payment_status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(student.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {students.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No recent activity</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
