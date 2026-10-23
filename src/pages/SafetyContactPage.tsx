import React from 'react';
import { Phone, AlertCircle, Building, ShieldAlert, ExternalLink, Mail, ShieldCheck } from 'lucide-react';

export const SafetyContactPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-xs text-slate-700 leading-relaxed">
      <div className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Phone className="w-7 h-7 text-amber-600" /> Indian Emergency Helplines & Safety Guidelines
        </h1>
        <p className="text-slate-500">
          Official statutory directory for emergency dispatch, Childline India, Railway Police (GRP), and state crime branches.
        </p>
      </div>

      {/* Emergency dispatch banner */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold">Active Disappearance or Kidnapping Danger?</h2>
          <p className="text-red-100 text-xs">
            There is <strong>NO 24-hour waiting period</strong> under Indian law. By Supreme Court order (Bachpan Bachao Andolan mandate), police must register an FIR immediately for missing children.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-white text-red-700 font-extrabold text-base shadow">
            Dial 112 (ERSS India)
          </div>
          <div className="px-4 py-2 rounded-xl bg-red-950 text-amber-300 font-extrabold text-base shadow">
            Childline 1098
          </div>
        </div>
      </div>

      {/* Specialized Indian Hotlines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Childline India (MWCD)</h3>
          <p className="text-slate-600">
            National 24/7 emergency toll-free service for children in need of care and protection, run with police and district child protection units (DCPU).
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 text-sm">
            Toll-Free: 1098
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Indian Railways GRP & RPF Security</h3>
          <p className="text-slate-600">
            For sightings, runaways, or tracking across Indian Railway stations, junctions, and trains.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 text-sm">
            RailMadad / GRP Helpline: 139
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Women in Distress Helpline</h3>
          <p className="text-slate-600">
            All-India emergency assistance for missing girls, women in crisis, and domestic safeguarding.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 text-sm">
            Helpline: 1091 / 181
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Elder Line (Senior Citizens)</h3>
          <p className="text-slate-600">
            Toll-free helpline for missing elders suffering from dementia, Alzheimer's, or disorientation.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 text-sm">
            Elder Line: 14567
          </div>
        </div>
      </div>

      {/* Immediate Legal Steps in India */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" /> Immediate Legal Rights & Protocols Under Indian Law
        </h3>
        <ol className="list-decimal pl-5 space-y-2.5">
          <li>
            <strong>Demand a "Zero FIR":</strong> You do NOT have to travel to the police station in whose jurisdiction the person went missing. Any police station in India is legally obligated to register a "Zero FIR" and transfer it to the concerned police station.
          </li>
          <li>
            <strong>Mandatory FIR for Missing Children:</strong> Police cannot turn away families of missing minors or claim it is a runaway case. Under Supreme Court guidelines, an FIR for kidnapping/missing must be registered immediately.
          </li>
          <li>
            <strong>Check TrackChild and Khoya-Paya:</strong> Request the Investigating Officer (IO) to immediately upload the child's photograph and details on the Ministry of Women and Child Development's <em>TrackChild</em> portal.
          </li>
          <li>
            <strong>Alert Nearest Railway Protection Force (RPF):</strong> Missing persons in India frequently travel via train. Contacting 139 with the person's photo can alert ticket checkers (TTEs) and platform RPF teams across neighboring stations.
          </li>
          <li>
            <strong>Register on Missing People Tracker India:</strong> File the case with your FIR number on this portal so our community observers and verified search volunteers can monitor local transit points.
          </li>
        </ol>
      </div>
    </div>
  );
};
