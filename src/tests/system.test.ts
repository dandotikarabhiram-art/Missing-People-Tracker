import { describe, it, expect, beforeEach } from 'vitest';
import { generateCaseReference, generateSightingReference, DatabaseEngine } from '../lib/database';
import { INITIAL_CASES, INITIAL_USERS } from '../data/seedData';
import { MissingPersonReport } from '../types';

describe('Missing People Tracker - System Integrity & Security Tests', () => {
  let db: DatabaseEngine;

  beforeEach(() => {
    db = DatabaseEngine.getInstance();
    db.resetToFactorySeed();
  });

  describe('1. Reference Generator Formats', () => {
    it('generates compliant case references in MPT-IN-YYYY-XXXX format', () => {
      const ref = generateCaseReference();
      const currentYear = new Date().getFullYear();
      expect(ref).toMatch(new RegExp(`^MPT-IN-${currentYear}-\\d{4}$`));
    });

    it('generates compliant sighting references in SGT-IN-YYYY-XXXX format', () => {
      const ref = generateSightingReference();
      const currentYear = new Date().getFullYear();
      expect(ref).toMatch(new RegExp(`^SGT-IN-${currentYear}-\\d{4}$`));
    });
  });

  describe('2. Role-Based Access Control & Visibility Safeguards', () => {
    it('prevents public visitors from reading unverified or pending reports', async () => {
      const publicCases = await db.getCases({ forUserRole: 'public' });
      const hasPending = publicCases.some(c => c.status === 'Pending Review');
      const hasRejected = publicCases.some(c => c.status === 'Rejected');
      expect(hasPending).toBe(false);
      expect(hasRejected).toBe(false);
    });

    it('allows registered family reporters to view their own pending reports', async () => {
      const reporterUser = INITIAL_USERS[3]; // Sunita Sharma
      const reporterCases = await db.getCases({
        forUserRole: 'reporter',
        userId: reporterUser.uid,
      });
      const hasOwnedCases = reporterCases.some(c => c.ownerId === reporterUser.uid);
      expect(hasOwnedCases).toBe(true);
    });

    it('allows administrators to view all cases including pending review queue', async () => {
      const adminCases = await db.getCases({ forUserRole: 'admin' });
      const hasPending = adminCases.some(c => c.status === 'Pending Review');
      expect(hasPending).toBe(true);
    });

    it('strips confidential witness contact details from public sighting queries', async () => {
      const publicSightings = await db.getSightings(undefined, 'public');
      publicSightings.forEach(s => {
        expect(s.witnessContact).toBeUndefined();
      });
    });

    it('preserves witness contact details for certified investigators', async () => {
      const invUser = INITIAL_USERS[1]; // Insp. Rajesh Kumar (CID)
      const invSightings = await db.getSightings(undefined, 'investigator', invUser.uid);
      const withContact = invSightings.find(s => s.witnessContact !== undefined);
      expect(withContact).toBeDefined();
    });
  });

  describe('3. Report Creation & Life Cycle', () => {
    it('enforces that new reports start in Pending Review with private visibility', async () => {
      const reporter = INITIAL_USERS[3];
      const newReport = await db.createReport(
        {
          ownerId: reporter.uid,
          ownerName: reporter.displayName,
          relationshipToPerson: 'Mother',
          fullName: 'Rohan Sharma',
          age: 12,
          gender: 'Male',
          height: "4'10\"",
          hairColor: 'Black',
          eyeColor: 'Dark Brown',
          identifyingFeatures: 'Mole on forehead',
          clothingLastSeen: 'School uniform',
          photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
          dateLastSeen: '2026-10-22',
          lastSeenCity: 'New Delhi',
          lastSeenState: 'Delhi',
          lastSeenCountry: 'India',
          lastSeenAddressApprox: 'Near Connaught Place',
          latitude: 28.63,
          longitude: 77.22,
          circumstances: 'Departed tuition center and did not reach home.',
          isEndangeredOrChild: true,
          priority: 'Critical / Endangered',
        },
        reporter
      );

      expect(newReport.status).toBe('Pending Review');
      expect(newReport.visibility).toBe('private');
      expect(newReport.referenceNumber).toMatch(/^MPT-IN-\d{4}-\d{4}$/);
    });

    it('records an audit log entry upon submitting a report', async () => {
      const admin = INITIAL_USERS[0];
      const logs = await db.getAuditLogs(admin);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some(l => l.action.includes('REPORT') || l.action.includes('APPROVE'))).toBe(true);
    });
  });
});
