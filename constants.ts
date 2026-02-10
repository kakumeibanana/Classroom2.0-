
import { User, Post, ChatGroup, Subject, Notification } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Aさん', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A', role: 'student' },
  { id: 'u2', name: 'Bさん', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B', role: 'student' },
  { id: 'u3', name: 'Cさん', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C', role: 'student' },
  { id: 'u4', name: 'Dさん', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=D', role: 'student' },
  { id: 'u5', name: 'Eさん', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=E', role: 'student' },
  { id: 'u6', name: 'Fさん', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=F', role: 'student' },
  { id: 'u7', name: '鈴木先生', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sheldon&glassesProbability=100&mouth=smile&top=shortHair&facialHairProbability=0', role: 'teacher' },
];

export const CURRENT_USER: User = USERS[0];

export const MOCK_SUBJECTS: Subject[] = [
  { id: 's1', name: '国語（現代文）', color: '#e8f0fe', icon: '国' },
  { id: 's2', name: '数学IA', color: '#fef7e0', icon: '数' },
  { id: 's3', name: '英語コミュニケーション', color: '#e4f7fb', icon: '英' },
  { id: 's4', name: '地理総合', color: '#f3e8fd', icon: '地' },
  { id: 's5', name: '生物基礎', color: '#e6f4ea', icon: '生' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'assignment',
    title: '新しい課題',
    description: '鈴木先生が「読書感想文」を投稿しました。',
    timestamp: '5分前',
    isRead: false,
    link: 'subject-s1'
  },
  {
    id: 'n2',
    type: 'message',
    title: '新着メッセージ',
    description: 'BさんからDMが届いています。',
    timestamp: '15分前',
    isRead: false,
    link: 'chat'
  },
  {
    id: 'n3',
    type: 'deadline',
    title: '期限が迫っています',
    description: '数学IAの課題提出まであと3時間です。',
    timestamp: '1時間前',
    isRead: false,
    link: 'todo'
  },
  {
    id: 'n4',
    type: 'group',
    title: '班への配属',
    description: '国語 A班に配属されました。',
    timestamp: '2時間前',
    isRead: true,
    link: 'subject-s1'
  }
];

export const getIconTextColor = (bgColor: string) => {
  if (bgColor === '#e8f0fe') return '#1967d2';
  if (bgColor === '#fef7e0') return '#b06000';
  if (bgColor === '#f3e8fd') return '#9334e6';
  if (bgColor === '#e4f7fb') return '#12b5cb';
  if (bgColor === '#e6f4ea') return '#137333';
  return '#3c4043';
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    subjectId: 's1',
    isAssignment: true,
    title: '読書感想文の提出',
    author: USERS[6],
    content: '夏目漱石「こころ」を読んで、800字程度でまとめてください。',
    timestamp: '2024/05/10',
    deadline: '5月20日',
    likes: 0,
    reactions: [],
    comments: [],
    attachments: [],
    simulationStatus: 'pending' // 初期状態: 未提出（期限内）
  },
  {
    id: 'p2',
    subjectId: 's2',
    isAssignment: true,
    title: '週末課題：2次関数',
    author: USERS[6],
    content: '問題集P.30〜35を解いて提出してください。',
    timestamp: '2024/05/12',
    deadline: '5月15日',
    likes: 0,
    reactions: [],
    comments: [],
    simulationStatus: 'overdue' // 初期状態: 未提出（期限超過）
  }
];

export const MOCK_GROUPS: ChatGroup[] = [
  { id: 'G1', name: '国語 A班', members: ['u1', 'u2', 'u3'], subjectId: 's1' },
];
