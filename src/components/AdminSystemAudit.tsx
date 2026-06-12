import React, { useState } from 'react';
import { Shield, Eye, Database, Terminal, Users, Layers, Activity, FileSpreadsheet, Trash2, Filter } from 'lucide-react';
import { AuditLog } from '../types';
import { Translations } from '../translations';


interface AdminSystemAuditProps {
  t: Translations;
  accentColor: string;
  auditLogs: AuditLog[];
  onClearLogs?: () => void;
}

export const AdminSystemAuditModule: React.FC<AdminSystemAuditProps> = ({
  t,
  accentColor,
  auditLogs,
  onClearLogs
}) => {
  const [filterModule, setFilterModule] = useState('All');
  const [terminalScrollEnabled, setTerminalScrollEnabled] = useState(true);

  // Administrative metrics counters
  const stats = [
    { label: t.totalUsers, value: '184 Peers', growth: '+14% month velocity', color: '#CCFF00' },
    { label: 'Total Projects Enrolled', value: '42 Active Initiatives', growth: '+22% week momentum', color: '#00E5FF' },
    { label: 'Active Sprint Tasks', value: '109 Tasks Assigned', growth: '4.8 contributors average', color: '#FF007F' },
    { label: 'Shared Learning Assets', value: '78 Resources Shared', growth: '340 downloads recorded', color: '#BD00FF' }
  ];

  const modules = ['All', 'Auth & Security', 'Project Hub', 'TeamFlow Pro', 'Community Portal', 'Resource Center', 'Mentor Connect'];

  const filteredLogs = auditLogs.filter(log => 
    filterModule === 'All' || log.module === filterModule
  );

  return (
    <div className="p-1 md:p-4 space-y-6 font-sans">
      
      {/* Grid of counters summary deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((st, i) => (
          <div key={i} className="bg-[#111111] border border-white/5 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">{st.label}</span>
            <div className="py-4">
              <h4 className="text-xl lg:text-2xl font-black text-white font-display tracking-tight leading-none">{st.value}</h4>
              <span className="text-[10px] font-medium text-slate-400 block mt-1.5">{st.growth}</span>
            </div>
            {/* Corner decorator color highlight */}
            <div className="absolute right-0 bottom-0 w-8 h-8 opacity-10 bg-gradient-to-tr rounded-tl-full" style={{ backgroundColor: st.color }} />
          </div>
        ))}
      </div>

      {/* Analytics visualization layout representation (Module 15/20) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-[#111111] border border-white/5 rounded-[32px] p-6 space-y-6">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 text-[8px] font-bold text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-full font-mono uppercase">
              MODULE 20 METRICS
            </span>
            <h3 className="text-lg font-black text-white font-display">University Engagement Vectors</h3>
            <p className="text-slate-500 text-xs">Dynamic enrollment velocity trends tracking registered users across departments.</p>
          </div>

          {/* SVG Custom graph chart blueprint representation */}
          <div className="h-48 w-full border border-white/5 rounded-2xl relative bg-[#0C0C0C] p-4 flex flex-col justify-between overflow-hidden">
            <svg className="w-full h-full absolute inset-0 opacity-40 p-1" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,80 Q20,60 40,50 T80,20 T100,5" fill="none" stroke={accentColor} strokeWidth="2" />
              <path d="M0,80 Q20,60 40,50 T80,20 T100,5 L100,100 L0,100 Z" fill={`url(#gradient-${accentColor.replace('#','')})`} />
              <defs>
                <linearGradient id={`gradient-${accentColor.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="relative z-10 flex flex-col justify-between h-full text-[9px] font-mono text-slate-500">
              <div className="flex justify-between"><span>Active Peaks (Max 250)</span><span>92% Activity Index</span></div>
              <div className="mt-auto flex justify-between pt-4 border-t border-white/5">
                <span>Month 01</span><span>Month 02</span><span>Month 03</span><span>Month 04 (Current)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
              <span className="text-slate-500 uppercase tracking-wider font-bold block text-[9px]">Top Department</span>
              <span className="text-white text-xs block font-bold mt-1">Computer Science (78%)</span>
            </div>
            <div className="p-3 bg-[#181818] border border-white/5 rounded-xl">
              <span className="text-slate-500 uppercase tracking-wider font-bold block text-[9px]">Highest Skill Demand</span>
              <span className="text-white text-xs block font-bold mt-1">ExpressJS & React state (48%)</span>
            </div>
          </div>
        </div>

        {/* Content Moderation Quick Log Queue (Module 16) */}
        <div className="lg:col-span-5 bg-[#111111] border border-white/5 rounded-[32px] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Reported Flagged Queue</h3>
            <span className="text-[10px] text-red-400 font-bold tracking-tight bg-red-400/15 px-2.5 py-0.5 rounded border border-red-500/20 uppercase">
              PENDING INBOX
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Student posts flag reports recorded under moderation screening protocol validation metrics.</p>

          <div className="space-y-3">
            <div className="p-3 bg-[#161616] border border-white/5 rounded-xl text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white font-mono">Post Reference ID: #post2204</span>
                <span className="text-[9px] text-red-400 font-bold bg-red-400/10 px-1.5 py-0.5 rounded">Spam trigger</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed select-all">
                "Check custom script code cheat sheet to secure grades instantly cheat link info..."
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => alert(`Initiated content deletion procedure for post reference id #post2204`)}
                  className="flex-1 py-1 bg-red-500/25 hover:bg-red-500/35 text-red-400 text-[10px] rounded font-bold cursor-pointer transition"
                >
                  Purge Item
                </button>
                <button
                  onClick={() => alert(`Cleared report log indexes for #post2204`)}
                  className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] rounded font-bold cursor-pointer transition"
                >
                  Dismiss Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal View style Audit Log Streams (Module 18) */}
      <div className="bg-black border border-white/10 rounded-[32px] overflow-hidden p-6 space-y-4 font-mono shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-green-400 animate-pulse" />
            <div>
              <h3 className="text-xs font-black tracking-tight text-white uppercase">University Audit log streams</h3>
              <p className="text-[9px] text-slate-500">Monitoring relational actions indexes and student payload traces</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="bg-[#121212] border border-white/10 text-[10px] text-slate-400 rounded-lg p-2.5 focus:outline-none focus:border-green-400"
              >
                {modules.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {onClearLogs && (
              <button
                onClick={onClearLogs}
                className="p-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[9px] font-bold rounded-lg transition shrink-0 cursor-pointer"
              >
                Flush Logs
              </button>
            )}
          </div>
        </div>

        {/* Console line scrolls */}
        <div 
          className="h-64 overflow-y-auto bg-black p-4 border border-white/5 rounded-2xl text-[10px] text-[#A6E22E] space-y-1.5 scroll-smooth"
          style={{ backgroundImage: 'linear-gradient(rgba(18, 18, 18, 0.4) 1px, transparent 1px)' }}
        >
          {filteredLogs.map(log => (
            <div key={log.id} className="hover:bg-white/5 py-0.5 rounded px-1 transition flex flex-col md:flex-row justify-between gap-2 font-mono">
              <div className="space-x-1.5">
                <span className="text-slate-500">[{log.timestamp}]</span>
                <span className="text-[#00E5FF] font-bold">[{log.module}]</span>
                <span className="text-white font-medium">{log.user}:</span>
                <span className="text-[#CCFF00]">{log.action}</span>
              </div>
              <span className="text-slate-600 block md:inline shrink-0 font-mono">IP: {log.ip}</span>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center text-slate-600 py-8 text-[11px]">
              No audit logs captured under module category index.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
