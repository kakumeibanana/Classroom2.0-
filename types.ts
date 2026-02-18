
export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  group?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  subtitle?: string;
}

export interface Attachment {
  id: string;
  title: string;
  url: string;
  type: 'doc' | 'slide' | 'sheet' | 'ppt' | 'pdf' | 'file';
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  replies?: Comment[];
}

export type SimulationStatus = 'pending' | 'overdue' | 'submitted' | 'late';

export interface Post {
  id: string;
  author: User;
  title?: string;
  content: string;
  timestamp: string;
  deadline?: string;
  likes: number;
  reactions: {
    type: 'heart' | 'thumbsup' | 'check';
    count: number;
    active: boolean;
  }[];
  comments: Comment[];
  attachments?: Attachment[];
  subjectId?: string;
  groupId?: string;
  isAssignment?: boolean;
  isGroupAssignment?: boolean;
  simulationStatus?: SimulationStatus; // シミュレーション用の状態
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  timestamp: string;
  isRead?: boolean;
  reactions?: { type: string; count: number; users: string[] }[];
  attachments?: { id: string; name: string; url: string; type: string; size: number }[];
  replyToId?: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  members: string[];
  subjectId: string;
  description?: string;
}

export interface WorkspaceResource {
  id: string;
  title: string;
  type: 'doc' | 'link' | 'file';
  lastModified: string;
}

export interface Notification {
  id: string;
  type: 'message' | 'assignment' | 'deadline' | 'group';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}
