// Data Storage Service for Case Investigation Manager

import { Case, Victim, Evidence, CaseNote, DashboardStats, FileUpload } from '@/types';
import { Suspect } from '@/types/suspect';
import { AuthService } from './auth';

const STORAGE_KEYS = {
  CASES: 'cim_cases',
  VICTIMS: 'cim_victims',
  EVIDENCE: 'cim_evidence',
  NOTES: 'cim_notes',
  FILES: 'cim_files',
  SUSPECTS: 'suspects'
};

export class StorageService {
  
  // Cases Management
  static getAllCases(): Case[] {
    const casesData = localStorage.getItem(STORAGE_KEYS.CASES);
    if (!casesData) return [];
    
    try {
      const cases = JSON.parse(casesData);
      return cases.map((caseItem: any) => ({
        ...caseItem,
        createdAt: new Date(caseItem.createdAt),
        updatedAt: new Date(caseItem.updatedAt),
        estimatedCloseDate: caseItem.estimatedCloseDate ? new Date(caseItem.estimatedCloseDate) : undefined,
        actualCloseDate: caseItem.actualCloseDate ? new Date(caseItem.actualCloseDate) : undefined
      }));
    } catch {
      return [];
    }
  }

  static getCaseById(id: string): Case | null {
    const cases = this.getAllCases();
    return cases.find(c => c.id === id) || null;
  }

  static getCaseByCaseNumber(caseNumber: string): Case | null {
    const cases = this.getAllCases();
    return cases.find(c => c.caseNumber === caseNumber) || null;
  }

  static createCase(caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Case {
    const cases = this.getAllCases();
    
    // Check if case number already exists
    if (cases.some(c => c.caseNumber === caseData.caseNumber)) {
      throw new Error('Case number already exists');
    }

    const newCase: Case = {
      ...caseData,
      id: `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    cases.push(newCase);
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'CREATE', 'case', newCase.id, { 
        caseNumber: newCase.caseNumber,
        title: newCase.title 
      });
    }
    
    return newCase;
  }

  static updateCase(id: string, updates: Partial<Case>): Case {
    const cases = this.getAllCases();
    const caseIndex = cases.findIndex(c => c.id === id);
    
    if (caseIndex === -1) {
      throw new Error('Case not found');
    }

    const updatedCase = { 
      ...cases[caseIndex], 
      ...updates, 
      updatedAt: new Date() 
    };
    cases[caseIndex] = updatedCase;
    
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'UPDATE', 'case', id, updates);
    }
    
    return updatedCase;
  }

  static deleteCase(id: string): void {
    const cases = this.getAllCases();
    const filteredCases = cases.filter(c => c.id !== id);
    
    // Also delete related victims, evidence, notes, and suspects
    this.deleteVictimsByCaseId(id);
    this.deleteEvidenceByCaseId(id);
    this.deleteNotesByCaseId(id);
    this.deleteSuspectsByCaseId(id);
    
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(filteredCases));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'DELETE', 'case', id, {});
    }
  }

  // Victims Management
  static getAllVictims(): Victim[] {
    const victimsData = localStorage.getItem(STORAGE_KEYS.VICTIMS);
    if (!victimsData) return [];
    
    try {
      const victims = JSON.parse(victimsData);
      return victims.map((victim: any) => ({
        ...victim,
        createdAt: new Date(victim.createdAt),
        updatedAt: new Date(victim.updatedAt)
      }));
    } catch {
      return [];
    }
  }

  static getVictimsByCaseId(caseId: string): Victim[] {
    return this.getAllVictims().filter(v => v.caseId === caseId);
  }

  static createVictim(victimData: Omit<Victim, 'id' | 'createdAt' | 'updatedAt'>): Victim {
    const victims = this.getAllVictims();
    
    const newVictim: Victim = {
      ...victimData,
      id: `victim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    victims.push(newVictim);
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(victims));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'CREATE', 'victim', newVictim.id, { 
        caseId: newVictim.caseId,
        name: `${newVictim.firstName} ${newVictim.lastName}`
      });
    }
    
