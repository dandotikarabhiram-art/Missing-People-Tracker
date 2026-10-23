import {
  MissingPersonReport,
  Sighting,
  InvestigationNote,
  AuditLog,
  AppNotification,
  UserProfile,
  CaseFilterOptions,
  UserRole,
} from '../types';
import {
  INITIAL_CASES,
  INITIAL_SIGHTINGS,
  INITIAL_NOTES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
} from '../data/seedData';
import { isLiveFirebaseActive, firestoreDb, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, setDoc, getDocs, updateDoc, query, where, orderBy } from 'firebase/firestore';

const STORAGE_KEYS = {
  CASES: 'mpt_db_cases_in_v3',
  SIGHTINGS: 'mpt_db_sightings_in_v3',
  NOTES: 'mpt_db_notes_in_v3',
  NOTIFICATIONS: 'mpt_db_notifications_in_v3',
  AUDIT_LOGS: 'mpt_db_audit_logs_in_v3',
  USERS: 'mpt_db_users_in_v3',
};

const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore[key] || null;
    }
  }
  return memoryStore[key] || null;
}

function safeSetItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {
      memoryStore[key] = value;
      return;
    }
  }
  memoryStore[key] = value;
}

// Helper for local storage read/write
function readLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = safeGetItem(key);
    if (!raw) {
      safeSetItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function writeLocal<T>(key: string, data: T) {
  try {
    safeSetItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

// Generate unique human-readable reference numbers for Indian National Registry
export function generateCaseReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MPT-IN-${year}-${rand}`;
}

export function generateSightingReference(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SGT-IN-${year}-${rand}`;
}

export class DatabaseEngine {
  private static instance: DatabaseEngine;

  private constructor() {
    this.ensureInitialized();
  }

  public static getInstance(): DatabaseEngine {
    if (!DatabaseEngine.instance) {
      DatabaseEngine.instance = new DatabaseEngine();
    }
    return DatabaseEngine.instance;
  }

  private ensureInitialized() {
    if (!safeGetItem(STORAGE_KEYS.CASES)) {
      writeLocal(STORAGE_KEYS.CASES, INITIAL_CASES);
    }
    if (!safeGetItem(STORAGE_KEYS.SIGHTINGS)) {
      writeLocal(STORAGE_KEYS.SIGHTINGS, INITIAL_SIGHTINGS);
    }
    if (!safeGetItem(STORAGE_KEYS.NOTES)) {
      writeLocal(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    }
    if (!safeGetItem(STORAGE_KEYS.NOTIFICATIONS)) {
      writeLocal(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!safeGetItem(STORAGE_KEYS.AUDIT_LOGS)) {
      writeLocal(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!safeGetItem(STORAGE_KEYS.USERS)) {
      writeLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
  }

  public resetToFactorySeed() {
    writeLocal(STORAGE_KEYS.CASES, INITIAL_CASES);
    writeLocal(STORAGE_KEYS.SIGHTINGS, INITIAL_SIGHTINGS);
    writeLocal(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    writeLocal(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    writeLocal(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    writeLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  // --- CASES ---
  public async getCases(options?: {
    forUserRole?: UserRole;
    userId?: string;
  }): Promise<MissingPersonReport[]> {
    if (isLiveFirebaseActive() && firestoreDb) {
      try {
        const colRef = collection(firestoreDb, 'missingPersons');
        const snap = await getDocs(colRef);
        const cases = snap.docs.map(d => ({ id: d.id, ...d.data() } as MissingPersonReport));
        return this.filterCasesByPermissions(cases, options?.forUserRole, options?.userId);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'missingPersons');
      }
    }

    const all = readLocal<MissingPersonReport[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
    return this.filterCasesByPermissions(all, options?.forUserRole, options?.userId);
  }

  private filterCasesByPermissions(
    cases: MissingPersonReport[],
    role: UserRole = 'public',
    userId?: string
  ): MissingPersonReport[] {
    if (role === 'admin') {
      return cases;
    }
    if (role === 'investigator') {
      // Investigators see public cases and all assigned cases
      return cases.filter(
        c => c.visibility === 'public' || c.assignedInvestigatorId === userId || role === 'investigator'
      );
    }
    if (role === 'reporter') {
      // Reporters see public cases and cases they own
      return cases.filter(c => c.visibility === 'public' || c.ownerId === userId);
    }
    // Public visitors see only approved public cases
    return cases.filter(
      c => c.visibility === 'public' && c.status !== 'Pending Review' && c.status !== 'Rejected'
    );
  }

  public async getCaseById(id: string): Promise<MissingPersonReport | null> {
    const cases = await this.getCases({ forUserRole: 'admin' });
    return cases.find(c => c.id === id || c.referenceNumber === id) || null;
  }

  public async searchCases(
    filters: CaseFilterOptions,
    role: UserRole = 'public',
    userId?: string
  ): Promise<MissingPersonReport[]> {
    const list = await this.getCases({ forUserRole: role, userId });

    return list.filter(item => {
      // Query search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = item.fullName.toLowerCase().includes(q);
        const matchesRef = item.referenceNumber.toLowerCase().includes(q);
        const matchesCity = item.lastSeenCity.toLowerCase().includes(q);
        const matchesState = item.lastSeenState.toLowerCase().includes(q);
        const matchesCircumstances = item.circumstances.toLowerCase().includes(q);
        if (!matchesName && !matchesRef && !matchesCity && !matchesState && !matchesCircumstances) {
          return false;
        }
      }

      // Age range
      if (filters.ageMin !== undefined && item.age < filters.ageMin) return false;
      if (filters.ageMax !== undefined && item.age > filters.ageMax) return false;

      // Gender
      if (filters.gender && filters.gender !== 'All' && item.gender !== filters.gender) return false;

      // City & State
      if (filters.city && !item.lastSeenCity.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.state && !item.lastSeenState.toLowerCase().includes(filters.state.toLowerCase())) return false;

      // Status
      if (filters.status && filters.status !== 'All' && item.status !== filters.status) return false;

      // Priority
      if (filters.priority && filters.priority !== 'All' && item.priority !== filters.priority) return false;

      // Endangered / Child
      if (filters.isEndangered && !item.isEndangeredOrChild) return false;

      // Date ranges
      if (filters.dateFrom && item.dateLastSeen < filters.dateFrom) return false;
      if (filters.dateTo && item.dateLastSeen > filters.dateTo) return false;

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (filters.sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (filters.sortBy === 'name') return a.fullName.localeCompare(b.fullName);
      if (filters.sortBy === 'age') return a.age - b.age;
      return 0;
    });
  }

  public async createReport(
    reportData: Omit<MissingPersonReport, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status' | 'visibility'>,
    author: UserProfile
  ): Promise<MissingPersonReport> {
    const id = `case-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const referenceNumber = generateCaseReference();
    const now = new Date().toISOString();

    const newReport: MissingPersonReport = {
      ...reportData,
      id,
      referenceNumber,
      ownerId: author.uid,
      ownerName: author.displayName,
      ownerEmail: author.email,
      status: 'Pending Review',
      visibility: 'private', // Must be verified by admin before public publication
      createdAt: now,
      updatedAt: now,
    };

    if (isLiveFirebaseActive() && firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'missingPersons', id), newReport);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `missingPersons/${id}`);
      }
    }

    const current = readLocal<MissingPersonReport[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
    current.unshift(newReport);
    writeLocal(STORAGE_KEYS.CASES, current);

    // Notify administrators
    await this.createNotification({
      recipientId: 'all-admins',
      title: 'New Missing Person Report Submitted',
      message: `New report ${referenceNumber} for "${newReport.fullName}" has been submitted and is awaiting administrator verification.`,
      link: '/admin',
      caseReferenceNumber: referenceNumber,
      type: 'report_status',
    });

    // Notify author
    await this.createNotification({
      recipientId: author.uid,
      title: 'Report Received - Under Review',
      message: `Your missing person report (${referenceNumber}) has been securely logged. It will be reviewed by an authorized case administrator before public posting.`,
      link: `/case/${id}`,
      caseReferenceNumber: referenceNumber,
      type: 'report_status',
    });

    // Audit log
    await this.logAudit({
      userId: author.uid,
      userName: author.displayName,
      userRole: author.role,
      action: 'SUBMIT_REPORT',
      targetType: 'case',
      targetId: id,
      details: `Submitted report ${referenceNumber} for ${newReport.fullName} (${newReport.lastSeenCity}, ${newReport.lastSeenState}).`,
    });

    return newReport;
  }

  public async updateReport(
    id: string,
    updates: Partial<MissingPersonReport>,
    user: UserProfile,
    actionReason?: string
  ): Promise<MissingPersonReport> {
    const current = readLocal<MissingPersonReport[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
    const index = current.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Case not found');

    const existing = current[index];

    // Authorization checks
    if (user.role === 'reporter' && existing.ownerId !== user.uid) {
      throw new Error('Unauthorized to edit this report');
    }
    if (user.role === 'reporter' && existing.status !== 'Pending Review') {
      // Reporters can only request updates if already verified or contact investigator
      if (updates.status && updates.status !== 'Withdrawn') {
        throw new Error('Reporters cannot modify case status directly once verified');
      }
    }

    const updated: MissingPersonReport = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (isLiveFirebaseActive() && firestoreDb) {
      try {
        await updateDoc(doc(firestoreDb, 'missingPersons', id), updates);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `missingPersons/${id}`);
      }
    }

    current[index] = updated;
    writeLocal(STORAGE_KEYS.CASES, current);

    // Audit log
    await this.logAudit({
      userId: user.uid,
      userName: user.displayName,
      userRole: user.role,
      action: updates.status ? `UPDATE_STATUS_${updates.status}` : 'UPDATE_REPORT',
      targetType: 'case',
      targetId: id,
      details: actionReason || `Updated report ${existing.referenceNumber}. Modified fields: ${Object.keys(updates).join(', ')}`,
    });

    // If status changed, notify reporter
    if (updates.status && updates.status !== existing.status) {
      await this.createNotification({
        recipientId: existing.ownerId,
        title: `Case Status Updated: ${updates.status}`,
        message: `Case ${existing.referenceNumber} (${existing.fullName}) status was updated to "${updates.status}". ${actionReason ? `Note: ${actionReason}` : ''}`,
        link: `/case/${id}`,
        caseReferenceNumber: existing.referenceNumber,
        type: 'report_status',
      });
    }

    return updated;
  }

  // --- SIGHTINGS ---
  public async getSightings(caseId?: string, userRole: UserRole = 'public', userId?: string): Promise<Sighting[]> {
    if (isLiveFirebaseActive() && firestoreDb) {
      try {
        const colRef = collection(firestoreDb, 'sightings');
        const snap = await getDocs(colRef);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Sighting));
        return this.filterSightingsByRole(list, caseId, userRole);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'sightings');
      }
    }

    const all = readLocal<Sighting[]>(STORAGE_KEYS.SIGHTINGS, INITIAL_SIGHTINGS);
    return this.filterSightingsByRole(all, caseId, userRole);
  }

  private filterSightingsByRole(
    sightings: Sighting[],
    caseId?: string,
    userRole: UserRole = 'public'
  ): Sighting[] {
    let filtered = sightings;
    if (caseId) {
      filtered = filtered.filter(s => s.caseId === caseId);
    }

    // Privacy protection: Public visitors and regular reporters NEVER see witness contact details
    if (userRole === 'public' || userRole === 'reporter') {
      return filtered
        .filter(s => s.status === 'Verified Relevant') // Only verified relevant observations are visible publicly
        .map(s => ({
          ...s,
          witnessName: s.isAnonymous ? 'Anonymous Witness' : (s.witnessName ? `${s.witnessName[0]}. [Protected]` : 'Verified Citizen'),
          witnessContact: undefined, // Stripped
        }));
    }

    return filtered;
  }

  public async submitSighting(
    sightingData: Omit<Sighting, 'id' | 'sightingReference' | 'createdAt' | 'status'>
  ): Promise<Sighting> {
    const id = `sgt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const sightingReference = generateSightingReference();
    const now = new Date().toISOString();

    const newSighting: Sighting = {
      ...sightingData,
      id,
      sightingReference,
      status: 'New',
      createdAt: now,
    };

    if (isLiveFirebaseActive() && firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'sightings', id), newSighting);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `sightings/${id}`);
      }
    }

    const current = readLocal<Sighting[]>(STORAGE_KEYS.SIGHTINGS, INITIAL_SIGHTINGS);
    current.unshift(newSighting);
    writeLocal(STORAGE_KEYS.SIGHTINGS, current);

    // Notify investigators and admin
    await this.createNotification({
      recipientId: 'all-investigators',
      title: 'New Sighting Submitted',
      message: `Lead ${sightingReference} reported for ${newSighting.missingPersonName} (${newSighting.caseReferenceNumber}) in ${newSighting.city}, ${newSighting.state}.`,
      link: '/investigator',
      caseReferenceNumber: newSighting.caseReferenceNumber,
      type: 'new_sighting',
    });

    // Update case status to 'New Lead Received' if active
    const targetCase = await this.getCaseById(newSighting.caseId);
    if (targetCase && targetCase.status === 'Verified / Active') {
      await this.updateReport(
        targetCase.id,
        { status: 'New Lead Received' },
        { uid: 'system', displayName: 'System Auto-Lead', role: 'admin', email: '', createdAt: '' },
        `New community sighting ${sightingReference} logged.`
      );
    }

    // Audit log
    await this.logAudit({
      userId: 'public-witness',
      userName: newSighting.isAnonymous ? 'Anonymous Citizen' : (newSighting.witnessName || 'Citizen'),
      userRole: 'public',
      action: 'SUBMIT_SIGHTING',
      targetType: 'sighting',
      targetId: id,
      details: `Submitted sighting ${sightingReference} for case ${newSighting.caseReferenceNumber}. Location: ${newSighting.city}, ${newSighting.state}.`,
    });

    return newSighting;
  }

  public async updateSightingStatus(
    sightingId: string,
    status: Sighting['status'],
    investigatorNotes: string,
    investigator: UserProfile
  ): Promise<Sighting> {
    const current = readLocal<Sighting[]>(STORAGE_KEYS.SIGHTINGS, INITIAL_SIGHTINGS);
    const index = current.findIndex(s => s.id === sightingId);
    if (index === -1) throw new Error('Sighting record not found');

    const updated: Sighting = {
      ...current[index],
      status,
      investigatorNotes,
      reviewedBy: investigator.displayName,
      reviewedAt: new Date().toISOString(),
    };

    if (isLiveFirebaseActive() && firestoreDb) {
      try {
        await updateDoc(doc(firestoreDb, 'sightings', sightingId), {
          status,
          investigatorNotes,
          reviewedBy: investigator.displayName,
          reviewedAt: updated.reviewedAt,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `sightings/${sightingId}`);
      }
    }

    current[index] = updated;
    writeLocal(STORAGE_KEYS.SIGHTINGS, current);

    // Audit log
    await this.logAudit({
      userId: investigator.uid,
      userName: investigator.displayName,
      userRole: investigator.role,
      action: `REVIEW_SIGHTING_${status}`,
      targetType: 'sighting',
      targetId: sightingId,
      details: `Investigator updated lead ${updated.sightingReference} status to "${status}". Notes: ${investigatorNotes}`,
    });

    return updated;
  }

  // --- INVESTIGATION NOTES (CONFIDENTIAL) ---
  public async getInvestigationNotes(caseId: string, user: UserProfile): Promise<InvestigationNote[]> {
    if (user.role !== 'investigator' && user.role !== 'admin') {
      return []; // Strict zero-knowledge for unauthorized users
    }

    if (isLiveFirebaseActive() && firestoreDb) {
      try {
        const colRef = collection(firestoreDb, 'investigationNotes');
        const snap = await getDocs(colRef);
        const notes = snap.docs.map(d => ({ id: d.id, ...d.data() } as InvestigationNote));
        return notes.filter(n => n.caseId === caseId);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'investigationNotes');
      }
    }

    const all = readLocal<InvestigationNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    return all.filter(n => n.caseId === caseId);
  }

  public async addInvestigationNote(
    noteData: Omit<InvestigationNote, 'id' | 'createdAt' | 'investigatorId' | 'investigatorName'>,
    investigator: UserProfile
  ): Promise<InvestigationNote> {
    if (investigator.role !== 'investigator' && investigator.role !== 'admin') {
      throw new Error('Only authorized investigators and administrators can add confidential notes.');
    }

    const id = `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newNote: InvestigationNote = {
      ...noteData,
      id,
      investigatorId: investigator.uid,
      investigatorName: investigator.displayName,
      createdAt: new Date().toISOString(),
    };

    if (isLiveFirebaseActive() && firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'investigationNotes', id), newNote);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `investigationNotes/${id}`);
      }
    }

    const current = readLocal<InvestigationNote[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    current.unshift(newNote);
    writeLocal(STORAGE_KEYS.NOTES, current);

    await this.logAudit({
      userId: investigator.uid,
      userName: investigator.displayName,
      userRole: investigator.role,
      action: 'ADD_INVESTIGATION_NOTE',
      targetType: 'case',
      targetId: noteData.caseId,
      details: `Added ${noteData.category} confidential note to case ${noteData.caseReferenceNumber}.`,
    });

    return newNote;
  }

  // --- NOTIFICATIONS ---
  public async getNotifications(userId: string, role: UserRole): Promise<AppNotification[]> {
    const all = readLocal<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return all.filter(n => {
      if (n.recipientId === userId) return true;
      if (role === 'admin' && n.recipientId === 'all-admins') return true;
      if ((role === 'investigator' || role === 'admin') && n.recipientId === 'all-investigators') return true;
      return false;
    });
  }

  public async markNotificationRead(id: string): Promise<void> {
    const current = readLocal<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = current.map(n => (n.id === id ? { ...n, isRead: true } : n));
    writeLocal(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  public async markAllNotificationsRead(userId: string, role: UserRole): Promise<void> {
    const current = readLocal<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = current.map(n => {
      if (
        n.recipientId === userId ||
        (role === 'admin' && n.recipientId === 'all-admins') ||
        ((role === 'investigator' || role === 'admin') && n.recipientId === 'all-investigators')
      ) {
        return { ...n, isRead: true };
      }
      return n;
    });
    writeLocal(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  public async createNotification(
    data: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>
  ): Promise<AppNotification> {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newNotif: AppNotification = {
      ...data,
      id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const current = readLocal<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    current.unshift(newNotif);
    writeLocal(STORAGE_KEYS.NOTIFICATIONS, current);
    return newNotif;
  }

  // --- AUDIT LOGS ---
  public async getAuditLogs(user: UserProfile): Promise<AuditLog[]> {
    if (user.role !== 'admin' && user.role !== 'investigator') {
      return [];
    }
    return readLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  public async logAudit(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newLog: AuditLog = {
      ...data,
      id,
      timestamp: new Date().toISOString(),
    };

    const current = readLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    current.unshift(newLog);
    // Keep max 200 logs
    if (current.length > 200) current.length = 200;
    writeLocal(STORAGE_KEYS.AUDIT_LOGS, current);
    return newLog;
  }

  // --- USERS & INVESTIGATORS ---
  public async getUsers(): Promise<UserProfile[]> {
    return readLocal<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public async updateUserRole(userId: string, newRole: UserRole, admin: UserProfile): Promise<UserProfile> {
    if (admin.role !== 'admin') {
      throw new Error('Only administrators can promote or change user roles');
    }
    const users = readLocal<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const index = users.findIndex(u => u.uid === userId);
    if (index === -1) throw new Error('User not found');

    const updated = { ...users[index], role: newRole };
    users[index] = updated;
    writeLocal(STORAGE_KEYS.USERS, users);

    await this.logAudit({
      userId: admin.uid,
      userName: admin.displayName,
      userRole: admin.role,
      action: 'UPDATE_USER_ROLE',
      targetType: 'user',
      targetId: userId,
      details: `Administrator changed ${updated.displayName}'s role to "${newRole}".`,
    });

    return updated;
  }
}

export const dbEngine = DatabaseEngine.getInstance();
