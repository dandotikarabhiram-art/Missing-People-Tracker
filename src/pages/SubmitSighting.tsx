import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Sighting, MissingPersonReport } from '../types';
import {
  Eye,
  Shield,
  Upload,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Lock,
  ChevronLeft,
  Camera,
} from 'lucide-react';

interface SubmitSightingProps {
  navigate: (path: string) => void;
  initialCaseId?: string;
  initialReference?: string;
}

export const SubmitSighting: React.FC<SubmitSightingProps> = ({
  navigate,
  initialCaseId,
  initialReference,
}) => {
  const { cases, submitSighting } = useData();
  const { user } = useAuth();

  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId || '');
  const [selectedCase, setSelectedCase] = useState<MissingPersonReport | null>(null);

  // Form Fields
  const [dateObserved, setDateObserved] = useState(new Date().toISOString().split('T')[0]);
  const [timeObserved, setTimeObserved] = useState('12:00');
  const [locationDescription, setLocationDescription] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [observationDetails, setObservationDetails] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');

  // Witness Info (Confidential)
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [witnessName, setWitnessName] = useState(user?.displayName || '');
  const [witnessContact, setWitnessContact] = useState(user?.phoneNumber || user?.email || '');
  const [consentGiven, setConsentGiven] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSighting, setSubmittedSighting] = useState<Sighting | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync selected case
  useEffect(() => {
    if (selectedCaseId) {
      const found = cases.find(c => c.id === selectedCaseId || c.referenceNumber === selectedCaseId);
      if (found) setSelectedCase(found);
    } else if (cases.length > 0 && !initialCaseId) {
      const publicCases = cases.filter(c => c.visibility === 'public');
      if (publicCases.length > 0) {
        setSelectedCaseId(publicCases[0].id);
        setSelectedCase(publicCases[0]);
      }
    }
  }, [selectedCaseId, cases, initialCaseId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedCase) {
      setErrorMsg('Please select a valid missing person case to associate this sighting with.');
      return;
    }

    if (!locationDescription.trim() || !city.trim() || !state.trim()) {
      setErrorMsg('Please fill in the observation location, city, and state.');
      return;
    }

    if (observationDetails.trim().length < 15) {
      setErrorMsg('Please provide a substantive description of what you observed (at least 15 characters).');
      return;
    }

    if (!consentGiven) {
      setErrorMsg('Please agree to the privacy statement and certify your observation details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await submitSighting({
        caseId: selectedCase.id,
        caseReferenceNumber: selectedCase.referenceNumber,
        missingPersonName: selectedCase.fullName,
        dateObserved,
        timeObserved,
        locationDescription: locationDescription.trim(),
        city: city.trim(),
        state: state.trim(),
        observationDetails: observationDetails.trim(),
        photoUrl: photoUrl || undefined,
        witnessName: isAnonymous ? undefined : witnessName.trim(),
        witnessContact: isAnonymous ? undefined : witnessContact.trim(),
        isAnonymous,
        consentGiven: true,
      });

      setSubmittedSighting(created);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error submitting sighting tip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedSighting) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900">Sighting Lead Securely Recorded</h2>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Sighting Reference Code:</span>
              <span className="font-mono font-bold text-slate-900">{submittedSighting.sightingReference}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Associated Case:</span>
              <span className="font-bold text-slate-900">
                {submittedSighting.missingPersonName} ({submittedSighting.caseReferenceNumber})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Review Status:</span>
              <span className="font-semibold text-blue-700">Dispatched to Assigned Lead Investigators</span>
            </div>
          </div>

          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs text-left">
            <strong>Witness Privacy Protected:</strong> Thank you for your civic contribution. Your witness submission is kept confidential and accessible strictly to authorized investigators and administrative officials.
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => navigate(`/case/${submittedSighting.caseId}`)}
              className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Return to Case Dossier
            </button>
            <button
              onClick={() => navigate('/search')}
              className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition cursor-pointer"
            >
              Browse Other Cases
            </button>
          </div>
        </div>
      </div>
    );
  }

  const approvedCases = cases.filter(c => c.visibility === 'public');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/search')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Cases
      </button>

      {/* Emergency Guidance Strip */}
      <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-950 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Immediate Life-Safety Notice:</span> If you are in immediate contact with the missing individual or if they appear in physical danger or medical distress, dial <strong>911</strong> or local emergency dispatch immediately before submitting this web form.
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
          <Eye className="w-3.5 h-3.5 text-teal-600" />
          <span>Confidential Lead Intake</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Submit a Sighting Tip</h1>
        <p className="text-xs text-slate-600">
          Your tip will be dispatched directly to the certified law enforcement or investigative team assigned to this case.
        </p>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Linked Case Selector */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Select Missing Person Case <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCaseId}
              onChange={e => {
                setSelectedCaseId(e.target.value);
                const found = cases.find(c => c.id === e.target.value);
                if (found) setSelectedCase(found);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- Choose Case --</option>
              {approvedCases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.referenceNumber}) &bull; Missing from {c.lastSeenCity}, {c.lastSeenState}
                </option>
              ))}
            </select>

            {selectedCase && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <img
                  src={selectedCase.photoUrl}
                  alt={selectedCase.fullName}
                  className="w-12 h-12 rounded-lg object-cover border"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selectedCase.fullName}</div>
                  <div className="text-[11px] text-slate-500">
                    Ref: {selectedCase.referenceNumber} &bull; Age: {selectedCase.age} &bull; {selectedCase.lastSeenCity}, {selectedCase.lastSeenState}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Observation Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Date Sighted <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dateObserved}
                onChange={e => setDateObserved(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Approximate Time</label>
              <input
                type="time"
                value={timeObserved}
                onChange={e => setTimeObserved(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Specific Location Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={locationDescription}
                onChange={e => setLocationDescription(e.target.value)}
                placeholder="e.g. Bus stop in front of Central Library, or Mile Marker 42 trail fork"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Boulder"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  State / Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="e.g. Colorado"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Details of Observation */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Description of the Observation <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={observationDetails}
              onChange={e => setObservationDetails(e.target.value)}
              placeholder="What drew your attention? What was the individual wearing? Were they alone or with others? Which direction did they travel? Vehicle make or license plate if noted..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Optional Photo or Evidence Upload */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800">
              Optional Supporting Photograph or Evidence Image
            </label>
            <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center gap-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Evidence" className="w-16 h-16 rounded object-cover border" />
              ) : (
                <Camera className="w-8 h-8 text-slate-400" />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  id="evidence-upload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="evidence-upload"
                  className="inline-block px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-700"
                >
                  Upload Image
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  PNG/JPG, max 5MB. Stored securely and only visible to authorized case officials.
                </p>
              </div>
            </div>
          </div>

          {/* Confidential Witness Information */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-teal-600" /> Witness Details (Strictly Confidential)
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold text-[11px]">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                />
                <span>Submit Completely Anonymously</span>
              </label>
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={witnessName}
                    onChange={e => setWitnessName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Phone / Email (For Detective Follow-up)
                  </label>
                  <input
                    type="text"
                    value={witnessContact}
                    onChange={e => setWitnessContact(e.target.value)}
                    placeholder="+1 (555) 000-0000 or email"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              Witness contact details are never made public. Providing contact details assists investigators in verifying lead authenticity.
            </p>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                required
                checked={consentGiven}
                onChange={e => setConsentGiven(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 mt-0.5"
              />
              <span className="text-[11px] leading-relaxed">
                I confirm that this sighting tip is provided in good faith. I understand that submitting knowingly falsified information to divert or impede a search is strictly illegal.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg transition cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? 'Dispatching to Assigned Investigators...' : 'Submit Sighting Lead'}
          </button>
        </form>
      </div>
    </div>
  );
};
