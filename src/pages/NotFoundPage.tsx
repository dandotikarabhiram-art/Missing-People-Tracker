import React from 'react';
import { ShieldAlert, Home, Search } from 'lucide-react';

interface NotFoundPageProps {
  navigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-slate-900 text-teal-400 flex items-center justify-center mx-auto shadow-xl">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800 mt-1">Page Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">
          The requested record or portal page does not exist or has been relocated under protective protocols.
        </p>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Home className="w-4 h-4" /> Return Home
        </button>
        <button
          onClick={() => navigate('/search')}
          className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Search className="w-4 h-4" /> Search Registry
        </button>
      </div>
    </div>
  );
};
