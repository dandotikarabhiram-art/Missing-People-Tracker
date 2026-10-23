import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MissingPersonReport,
  Sighting,
  InvestigationNote,
  AppNotification,
  AuditLog,
  UserProfile,
  CaseFilterOptions,
} from '../types';
import { dbEngine } from '../lib/database';
import { useAuth } from './AuthContext';

interface DataContextType {
  cases: MissingPersonReport[];
  sightings: Sighting[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  allUsers: UserProfile[];
  unreadNotifCount: number;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  
  // Case Actions
  getCaseById: (id: string) => Promise<MissingPersonReport | null>;
  searchCases: (filters: CaseFilterOptions) => Promise<MissingPersonReport[]>;
  createReport: (
    data: Omit<MissingPersonReport, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status' | 'visibility'>
  ) => Promise<MissingPersonReport>;
  updateReport: (
    id: string,
    updates: Partial<MissingPersonReport>,
    reason?: string
  ) => Promise<MissingPersonReport>;
  approveReport: (id: string, notes?: string) => Promise<MissingPersonReport>;
  rejectReport: (id: string, reason: string) => Promise<MissingPersonReport>;
  withdrawReport: (id: string, reason: string) => Promise<MissingPersonReport>;
  assignInvestigator: (
    caseId: string,
    investigatorId: string,
    investigatorName: string
  ) => Promise<MissingPersonReport>;

  // Sightings Actions
  getCaseSightings: (caseId: string) => Promise<Sighting[]>;
  submitSighting: (
    data: Omit<Sighting, 'id' | 'sightingReference' | 'createdAt' | 'status'>
  ) => Promise<Sighting>;
  reviewSighting: (
    sightingId: string,
    status: Sighting['status'],
    notes: string
  ) => Promise<Sighting>;

  // Investigation Notes
  getCaseNotes: (caseId: string) => Promise<InvestigationNote[]>;
  addInvestigationNote: (
    data: Omit<InvestigationNote, 'id' | 'createdAt' | 'investigatorId' | 'investigatorName'>
  ) => Promise<InvestigationNote>;

  // Notifications & Audits
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  resetDatabase: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  const [cases, setCases] = useState<MissingPersonReport[]>([]);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedCases, fetchedSightings, fetchedNotifs, fetchedUsers] = await Promise.all([
        dbEngine.getCases({ forUserRole: role, userId: user?.uid }),
        dbEngine.getSightings(undefined, role, user?.uid),
        dbEngine.getNotifications(user?.uid || '', role),
        dbEngine.getUsers(),
      ]);

      setCases(fetchedCases);
      setSightings(fetchedSightings);
      setNotifications(fetchedNotifs);
      setAllUsers(fetchedUsers);

