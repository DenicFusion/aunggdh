import React from 'react';

export const Header: React.FC = () => (
  <header className="bg-indigo-900 text-white shadow-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-white p-1 rounded-full">
             <svg className="w-6 h-6 text-indigo-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight leading-tight">A&U NG</h1>
            <span className="text-[10px] uppercase tracking-widest opacity-80">Official Portal</span>
        </div>
      </div>
      <div className="text-xs sm:text-sm font-light opacity-80 hidden sm:block">
        Office of the Registrar
      </div>
    </div>
  </header>
);

export const Footer: React.FC = () => (
  <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
    <div className="max-w-7xl mx-auto px-4 text-center text-sm">
      <p>&copy; {new Date().getFullYear()} A&U NG. Powered by Supabase & Paystack.</p>
    </div>
  </footer>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};