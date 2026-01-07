import React, { useState, useEffect } from 'react';
import { adminLogin, isAdminLoggedIn } from './services/db';
import { PublicFlow } from './pages/PublicFlow';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminStudents } from './pages/AdminStudents';
import { AdminSettings } from './pages/AdminSettings';

// -- Client Side Router Helpers --
const usePath = () => {
    const [path, setPath] = useState(window.location.pathname);
    useEffect(() => {
        const onPopState = () => setPath(window.location.pathname);
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);
    return path;
};

const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    // Dispatch a popstate event so the hook updates
    window.dispatchEvent(new PopStateEvent('popstate'));
};

// -- Admin Components --

const AdminFlow: React.FC = () => {
    const [view, setView] = useState<'dashboard' | 'students' | 'settings'>('dashboard');

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <AdminSidebar currentView={view} setView={setView} onNavigate={navigate} />
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
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Admin Access</h2>
                    <p className="text-gray-500 mt-2">Enter your security key</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Access Key</label>
                        <input 
                            type="password" 
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Invalid Access Key
                        </div>
                    )}
                    <button className="w-full bg-indigo-900 text-white py-3 rounded-lg font-bold hover:bg-indigo-800 transition-colors shadow-lg">
                        Login to Dashboard
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate('/')}
                        className="w-full mt-4 text-gray-500 text-sm hover:text-gray-700 font-medium"
                    >
                        Return to Website
                    </button>
                </form>
            </div>
        </div>
    );
};

// -- Main App --

const App: React.FC = () => {
    const path = usePath();
    const [isAdmin, setIsAdmin] = useState(isAdminLoggedIn());

    // Effect to check admin status on load/route change
    useEffect(() => {
        setIsAdmin(isAdminLoggedIn());
    }, [path]);

    if (path === '/myadmin') {
        if (!isAdmin) {
            return <AdminLogin onLogin={() => {
                setIsAdmin(true);
                // Force re-render/update
            }} />;
        }
        return <AdminFlow />;
    }

    return <PublicFlow />;
};

export default App;