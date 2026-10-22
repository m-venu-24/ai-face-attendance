import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LiveCameraRecognition } from './components/LiveCameraRecognition';
import { RegisterPerson } from './components/RegisterPerson';
import { AttendanceLogs } from './components/AttendanceLogs';
import { UserDirectory } from './components/UserDirectory';
import { NotificationsPanel } from './components/NotificationsPanel';
import { AttendanceRecord, AttendanceSummary, RegisteredUser, NotificationLog, SystemSettings } from './types';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('attend');
  const [systemStatus, setSystemStatus] = useState<string>('INITIALIZING');
  const [isModelReady, setIsModelReady] = useState<boolean>(true);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    tolerance: 0.50,
    scaleFactor: 0.5,
    enableNotifications: true,
    adminEmail: 'admin@example.com',
    adminPhone: '+1234567890',
    allowMultipleDailyMarks: false,
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warn' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    try {
      setSystemStatus('SYNCING DATA');
      const [recordsRes, summaryRes, usersRes, notifsRes, settingsRes] = await Promise.all([
        fetch('/api/attendance'),
        fetch('/api/attendance/summary'),
        fetch('/api/registered-users'),
        fetch('/api/notifications'),
        fetch('/api/settings'),
      ]);

      if (recordsRes.ok) setRecords(await recordsRes.json());
      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (usersRes.ok) setRegisteredUsers(await usersRes.json());
      if (notifsRes.ok) setNotifications(await notifsRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());

      setSystemStatus('SYSTEM READY');
      setIsModelReady(true);
    } catch (err) {
      console.warn('Initial API sync:', err);
      setSystemStatus('LOCAL MODE');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Today's marked names set
  const todayDate = summary?.todayDate || new Date().toISOString().split('T')[0];
  const todayMarkedNames = new Set(
    records.filter((r) => r.date === todayDate).map((r) => r.name)
  );

  // Mark attendance trigger
  const handleMarkAttendance = async (name: string, confidence: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, confidence }),
      });

      const data = await res.json();

      if (res.status === 409) {
        showToast(`ALREADY MARKED TODAY: ${name}`, 'warn');
        return false;
      }

      if (!res.ok) {
        showToast(data.error || 'Failed to record attendance', 'warn');
        return false;
      }

      showToast(`✔ ATTENDANCE RECORDED: ${name} (${confidence}%)`, 'success');
      // Refresh state
      fetchData();
      return true;
    } catch (err) {
      console.error('Error marking attendance:', err);
      showToast(`Error marking attendance for ${name}`, 'warn');
      return false;
    }
  };

  // Manual mark
  const handleManualMark = async (name: string): Promise<boolean> => {
    return handleMarkAttendance(name, 100);
  };

  // Delete attendance record
  const handleDeleteRecord = async (id: string) => {
    try {
      await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast('Record deleted', 'info');
      // refresh summary
      const sumRes = await fetch('/api/attendance/summary');
      if (sumRes.ok) setSummary(await sumRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  // Clear records
  const handleClearRecords = async (filter: 'today' | 'all' = 'today') => {
    try {
      await fetch(`/api/attendance?filter=${filter}`, { method: 'DELETE' });
      showToast(`Cleared ${filter} attendance logs`, 'info');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Register person callback
  const handlePersonRegistered = (newUser: RegisteredUser) => {
    setRegisteredUsers((prev) => {
      const filtered = prev.filter((u) => u.id !== newUser.id);
      return [...filtered, newUser];
    });
    showToast(`Registered '${newUser.name}' with ${newUser.samplesCount} samples!`, 'success');
  };

  // Delete user
  const handleDeleteUser = async (id: string) => {
    try {
      await fetch(`/api/registered-users/${id}`, { method: 'DELETE' });
      setRegisteredUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('User deleted from database', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Update Settings
  const handleUpdateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        showToast('Settings updated', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clear notifications
  const handleClearNotifications = async () => {
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
      showToast('Notification logs cleared', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050a0f] text-[#cce8f4] flex flex-col selection:bg-[#00d4ff]/30 selection:text-[#cce8f4]">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        isModelReady={isModelReady}
        todayMarkedCount={todayMarkedNames.size}
      />

      {/* Main Content Viewports */}
      <main className="flex-1 pb-12">
        {activeTab === 'attend' && (
          <LiveCameraRecognition
            registeredUsers={registeredUsers}
            onMarkAttendance={handleMarkAttendance}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            todayMarkedNames={todayMarkedNames}
          />
        )}

        {activeTab === 'register' && (
          <RegisterPerson
            onPersonRegistered={handlePersonRegistered}
            registeredUsers={registeredUsers}
          />
        )}

        {activeTab === 'records' && (
          <AttendanceLogs
            records={records}
            summary={summary}
            registeredUsers={registeredUsers}
            onRefresh={fetchData}
            onDeleteRecord={handleDeleteRecord}
            onClearRecords={handleClearRecords}
            onManualMark={handleManualMark}
          />
        )}

        {activeTab === 'directory' && (
          <UserDirectory
            users={registeredUsers}
            onDeleteUser={handleDeleteUser}
            onNavigateRegister={() => setActiveTab('register')}
            todayMarkedNames={todayMarkedNames}
          />
        )}

        {(activeTab === 'notifications' || activeTab === 'settings') && (
          <NotificationsPanel
            notifications={notifications}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearNotifications={handleClearNotifications}
          />
        )}
      </main>

      {/* Floating System Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2.5 rounded shadow-2xl font-mono-tech text-xs font-bold flex items-center gap-2 transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-[#00ff9d] text-black shadow-[0_0_25px_rgba(0,255,157,0.4)]'
              : toast.type === 'warn'
              ? 'bg-[#ffb800] text-black shadow-[0_0_25px_rgba(255,184,0,0.4)]'
              : 'bg-[#00d4ff] text-black shadow-[0_0_25px_rgba(0,212,255,0.4)]'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : toast.type === 'warn' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <Info className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