      if (role === 'admin' || role === 'investigator') {
        if (user) {
          const logs = await dbEngine.getAuditLogs(user);
          setAuditLogs(logs);
        }
      }
    } catch (err) {
      console.error('Failed refreshing data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [role, user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Case Actions
  const getCaseById = async (id: string) => {
    return dbEngine.getCaseById(id);
  };

  const searchCases = async (filters: CaseFilterOptions) => {
    return dbEngine.searchCases(filters, role, user?.uid);
  };

  const createReport = async (
    data: Omit<MissingPersonReport, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status' | 'visibility'>
  ) => {
    if (!user) {
      throw new Error('Must be registered and signed in to file an official report.');
    }
    const created = await dbEngine.createReport(data, user);
    await refreshData();
    return created;
  };

  const updateReport = async (id: string, updates: Partial<MissingPersonReport>, reason?: string) => {
    if (!user) throw new Error('Authentication required.');
    const updated = await dbEngine.updateReport(id, updates, user, reason);
    await refreshData();
    return updated;
  };

  const approveReport = async (id: string, notes?: string) => {
    if (!user || user.role !== 'admin') throw new Error('Admin authorization required.');
    const updated = await dbEngine.updateReport(
      id,
      {
        status: 'Verified / Active',
        visibility: 'public',
        adminReviewNotes: notes || 'Approved by system administrator.',
      },
      user,
      `Case report verified and published to public registry. ${notes || ''}`
    );
    await refreshData();
    return updated;
  };

  const rejectReport = async (id: string, reason: string) => {
    if (!user || user.role !== 'admin') throw new Error('Admin authorization required.');
    const updated = await dbEngine.updateReport(
      id,
      {
        status: 'Rejected',
        visibility: 'private',
        rejectionReason: reason,
      },
      user,
      `Report rejected by administrator. Reason: ${reason}`
    );
    await refreshData();
    return updated;
  };

  const withdrawReport = async (id: string, reason: string) => {
    if (!user) throw new Error('Authentication required.');
    const updated = await dbEngine.updateReport(
      id,
      {
        status: 'Withdrawn',
        visibility: 'private',
      },
      user,
      `Case report withdrawn by reporter. Reason: ${reason}`
    );
    await refreshData();
    return updated;
  };

  const assignInvestigator = async (
    caseId: string,
    investigatorId: string,
    investigatorName: string
  ) => {
    if (!user || user.role !== 'admin') throw new Error('Admin privileges required.');
    const updated = await dbEngine.updateReport(
      caseId,
      {
        assignedInvestigatorId: investigatorId,
        assignedInvestigatorName: investigatorName,
      },
      user,
      `Assigned investigator ${investigatorName} to case.`
    );

    // Notify assigned investigator
    await dbEngine.createNotification({
      recipientId: investigatorId,
      title: 'New Case Assigned to You',
      message: `You have been assigned as lead investigator on case ${updated.referenceNumber} (${updated.fullName}).`,
      link: `/case/${caseId}`,
      caseReferenceNumber: updated.referenceNumber,
      type: 'case_assigned',
    });

    await refreshData();
    return updated;
  };

  // Sighting Actions
  const getCaseSightings = async (caseId: string) => {
    return dbEngine.getSightings(caseId, role, user?.uid);
  };

  const submitSighting = async (
    data: Omit<Sighting, 'id' | 'sightingReference' | 'createdAt' | 'status'>
  ) => {
    const created = await dbEngine.submitSighting(data);
    await refreshData();
    return created;
  };

  const reviewSighting = async (
    sightingId: string,
    status: Sighting['status'],
    notes: string
  ) => {
    if (!user || (user.role !== 'investigator' && user.role !== 'admin')) {
      throw new Error('Investigator authorization required.');
    }
    const updated = await dbEngine.updateSightingStatus(sightingId, status, notes, user);
    await refreshData();
    return updated;
  };

  // Investigation Notes
  const getCaseNotes = async (caseId: string) => {
    if (!user) return [];
    return dbEngine.getInvestigationNotes(caseId, user);
  };

  const addInvestigationNote = async (
    data: Omit<InvestigationNote, 'id' | 'createdAt' | 'investigatorId' | 'investigatorName'>
  ) => {
    if (!user || (user.role !== 'investigator' && user.role !== 'admin')) {
      throw new Error('Investigator authorization required.');
    }
    const created = await dbEngine.addInvestigationNote(data, user);
    await refreshData();
    return created;
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    await dbEngine.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    await dbEngine.markAllNotificationsRead(user.uid, role);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const resetDatabase = () => {
    dbEngine.resetToFactorySeed();
    refreshData();
  };

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  return (
    <DataContext.Provider
      value={{
        cases,
        sightings,
        notifications,
        auditLogs,
        allUsers,
        unreadNotifCount,
        isLoading,
        refreshData,
        getCaseById,
        searchCases,
        createReport,
        updateReport,
        approveReport,
        rejectReport,
        withdrawReport,
        assignInvestigator,
        getCaseSightings,
        submitSighting,
        reviewSighting,
        getCaseNotes,
        addInvestigationNote,
        markNotificationRead,
        markAllNotificationsRead,
        resetDatabase,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