    return newVictim;
  }

  static updateVictim(id: string, updates: Partial<Victim>): Victim {
    const victims = this.getAllVictims();
    const victimIndex = victims.findIndex(v => v.id === id);
    
    if (victimIndex === -1) {
      throw new Error('Victim not found');
    }

    const updatedVictim = { 
      ...victims[victimIndex], 
      ...updates, 
      updatedAt: new Date() 
    };
    victims[victimIndex] = updatedVictim;
    
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(victims));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'UPDATE', 'victim', id, updates);
    }
    
    return updatedVictim;
  }

  static deleteVictim(id: string): void {
    const victims = this.getAllVictims();
    const filteredVictims = victims.filter(v => v.id !== id);
    
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(filteredVictims));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'DELETE', 'victim', id, {});
    }
  }

  static deleteVictimsByCaseId(caseId: string): void {
    const victims = this.getAllVictims();
    const filteredVictims = victims.filter(v => v.caseId !== caseId);
    localStorage.setItem(STORAGE_KEYS.VICTIMS, JSON.stringify(filteredVictims));
  }

  // Evidence Management
  static getAllEvidence(): Evidence[] {
    const evidenceData = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
    if (!evidenceData) return [];
    
    try {
      const evidence = JSON.parse(evidenceData);
      return evidence.map((item: any) => ({
        ...item,
        collectedAt: new Date(item.collectedAt),
        chainOfCustody: item.chainOfCustody.map((entry: any) => ({
          ...entry,
          handledAt: new Date(entry.handledAt)
        }))
      }));
    } catch {
      return [];
    }
  }

  static getEvidenceByCaseId(caseId: string): Evidence[] {
    return this.getAllEvidence().filter(e => e.caseId === caseId);
  }

  static createEvidence(evidenceData: Omit<Evidence, 'id'>): Evidence {
    const evidence = this.getAllEvidence();
    
    const newEvidence: Evidence = {
      ...evidenceData,
      id: `evidence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    evidence.push(newEvidence);
    localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(evidence));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'CREATE', 'evidence', newEvidence.id, { 
        caseId: newEvidence.caseId,
        name: newEvidence.name,
        type: newEvidence.type
      });
    }
    
    return newEvidence;
  }

  static updateEvidence(id: string, updates: Partial<Evidence>): Evidence {
    const evidence = this.getAllEvidence();
    const evidenceIndex = evidence.findIndex(e => e.id === id);
    
    if (evidenceIndex === -1) {
      throw new Error('Evidence not found');
    }

    const updatedEvidence = { ...evidence[evidenceIndex], ...updates };
    evidence[evidenceIndex] = updatedEvidence;
    
    localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(evidence));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'UPDATE', 'evidence', id, updates);
    }
    
    return updatedEvidence;
  }

  static deleteEvidence(id: string): void {
    const evidence = this.getAllEvidence();
    const filteredEvidence = evidence.filter(e => e.id !== id);
    
    localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(filteredEvidence));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'DELETE', 'evidence', id, {});
    }
  }

  static deleteEvidenceByCaseId(caseId: string): void {
    const evidence = this.getAllEvidence();
    const filteredEvidence = evidence.filter(e => e.caseId !== caseId);
    localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(filteredEvidence));
  }

  // Notes Management
  static getAllNotes(): CaseNote[] {
    const notesData = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!notesData) return [];
    
    try {
      const notes = JSON.parse(notesData);
      return notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt)
      }));
    } catch {
      return [];
    }
  }

  static getNotesByCaseId(caseId: string): CaseNote[] {
    return this.getAllNotes().filter(n => n.caseId === caseId);
  }

  static createNote(noteData: Omit<CaseNote, 'id' | 'createdAt'>): CaseNote {
    const notes = this.getAllNotes();
    
    const newNote: CaseNote = {
      ...noteData,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    notes.push(newNote);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'CREATE', 'note', newNote.id, { 
        caseId: newNote.caseId,
        type: newNote.type
      });
    }
    
    return newNote;
  }

  static deleteNotesByCaseId(caseId: string): void {
    const notes = this.getAllNotes();
    const filteredNotes = notes.filter(n => n.caseId !== caseId);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filteredNotes));
  }

  // Suspects Management
  static getAllSuspects(): Suspect[] {
    const suspectsData = localStorage.getItem(STORAGE_KEYS.SUSPECTS);
    if (!suspectsData) return [];
    
    try {
      const suspects = JSON.parse(suspectsData);
      return suspects.map((suspect: any) => ({
        ...suspect,
        createdAt: new Date(suspect.createdAt),
        updatedAt: new Date(suspect.updatedAt)
      }));
    } catch {
      return [];
    }
  }

  static getSuspectsByCaseId(caseId: string): Suspect[] {
    return this.getAllSuspects().filter(s => s.caseId === caseId);
  }

  static createSuspect(suspectData: Omit<Suspect, 'id' | 'createdAt' | 'updatedAt'>): Suspect {
    const suspects = this.getAllSuspects();
    
    const newSuspect: Suspect = {
      ...suspectData,
      id: `suspect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    suspects.push(newSuspect);
    localStorage.setItem(STORAGE_KEYS.SUSPECTS, JSON.stringify(suspects));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'CREATE', 'suspect', newSuspect.id, { 
        caseId: newSuspect.caseId,
        name: `${newSuspect.firstName} ${newSuspect.lastName}`
      });
    }
    
    return newSuspect;
  }

  static updateSuspect(id: string, updates: Partial<Suspect>): Suspect {
    const suspects = this.getAllSuspects();
    const suspectIndex = suspects.findIndex(s => s.id === id);
    
    if (suspectIndex === -1) {
      throw new Error('Suspect not found');
    }

    const updatedSuspect = { 
      ...suspects[suspectIndex], 
      ...updates, 
      updatedAt: new Date() 
    };
    suspects[suspectIndex] = updatedSuspect;
    
    localStorage.setItem(STORAGE_KEYS.SUSPECTS, JSON.stringify(suspects));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'UPDATE', 'suspect', id, updates);
    }
    
    return updatedSuspect;
  }

  static deleteSuspect(id: string): void {
    const suspects = this.getAllSuspects();
    const filteredSuspects = suspects.filter(s => s.id !== id);
    
    localStorage.setItem(STORAGE_KEYS.SUSPECTS, JSON.stringify(filteredSuspects));
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      AuthService.logActivity(currentUser.id, 'DELETE', 'suspect', id, {});
    }
  }

  static deleteSuspectsByCaseId(caseId: string): void {
    const suspects = this.getAllSuspects();
    const filteredSuspects = suspects.filter(s => s.caseId !== caseId);
    localStorage.setItem(STORAGE_KEYS.SUSPECTS, JSON.stringify(filteredSuspects));
  }

  // Dashboard Stats
  static getDashboardStats(): DashboardStats {
    const cases = this.getAllCases();
    const victims = this.getAllVictims();
    const evidence = this.getAllEvidence();
    const recentActivity = AuthService.getAuditLogs()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    const casesByStatus = cases.reduce((acc, caseItem) => {
      acc[caseItem.status] = (acc[caseItem.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const casesByPriority = cases.reduce((acc, caseItem) => {
      acc[caseItem.priority] = (acc[caseItem.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const evidenceByType = evidence.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCases: cases.length,
      openCases: cases.filter(c => c.status === 'open').length,
      closedCases: cases.filter(c => c.status === 'closed').length,
      activeCases: cases.filter(c => c.status === 'active').length,
      totalVictims: victims.length,
      totalEvidence: evidence.length,
      recentActivity,
      casesByStatus,
      casesByPriority,
      evidenceByType
    };
  }
}