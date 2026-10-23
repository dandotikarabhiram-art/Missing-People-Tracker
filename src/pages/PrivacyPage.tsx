import React from 'react';
import { Shield, Lock, EyeOff, UserCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-xs text-slate-700 leading-relaxed">
      <div className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-teal-600" /> Privacy Policy & PII Safeguards
        </h1>
        <p className="text-slate-500">
          Last revised: October 2026 &bull; Strict adherence to Child Safeguarding & Data Segregation.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">1. Segregation of Public vs. Confidential PII</h2>
          <p>
            Missing People Tracker adheres to a strict "Split Collection" security architecture. When a reporter files a case, their personal telephone number, home address, and private email are stored in an isolated, access-restricted database subcollection. Under no circumstances is reporter contact information disclosed on public search cards, map markers, or open web pages.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">2. Witness Anonymity & Protection</h2>
          <p>
            Members of the public submitting sighting leads can choose to remain fully anonymous. For witnesses who voluntarily provide callback information to assist detectives, that contact detail is encrypted and accessible strictly to authorized lead investigators and administrators assigned to the specific case file.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">3. Prohibition of Covert Surveillance & Biometric Facial Harvesting</h2>
          <p>
            We adhere to ethical search protocols:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Zero covert GPS tracking or unauthorised mobile pinging.</li>
            <li>Zero automated biometric facial recognition scraping or scraping of external private databases.</li>
            <li>Approximate geographic coordinates on maps represent district or general vicinity only to protect domestic residences.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">4. Safeguarding Children & Vulnerable Individuals</h2>
          <p>
            Juvenile missing person profiles require administrator approval prior to public release. When cases involve domestic custody disputes or high-risk domestic violence protective orders, administrators evaluate reports in direct collaboration with local law enforcement to prevent misuse by unauthorized parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">5. Case Resolution and Data Retention</h2>
          <p>
            When a missing person is confirmed located and reunited by official authorities, their status is transitioned to "Resolved / Closed". Private investigation notes and witness records are retained in compliance with jurisdictional statutory audit laws.
          </p>
        </section>
      </div>
    </div>
  );
};
