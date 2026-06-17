const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure database directory and file exist
function initializeDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], summaries: [] }, null, 2), 'utf8');
  }
}

initializeDb();

function readDb() {
  try {
    initializeDb();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file, using fallback empty structures:', error);
    return { users: [], summaries: [] };
  }
}

function writeDb(data) {
  try {
    initializeDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

const db = {
  // --- User Operations ---
  findUserByUsername(username) {
    const data = readDb();
    return data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  findUserById(id) {
    const data = readDb();
    return data.users.find(u => u.id === id);
  },

  createUser(username, password) {
    const data = readDb();
    
    // Check if user already exists
    if (this.findUserByUsername(username)) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: username.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4),
      username,
      password, // Simple local credentials storage
      created_at: new Date().toISOString()
    };
    
    data.users.push(newUser);
    writeDb(data);
    return newUser;
  },

  // --- Summary Operations ---
  getUserSummaries(userId) {
    const data = readDb();
    return data.summaries.filter(s => s.userId === userId);
  },

  getSummaryById(id) {
    const data = readDb();
    return data.summaries.find(s => s.id === id);
  },

  saveUserSummary(userId, summary) {
    const data = readDb();
    
    // Ensure the summary is associated with this user
    const summaryToSave = {
      ...summary,
      userId,
      updated_at: new Date().toISOString()
    };
    
    if (!summaryToSave.created_at) {
      summaryToSave.created_at = new Date().toISOString();
    }
    
    // Find index of existing summary for replacement
    const index = data.summaries.findIndex(s => s.id === summaryToSave.id && s.userId === userId);
    
    if (index !== -1) {
      data.summaries[index] = summaryToSave;
    } else {
      data.summaries.push(summaryToSave);
    }
    
    writeDb(data);
    return summaryToSave;
  },

  deleteUserSummary(userId, id) {
    const data = readDb();
    const initialLength = data.summaries.length;
    data.summaries = data.summaries.filter(s => !(s.id === id && s.userId === userId));
    
    if (data.summaries.length !== initialLength) {
      writeDb(data);
      return true;
    }
    return false;
  }
};

module.exports = db;
