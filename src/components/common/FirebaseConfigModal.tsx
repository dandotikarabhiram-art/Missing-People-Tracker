import React, { useState } from 'react';
import {
  isLiveFirebaseActive,
  getSavedFirebaseConfig,
  saveCustomFirebaseConfig,
  testFirebaseConnection,
  FirebaseConfigObject,
} from '../../lib/firebase';
import { Database, CheckCircle2, AlertTriangle, Shield, ExternalLink, RefreshCw, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [configJson, setConfigJson] = useState(() => {
    const saved = getSavedFirebaseConfig();
    return saved ? JSON.stringify(saved, null, 2) : '';
  });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const isLive = isLiveFirebaseActive();

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testFirebaseConnection();
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e?.message || 'Connection failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    try {
      if (!configJson.trim()) {
        saveCustomFirebaseConfig(null);
        setSaveSuccess(true);
        setTimeout(() => window.location.reload(), 1000);
        return;
      }

      const parsed: FirebaseConfigObject = JSON.parse(configJson);
      if (!parsed.projectId || !parsed.apiKey) {
        alert('Config must at least contain "projectId" and "apiKey".');
        return;
      }

      saveCustomFirebaseConfig(parsed);
      setSaveSuccess(true);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      alert(`Invalid JSON format: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Firebase & Data Storage Engine</h3>
              <p className="text-xs text-slate-300">Database connection, security rules & operational status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Indicator */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isLive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {isLive ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            )}
            <div>
              <h4 className="font-bold text-sm">
                {isLive ? 'Connected to Live Cloud Firestore' : 'Running in Local Standalone Persistence Mode'}
              </h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isLive
                  ? 'All writes, queries, and security rules are being synchronized directly with your live Firebase cloud instance.'
                  : 'Operating with persistent browser state, full relational schemas, and pre-seeded realistic cases. In this mode, all reporting, searching, sightings, notes, and role dashboards work 100% interactively without requiring external cloud billing.'}
              </p>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-teal-600" /> Connecting to Your Firebase Project
            </h4>
            <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
              <li>
                Visit{' '}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 underline font-medium inline-flex items-center gap-0.5"
                >
                  Firebase Console <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and create a project.
              </li>
              <li>
                Enable <strong>Cloud Firestore</strong> (in Production or Test mode).
              </li>
              <li>
                Enable <strong>Authentication</strong> (Email/Password & Google Sign-In).
              </li>
              <li>
                Copy your web app configuration JSON from <em>Project Settings &gt; General</em> and paste below.
              </li>
            </ol>
          </div>

          {/* Configuration Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Firebase Config JSON (or clear to reset to standalone persistence)
            </label>
            <textarea
              value={configJson}
              onChange={e => setConfigJson(e.target.value)}
              placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "my-app.firebaseapp.com",\n  "projectId": "my-missing-tracker",\n  "storageBucket": "my-app.appspot.com",\n  "messagingSenderId": "123456789",\n  "appId": "1:123456789:web:abcdef"\n}`}
              rows={7}
              className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          {/* Test connection output */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs font-mono border ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-300">
              Settings updated. Reloading app context...
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition cursor-pointer"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
