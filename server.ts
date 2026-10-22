import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

interface AttendanceRecord {
  id: string;
  name: string;
  date: string;
  time: string;
  timestamp: number;
  confidence?: number;
  status: 'Verified' | 'Late' | 'Manual';
}

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  samplesCount: number;
  registeredAt: string;
  descriptors?: number[][];
}

interface NotificationLog {
  id: string;
  type: 'EMAIL' | 'SMS';
  recipient: string;
  recipientType: 'Admin' | 'User';
  subject?: string;
  message: string;
  timestamp: string;
  status: 'Sent' | 'Failed';
}

// Initial state loaded from attendance.csv & 3_attendance.py
let attendanceRecords: AttendanceRecord[] = [
  { id: '1', name: 'Venu', date: '2026-03-29', time: '03:07:02 PM', timestamp: Date.now() - 3600000 * 5, confidence: 96, status: 'Verified' },
  { id: '2', name: 'Venu', date: '2026-03-29', time: '03:11:21 PM', timestamp: Date.now() - 3600000 * 4.8, confidence: 98, status: 'Verified' },
  { id: '3', name: 'Venu', date: '2026-03-29', time: '03:14:22 PM', timestamp: Date.now() - 3600000 * 4.5, confidence: 95, status: 'Verified' },
  { id: '4', name: 'Venu', date: '2026-03-29', time: '03:17:38 PM', timestamp: Date.now() - 3600000 * 4.2, confidence: 97, status: 'Verified' },
  { id: '5', name: 'Venu', date: '2026-03-29', time: '03:23:57 PM', timestamp: Date.now() - 3600000 * 4.0, confidence: 99, status: 'Verified' },
];

let registeredUsers: RegisteredUser[] = [
  {
    id: 'user-1',
    name: 'Venu',
    email: 'venu@user.com',
    phone: '+1987654321',
    samplesCount: 50,
    registeredAt: '2026-03-28 10:00 AM',
  },
  {
    id: 'user-2',
    name: 'Alice',
    email: 'alice@user.com',
    phone: '+1122334455',
    samplesCount: 25,
    registeredAt: '2026-03-28 11:30 AM',
  },
  {
    id: 'user-3',
    name: 'Bob',
    email: 'bob@user.com',
    phone: '+1555666777',
    samplesCount: 15,
    registeredAt: '2026-03-28 02:15 PM',
  },
];

let systemSettings = {
  tolerance: 0.50,
  scaleFactor: 0.5,
  enableNotifications: true,
  adminEmail: 'admin@example.com',
  adminPhone: '+1234567890',
  allowMultipleDailyMarks: false,
};

let notificationLogs: NotificationLog[] = [
  {
    id: 'notif-1',
    type: 'EMAIL',
    recipient: 'admin@example.com',
    recipientType: 'Admin',
    subject: 'Attendance Verified: Venu',
    message: 'Notice: Student Venu has verified attendance on 2026-03-29 at 03:23:57 PM.',
    timestamp: '2026-03-29 03:23:58 PM',
    status: 'Sent',
  },
  {
    id: 'notif-2',
    type: 'SMS',
    recipient: '+1234567890',
    recipientType: 'Admin',
    message: 'Admin Alert: Venu marked present at 03:23:57 PM',
    timestamp: '2026-03-29 03:23:58 PM',
    status: 'Sent',
  },
  {
    id: 'notif-3',
    type: 'SMS',
    recipient: '+1987654321',
    recipientType: 'User',
    message: 'Hello Venu, your attendance was marked at 03:23:57 PM',
    timestamp: '2026-03-29 03:23:59 PM',
    status: 'Sent',
  },
];

// Helper to format current date and time
function getCurrentFormatted() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  return { dateStr, timeStr };
}

// ── API Routes ──────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Face Attendance System' });
});

// Attendance routes
app.get('/api/attendance', (req, res) => {
  const { date, name } = req.query;
  let filtered = [...attendanceRecords];
  if (date) {
    filtered = filtered.filter((r) => r.date === date);
  }
  if (name) {
    filtered = filtered.filter((r) => r.name.toLowerCase().includes(String(name).toLowerCase()));
  }
  res.json(filtered.sort((a, b) => b.timestamp - a.timestamp));
});

