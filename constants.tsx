
import { User, UserRole, AppraisalStatus, Appraisal } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Zian Chen', role: UserRole.SUPER_ADMIN, department: 'Executive', email: 'zian@corp.ai', joiningDate: '2018-05-20' },
  
  // HR Team
  { id: '2', name: 'Eswar HR', role: UserRole.HR, department: 'Human Resources', email: 'eswar@corp.ai', joiningDate: '2021-03-15' },
  { id: '3', name: 'Durai HR', role: UserRole.HR, department: 'Human Resources', email: 'durai@corp.ai', joiningDate: '2021-06-10' },
  { id: '10', name: 'Priya Sharma', role: UserRole.HR, department: 'Human Resources', email: 'priya@corp.ai', joiningDate: '2022-09-01' },
  
  // Management
  { id: '4', name: 'Hari Manager', role: UserRole.MANAGER, department: 'Engineering', email: 'hari@corp.ai', joiningDate: '2019-11-20' },
  { id: '5', name: 'Devjith Manager', role: UserRole.MANAGER, department: 'Product', email: 'devjith@corp.ai', joiningDate: '2020-05-12' },
  { id: '11', name: 'Sarah Jenkins', role: UserRole.MANAGER, department: 'Sales', email: 'sarah@corp.ai', joiningDate: '2019-01-15' },
  
  // Team Leads
  { id: '6', name: 'Harish TL', role: UserRole.TEAM_LEAD, department: 'Frontend', email: 'harish@corp.ai', joiningDate: '2022-01-10' },
  { id: '12', name: 'Marcus Aurelius', role: UserRole.TEAM_LEAD, department: 'Backend', email: 'marcus@corp.ai', joiningDate: '2021-11-30' },
  { id: '13', name: 'Elena Rodriguez', role: UserRole.TEAM_LEAD, department: 'Design', email: 'elena@corp.ai', joiningDate: '2023-02-14' },
  
  // Employees
  { id: '7', name: 'Alice Smith', role: UserRole.EMPLOYEE, department: 'Frontend', email: 'alice@corp.ai', joiningDate: '2024-04-20' },
  { id: '8', name: 'Bob Johnson', role: UserRole.EMPLOYEE, department: 'Backend', email: 'bob@corp.ai', joiningDate: '2023-04-15' },
  { id: '9', name: 'Charlie Brown', role: UserRole.EMPLOYEE, department: 'Design', email: 'charlie@corp.ai', joiningDate: '2024-05-01' },
  { id: '14', name: 'David Lee', role: UserRole.EMPLOYEE, department: 'Mobile', email: 'david@corp.ai', joiningDate: '2023-08-22' },
  { id: '15', name: 'Fiona Gallagher', role: UserRole.EMPLOYEE, department: 'DevOps', email: 'fiona@corp.ai', joiningDate: '2022-12-05' },
  { id: '16', name: 'George Miller', role: UserRole.EMPLOYEE, department: 'Frontend', email: 'george@corp.ai', joiningDate: '2024-01-10' },
];

export const APPRAISAL_CRITERIA = [
  { key: 'skills', label: 'Technical Proficiency', weight: 20 },
  { key: 'personality', label: 'Interpersonal Dynamics', weight: 20 },
  { key: 'communication', label: 'Communication Flow', weight: 20 },
  { key: 'teamwork', label: 'Collaborative Impact', weight: 20 },
  { key: 'performance', label: 'KPI Fulfillment', weight: 20 },
];

export const MOCK_APPRAISALS: Appraisal[] = [
  {
    id: 'a1',
    employeeId: '7',
    month: 'April',
    year: 2025,
    status: AppraisalStatus.PENDING_ASSIGNMENT,
    ratings: [],
    availableStatuses: {}
  },
  {
    id: 'a2',
    employeeId: '8',
    month: 'April',
    year: 2025,
    status: AppraisalStatus.PENDING_ASSIGNMENT,
    // evaluator slots are explicitly empty for manual assignment
    hrId: undefined,
    tlId: undefined,
    managerId: undefined,
    ratings: [],
    availableStatuses: {}
  },
  {
    id: 'a3',
    employeeId: '9',
    month: 'April',
    year: 2025,
    status: AppraisalStatus.PENDING_ASSIGNMENT,
    hrId: undefined,
    tlId: undefined,
    managerId: undefined,
    ratings: [],
    availableStatuses: {}
  }
];
