import React from 'react';
import { ShieldAlert, Phone, Mail, Shield, HeartHandshake, ExternalLink } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      {/* Emergency Guidance Banner for India */}
      <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-amber-950/70 border-b border-slate-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600 text-white rounded-xl shadow-lg shadow-red-600/30">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Need Urgent Police or Search Assistance in India?</h4>
              <p className="text-slate-300 text-xs">
                Missing People Tracker operates in alignment with state police stations and GRP. For immediate danger or active child disappearance, dial Indian emergency helplines.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-red-500/40 text-red-300 font-bold">
              National ERSS: 112
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 font-bold">
              Childline: 1098
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-teal-500/40 text-teal-300 font-bold">
              Railways GRP: 139
            </span>
            <button
              onClick={() => navigate('/contact')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition cursor-pointer"
            >
              All India Hotlines &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Missing People Tracker India</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              National citizen and law enforcement coordination portal for missing persons across Indian states, union territories, and railway networks.
            </p>
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
              <Shield className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                DPDP Act 2023 & Juvenile Justice Act compliant. Zero commercial facial harvesting. Witness identities protected.
              </span>
            </div>
          </div>

          {/* Public Services */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Public Services</h5>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/search')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  Search Indian Registry
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/map')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  India Map View
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/report')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  File Missing Person Report
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/search')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  Submit Railway / Transit Sighting
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  How FIR Verification Works
                </button>
              </li>
            </ul>
          </div>

          {/* Safety & Legal */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Safeguards & Legal</h5>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/privacy')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  Privacy Policy & DPDP Safeguards
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/terms')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  Terms & False Report Penalties (BNS)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  State Emergency Hotlines
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  Childline 1098 Protocol
                </button>
              </li>
            </ul>
          </div>

          {/* National Resources */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Indian Statutory Portals</h5>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://trackchild.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition inline-flex items-center gap-1"
                >
                  TrackChild National Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://khoyapaya.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition inline-flex items-center gap-1"
                >
                  Khoya-Paya Citizen Portal (MWCD) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://ncrb.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition inline-flex items-center gap-1"
                >
                  National Crime Records Bureau (NCRB) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                National Coordination Cell: support@missingtracker.in
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Missing People Tracker India &bull; खोया-पाया राष्ट्रीय पोर्टल. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by OpenStreetMap & Cloud Firestore</span>
            <span>All demonstration records are fictional for testing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
