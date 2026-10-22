import React, { useState } from 'react';
import { Download, Search, Trash2, Calendar, UserCheck, CheckCircle2, RefreshCw, Plus, Clock, FileSpreadsheet } from 'lucide-react';
import { AttendanceRecord, AttendanceSummary, RegisteredUser } from '../types';

interface AttendanceLogsProps {
  records: AttendanceRecord[];
  summary: AttendanceSummary | null;
  registeredUsers: RegisteredUser[];
  onRefresh: () => void;
  onDeleteRecord: (id: string) => Promise<void>;
  onClearRecords: (filter?: 'today' | 'all') => Promise<void>;
  onManualMark: (name: string) => Promise<boolean>;
}

export const AttendanceLogs: React.FC<AttendanceLogsProps> = ({
  records,
  summary,
  registeredUsers,
  onRefresh,
  onDeleteRecord,
  onClearRecords,
  onManualMark,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [manualName, setManualName] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesName = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || r.date === dateFilter;
    return matchesName && matchesDate;
  });

  // Export CSV handler
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/attendance/csv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    await onManualMark(manualName.trim());
    setManualName('');
    setShowManualModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0b1520] border border-[#0d2a3a] rounded-lg p-4 font-mono-tech">
          <div className="text-[11px] text-[#4a7a96] uppercase tracking-wider mb-1">
            MARKED TODAY
          </div>
          <div className="text-2xl font-bold text-[#00ff9d]">
            {summary?.todayCount ?? 0}
          </div>
          <div className="text-[10px] text-[#4a7a96] mt-1">
            Date: {summary?.todayDate || new Date().toISOString().split('T')[0]}
          </div>
        </div>

        <div className="bg-[#0b1520] border border-[#0d2a3a] rounded-lg p-4 font-mono-tech">
          <div className="text-[11px] text-[#4a7a96] uppercase tracking-wider mb-1">
            REGISTERED PROFILES
          </div>
          <div className="text-2xl font-bold text-[#00d4ff]">
            {summary?.registeredCount ?? registeredUsers.length}
          </div>
          <div className="text-[10px] text-[#4a7a96] mt-1">Known identities in DB</div>
        </div>

        <div className="bg-[#0b1520] border border-[#0d2a3a] rounded-lg p-4 font-mono-tech">
          <div className="text-[11px] text-[#4a7a96] uppercase tracking-wider mb-1">
            TODAY'S RATE
          </div>
          <div className="text-2xl font-bold text-[#cce8f4]">
            {summary?.attendanceRate ?? 0}%
          </div>
          <div className="text-[10px] text-[#4a7a96] mt-1">
            {summary?.uniqueTodayPersons ?? 0} of {registeredUsers.length} present
          </div>
        </div>

        <div className="bg-[#0b1520] border border-[#0d2a3a] rounded-lg p-4 font-mono-tech">
          <div className="text-[11px] text-[#4a7a96] uppercase tracking-wider mb-1">
            TOTAL HISTORICAL
          </div>
          <div className="text-2xl font-bold text-[#cce8f4]">
            {records.length}
          </div>
          <div className="text-[10px] text-[#4a7a96] mt-1">attendance.csv rows</div>
        </div>
      </div>

      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0b1520] border border-[#0d2a3a] p-3 rounded-lg">
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#4a7a96]" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#050a0f] border border-[#0d2a3a] focus:border-[#00d4ff] rounded text-xs font-mono-tech text-[#cce8f4] outline-none w-44 sm:w-56"
            />
          </div>

          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#4a7a96]" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-[#050a0f] border border-[#0d2a3a] focus:border-[#00d4ff] rounded text-xs font-mono-tech text-[#cce8f4] outline-none"
            />
          </div>

          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-[11px] font-mono-tech text-[#00d4ff] hover:underline"
            >
              Clear date
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="px-3 py-1.5 bg-[#0b1520] hover:bg-[#122232] border border-[#0d2a3a] text-[#00d4ff] rounded text-xs font-mono-tech font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3 h-3" /> MANUAL ENTRY
          </button>

          <button
            onClick={onRefresh}
            className="p-1.5 bg-[#0b1520] hover:bg-[#122232] border border-[#0d2a3a] text-[#4a7a96] hover:text-[#cce8f4] rounded text-xs font-mono-tech transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExporting || records.length === 0}
            className="px-3 py-1.5 bg-[#00d4ff] hover:bg-[#33deff] text-black rounded text-xs font-mono-tech font-bold flex items-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(0,212,255,0.2)] disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" /> EXPORT CSV
          </button>

          <button
            onClick={() => onClearRecords('today')}
            className="px-2.5 py-1.5 bg-[#ff4060]/10 hover:bg-[#ff4060]/20 border border-[#ff4060]/30 text-[#ff4060] rounded text-xs font-mono-tech transition-colors"
            title="Clear today's logs"
          >
            RESET TODAY
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-[#0b1520] border border-[#0d2a3a] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-tech text-xs">
            <thead className="bg-[#050a0f] border-b border-[#0d2a3a] text-[#4a7a96] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">NAME</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">CONFIDENCE</th>
                <th className="py-3 px-4">VERIFICATION</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0d2a3a]/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#4a7a96]">
                    <FileSpreadsheet className="w-8 h-8 text-[#4a7a96]/30 mx-auto mb-2" />
                    <span>No attendance records matching filter criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className="hover:bg-[#050a0f]/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-[#4a7a96]">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-[#cce8f4]">
                      {record.name}
                    </td>
                    <td className="py-3 px-4 text-[#4a7a96]">{record.date}</td>
                    <td className="py-3 px-4 text-[#00d4ff] flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#4a7a96]" />
                      {record.time}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/30 text-[11px]">
                        {record.confidence || 96}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 text-[#00ff9d]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {record.status || 'Verified'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteRecord(record.id)}
                        className="text-[#4a7a96] hover:text-[#ff4060] transition-colors p-1"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info matching README output table */}
        <div className="p-3 bg-[#050a0f] border-t border-[#0d2a3a] font-mono-tech text-[11px] text-[#4a7a96] flex flex-wrap items-center justify-between gap-2">
          <span>
            SHOWING <strong>{filteredRecords.length}</strong> OF <strong>{records.length}</strong> TOTAL LOGGED ENTRIES
          </span>
          <span>OUTPUT FILE: <strong className="text-[#00d4ff]">attendance.csv</strong> & SQLITE DB</span>
        </div>
      </div>

      {/* Manual Attendance Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-[#0b1520] border border-[#00d4ff]/40 rounded-lg p-5 max-w-sm w-full font-mono-tech space-y-4 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
            <h3 className="text-sm font-bold text-[#00d4ff] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#00ff9d]" /> MANUAL ATTENDANCE OVERRIDE
            </h3>
            <p className="text-xs text-[#4a7a96]">
              Select a registered user or enter name to manually record attendance for today's session.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-[#4a7a96] mb-1">SELECT REGISTERED USER:</label>
                <select
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050a0f] border border-[#0d2a3a] rounded text-xs text-[#cce8f4] outline-none"
                >
                  <option value="">-- Choose Person --</option>
                  {registeredUsers.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#4a7a96] mb-1">OR ENTER NAME:</label>
                <input
                  type="text"
                  placeholder="e.g. Venu"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050a0f] border border-[#0d2a3a] rounded text-xs text-[#cce8f4] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-2 bg-[#050a0f] border border-[#0d2a3a] text-[#4a7a96] rounded text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!manualName.trim()}
                  className="flex-1 py-2 bg-[#00d4ff] text-black font-bold rounded text-xs hover:bg-[#33deff] disabled:opacity-40"
                >
                  RECORD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
