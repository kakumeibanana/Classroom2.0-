const API_BASE_URL = '/api';

export interface UserData {
  userId: string;
  posts: any[];
  groups: any[];
  notifications: any[];
  chatHistories: Record<string, any[]>;
}

export interface ApiMessage {
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

// User Data APIs
export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`);
    if (!response.ok) {
      console.warn(`User data not found for ${userId}, using local data`);
      return null;
    }
    const data = await response.json();
    console.log(`✅ Loaded user data for ${userId}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export async function saveUserData(userId: string, data: Omit<UserData, 'userId'>): Promise<boolean> {
  try {
    console.log(`💾 Saving user data for ${userId}:`, data);
    const response = await fetch(`${API_BASE_URL}/user/${userId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      console.log(`✅ Successfully saved user data for ${userId}`);
    } else {
      console.error(`❌ Failed to save user data for ${userId}. Status: ${response.status}`);
    }
    return response.ok;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
}

// Message APIs
export async function createMessage(message: ApiMessage): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return response.ok;
  } catch (error) {
    console.error('Error creating message:', error);
    return false;
  }
}

export async function getMessages(chatId: string): Promise<ApiMessage[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${chatId}`);
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function markMessageAsRead(messageId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    console.error('Error marking message as read:', error);
    return false;
  }
}

export async function addReaction(messageId: string, type: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}/reaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, userId })
    });
    return response.ok;
  } catch (error) {
    console.error('Error adding reaction:', error);
    return false;
  }
}

// Post APIs
export async function createPost(post: any): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    return response.ok;
  } catch (error) {
    console.error('Error creating post:', error);
    return false;
  }
}

// Notification APIs
export async function createNotification(notification: any): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });
    return response.ok;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.warn('Backend server not available');
    return false;
  }
}

// File upload
export async function uploadFile(file: File): Promise<{ id: string; name: string; url: string; type: string; size: number } | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}
// Auth APIs
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar: string;
}

export async function signup(name: string, email: string, password: string, role: 'student' | 'teacher', classId?: string): Promise<{ userId: string; sessionToken: string; user: AuthUser } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, classId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return response.json();
  } catch (error) {
    console.error('Error signing up:', error);
    return null;
  }
}

export async function login(email: string, password: string): Promise<{ userId: string; sessionToken: string; user: AuthUser } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    return response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
}

export async function getCurrentUser(sessionToken: string): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${sessionToken}` }
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

// DM APIs
export async function sendDM(senderId: string, receiverId: string, content: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/dm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId,
        receiverId,
        content,
        timestamp: new Date().toISOString()
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Error sending DM:', error);
    return false;
  }
}

export async function getDMHistory(userId1: string, userId2: string): Promise<ApiMessage[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dm/${userId1}/${userId2}`);
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Error fetching DM history:', error);
    return [];
  }
}

export async function getDMList(userId: string): Promise<{ user: AuthUser; lastMessageTime: string; unreadCount: number }[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dm/${userId}/list`);
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Error fetching DM list:', error);
    return [];
  }
}

// Assignment APIs
export interface Assignment {
  id: string;
  authorId: string;
  title: string;
  description?: string;
  deadline?: string;
  classId?: string;
  createdAt: string;
  submissions?: any[];
}

export async function createAssignment(authorId: string, title: string, description?: string, deadline?: string, classId?: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorId,
        title,
        description,
        deadline,
        classId
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Error creating assignment:', error);
    return false;
  }
}

export async function getAssignments(classId?: string): Promise<Assignment[]> {
  try {
    const url = classId ? `${API_BASE_URL}/assignments?classId=${classId}` : `${API_BASE_URL}/assignments`;
    const response = await fetch(url);
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
}