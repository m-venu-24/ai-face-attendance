import React, { useState } from 'react';
import { Bell, Mail, Phone, Settings, Save, Trash2, CheckCircle2, Sliders, Shield } from 'lucide-react';
import { NotificationLog, SystemSettings } from '../types';

interface NotificationsPanelProps {
  notifications: NotificationLog[];
  settings: SystemSettings;
  onUpdateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  onClearNotifications: () => Promise<void>;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  settings,
  onUpdateSettings,
  onClearNotifications,
}) => {
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail);
  const [adminPhone, setAdminPhone] = useState(settings.adminPhone);
  const [enableNotifications, setEnableNotifications] = useState(settings.enableNotifications);
  const [allowMultipleDailyMarks, setAllowMultipleDailyMarks] = useState(settings.allowMultipleDailyMarks);
  const [tolerance, setTolerance] = useState(settings.tolerance);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      adminEmail,
      adminPhone,
      enableNotifications,
      allowMultipleDailyMarks,
      tolerance,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-[#0d2a3a] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-mono-tech text-lg font-bold text-[#00d4ff] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#00ff9d]" />
            ALERT DISPATCH & HARDWARE GSM NOTIFICATIONS
          </h2>
          <p className="text-xs text-[#4a7a96] mt-0.5">
            Architecture layer from 3_attendance.py: SMTP email relay and GSM SIM800/SIM900 SMS gateway simulation.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearNotifications}
            className="px-3 py-1.5 bg-[#0b1520] hover:bg-[#122232] border border-[#0d2a3a] text-[#ff4060] rounded text-xs font-mono-tech flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> CLEAR LOGS
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#0b1520] border border-[#0d2a3a] rounded-lg p-5 flex flex-col gap-4 font-mono-tech">
          <div className="text-xs text-[#00d4ff] font-semibold border-b border-[#0d2a3a] pb-2 flex items-center gap-1.5">
            <Sliders className="w-4 h-4" />
            // DISPATCH CONFIGURATION
          </div>

          {saveSuccess && (
            <div className="p-2.5 bg-[#00ff9d]/10 border border-[#00ff9d]/40 rounded text-xs text-[#00ff9d] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Settings saved successfully!
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            {/* Toggle Enable */}
            <div className="flex items-center justify-between p-3 bg-[#050a0f] border border-[#0d2a3a] rounded">
              <div>
                <div className="text-[#cce8f4] font-semibold">Enable Notifications</div>
                <div className="text-[10px] text-[#4a7a96]">Dispatch Email & SMS upon verified match</div>
              </div>
              <input
                type="checkbox"
                checked={enableNotifications}
                onChange={(e) => setEnableNotifications(e.target.checked)}
                className="w-4 h-4 accent-[#00d4ff] cursor-pointer"
              />
            </div>

            {/* Toggle Multiple Marks */}
            <div className="flex items-center justify-between p-3 bg-[#050a0f] border border-[#0d2a3a] rounded">
              <div>
                <div className="text-[#cce8f4] font-semibold">Allow Multiple Marks Today</div>
                <div className="text-[10px] text-[#4a7a96]">Disable once-per-session strict filter</div>
              </div>
              <input
                type="checkbox"
                checked={allowMultipleDailyMarks}
                onChange={(e) => setAllowMultipleDailyMarks(e.target.checked)}
                className="w-4 h-4 accent-[#00d4ff] cursor-pointer"
              />
            </div>

            {/* Admin Email */}
            <div>
              <label className="block text-[#4a7a96] mb-1">
                SYSTEM ADMIN EMAIL (ADMIN_EMAIL)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#4a7a96]" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#050a0f] border border-[#0d2a3a] focus:border-[#00d4ff] rounded text-[#cce8f4] outline-none"
                />
              </div>
            </div>

            {/* Admin Phone */}
            <div>
              <label className="block text-[#4a7a96] mb-1">
                ADMIN GSM PHONE NUMBER (ADMIN_PHONE)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#4a7a96]" />
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#050a0f] border border-[#0d2a3a] focus:border-[#00d4ff] rounded text-[#cce8f4] outline-none"
                />
              </div>
            </div>

            {/* Tolerance */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#4a7a96]">FACE MATCH TOLERANCE:</span>
                <span className="text-[#00d4ff] font-bold">{tolerance.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.70"
                step="0.05"
                value={tolerance}
                onChange={(e) => setTolerance(parseFloat(e.target.value))}
                className="w-full accent-[#00d4ff] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#4a7a96] mt-0.5">
                <span>0.30 (Strict)</span>
                <span>0.50 (Default)</span>
                <span>0.70 (Loose)</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#00d4ff] hover:bg-[#33deff] text-black font-bold rounded flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(0,212,255,0.25)] transition-all mt-4"
            >
              <Save className="w-3.5 h-3.5" /> SAVE CONFIGURATION
            </button>
          </form>
        </div>

        {/* Live Notification Feed (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b1520] border border-[#0d2a3a] rounded-lg p-5 flex flex-col font-mono-tech">
          <div className="flex items-center justify-between border-b border-[#0d2a3a] pb-2 mb-3">
            <span className="text-xs text-[#00d4ff] font-semibold">// DISPATCHED ALERTS LOG</span>
            <span className="text-xs text-[#4a7a96]">{notifications.length} events logged</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#4a7a96]">
                <Bell className="w-8 h-8 text-[#4a7a96]/30 mx-auto mb-2" />
                <span>No notifications generated yet.</span>
                <p className="text-[11px] text-[#4a7a96]/70 mt-1">
                  When a face is recognized in the Live Attendance tab, instant Email and SMS logs will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 bg-[#050a0f] border border-[#0d2a3a] rounded flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {notif.type === 'EMAIL' ? (
                        <span className="px-1.5 py-0.5 rounded bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30 text-[10px] font-bold">
                          EMAIL
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/30 text-[10px] font-bold">
                          SMS
                        </span>
                      )}
                      <span className="text-[#4a7a96]">
                        {notif.recipientType} [{notif.recipient}]
                      </span>
                    </div>
                    <span className="text-[#4a7a96]">{notif.timestamp}</span>
                  </div>

                  {notif.subject && (
                    <div className="font-semibold text-[#cce8f4] text-xs mt-0.5">
                      Subject: {notif.subject}
                    </div>
                  )}

                  <div className="text-[11px] text-[#4a7a96] bg-[#0b1520] p-2 rounded mt-1 border border-[#0d2a3a]/50">
                    {notif.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
