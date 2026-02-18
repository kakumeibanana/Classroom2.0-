
import { User, Post, ChatGroup, Subject, Notification, Message } from './types';

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

// ユーザーごとのモックデータ分岐
export const USER_MOCK_DATA: Record<string, { posts: Post[]; groups: ChatGroup[]; notifications: Notification[]; chatHistories: Record<string, Message[]> }> = {
  'u1': { // Aさん
    posts: [
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
        simulationStatus: 'pending'
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
        simulationStatus: 'overdue'
      }
    ],
    groups: [
      { id: 'G1', name: '国語 A班', members: ['u1', 'u2', 'u3'], subjectId: 's1' },
    ],
    notifications: [
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
        title: '鈴木先生からのメッセージ',
        description: '提出物の期限について相談がありますか？',
        timestamp: '15分前',
        isRead: false,
        link: 'chat'
      }
    ],
    chatHistories: {
      'u2': [
        { id: 'dm_u1_u2_1', senderId: 'u2', receiverId: 'u1', content: 'Aさん、さっきの授業のノート見せてくれない？', timestamp: '09:30', isRead: false }
      ],
      'u3': [
        { id: 'dm_u1_u3_1', senderId: 'u3', receiverId: 'u1', content: '今日の放課後、図書室行く？', timestamp: '08:45', isRead: false }
      ],
      'u7': [
        { id: 'dm_u1_u7_1', senderId: 'u7', receiverId: 'u1', content: '提出物の期限について相談がありますか？', timestamp: '昨日', isRead: true },
      ]
    }
  },
  'u2': { // Bさん
    posts: [
      {
        id: 'p3',
        subjectId: 's3',
        isAssignment: true,
        title: 'English Presentation',
        author: USERS[6],
        content: 'Give a 5-minute presentation about your favorite country.',
        timestamp: '2024/05/11',
        deadline: '5月25日',
        likes: 0,
        reactions: [],
        comments: [],
        attachments: [],
        simulationStatus: 'submitted'
      }
    ],
    groups: [
      { id: 'G1', name: '国語 A班', members: ['u1', 'u2', 'u3'], subjectId: 's1' },
    ],
    notifications: [
      {
        id: 'n5',
        type: 'message',
        title: 'Aさんからのメッセージ',
        description: 'さっきの授業のノート見せてくれない？',
        timestamp: '10分前',
        isRead: false,
        link: 'chat'
      }
    ],
    chatHistories: {
      'u1': [
        { id: 'dm_u2_u1_1', senderId: 'u2', receiverId: 'u1', content: 'Aさん、さっきの授業のノート見せてくれない？', timestamp: '09:30', isRead: false }
      ],
      'u3': [
        { id: 'dm_u2_u3_1', senderId: 'u2', receiverId: 'u3', content: 'Cさん、週末の勉強会参加できる？', timestamp: '14:00', isRead: false }
      ],
      'u7': [
        { id: 'dm_u2_u7_1', senderId: 'u2', receiverId: 'u7', content: 'プレゼンテーションの提出期限について質問があります。', timestamp: '昨日 16:30', isRead: true }
      ]
    }
  },
  'u6': { // Fさん
    posts: [
      {
        id: 'p4',
        subjectId: 's4',
        isAssignment: true,
        title: '地理レポート：アジア経済',
        author: USERS[6],
        content: 'アジア各国の経済事情について調べてレポートしてください。',
        timestamp: '2024/05/13',
        deadline: '5月30日',
        likes: 0,
        reactions: [],
        comments: [],
        attachments: [],
        simulationStatus: 'late'
      }
    ],
    groups: [
      { id: 'G2', name: '英語 B班', members: ['u4', 'u5', 'u6'], subjectId: 's3' },
    ],
    notifications: [
      {
        id: 'n6',
        type: 'assignment',
        title: '新しい課題案内',
        description: '地理レポートが追加されました。',
        timestamp: '1時間前',
        isRead: true,
        link: 'subject-s4'
      }
    ],
    chatHistories: {
      'u1': [
        { id: 'dm_u6_u1_1', senderId: 'u1', receiverId: 'u6', content: 'Fさん、週末の勉強会いる？', timestamp: '15:30', isRead: true }
      ],
      'u7': [
        { id: 'dm_u6_u7_1', senderId: 'u7', receiverId: 'u6', content: 'レポート提出について相談しましょう。', timestamp: '昨日 14:00', isRead: true },
        { id: 'dm_u6_u7_2', senderId: 'u6', receiverId: 'u7', content: 'わかりました。明日の放課後に報告室に寄ります。', timestamp: '昨日 14:15', isRead: true }
      ]
    }
  },
  'u7': { // 鈴木先生
    posts: MOCK_POSTS,
    groups: MOCK_GROUPS,
    notifications: [
      {
        id: 'n7',
        type: 'message',
        title: 'Aさんからのメッセージ',
        description: '提出物について相談したいことがあります。',
        timestamp: '20分前',
        isRead: false,
        link: 'chat'
      }
    ],
    chatHistories: {
      'u1': [
        { id: 'dm_u7_u1_1', senderId: 'u7', receiverId: 'u1', content: '提出物の期限について相談がありますか？', timestamp: '昨日', isRead: true }
      ],
      'u2': [
        { id: 'dm_u7_u2_1', senderId: 'u2', receiverId: 'u7', content: 'プレゼンテーションの提出期限について質問があります。', timestamp: '昨日 16:30', isRead: false },
        { id: 'dm_u7_u2_2', senderId: 'u7', receiverId: 'u2', content: '提出期限は5月25日です。頑張ってください。', timestamp: '昨日 16:45', isRead: false }
      ],
      'u6': [
        { id: 'dm_u7_u6_1', senderId: 'u7', receiverId: 'u6', content: 'レポート提出について相談しましょう。', timestamp: '昨日 14:00', isRead: true },
        { id: 'dm_u7_u6_2', senderId: 'u6', receiverId: 'u7', content: 'わかりました。明日の放課後に報告室に寄ります。', timestamp: '昨日 14:15', isRead: true }
      ]
    }
  }
};
