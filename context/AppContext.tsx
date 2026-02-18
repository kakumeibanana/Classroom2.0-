import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { User, Post, ChatGroup, Notification, Message } from '../types';
import { USERS, MOCK_POSTS, MOCK_GROUPS, MOCK_NOTIFICATIONS, USER_MOCK_DATA } from '../constants';
import { getUserData, saveUserData, healthCheck } from '../src/api/client';

export interface AppState {
  activeUser: User;
  activeTab: string;
  subjectSubTab: 'stream' | 'classwork' | 'groups' | 'todo';
  selectedGroup: ChatGroup | null;
  sidebarOpen: boolean;
  posts: Post[];
  groups: ChatGroup[];
  notifications: Notification[];
  chatHistories: Record<string, Message[]>;
}

export type AppAction =
  | { type: 'SET_ACTIVE_USER'; payload: User }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SUBJECT_SUB_TAB'; payload: AppState['subjectSubTab'] }
  | { type: 'SET_SELECTED_GROUP'; payload: ChatGroup | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'SET_GROUPS'; payload: ChatGroup[] }
  | { type: 'ADD_GROUP'; payload: ChatGroup }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'ADD_COMMENT'; payload: { postId: string; comment: any } }
  | { type: 'CYCLE_SIMULATION_STATUS'; payload: string }
  | { type: 'SET_CHAT_HISTORIES'; payload: Record<string, Message[]> }
  | { type: 'ADD_MESSAGE'; payload: { fromUserId: string; toUserId: string; message: Message } }
  | { type: 'RESTORE_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  activeUser: USERS[0],
  activeTab: 'home',
  subjectSubTab: 'stream',
  selectedGroup: null,
  sidebarOpen: false,
  posts: MOCK_POSTS,
  groups: MOCK_GROUPS,
  notifications: MOCK_NOTIFICATIONS,
  chatHistories: {},
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_USER': {
      const userData = USER_MOCK_DATA[action.payload.id];
      return {
        ...state,
        activeUser: action.payload,
        posts: userData?.posts || MOCK_POSTS,
        groups: userData?.groups || MOCK_GROUPS,
        notifications: userData?.notifications || MOCK_NOTIFICATIONS,
        chatHistories: userData?.chatHistories || {},
        selectedGroup: null,
        activeTab: 'home',
      };
    }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_SUBJECT_SUB_TAB':
      return { ...state, subjectSubTab: action.payload };
    case 'SET_SELECTED_GROUP':
      return { ...state, selectedGroup: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_POSTS':
      return { ...state, posts: action.payload };
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case 'ADD_COMMENT':
      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === action.payload.postId
            ? { ...p, comments: [...p.comments, action.payload.comment] }
            : p
        ),
      };
    case 'CYCLE_SIMULATION_STATUS': {
      return {
        ...state,
        posts: state.posts.map(p => {
          if (p.id !== action.payload) return p;
          const current = p.simulationStatus || 'pending';
          let next: any;
          switch (current) {
            case 'pending': next = 'overdue'; break;
            case 'overdue': next = 'submitted'; break;
            case 'submitted': next = 'late'; break;
            case 'late': next = 'pending'; break;
            default: next = 'pending';
          }
          return { ...p, simulationStatus: next };
        }),
      };
    }
    case 'SET_CHAT_HISTORIES':
      return { ...state, chatHistories: action.payload };
    case 'ADD_MESSAGE': {
      const { fromUserId, toUserId, message } = action.payload;
      return {
        ...state,
        chatHistories: {
          ...state.chatHistories,
          [toUserId]: [...(state.chatHistories[toUserId] || []), message]
        }
      };
    }
    case 'RESTORE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  setActiveUser: (user: User) => void;
  setActiveTab: (tab: string) => void;
  setSubjectSubTab: (tab: AppState['subjectSubTab']) => void;
  toggleSidebar: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isDbAvailable, setIsDbAvailable] = useState(false);

  // Check if backend is available on mount
  useEffect(() => {
    healthCheck().then(setIsDbAvailable);
  }, []);

  // Load user data from API or localStorage
  useEffect(() => {
    const loadUserData = async () => {
      if (isDbAvailable) {
        // Try to load from API
        const apiData = await getUserData(state.activeUser.id);
        if (apiData) {
          dispatch({
            type: 'RESTORE_STATE',
            payload: {
              posts: apiData.posts,
              groups: apiData.groups,
              notifications: apiData.notifications,
              chatHistories: apiData.chatHistories
            }
          });
          return;
        }
      }

      // Fallback to localStorage
      const saved = localStorage.getItem(`classroom-state-${state.activeUser.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          dispatch({ type: 'RESTORE_STATE', payload: parsed });
        } catch (e) {
          console.error('Failed to restore state:', e);
        }
      }
    };

    loadUserData();
  }, [state.activeUser.id, isDbAvailable]);

  // Save to API or localStorage
  useEffect(() => {
    const saveData = async () => {
      const userData = {
        posts: state.posts,
        groups: state.groups,
        notifications: state.notifications,
        chatHistories: state.chatHistories
      };

      // Save to API if available
      if (isDbAvailable) {
        await saveUserData(state.activeUser.id, userData);
      }

      // Always save to localStorage as fallback
      localStorage.setItem(
        `classroom-state-${state.activeUser.id}`,
        JSON.stringify(userData)
      );
    };

    saveData();
  }, [state.posts, state.groups, state.notifications, state.chatHistories, state.activeUser.id, isDbAvailable]);

  const setActiveUser = useCallback((user: User) => {
    dispatch({ type: 'SET_ACTIVE_USER', payload: user });
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const setSubjectSubTab = useCallback((tab: AppState['subjectSubTab']) => {
    dispatch({ type: 'SET_SUBJECT_SUB_TAB', payload: tab });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    setActiveUser,
    setActiveTab,
    setSubjectSubTab,
    toggleSidebar,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
