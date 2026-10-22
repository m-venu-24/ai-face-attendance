import React, { useState, useEffect } from 'react';
import { Camera, UserPlus, FileSpreadsheet, Users, Bell, Sliders, Activity } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: string;
  isModelReady: boolean;
  todayMarkedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  isModelReady,
  todayMarkedCount,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'attend', label: 'LIVE ATTENDANCE', icon: Camera, badge: null },
    { id: 'register', label: 'REGISTER PERSON', icon: UserPlus, badge: null },
    { id: 'records', label: 'ATTENDANCE LOG', icon: FileSpreadsheet, badge: todayMarkedCount > 0 ? `${todayMarkedCount}` : null },
    { id: 'directory', label: 'REGISTERED USERS', icon: Users, badge: null },
    { id: 'notifications', label: 'ALERTS & LOGS', icon: Bell, badge: null },
    { id: 'settings', label: 'SETTINGS', icon: Sliders, badge: null },
  ];

  return (
    <header className="border-b border-[#0d2a3a] bg-[#050a0f]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & System Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff9d] shadow-[0_0_12px_#00ff9d] animate-pulse"></span>
            <span className="font-mono-tech font-bold text-base tracking-wider text-[#00d4ff]">
              FACE_ATTEND <span className="text-[#00ff9d]">AI</span>
            </span>
          </div>
          <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded border border-[#0d2a3a] text-[#4a7a96] font-mono-tech">
            v2.1 OPENCV/CNN
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono-tech font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_12px_rgba(0,212,255,0.2)]'
                    : 'text-[#4a7a96] hover:text-[#cce8f4] hover:bg-[#0b1520] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00d4ff]' : 'text-[#4a7a96]'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live Status and Clock */}
        <div className="flex items-center gap-3 font-mono-tech text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b1520] border border-[#0d2a3a]">
            <Activity className="w-3 h-3 text-[#00d4ff]" />
            <span className="text-[#4a7a96] text-[11px]">SYS:</span>
            <span
              className={`font-semibold tracking-wide ${
                systemStatus.includes('ERROR')
                  ? 'text-[#ff4060]'
                  : isModelReady
                  ? 'text-[#00ff9d]'
                  : 'text-[#ffb800]'
              }`}
            >
              {systemStatus}
            </span>
          </div>

          <div className="hidden md:block px-2.5 py-1 rounded bg-[#0b1520] border border-[#0d2a3a] text-[#00d4ff]">
            {time}
          </div>
        </div>
      </div>
    </header>
  );
};
