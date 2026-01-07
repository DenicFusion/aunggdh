import React, { useState, useEffect } from 'react';
import { adminLogin, isAdminLoggedIn } from './services/db';
import { PublicFlow } from './pages/PublicFlow';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminStudents } from './pages/AdminStudents';
import { AdminSettings } from './pages/AdminSettings';

const AdminFlow: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'students' | 'settings'>('dashboard');

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <AdminSidebar currentView={view} setView={setView} />
            <main className="ml-64 flex-1">
                {view === 'dashboard' && <AdminDashboard />}
                {view === 'students' && <AdminStudents />}
                {view === 'settings' && <AdminSettings />}
            </main>
        </div>
    );
};

const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [key, setKey] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await adminLogin(key);
        if (success) {
            onLogin();
        } else {
            setError(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Access</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Access Key</label>
                        <input 
                            type="password" 
                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">Invalid Access Key</p>}
                    <button className="w-full bg-indigo-900 text-white py-2 rounded font-semibold hover:bg-indigo-800">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    // Simple hash routing for demo purposes without full react-router setup overhead
    const [route, setRoute] = useState(window.location.hash || '#/');
    const [isAdmin, setIsAdmin] = useState(isAdminLoggedIn());

    useEffect(() => {
        const handleHashChange = () => setRoute(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (route === '#/myadmin') {
        if (!isAdmin) {
            return <AdminLogin onLogin={() => setIsAdmin(true)} />;
        }
        return <AdminFlow />;
    }

    return <PublicFlow />;
};

export default App;
