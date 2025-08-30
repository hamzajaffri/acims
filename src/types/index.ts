// Core Types for Case Investigation Manager

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'investigator' | 'analyst' | 'viewer';
  firstName: string;
  lastName: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  phone?: string;
  department?: string;
  badgeNumber?: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: 'open' | 'active' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  casePassword?: string;
  location?: string;
  category: string;
  estimatedCloseDate?: Date;
  actualCloseDate?: Date;
}

export interface Victim {
  id: string;
  caseId: string;
  firstName: string;
  lastName: string;
  cnicId: string;
  age?: number;
  gender: 'male' | 'female' | 'other' | 'unknown';
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Evidence {
  id: string;
  caseId: string;
  name: string;
  type: 'digital' | 'physical';
  category: string;
  description?: string;
  
  // Digital Evidence Fields
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  filePath?: string;
  hash?: string;
  
  // Physical Evidence Fields
  evidenceNumber?: string;
  location?: string;
  storageLocation?: string;
  chainOfCustody: ChainOfCustodyEntry[];
  
  // Common Fields
  collectedBy: string;
  collectedAt: Date;
  status: 'collected' | 'processing' | 'analyzed' | 'archived';
  tags: string[];
  notes?: string;
}

export interface ChainOfCustodyEntry {
  id: string;
  handledBy: string;
  handledAt: Date;
  action: 'collected' | 'transferred' | 'analyzed' | 'returned' | 'archived';
  notes?: string;
  location?: string;
}

export interface CaseNote {
  id: string;
  caseId: string;
  content: string;
  attachments?: string[];
  createdBy: string;
  createdAt: Date;
  type: 'note' | 'update' | 'finding' | 'response';
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

export interface DashboardStats {
  totalCases: number;
  openCases: number;
  closedCases: number;
  activeCases: number;
  totalVictims: number;
  totalEvidence: number;
  recentActivity: AuditLog[];
  casesByStatus: Record<string, number>;
  casesByPriority: Record<string, number>;
  evidenceByType: Record<string, number>;
}

export interface FileUpload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadPath: string;
  uploadedBy: string;
  uploadedAt: Date;
  relatedEntity: 'case' | 'evidence' | 'victim';
  relatedEntityId: string;
}