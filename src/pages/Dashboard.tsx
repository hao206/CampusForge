import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, TrendingUp
} from 'lucide-react';

import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectStore } from '../store/useProjectStore';
import { useTaskStore } from '../store/useTaskStore';
import { translations } from '../translations';
import { INITIAL_LEADERBOARD } from '../data';

// Recharts imports for Part D1
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { lang, accent } = useUIStore();
  const t = translations[lang];

  const user = useAuthStore((s) => s.user);
  const projects = useProjectStore((s) => s.projects);
  const tasks = useTaskStore((s) => s.tasks);

  const [widgetTaskFilter, setWidgetTaskFilter] = useState<'All' | 'High'>('All');

  // Filter tasks assigned to current user
  const userFilteredTasks = tasks.filter(task => {
    const isMe = user && task.assignedTo === user.fullName;
    if (!isMe) return false;
    if (widgetTaskFilter === 'High') return task.priority === 'High';
    return true;
  });

  // Calculate dynamic Sprint completion stats
  const completedTasks = tasks.filter(t => t.status === 'Done').length;

  // Derive charts data for Part D1 from auditLogs or fallback on structured mock data sets
  // Mock data representing Last 7 Days Completed Tasks
  const taskProgressData = [
    { name: lang === 'en' ? 'Mon' : 'T2', value: 2 },
    { name: lang === 'en' ? 'Tue' : 'T3', value: 4 },
    { name: lang === 'en' ? 'Wed' : 'T4', value: 3 },
    { name: lang === 'en' ? 'Thu' : 'T5', value: 5 },
    { name: lang === 'en' ? 'Fri' : 'T6', value: 6 },
    { name: lang === 'en' ? 'Sat' : 'T7', value: 4 },
    { name: lang === 'en' ? 'Sun' : 'CN', value: completedTasks },
  ];

  // Mock data representing Reputation XP accumulation trend
  const xpGrowthData = [
    { name: 'Day 1', value: 2000 },
    { name: 'Day 2', value: 2150 },
    { name: 'Day 3', value: 2300 },
    { name: 'Day 4', value: 2450 },
    { name: 'Day 5', value: 2600 },
    { name: 'Day 6', value: 2750 },
    { name: 'Day 7', value: user?.reputationScore || 2840 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* Visual Sprint Intro Banner */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 lg:p-8 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <span className="px-3 py-1 bg-[#CCFF00]/10 text-[#CCFF00] text-[9px] font-mono font-bold rounded-full border border-[#CCFF00]/30 uppercase tracking-widest" style={{ color: accent, borderColor: `${accent}40`, backgroundColor: `${accent}12` }}>
              {t.sprintActive}
            </span>
            <h1 className="text-3xl lg:text-4xl font-black text-white mt-4 font-display tracking-tight leading-tight">
              {t.appName} {t.studentDashboardTitle}
            </h1>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              {t.welcomeFrameworkDesc}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex -space-x-2.5">
                {INITIAL_LEADERBOARD.map((p, i) => (
                  <img key={i} src={p.avatar} className="w-8 h-8 rounded-full border-2 border-[#111111] object-cover" alt="peer" />
                ))}
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-bold">+16 {t.activeStudentsContributing}</span>
              <button 
                onClick={() => navigate('/teamflow')}
                className="px-5 py-2.5 rounded-full text-black font-black text-xs uppercase tracking-wider hover:opacity-90 transition cursor-pointer self-start"
                style={{ backgroundColor: accent }}
              >
                {t.openKanban}
              </button>
            </div>
          </div>
          {/* Ambient layout graphic blobs */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 blur-[90px] opacity-20 rounded-full" style={{ backgroundColor: accent }} />
        </div>

        {/* Secondary bento-grid widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Widget 1: Personal checklist */}
          <div className="bg-[#111111] border border-white/5 rounded-[24px] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">{t.yourTasks}</h3>
              <div className="flex gap-2">
                {(['All', 'High'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setWidgetTaskFilter(f)}
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      widgetTaskFilter === f ? 'bg-white/10 text-white' : 'text-slate-500'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {userFilteredTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => navigate('/teamflow')}
                  className="p-3 bg-[#161616] border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{task.title}</div>
                    <span className="text-[9px] text-slate-500 font-mono block">{lang === 'en' ? 'Sprint Item Due:' : 'Thời hạn hoàn thành:'} {task.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 bg-white/5 text-slate-400 font-mono rounded">
                      {task.status}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                        task.priority === 'High' ? 'bg-red-500' : 'bg-yellow-400'
                    }`} />
                  </div>
                </div>
              ))}

              {userFilteredTasks.length === 0 && (
                <div className="text-center text-xs text-slate-600 py-6 font-mono border border-dashed border-white/5 rounded-xl">
                  {t.emptyTaskChecklist}
                </div>
              )}
            </div>
          </div>

          {/* Widget 2: Matched opportunities suggestion */}
          <div className="bg-[#111111] border border-white/5 rounded-[24px] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">{t.topMatches}</h3>
              <span onClick={() => navigate('/projects')} className="text-[10px] text-slate-400 cursor-pointer hover:underline font-mono">{t.projectHub} →</span>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 3).map((p, idx) => (
                <div key={p.id} className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 shrink-0 flex items-center justify-center text-xs text-[#00E5FF] font-mono italic">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                    <p className="text-[9px] text-slate-500 truncate">{p.category} • {lang === 'en' ? 'Required:' : 'Yêu cầu:'} {p.requiredSkills.slice(0, 3).join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Part D1: Analytics Widget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tasks Completed Bar Chart */}
          <div className="bg-[#111111] border border-white/5 rounded-[24px] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
                {lang === 'en' ? 'Velocity: Cards Done / Week' : 'Tốc độ: Số nhiệm vụ xong / Tuần'}
              </h4>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskProgressData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={10} stroke="#475569" tickLine={false} />
                  <YAxis fontSize={10} stroke="#475569" tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} 
                    labelStyle={{ fontSize: '10px', color: '#94a3b8' }}
                    itemStyle={{ fontSize: '11px', color: '#ffffff' }}
                  />
                  <Bar dataKey="value" fill={accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* XP Gained Line Chart */}
          <div className="bg-[#111111] border border-white/5 rounded-[24px] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
                {lang === 'en' ? 'Reputation Growth Trend' : 'Biểu đồ tích lũy điểm Uy tín'}
              </h4>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={xpGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={10} stroke="#475569" tickLine={false} />
                  <YAxis fontSize={10} stroke="#475569" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111111', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} 
                    labelStyle={{ fontSize: '10px', color: '#94a3b8' }}
                    itemStyle={{ fontSize: '11px', color: '#ffffff' }}
                  />
                  <Line type="monotone" dataKey="value" stroke={accent} strokeWidth={2.5} dot={{ fill: '#050505', stroke: accent, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Right col: Profile summary radar & Achievements widgets */}
      <div className="lg:col-span-4 space-y-6">
        {user ? (
          <div className="bg-[#111111] border border-white/5 rounded-[24px] p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4 text-center pb-4 border-b border-white/5">
              <div className="relative inline-block cursor-pointer" onClick={() => navigate('/profile/me')}>
                <img 
                  src={user.avatar} 
                  className="w-16 h-16 rounded-full border-2 border-white/10 object-cover mx-auto" 
                  alt="me" 
                />
                <div className="w-4.5 h-4.5 bg-green-500 rounded-full border-2 border-[#111111] absolute bottom-0 right-0" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white tracking-wide hover:text-[#CCFF00] cursor-pointer transition-colors" onClick={() => navigate('/profile/me')}>
                  {user.fullName}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">{user.studentId} • {user.role === 'Guest' ? t.userRoleGuest : user.role === 'Admin' ? 'Administrator' : 'CS Sophomore'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block tracking-wider">
                {t.graduationSkills}
              </span>

              <div className="space-y-3">
                {user.skills && user.skills.map(s => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
                      <span>{s.name}</span>
                      <span>{lang === 'en' ? 'Level' : 'Cấp'} {s.level}/5</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${s.level * 20}%`, backgroundColor: accent }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => navigate('/settings')}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase rounded-xl transition cursor-pointer"
            >
              {t.upgradeProfile}
            </button>
          </div>
        ) : (
          <div className="bg-[#111111] border border-white/5 rounded-[24px] p-6 text-center text-slate-400 text-xs">
            {lang === 'en' ? 'Please log in to see profile stats.' : 'Vui lòng đăng nhập để xem thông tin cá nhân.'}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
