import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Database setup
let db;

async function initDb() {
  db = await open({
    filename: path.join(__dirname, '../data.db'),
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON');

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      receiverId TEXT,
      groupId TEXT,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      isRead BOOLEAN DEFAULT 0,
      replyToId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS message_reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      messageId TEXT NOT NULL,
      type TEXT NOT NULL,
      userId TEXT NOT NULL,
      FOREIGN KEY (messageId) REFERENCES chat_messages(id) ON DELETE CASCADE,
      UNIQUE(messageId, type, userId)
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      authorId TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      deadline TEXT,
      subjectId TEXT,
      isAssignment BOOLEAN DEFAULT 0,
      simulationStatus TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      timestamp TEXT NOT NULL,
      isRead BOOLEAN DEFAULT 0,
      link TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
      avatar TEXT,
      classId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_data (
      userId TEXT PRIMARY KEY,
      postsJson TEXT,
      groupsJson TEXT,
      notificationsJson TEXT,
      chatHistoriesJson TEXT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      authorId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      deadline DATETIME,
      classId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id TEXT PRIMARY KEY,
      assignmentId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      content TEXT,
      attachments TEXT,
      submittedAt DATETIME,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'graded')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      sessionToken TEXT UNIQUE NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(senderId);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON chat_messages(receiverId);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_group ON chat_messages(groupId);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId);
    CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(authorId);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_assignments_author ON assignments(authorId);
    CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(studentId);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(userId);
  `);

  // Initialize demo users if they don't exist
  const userIds = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'];
  const userNames = ['Aさん', 'Bさん', 'Cさん', 'Dさん', 'Eさん', 'Fさん', '鈴木先生'];
  const userRoles = ['student', 'student', 'student', 'student', 'student', 'student', 'teacher'];
  const userSeeds = ['A', 'B', 'C', 'D', 'E', 'F', 'Sheldon'];

  for (let i = 0; i < userIds.length; i++) {
    const userExists = await db.get("SELECT * FROM users WHERE id = ?", [userIds[i]]);
    if (!userExists) {
      const hashedPassword = crypto.createHash('sha256').update('password').digest('hex');
      const avatarUrl = i === 6 
        ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sheldon&glassesProbability=100&mouth=smile&top=shortHair&facialHairProbability=0'
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${userSeeds[i]}`;
      
      await db.run(
        `INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)`,
        [userIds[i], userNames[i], `user-${i+1}@school.jp`, hashedPassword, userRoles[i], avatarUrl]
      );
    }
  }

  console.log('✅ Database initialized successfully');
}

// API Routes

