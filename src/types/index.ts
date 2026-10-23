export type UserRole = 'public' | 'reporter' | 'investigator' | 'admin';

export type CaseStatus =
  | 'Pending Review'
  | 'Verified / Active'
  | 'Under Investigation'
  | 'New Lead Received'
  | 'Located — Awaiting Confirmation'
  | 'Resolved / Closed'
  | 'Rejected'
  | 'Withdrawn';

export type CasePriority = 'Low' | 'Medium' | 'High' | 'Critical / Endangered';

export interface MissingPersonReport {
  id: string;
  referenceNumber: string; // e.g. MPT-2026-0842
  ownerId: string; // Reporter's user ID
  ownerName: string;
  ownerEmail?: string; // Private
  ownerPhone?: string; // Private
  relationshipToPerson: string; // Private or verified relation
  
  // Missing Person Details (Public after approval)
  fullName: string;
  nickname?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say';
  height: string; // e.g. "5'9\" (175 cm)"
  weight?: string; // e.g. "155 lbs"
  hairColor: string;
  eyeColor: string;
  identifyingFeatures: string; // Scars, tattoos, birthmarks, eyeglasses
  clothingLastSeen: string;
  photoUrl: string;
  additionalPhotos?: string[];

  // Disappearance Details
  dateLastSeen: string; // YYYY-MM-DD
  timeLastSeen?: string; // HH:mm
  lastSeenCity: string;
  lastSeenState: string;
  lastSeenCountry: string;
  lastSeenAddressApprox: string; // Approximate landmark or district
  latitude: number;
  longitude: number;
  circumstances: string;
  isEndangeredOrChild: boolean;
  medicalConditionsOrMedication?: string;

  // Law Enforcement Reference
  policeReportNumber?: string;
  policeDepartment?: string;
  investigatingOfficer?: string;

  // Management & Verification
  status: CaseStatus;
  priority: CasePriority;
  visibility: 'private' | 'investigators_only' | 'public';
  assignedInvestigatorId?: string;
  assignedInvestigatorName?: string;
  adminReviewNotes?: string;
  rejectionReason?: string;
  additionalInfoRequested?: string;

  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export interface Sighting {
  id: string;
  sightingReference: string; // e.g. SGT-2026-9041
  caseId: string;
  caseReferenceNumber: string;
  missingPersonName: string;
  dateObserved: string; // YYYY-MM-DD
  timeObserved?: string; // HH:mm
  locationDescription: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  observationDetails: string;
  photoUrl?: string;
  
  // Witness Details (Strictly Private to Investigators/Admins)
  witnessName?: string;
  witnessContact?: string;
  isAnonymous: boolean;
  consentGiven: boolean;

  // Review Status
  status: 'New' | 'Under Investigation' | 'Verified Relevant' | 'Inconclusive' | 'Dismissed';
  investigatorNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;

  createdAt: string;
}

export interface InvestigationNote {
  id: string;
  caseId: string;
  caseReferenceNumber: string;
  investigatorId: string;
  investigatorName: string;
  note: string;
  category: 'Lead Follow-up' | 'Witness Interview' | 'Law Enforcement Liaison' | 'Forensic/Digital' | 'General';
  isConfidential: boolean; // Internal only
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientId: string; // 'all-admins', 'all-investigators', or specific userId
  title: string;
  message: string;
  link?: string;
  caseReferenceNumber?: string;
  isRead: boolean;
  type: 'report_status' | 'new_sighting' | 'case_assigned' | 'info_requested' | 'system';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetType: 'case' | 'sighting' | 'user' | 'system';
  targetId: string;
  details: string;
  ipAddress?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  badgeNumber?: string; // For verified investigators
  department?: string; // For law enforcement / agency
  createdAt: string;
}

export interface CaseFilterOptions {
  searchQuery: string;
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  city?: string;
  state?: string;
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  isEndangered?: boolean;
  sortBy: 'newest' | 'oldest' | 'name' | 'age';
}
