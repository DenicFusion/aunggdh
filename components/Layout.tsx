import React from 'react';

export const Header: React.FC = () => (
  <header className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="bg-white p-2 rounded-full shadow-sm">
             <svg className="w-6 h-6 text-indigo-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold tracking-tight leading-none">A&U NG</h1>
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-80 mt-1 font-medium">Official Portal</span>
        </div>
      </div>
      <div className="text-sm font-medium opacity-90 hidden sm:block bg-indigo-800 px-4 py-1.5 rounded-full border border-indigo-700">
        Office of the Registrar
      </div>
    </div>
  </header>
);

export const Footer: React.FC = () => (
  <footer className="bg-white border-t border-gray-100 text-gray-500 py-12 mt-auto">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p className="text-base font-medium text-gray-600 mb-3">&copy; {new Date().getFullYear()} A&U NG Admission Office. All rights reserved.</p>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <span>Secured by Paystack</span>
        <span>•</span>
        <span>Powered by <span className="font-bold text-indigo-600">EmzzyTech</span></span>
      </div>
    </div>
  </footer>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};