// Get user data
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await db.get('SELECT * FROM user_data WHERE userId = ?', [userId]);
    
    // Build chat histories from chat_messages table
    const messages = await db.all(
      `SELECT * FROM chat_messages WHERE senderId = ? OR receiverId = ? ORDER BY timestamp ASC`,
      [userId, userId]
    );

    const chatHistories = {};
    for (const msg of messages || []) {
      const chatKey = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (chatKey) {
        if (!chatHistories[chatKey]) {
          chatHistories[chatKey] = [];
        }
        chatHistories[chatKey].push({
          id: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          groupId: msg.groupId,
          content: msg.content,
          timestamp: msg.timestamp,
          isRead: msg.isRead ? true : false,
          replyToId: msg.replyToId,
          reactions: [] // TODO: fetch from message_reactions table
        });
      }
    }

    const postsData = userData ? JSON.parse(userData.postsJson || '[]') : [];
    const groupsData = userData ? JSON.parse(userData.groupsJson || '[]') : [];
    const notificationsData = userData ? JSON.parse(userData.notificationsJson || '[]') : [];

    console.log(`📊 [GET /api/user/${userId}] Returning data:`, {
      postsCount: postsData.length,
      groupsCount: groupsData.length,
      notificationsCount: notificationsData.length,
      chatHistoriesKeys: Object.keys(chatHistories).length
    });

    return res.json({
      userId,
      posts: postsData,
      groups: groupsData,
      notifications: notificationsData,
      chatHistories
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save user data
app.post('/api/user/:userId/save', async (req, res) => {
  try {
    const { userId } = req.params;
    const { posts, groups, notifications, chatHistories } = req.body;

    console.log(`💾 [POST /api/user/${userId}/save] Saving data:`, {
      postsCount: posts?.length || 0,
      groupsCount: groups?.length || 0,
      notificationsCount: notifications?.length || 0,
      chatHistoriesKeys: Object.keys(chatHistories || {}).length
    });

    const existing = await db.get('SELECT * FROM user_data WHERE userId = ?', [userId]);

    if (existing) {
      await db.run(
        `UPDATE user_data SET postsJson = ?, groupsJson = ?, notificationsJson = ?, chatHistoriesJson = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?`,
        [
          JSON.stringify(posts),
          JSON.stringify(groups),
          JSON.stringify(notifications),
          JSON.stringify(chatHistories),
          userId
        ]
      );
    } else {
      await db.run(
        `INSERT INTO user_data (userId, postsJson, groupsJson, notificationsJson, chatHistoriesJson) VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          JSON.stringify(posts),
          JSON.stringify(groups),
          JSON.stringify(notifications),
          JSON.stringify(chatHistories)
        ]
      );
    }

    res.json({ success: true, message: 'User data saved' });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add chat message
app.post('/api/messages', async (req, res) => {
  try {
    const { id, senderId, receiverId, groupId, content, timestamp, isRead, replyToId } = req.body;

    await db.run(
      `INSERT INTO chat_messages (id, senderId, receiverId, groupId, content, timestamp, isRead, replyToId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, senderId, receiverId || null, groupId || null, content, timestamp, isRead ? 1 : 0, replyToId || null]
    );

    res.json({ success: true, messageId: id });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get chat messages
app.get('/api/messages/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await db.all(
      `SELECT * FROM chat_messages WHERE groupId = ? OR receiverId = ? OR senderId = ? ORDER BY timestamp ASC`,
      [chatId, chatId, chatId]
    );

    res.json(messages || []);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add message reaction
app.post('/api/messages/:messageId/reaction', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { type, userId } = req.body;

    const existing = await db.get(
      'SELECT * FROM message_reactions WHERE messageId = ? AND type = ? AND userId = ?',
      [messageId, type, userId]
    );

    if (existing) {
      await db.run(
        'DELETE FROM message_reactions WHERE messageId = ? AND type = ? AND userId = ?',
        [messageId, type, userId]
      );
    } else {
      await db.run(
        'INSERT INTO message_reactions (messageId, type, userId) VALUES (?, ?, ?)',
        [messageId, type, userId]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating reaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add post
app.post('/api/posts', async (req, res) => {
  try {
    const { id, authorId, title, content, timestamp, deadline, subjectId, isAssignment, simulationStatus } = req.body;

    await db.run(
      `INSERT INTO posts (id, authorId, title, content, timestamp, deadline, subjectId, isAssignment, simulationStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, authorId, title || null, content, timestamp, deadline || null, subjectId || null, isAssignment ? 1 : 0, simulationStatus || 'pending']
    );

    res.json({ success: true, postId: id });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add notification
app.post('/api/notifications', async (req, res) => {
  try {
    const { id, userId, type, title, description, timestamp, isRead, link } = req.body;

    await db.run(
      `INSERT INTO notifications (id, userId, type, title, description, timestamp, isRead, link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, type, title, description || null, timestamp, isRead ? 1 : 0, link || null]
    );

    res.json({ success: true, notificationId: id });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
app.patch('/api/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;

    await db.run('UPDATE chat_messages SET isRead = 1 WHERE id = ?', [messageId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating message read status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
app.patch('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    await db.run('UPDATE notifications SET isRead = 1 WHERE id = ?', [notificationId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notification read status:', error);
    res.status(500).json({ error: error.message });
  }
});

// File upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileInfo = {
      id: Date.now().toString(),
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      type: req.file.mimetype,
      size: req.file.size
    };

    res.json(fileInfo);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, classId } = req.body;

    // Check if user exists
    const existing = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'ユーザーのメールアドレスは既に存在します' });
    }

    // Hash password (simple hash for demo)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const userId = 'user-' + Date.now();

    await db.run(
      `INSERT INTO users (id, name, email, password, role, classId, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email, hashedPassword, role || 'student', classId || null, `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`]
    );

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await db.run(
      `INSERT INTO sessions (id, userId, sessionToken, expiresAt) VALUES (?, ?, ?, ?)`,
      ['session-' + Date.now(), userId, sessionToken, expiresAt]
    );

    res.json({
      success: true,
      userId,
      sessionToken,
      user: {
        id: userId,
        name,
        email,
        role: role || 'student',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
      }
    });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await db.run(
      `INSERT INTO sessions (id, userId, sessionToken, expiresAt) VALUES (?, ?, ?, ?)`,
      ['session-' + Date.now(), user.id, sessionToken, expiresAt]
    );

    res.json({
      success: true,
      userId: user.id,
      sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const sessionToken = req.headers.authorization?.split(' ')[1];
    if (!sessionToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = await db.get(
      'SELECT * FROM sessions WHERE sessionToken = ? AND expiresAt > CURRENT_TIMESTAMP',
      [sessionToken]
    );

    if (!session) {
      return res.status(401).json({ error: 'Session expired' });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [session.userId]);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Assignment Routes
app.post('/api/assignments', async (req, res) => {
  try {
    const { authorId, title, description, deadline, classId } = req.body;

    // Check if user is teacher
    const user = await db.get('SELECT * FROM users WHERE id = ?', [authorId]);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ error: '先生だけが課題を作成できます' });
    }

    const assignmentId = 'assignment-' + Date.now();
    await db.run(
      `INSERT INTO assignments (id, authorId, title, description, deadline, classId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [assignmentId, authorId, title, description || null, deadline || null, classId || null]
    );

    res.json({ success: true, assignmentId });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assignments', async (req, res) => {
  try {
    const { classId } = req.query;

    const assignments = await db.all(
      classId 
        ? 'SELECT * FROM assignments WHERE classId = ? ORDER BY createdAt DESC' 
        : 'SELECT * FROM assignments ORDER BY createdAt DESC',
      classId ? [classId] : []
    );

    // Get submission count for each assignment
    const result = await Promise.all(
      (assignments || []).map(async (a) => {
        const submissions = await db.all(
          'SELECT * FROM assignment_submissions WHERE assignmentId = ?',
          [a.id]
        );
        return {
          ...a,
          submissions: submissions || []
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: error.message });
  }
});

// DM Routes (Direct Messages)
app.post('/api/dm', async (req, res) => {
  try {
    const { senderId, receiverId, content, timestamp } = req.body;

    const messageId = 'dm-' + Date.now();
    await db.run(
      `INSERT INTO chat_messages (id, senderId, receiverId, content, timestamp, isRead)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [messageId, senderId, receiverId, content, timestamp]
    );

    // Create notification
    const notificationId = 'notif-' + Date.now();
    const sender = await db.get('SELECT name FROM users WHERE id = ?', [senderId]);
    await db.run(
      `INSERT INTO notifications (id, userId, type, title, description, timestamp, isRead)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [notificationId, receiverId, 'message', `${sender.name}からのメッセージ`, content.substring(0, 50), timestamp]
    );

    res.json({ success: true, messageId });
  } catch (error) {
    console.error('Error sending DM:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dm/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const messages = await db.all(
      `SELECT * FROM chat_messages 
       WHERE ((senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?))
       ORDER BY timestamp ASC`,
      [userId1, userId2, userId2, userId1]
    );

    res.json(messages || []);
  } catch (error) {
    console.error('Error fetching DM:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dm/:userId/list', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get unique conversation partners
    const conversations = await db.all(
      `SELECT DISTINCT 
        CASE WHEN senderId = ? THEN receiverId ELSE senderId END as userId,
        MAX(timestamp) as lastMessageTime
       FROM chat_messages
       WHERE senderId = ? OR receiverId = ?
       GROUP BY userId
       ORDER BY lastMessageTime DESC`,
      [userId, userId, userId]
    );

    // Get user details for each conversation partner
    const result = await Promise.all(
      (conversations || []).map(async (conv) => {
        const user = await db.get('SELECT id, name, avatar FROM users WHERE id = ?', [conv.userId]);
        const unreadCount = await db.get(
          `SELECT COUNT(*) as count FROM chat_messages 
           WHERE senderId = ? AND receiverId = ? AND isRead = 0`,
          [conv.userId, userId]
        );
        return {
          user,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: unreadCount?.count || 0
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error('Error fetching DM list:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Classroom 2.0 backend is running' });
});

// Start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database: /workspaces/Classroom2.0-/data.db`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
