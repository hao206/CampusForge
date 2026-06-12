export type Role = 'Guest' | 'Student' | 'Project Leader' | 'Moderator' | 'Admin' | 'Super Admin';

export interface UserProfile {
  id: string;
  fullName: string;
  studentId: string;
  email: string;
  avatar: string;
  coverPhoto: string;
  faculty: string;
  major: string;
  academicYear: string;
  biography: string;
  skills: { name: string; level: number }[];
  interests: string[];
  careerGoals: string;
  reputationScore: number;
  role: string;
}

export type ProjectStatus = 'Recruiting' | 'Active' | 'Completed' | 'Archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredSkills: string[];
  deadline: string;
  teamSize: number;
  progress: number;
  status: ProjectStatus;
  leaderId: string;
  leaderName: string;
}

export type TaskStatus = 'Backlog' | 'To Do' | 'Doing' | 'Review' | 'Done';

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: TaskStatus;
  assignedTo: string;
  assignedAvatar?: string;
  dueDate: string;
  commentsCount: number;
}

export interface Post {
  id: string;
  author: string;
  role: string;
  avatar: string;
  content: string;
  images: string[];
  likes: number;
  comments: { author: string; content: string; time: string }[];
  loved?: boolean;
  topic: string;
  saved?: boolean;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  category: 'Report' | 'Slides' | 'Source Code' | 'Template' | 'Material';
  sharedBy: string;
  downloads: number;
  size: string;
  link: string;
}

export interface SkillExchangeOffer {
  id: string;
  studentName: string;
  avatar: string;
  offers: string[];
  requests: string[];
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  rating: number;
  sessionsBooked: number;
  skills: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  ip: string;
}
