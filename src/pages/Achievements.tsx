import React from 'react';
import { Award, Zap } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { translations } from '../translations';
import { INITIAL_LEADERBOARD } from '../data';

export const Achievements: React.FC = () => {
  const { lang } = useUIStore();
  const t = translations[lang];
  const user = useAuthStore((s) => s.user);

  // Extend rankings to put current user's actual XP progress dynamically! (Part D3)
  const isUserIncludedInLeaderboard = INITIAL_LEADERBOARD.some(student => student.name === user?.fullName);
  const derivedLeaderboardList = [...INITIAL_LEADERBOARD];
  
  if (user && !isUserIncludedInLeaderboard) {
    // Add current user details dynamically
    derivedLeaderboardList.push({
      rank: 10,
      name: user.fullName,
      avatar: user.avatar,
      badges: ['🏅 Custom Member'],
      xp: user.reputationScore
    });
  }

  // Sort by XP score desc
  const sortedLeaderboard = derivedLeaderboardList.sort((a, b) => b.xp - a.xp);

  const badgeRankings = [
    { title: '🏆 Team Leader • Trưởng Nhóm Agile', desc: 'Successfully created a project and filled mock recruitment queues.', xp: 'Unlocked' },
    { title: '💻 Frontend Master • Chuyên Gia Frontend', desc: 'Possess React 19 + Tailwind v4 + State parameters of 4.5/5.', xp: 'Unlocked' },
    { title: '🛡️ Security Scout • Trinh Sát Bảo Mật', desc: 'Verifying parameter protections and JWT route constraints.', xp: '700 XP' },
    { title: '🔥 Top Contributor • Lực Lượng Nòng Cốt', desc: 'Exceed 4,000 XP cumulative academic reputation credits.', xp: '4k XP' },
    { title: '👨‍🏫 Community Helper • Đại Sứ Cộng Đồng', desc: 'Submit over 50 social comments logs inside discussion topics.', xp: '1.5k XP' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* Level Up details card */}
      <div className="lg:col-span-2 bg-[#111111] border border-white/5 rounded-[32px] p-6 lg:p-8 space-y-6">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 text-[8px] font-bold text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-full font-mono uppercase">
            XP PROGRESS TREE
          </span>
          <h3 className="text-xl font-bold font-display text-white">CampusForge Badging Index</h3>
          <p className="text-slate-400 text-xs">Accumulate XP points by contributing source code, uploading resources, writing comments, or completing tasks.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#181818] border border-white/5 rounded-2xl space-y-1">
            <span className="text-slate-500 font-semibold text-[9px] uppercase font-mono">Active Badge Rank</span>
            <span className="text-white font-bold block text-sm">💻 Frontend Master</span>
          </div>
          <div className="p-4 bg-[#181818] border border-white/5 rounded-2xl space-y-1">
            <span className="text-slate-500 font-semibold text-[9px] uppercase font-mono">Next Badge Threshold</span>
            <span className="text-white font-bold block text-sm">🛡️ Security Warden (+360 XP)</span>
          </div>
        </div>

        {/* List of possible badges */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Academic Prestige Medals Catalog</h4>
          
          <div className="space-y-2">
            {badgeRankings.map(badge => (
              <div 
                key={badge.title} 
                className="p-3 bg-[#161616]/70 hover:bg-[#161616] transition rounded-xl border border-white/5 flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{badge.title}</span>
                  <span className="text-slate-500 text-[10px]">{badge.desc}</span>
                </div>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                  badge.xp === 'Unlocked' ? 'bg-[#CCFF00]/15 text-[#CCFF00]' : 'bg-slate-800 text-slate-400'
                }`}>
                  {badge.xp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Campus Leaderboard */}
      <div className="bg-[#111111] border border-white/5 rounded-[24px] p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider">Top Contributor Rankings</h3>
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        
        <div className="space-y-4 pt-2">
          {sortedLeaderboard.map((student, i) => {
            const isMe = student.name === user?.fullName;
            return (
              <div 
                key={student.name + '-' + i} 
                className={`flex justify-between items-center p-2 rounded-xl transition ${
                  isMe ? 'bg-[#CCFF00]/5 border border-[#CCFF00]/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold font-mono text-slate-500 w-4">{i + 1}</span>
                  <img src={student.avatar} className="w-8 h-8 rounded-full border border-white/5 object-cover shrink-0" alt="avatar" />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      {student.name}
                      {isMe && <span className="text-[8px] font-bold text-[#CCFF00] font-mono bg-[#CCFF00]/10 px-1 py-0.2 rounded">YOU</span>}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-mono italic">{student.badges ? student.badges[0] : 'Contributor'}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-white">{student.xp} XP</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
