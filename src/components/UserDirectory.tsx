import React, { useState } from 'react';
import { Users, Mail, Phone, Calendar, Trash2, UserPlus, CheckCircle2, Shield } from 'lucide-react';
import { RegisteredUser } from '../types';

interface UserDirectoryProps {
  users: RegisteredUser[];
  onDeleteUser: (id: string) => Promise<void>;
  onNavigateRegister: () => void;
  todayMarkedNames: Set<string>;
}

export const UserDirectory: React.FC<UserDirectoryProps> = ({
  users,
  onDeleteUser,
  onNavigateRegister,
  todayMarkedNames,
}) => {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0d2a3a] pb-4">
        <div>
          <h2 className="font-mono-tech text-lg font-bold text-[#00d4ff] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00ff9d]" />
            REGISTERED USERS & CONTACT DIRECTORY
          </h2>
          <p className="text-xs text-[#4a7a96] mt-0.5">
            Profiles stored in model encodings index (encodings.pkl) with contact notification credentials.
          </p>
        </div>

        <button
          onClick={onNavigateRegister}
          className="px-3.5 py-2 bg-[#00d4ff] hover:bg-[#33deff] text-black font-mono-tech text-xs font-bold rounded flex items-center gap-2 shadow-[0_0_12px_rgba(0,212,255,0.25)] transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          REGISTER NEW PERSON
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Filter registered users by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md w-full px-3.5 py-2 bg-[#0b1520] border border-[#0d2a3a] focus:border-[#00d4ff] rounded text-xs font-mono-tech text-[#cce8f4] outline-none"
        />
        <div className="text-xs font-mono-tech text-[#4a7a96]">
          SHOWING <strong className="text-[#00d4ff]">{filteredUsers.length}</strong> PROFILES
        </div>
      </div>

      {/* Grid of Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isMarkedToday = todayMarkedNames.has(user.name);
          return (
            <div
              key={user.id}
              className="bg-[#0b1520] border border-[#0d2a3a] hover:border-[#00d4ff]/40 rounded-lg p-4 font-mono-tech transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff] font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#cce8f4]">{user.name}</h4>
                      <span className="text-[10px] text-[#4a7a96]">
                        {user.samplesCount} trained face samples
                      </span>
                    </div>
                  </div>

                  {isMarkedToday ? (
                    <span className="px-2 py-0.5 rounded bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40 text-[10px] flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> MARKED TODAY
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-[#050a0f] text-[#4a7a96] border border-[#0d2a3a] text-[10px]">
                      AWAITING TODAY
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-[#4a7a96] my-3 border-t border-[#0d2a3a]/60 pt-2.5">
                  <div className="flex items-center gap-2 text-[11px] truncate">
                    <Mail className="w-3.5 h-3.5 text-[#00d4ff] shrink-0" />
                    <span className="text-[#cce8f4] truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-[#00ff9d] shrink-0" />
                    <span className="text-[#cce8f4]">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <Calendar className="w-3.5 h-3.5 text-[#4a7a96] shrink-0" />
                    <span>Registered: {user.registeredAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#0d2a3a]/60 pt-2 text-[11px]">
                <span className="text-[#4a7a96] flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#00d4ff]" /> Biometric OK
                </span>
                <button
                  onClick={() => onDeleteUser(user.id)}
                  className="text-[#4a7a96] hover:text-[#ff4060] transition-colors p-1"
                  title="Remove person"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