app.post('/api/attendance', (req, res) => {
  const { name, confidence, force } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required' });
  }

  const { dateStr, timeStr } = getCurrentFormatted();

  // Check if marked today (if multiple marks not allowed unless force is true)
  if (!systemSettings.allowMultipleDailyMarks && !force) {
    const alreadyMarked = attendanceRecords.some(
      (r) => r.name.toLowerCase() === name.toLowerCase() && r.date === dateStr
    );
    if (alreadyMarked) {
      return res.status(409).json({
        error: 'Already marked today',
        message: `${name} has already recorded attendance for ${dateStr}`,
        alreadyMarked: true,
      });
    }
  }

  const newRecord: AttendanceRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name,
    date: dateStr,
    time: timeStr,
    timestamp: Date.now(),
    confidence: confidence ? Math.round(confidence) : 95,
    status: 'Verified',
  };

  attendanceRecords.unshift(newRecord);

  // Dispatch simulated notifications (matches 3_attendance.py)
  if (systemSettings.enableNotifications) {
    const userMatch = registeredUsers.find(
      (u) => u.name.toLowerCase() === name.toLowerCase()
    );

    // 1. Admin Email
    notificationLogs.unshift({
      id: `notif-${Date.now()}-1`,
      type: 'EMAIL',
      recipient: systemSettings.adminEmail,
      recipientType: 'Admin',
      subject: `Attendance Verified: ${name}`,
      message: `Notice: Student '${name}' has verified attendance on ${dateStr} at ${timeStr}.`,
      timestamp: `${dateStr} ${timeStr}`,
      status: 'Sent',
    });

    // 2. Admin SMS
    notificationLogs.unshift({
      id: `notif-${Date.now()}-2`,
      type: 'SMS',
      recipient: systemSettings.adminPhone,
      recipientType: 'Admin',
      message: `Admin Alert: ${name} marked present at ${timeStr}`,
      timestamp: `${dateStr} ${timeStr}`,
      status: 'Sent',
    });

    // 3. User alerts
    if (userMatch) {
      if (userMatch.email) {
        notificationLogs.unshift({
          id: `notif-${Date.now()}-3`,
          type: 'EMAIL',
          recipient: userMatch.email,
          recipientType: 'User',
          subject: 'Attendance Confirmation',
          message: `Hello ${name}, your attendance was successfully recorded on ${dateStr} at ${timeStr}.`,
          timestamp: `${dateStr} ${timeStr}`,
          status: 'Sent',
        });
      }
      if (userMatch.phone) {
        notificationLogs.unshift({
          id: `notif-${Date.now()}-4`,
          type: 'SMS',
          recipient: userMatch.phone,
          recipientType: 'User',
          message: `Hello ${name}, your attendance was marked at ${timeStr}`,
          timestamp: `${dateStr} ${timeStr}`,
          status: 'Sent',
        });
      }
    }
  }

  res.status(201).json({
    success: true,
    record: newRecord,
    message: `Attendance marked for ${name}`,
  });
});

app.delete('/api/attendance/:id', (req, res) => {
  const { id } = req.params;
  attendanceRecords = attendanceRecords.filter((r) => r.id !== id);
  res.json({ success: true });
});

app.delete('/api/attendance', (req, res) => {
  const { filter } = req.query;
  const { dateStr } = getCurrentFormatted();
  if (filter === 'today') {
    attendanceRecords = attendanceRecords.filter((r) => r.date !== dateStr);
  } else {
    attendanceRecords = [];
  }
  res.json({ success: true });
});

app.get('/api/attendance/summary', (req, res) => {
  const { dateStr } = getCurrentFormatted();
  const todayRecords = attendanceRecords.filter((r) => r.date === dateStr);
  const uniqueTodayPersons = new Set(todayRecords.map((r) => r.name)).size;

  res.json({
    totalEntries: attendanceRecords.length,
    todayDate: dateStr,
    todayCount: todayRecords.length,
    uniqueTodayPersons,
    registeredCount: registeredUsers.length,
    attendanceRate: registeredUsers.length > 0
      ? Math.round((uniqueTodayPersons / registeredUsers.length) * 100)
      : 0,
    latest: attendanceRecords[0] || null,
  });
});

app.get('/api/attendance/csv', (req, res) => {
  const header = 'Name,Date,Time,Status,Confidence';
  const rows = attendanceRecords.map(
    (r) => `${r.name},${r.date},${r.time},${r.status},${r.confidence || 95}%`
  );
  const csvContent = [header, ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance.csv"');
  res.send(csvContent);
});

// Registered users routes
app.get('/api/registered-users', (req, res) => {
  res.json(registeredUsers);
});

app.post('/api/registered-users', (req, res) => {
  const { name, email, phone, samplesCount, descriptors } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required' });
  }

  const existingIdx = registeredUsers.findIndex(
    (u) => u.name.toLowerCase() === name.trim().toLowerCase()
  );

  const { dateStr, timeStr } = getCurrentFormatted();

  if (existingIdx >= 0) {
    // Update existing person
    registeredUsers[existingIdx] = {
      ...registeredUsers[existingIdx],
      email: email || registeredUsers[existingIdx].email,
      phone: phone || registeredUsers[existingIdx].phone,
      samplesCount: (registeredUsers[existingIdx].samplesCount || 0) + (samplesCount || 5),
      descriptors: descriptors || registeredUsers[existingIdx].descriptors,
    };
    return res.json({ success: true, user: registeredUsers[existingIdx], updated: true });
  }

  const newUser: RegisteredUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email ? email.trim() : `${name.trim().toLowerCase()}@user.com`,
    phone: phone ? phone.trim() : '+1' + Math.floor(1000000000 + Math.random() * 9000000000),
    samplesCount: samplesCount || 5,
    registeredAt: `${dateStr} ${timeStr}`,
    descriptors: descriptors || [],
  };

  registeredUsers.push(newUser);
  res.status(201).json({ success: true, user: newUser });
});

app.delete('/api/registered-users/:id', (req, res) => {
  const { id } = req.params;
  registeredUsers = registeredUsers.filter((u) => u.id !== id);
  res.json({ success: true });
});

// Notifications routes
app.get('/api/notifications', (req, res) => {
  res.json(notificationLogs);
});

app.delete('/api/notifications', (req, res) => {
  notificationLogs = [];
  res.json({ success: true });
});

// Settings routes
app.get('/api/settings', (req, res) => {
  res.json(systemSettings);
});

app.post('/api/settings', (req, res) => {
  systemSettings = { ...systemSettings, ...req.body };
  res.json({ success: true, settings: systemSettings });
});

// Dev server or static assets handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Face Attendance System] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
