export interface Suspect {
  id: string;
  caseId: string;
  firstName: string;
  lastName: string;
  alias?: string;
  cnicId?: string;
  dateOfBirth?: string;
  age?: number;
  gender: 'male' | 'female' | 'other' | 'unknown';
  nationality?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  occupation?: string;
  description?: string;
  status: 'wanted' | 'arrested' | 'released' | 'under_investigation';
  lastKnownLocation?: string;
  criminalHistory?: string;
  associatedCases?: string[];
  photos?: string[];
  fingerprints?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}