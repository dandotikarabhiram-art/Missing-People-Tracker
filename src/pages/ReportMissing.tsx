import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { MissingPersonReport } from '../types';
import {
  ShieldAlert,
  Upload,
  User,
  Calendar,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  Camera,
} from 'lucide-react';

interface ReportMissingProps {
  navigate: (path: string, state?: any) => void;
}

export const ReportMissing: React.FC<ReportMissingProps> = ({ navigate }) => {
  const { cases, createReport } = useData();
  const { user, role } = useAuth();

  // Multi-step form step (1: Basic & Photo, 2: Physical & Characteristics, 3: Disappearance & Police, 4: Reporter & Consent)
  const [step, setStep] = useState(1);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<MissingPersonReport['gender']>('Female');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Physical
  const [height, setHeight] = useState("5'6\" (168 cm)");
  const [weight, setWeight] = useState('135 lbs');
  const [hairColor, setHairColor] = useState('Brown');
  const [eyeColor, setEyeColor] = useState('Hazel');
  const [identifyingFeatures, setIdentifyingFeatures] = useState('');
  const [clothingLastSeen, setClothingLastSeen] = useState('');

  // Disappearance
  const [dateLastSeen, setDateLastSeen] = useState(new Date().toISOString().split('T')[0]);
  const [timeLastSeen, setTimeLastSeen] = useState('14:00');
  const [lastSeenCity, setLastSeenCity] = useState('');
  const [lastSeenState, setLastSeenState] = useState('');
  const [lastSeenCountry, setLastSeenCountry] = useState('United States');
  const [lastSeenAddressApprox, setLastSeenAddressApprox] = useState('');
  const [circumstances, setCircumstances] = useState('');
  const [isEndangeredOrChild, setIsEndangeredOrChild] = useState(false);
  const [medicalConditionsOrMedication, setMedicalConditionsOrMedication] = useState('');

  // Police
  const [policeDepartment, setPoliceDepartment] = useState('');
  const [policeReportNumber, setPoliceReportNumber] = useState('');
  const [investigatingOfficer, setInvestigatingOfficer] = useState('');

  // Reporter
  const [relationshipToPerson, setRelationshipToPerson] = useState('Family Member');
  const [reporterPhone, setReporterPhone] = useState(user?.phoneNumber || '');
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<MissingPersonReport | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Check for duplicate warning when name or city changes
  const checkDuplicates = (nameToCheck: string, cityToCheck: string) => {
    if (!nameToCheck.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const cleanName = nameToCheck.toLowerCase().trim();
    const cleanCity = cityToCheck.toLowerCase().trim();

    const matched = cases.find(
      c =>
        c.fullName.toLowerCase().trim() === cleanName ||
        (cleanCity && c.fullName.toLowerCase().includes(cleanName) && c.lastSeenCity.toLowerCase().includes(cleanCity))
    );

    if (matched) {
      setDuplicateWarning(
        `Potential duplicate detected: A report for "${matched.fullName}" (${matched.referenceNumber}) in ${matched.lastSeenCity}, ${matched.lastSeenState} already exists in the system.`
      );
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be under 5MB.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setPhotoUrl(result); // Base64 data URL ready for storage
    };
    reader.readAsDataURL(file);
  };

  // Coordinates lookup heuristic for Indian cities
  const getApproxCoords = (city: string, state: string): { lat: number; lng: number } => {
    const map: Record<string, [number, number]> = {
      'new delhi': [28.6139, 77.2090],
      delhi: [28.6139, 77.2090],
      mumbai: [19.0760, 72.8777],
      bengaluru: [12.9716, 77.5946],
      bangalore: [12.9716, 77.5946],
      kolkata: [22.5726, 88.3639],
      calcutta: [22.5726, 88.3639],
      hyderabad: [17.3850, 78.4867],
      chennai: [13.0827, 80.2707],
      madras: [13.0827, 80.2707],
      ahmedabad: [23.0225, 72.5714],
      pune: [18.5204, 73.8567],
      jaipur: [26.9124, 75.7873],
      lucknow: [26.8467, 80.9462],
      chandigarh: [30.7333, 76.7794],
      kochi: [9.9312, 76.2673],
      cochin: [9.9312, 76.2673],
      patna: [25.5941, 85.1376],
      bhopal: [23.2599, 77.4126],
      indore: [22.7196, 75.8577],
      surat: [21.1702, 72.8311],
      bhubaneswar: [20.2961, 85.8245],
      guwahati: [26.1445, 91.7362],
      varanasi: [25.3176, 82.9739],
      nagpur: [21.1458, 79.0882],
      visakhapatnam: [17.6868, 83.2185],
    };
    const key = city.toLowerCase().trim();
    if (map[key]) return { lat: map[key][0], lng: map[key][1] };
    return { lat: 22.5937, lng: 78.9629 };
  };

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!fullName.trim()) {
        setErrorMsg('Please enter the missing person’s full legal name.');
        return;
      }
      if (!age || parseInt(age, 10) < 0 || parseInt(age, 10) > 120) {
        setErrorMsg('Please enter a valid age (0 - 120).');
        return;
      }
      if (!photoUrl && !imagePreview) {
        setErrorMsg('A clear, recent photograph is required to aid identification.');
        return;
      }
    } else if (step === 2) {
      if (!identifyingFeatures.trim()) {
        setErrorMsg('Please list at least one identifying feature (or write "None observed").');
        return;
      }
    } else if (step === 3) {
      if (!lastSeenCity.trim() || !lastSeenState.trim()) {
        setErrorMsg('Please provide the city and state where the person was last seen.');
        return;
      }
      if (!dateLastSeen) {
        setErrorMsg('Please specify the date last seen.');
        return;
      }
      if (circumstances.trim().length < 20) {
        setErrorMsg('Please provide a detailed explanation of disappearance circumstances (at least 20 characters).');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('You must be signed in as a registered reporter to submit an official case.');
      return;
    }

    if (!consentAcknowledged) {
      setErrorMsg('You must agree to the truthfulness and verification conditions.');
      return;
    }

    setIsSubmitting(true);
    try {
      const coords = getApproxCoords(lastSeenCity, lastSeenState);
      const report = await createReport({
        ownerId: user.uid,
        ownerName: user.displayName,
        ownerEmail: user.email,
        ownerPhone: reporterPhone,
        relationshipToPerson,
        fullName: fullName.trim(),
        nickname: nickname.trim() || undefined,
        age: parseInt(age, 10),
        gender,
        height,
        weight,
        hairColor,
        eyeColor,
        identifyingFeatures: identifyingFeatures.trim(),
        clothingLastSeen: clothingLastSeen.trim(),
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        dateLastSeen,
        timeLastSeen,
        lastSeenCity: lastSeenCity.trim(),
        lastSeenState: lastSeenState.trim(),
        lastSeenCountry: lastSeenCountry.trim(),
        lastSeenAddressApprox: lastSeenAddressApprox.trim(),
        latitude: coords.lat,
        longitude: coords.lng,
        circumstances: circumstances.trim(),
        isEndangeredOrChild: isEndangeredOrChild || parseInt(age, 10) < 18,
        medicalConditionsOrMedication: medicalConditionsOrMedication.trim() || undefined,
        policeDepartment: policeDepartment.trim() || undefined,
        policeReportNumber: policeReportNumber.trim() || undefined,
        investigatingOfficer: investigatingOfficer.trim() || undefined,
        priority: isEndangeredOrChild || parseInt(age, 10) < 18 ? 'Critical / Endangered' : 'High',
      });

      setSubmittedReport(report);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit report. Please check required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedReport) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900">Report Successfully Filed</h2>

          <div className="inline-block p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left w-full space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
              <span className="text-slate-500">Official Reference Number:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{submittedReport.referenceNumber}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
              <span className="text-slate-500">Subject Name:</span>
              <span className="font-bold text-slate-900">{submittedReport.fullName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Status:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Pending Administrative Review
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs text-left space-y-1">
            <strong>What happens next?</strong>
            <p>
              An authorized case administrator is reviewing this submission against police complaint records to verify jurisdiction and prevent duplicate reporting. Once approved, it will be published to the public search index and map.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              View in My Reports Dashboard &rarr;
            </button>
            <button
              onClick={() => navigate(`/case/${submittedReport.id}`)}
              className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition cursor-pointer"
            >
              Open Case Details Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
          <span>Official Registry Intake Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Report a Missing Person</h1>
        <p className="text-xs text-slate-600 max-w-lg mx-auto">
          Please provide as much factual, verified detail as possible. Private reporter contact information is never published.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
        {[
          { num: 1, label: 'Identity & Photo' },
          { num: 2, label: 'Physical Profile' },
          { num: 3, label: 'Disappearance' },
          { num: 4, label: 'Verification & Law' },
        ].map(s => (
          <div key={s.num} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step >= s.num
                  ? 'bg-teal-600 text-white ring-4 ring-white shadow-sm'
                  : 'bg-white text-slate-400 border-2 border-slate-300'
              }`}
            >
              {s.num}
            </div>
            <span className="text-[10px] font-semibold text-slate-600 mt-1 hidden sm:block">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Duplicate Warning Alert */}
      {duplicateWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Duplicate Warning:</span> {duplicateWarning}
            <div className="mt-1">
              Please double check if this person has already been logged to avoid conflicting investigation threads.
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Basic & Photo */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" /> Missing Person Identification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => {
                      setFullName(e.target.value);
                      checkDuplicates(e.target.value, lastSeenCity);
                    }}
                    placeholder="e.g. Maya Elizabeth Jenkins"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nickname / Common Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    placeholder="e.g. May"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Age or Estimated Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="120"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="e.g. 22"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender Identity <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload & Preview */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Recent Photograph of Missing Person <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50">
                  {imagePreview ? (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shrink-0 relative group">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setPhotoUrl('');
                          setPhotoFile(null);
                        }}
                        className="absolute inset-0 bg-slate-900/60 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <input
                      type="file"
                      id="photo-file-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo-file-upload"
                      className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition"
                    >
                      Browse Device Photo
                    </label>
                    <p className="text-[11px] text-slate-500">
                      PNG, JPG, or WebP. Max 5MB. Must be a clear, front-facing recent photo.
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>Or paste image URL:</span>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={photoUrl.startsWith('data:') ? '' : photoUrl}
                        onChange={e => {
                          setPhotoUrl(e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        className="px-2 py-1 rounded border border-slate-300 text-xs w-48"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Physical Description */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" /> Physical Appearance & Characteristics
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Approximate Height</label>
                  <input
                    type="text"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    placeholder="e.g. 5'7&quot; (170 cm)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Approximate Weight</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="e.g. 140 lbs (63 kg)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hair Color & Style</label>
                  <input
                    type="text"
                    value={hairColor}
                    onChange={e => setHairColor(e.target.value)}
                    placeholder="e.g. Dark Brown, shoulder length"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Eye Color</label>
                  <input
                    type="text"
                    value={eyeColor}
                    onChange={e => setEyeColor(e.target.value)}
                    placeholder="e.g. Hazel / Blue"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Distinctive Identifying Features <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={identifyingFeatures}
                  onChange={e => setIdentifyingFeatures(e.target.value)}
                  placeholder="Scars, tattoos (description & location), birthmarks, dental braces, piercings, eyeglasses, mobility aids..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clothing Last Seen Wearing
                </label>
                <textarea
                  rows={2}
                  value={clothingLastSeen}
                  onChange={e => setClothingLastSeen(e.target.value)}
                  placeholder="e.g. Grey hooded sweatshirt, dark blue denim jeans, black Nike sneakers, red backpack..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-red-950">
                  <input
                    type="checkbox"
                    checked={isEndangeredOrChild}
                    onChange={e => setIsEndangeredOrChild(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span>Designate as Child or Endangered Missing Person</span>
                </label>
                <input
                  type="text"
                  value={medicalConditionsOrMedication}
                  onChange={e => setMedicalConditionsOrMedication(e.target.value)}
                  placeholder="Medical conditions, autism spectrum, dementia, or daily essential medications..."
                  className="w-full p-2 rounded-lg border border-red-300 text-xs bg-white focus:ring-red-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Disappearance & Police */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" /> Disappearance Location & Circumstances
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date Last Seen <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dateLastSeen}
                    onChange={e => setDateLastSeen(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Approximate Time Last Seen
                  </label>
                  <input
                    type="time"
                    value={timeLastSeen}
                    onChange={e => setTimeLastSeen(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lastSeenCity}
                    onChange={e => {
                      setLastSeenCity(e.target.value);
                      checkDuplicates(fullName, e.target.value);
                    }}
                    placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State / Union Territory <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={lastSeenState}
                    onChange={e => setLastSeenState(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="">-- Select State / UT --</option>
                    <option value="Delhi">Delhi (NCR)</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Assam">Assam</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                    <option value="Goa">Goa</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Approximate Landmark, Railway Station, or Bus Depot
                </label>
                <input
                  type="text"
                  value={lastSeenAddressApprox}
                  onChange={e => setLastSeenAddressApprox(e.target.value)}
                  placeholder="e.g. Near Rajiv Chowk Metro Gate 7 / Dadar Railway Overbridge"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Circumstances of Disappearance <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={circumstances}
                  onChange={e => setCircumstances(e.target.value)}
                  placeholder="Please describe context: where they departed from, last known phone call, railway / bus route planned, clothing details, companions, coaching institute or workplace..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Police Incident Reference */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-900" /> Police Station & FIR Complaint Reference (TrackChild / ZIPNET)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={policeDepartment}
                    onChange={e => setPoliceDepartment(e.target.value)}
                    placeholder="PS Name (e.g. PS Connaught Place)"
                    className="p-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={policeReportNumber}
                    onChange={e => setPoliceReportNumber(e.target.value)}
                    placeholder="FIR No. / GD Entry (e.g. FIR 342/2026)"
                    className="p-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={investigatingOfficer}
                    onChange={e => setInvestigatingOfficer(e.target.value)}
                    placeholder="IO Officer Name & Rank"
                    className="p-2 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Reporter & Consent */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-bold text-slate-900 text-base border-b pb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-600" /> Reporter Verification & Private Contact
              </h3>

              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-teal-900 text-xs space-y-1">
                <strong>Privacy Guarantee:</strong> Your contact telephone and email will be stored in a segregated, confidential Firestore collection. They are NEVER exposed on public search cards or open pages.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Relationship to Missing Person <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={relationshipToPerson}
                    onChange={e => setRelationshipToPerson(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Parent / Legal Guardian">Parent / Legal Guardian</option>
                    <option value="Spouse / Partner">Spouse / Partner</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child / Adult Offspring">Child / Adult Offspring</option>
                    <option value="Close Relative">Close Relative</option>
                    <option value="Authorized Legal Representative">Authorized Legal Representative</option>
                    <option value="Law Enforcement Liaison">Law Enforcement Liaison</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Private Reporter Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={reporterPhone}
                    onChange={e => setReporterPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    required
                    checked={consentAcknowledged}
                    onChange={e => setConsentAcknowledged(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 mt-0.5"
                  />
                  <span>
                    I solemnly certify that the information provided is accurate to the best of my knowledge, and I am authorized to file this report. I understand that submitting false missing person reports is a serious criminal offense and will be referred to law enforcement.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Form Navigation Controls */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>{isSubmitting ? 'Submitting & Encrypting...' : 'Submit Report for Verification'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
