import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

    CREATE TABLE IF NOT EXISTS user_data (
      userId TEXT PRIMARY KEY,
      postsJson TEXT,
      groupsJson TEXT,
      notificationsJson TEXT,
      chatHistoriesJson TEXT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(senderId);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON chat_messages(receiverId);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_group ON chat_messages(groupId);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId);
    CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(authorId);
  `);

  console.log('✅ Database initialized successfully');
}

// API Routes

// Get user data
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await db.get('SELECT * FROM user_data WHERE userId = ?', [userId]);
    
    if (userData) {
      return res.json({
        userId,
        posts: JSON.parse(userData.postsJson || '[]'),
        groups: JSON.parse(userData.groupsJson || '[]'),
        notifications: JSON.parse(userData.notificationsJson || '[]'),
        chatHistories: JSON.parse(userData.chatHistoriesJson || '{}')
      });
    }
    
    res.status(404).json({ error: 'User data not found' });
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
