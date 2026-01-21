
export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  MANAGER = 'Manager',
  HR = 'HR',
  TEAM_LEAD = 'Team Lead',
  EMPLOYEE = 'Employee'
}

export enum AppraisalStatus {
  PENDING_ASSIGNMENT = 'Pending Assignment',
  IN_PROGRESS = 'In Progress',
  PENDING_REVIEW = 'Pending Review',
  FINALIZED = 'Finalized',
  REJECTED = 'Rejected'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  email: string;
  joiningDate: string;
}

export interface AppraisalRating {
  evaluatorId: string;
  evaluatorRole: UserRole;
  criteria: {
    skills: number;
    personality: number;
    communication: number;
    teamwork: number;
    performance: number;
  };
  comments: string;
  submittedAt: string;
}

export interface Appraisal {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  status: AppraisalStatus;
  hrId?: string;
  tlId?: string;
  managerId?: string;
  ratings: AppraisalRating[];
  averageRating?: number;
  preferredDate?: string;
  finalMOM?: string;
  incrementSlab?: string;
  availableStatuses: Record<string, boolean>; // e.g. { 'user-id': true }
}
