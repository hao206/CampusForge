import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, Award, MessageSquare, Edit2, Check,
  MapPin, BookOpen, Activity, LayoutGrid
} from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore';
import { useProjectStore } from '../store/useProjectStore';
import { useAuditStore } from '../store/useAuditStore';
import { useUIStore } from '../store/useUIStore';
import { useToastStore } from '../store/useToastStore';
import { UserProfile } from '../types';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const { lang, accent } = useUIStore();

  const currentUser = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const projects = useProjectStore((s) => s.projects);
  const auditLogs = useAuditStore((s) => s.auditLogs);
  const addToast = useToastStore((s) => s.addToast);

  // Determine if viewing own profile
  const isSelf = !userId || userId === 'me' || userId === currentUser?.id || userId === currentUser?.studentId;

  // Active Tab: profile, projects, activity
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'activity'>('profile');
  
  // Follow toggle and follow counter
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(142);

  // Editing state for own profile
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(currentUser?.biography || '');
  const [editMajor, setEditMajor] = useState(currentUser?.major || '');
  const [editGoals, setEditGoals] = useState(currentUser?.careerGoals || '');
  const [editCover, setEditCover] = useState(currentUser?.coverPhoto || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');

  // Mock static profiles for other users
  const getMockUserProfile = (): UserProfile => {
    if (isSelf && currentUser) return currentUser;

    // Search audit log or list of standard leaders
    // We create static detailed profiles
    if (userId?.toLowerCase() === 'linh' || userId === 'u4') {
      return {
        id: 'u4',
        fullName: 'Linh Dang',
        studentId: '73DCTT4551',
        email: 'linh.dang@st.utt.edu.vn',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        coverPhoto: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80',
        faculty: 'Information Security Division',
        major: 'Cyber Security & Cryptography',
        academicYear: 'Senior member',
        biography: 'Certified white-hat penetration consultant. Love auditing middleware routers, SQL indices, and Docker ingress networks.',
        skills: [
          { name: 'Security Core', level: 5 },
          { name: 'NodeJS', level: 4 },
          { name: 'SQL DB', level: 4 },
          { name: 'Docker', level: 3 }
        ],
        interests: ['Secure JWT middlewares', 'Blockchain Consensus', 'Terminal interfaces'],
        careerGoals: 'Becoming an enterprise lead penetration tester.',
        reputationScore: 4210,
        role: 'Student'
      };
    }

    if (userId?.toLowerCase() === 'minh' || userId === 'u3') {
      return {
        id: 'u3',
        fullName: 'Minh Hoang',
        studentId: '73DCTI2250',
        email: 'minh.hoang@st.utt.edu.vn',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        coverPhoto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        faculty: 'IoT & Microcontrollers Unit',
        major: 'Embedded Automation',
        academicYear: 'Designer lead',
        biography: 'Building physical models with Arduino circuits, ultrasonic radar hubs, and web visualization panels.',
        skills: [
          { name: 'C++', level: 5 },
          { name: 'Python', level: 4 },
          { name: 'UI Figma', level: 4 },
          { name: 'MQTT Broker', level: 3 }
        ],
        interests: ['Eco campuses', 'Figma prototypes', 'Microcontrollers'],
        careerGoals: 'Senior Hardware systems developer.',
        reputationScore: 3950,
        role: 'Project Leader'
      };
    }

    // Default matching mockAlex Nguyen
    return {
      id: 'u1',
      fullName: 'Alex Nguyen',
      studentId: '73DCTT1102',
      email: 'alex.n@st.utt.edu.vn',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
      faculty: 'Computer Science Department',
      major: 'Software Engineering',
      academicYear: 'Senior Representative',
      biography: 'Enthusiastic front-end developer and code tutor. Leading Core Module implementations.',
      skills: [
        { name: 'React SPA', level: 5 },
        { name: 'Tailwind SDK', level: 5 },
        { name: 'Typescript', level: 4 }
      ],
      interests: ['SPA structures', 'Agile flows', 'Mentorship'],
      careerGoals: 'Lead SaaS Frontend Solutions Architect.',
      reputationScore: 4890,
      role: 'Project Leader'
    };
  };

  const profile = getMockUserProfile();

  const handleSaveProfile = () => {
    updateProfile({
      biography: editBio,
      major: editMajor,
      careerGoals: editGoals,
      coverPhoto: editCover,
      avatar: editAvatar
    });
    setIsEditing(false);
    addToast(lang === 'en' ? 'Profile details saved successfully!' : 'Đã lưu thông tin hồ sơ!', 'success');
  };

  const handleFollowToggle = () => {
    if (isFollowing) {
      setFollowersCount(c => c - 1);
      setIsFollowing(false);
      addToast(lang === 'en' ? `Unfollowed ${profile.fullName}` : `Đã bỏ theo dõi ${profile.fullName}`, 'info');
    } else {
      setFollowersCount(c => c + 1);
      setIsFollowing(true);
      addToast(lang === 'en' ? `Now following ${profile.fullName}!` : `Đã theo dõi ${profile.fullName}!`, 'success');
    }
  };

  // Get active badge string
  const getBadgeRank = (reputation: number) => {
    if (reputation >= 4000) return '🏅 Platinum Knight • Hiệp Sĩ Bạch Kim';
    if (reputation >= 3000) return '🛡️ Golden Guard • Cận Vệ Hoàng Gia';
    if (reputation >= 2000) return '⭐️ Skilled Elite • Chiến Binh Tinh Nhuệ';
    return '🌱 Emerging Recruit • Chuyên Viên Học Việc';
  };

  // Filter projects associated with this profile
  const userProjects = projects.filter(proj => 
    proj.leaderId === profile.id || proj.leaderName === profile.fullName
  );

  // Filter audit logs associated with this profile
  const userActivity = auditLogs.filter(log => 
    log.user === profile.fullName
  );

  return (
    <div className="p-1 md:p-6 space-y-6 font-sans">
      {/* Cover Banner */}
      <div className="relative h-48 md:h-64 rounded-[32px] overflow-hidden border border-white/5 bg-[#161616]">
        <img 
          src={isSelf ? (currentUser?.coverPhoto || editCover) : profile.coverPhoto} 
          className="w-full h-full object-cover opacity-80" 
          alt="profile cover" 
        />
        
        {isEditing && isSelf && (
          <div className="absolute top-4 right-4 bg-black/75 p-3 rounded-2xl border border-white/10 space-y-2 max-w-xs">
            <label className="text-[9px] uppercase tracking-wider font-bold text-[#CCFF00] block">Change Cover Photo Link</label>
            <input 
              type="text" 
              value={editCover} 
              onChange={(e) => setEditCover(e.target.value)}
              className="w-full bg-[#111111] text-white text-[10px] p-2 rounded-lg border border-white/5 focus:outline-none"
              placeholder="Unsplash background image URL..."
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      </div>

      {/* Main details overlap container */}
      <div className="relative -mt-20 px-4 md:px-8 flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar with indicator */}
        <div className="relative">
          <img 
            src={isSelf ? (currentUser?.avatar || editAvatar) : profile.avatar} 
            className="w-32 h-32 rounded-[28px] object-cover border-4 border-[#050505] shadow-2xl shrink-0" 
            alt="profile avatar" 
          />
          <div className="absolute right-1 bottom-1 w-5 h-5 bg-emerald-500 border-4 border-[#050505] rounded-full animate-pulse" title="Active Sessions Authenticated" />
        </div>

        {/* Text descriptions */}
        <div className="flex-1 space-y-3 pt-6 md:pt-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{profile.fullName}</h1>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] uppercase tracking-wider font-bold font-mono rounded">
                  online
                </span>
                <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-white text-[9px] tracking-wider rounded font-mono font-bold uppercase">
                  {profile.role || 'Member'}
                </span>
              </div>
              <p className="text-slate-400 text-xs font-mono">{profile.email} • ID: {profile.studentId}</p>
            </div>

            {/* Interactions tools */}
            <div className="flex gap-2.5">
              {!isSelf ? (
                <>
                  <button 
                    onClick={handleFollowToggle}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer select-none"
                    style={{ 
                      backgroundColor: isFollowing ? 'rgba(255,255,255,0.05)' : accent,
                      color: isFollowing ? '#ffffff' : '#000000',
                      border: isFollowing ? '1px border white/10' : 'none'
                    }}
                  >
                    {isFollowing ? (lang === 'en' ? 'Following ✓' : 'Đang theo dõi ✓') : (lang === 'en' ? 'Follow' : 'Theo dõi')}
                  </button>
                  <button 
                    onClick={() => addToast(lang === 'en' ? 'Mock Inbox Channel initialized' : 'Kênh liên lạc mô phỏng được khởi tạo', 'info')}
                    className="p-2.5 bg-white/5 text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </>
              ) : isEditing ? (
                <button 
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black uppercase rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" /> {lang === 'en' ? 'Save Changes' : 'Lưu Thay đổi'}
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> {lang === 'en' ? 'Edit Profile' : 'Chỉnh sửa'}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-slate-500" /> {profile.faculty}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> UTT campus ground</span>
            <span className="px-2 py-0.5 bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] font-bold text-[9px] rounded font-mono">
              ★ {profile.reputationScore} XP
            </span>
          </div>
        </div>
      </div>

      {/* Grid Content splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        
        {/* Left Stats Section */}
        <div className="space-y-6">
          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">{lang === 'en' ? 'Academic Prestige' : 'Điểm Uy Tín & Huy Chương'}</h3>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
              <Award className="w-10 h-10 text-yellow-500 shrink-0" />
              <div>
                <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-mono font-bold">Prestige Class Badge</span>
                <span className="text-xs font-black text-white">{getBadgeRank(profile.reputationScore)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-center">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[18px] font-black text-white font-mono">{followersCount}</span>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">{lang === 'en' ? 'Followers' : 'Người theo dõi'}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[18px] font-black text-white font-mono">{userProjects.length}</span>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">{lang === 'en' ? 'Agile Teams' : 'Đội Ngũ Đảm Nhiệm'}</span>
              </div>
            </div>
          </div>

          {/* Core Mastered Skills panel */}
          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">{lang === 'en' ? 'Graduation Skills' : 'Năng Lực Tốt Nghiệp'}</h3>
            <div className="space-y-3">
              {profile.skills.length > 0 ? profile.skills.map((skill, si) => (
                <div key={si} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>{skill.name}</span>
                    <span>{skill.level}/5 Mastered</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#CCFF00] rounded-full" style={{ width: `${(skill.level / 5) * 100}%` }} />
                  </div>
                </div>
              )) : (
                <span className="text-xs text-slate-500 block font-mono">No specialized skills defined.</span>
              )}
            </div>

            {isEditing && isSelf && (
              <div className="pt-3 border-t border-white/5 space-y-2">
                <label className="text-[9px] uppercase tracking-wider font-bold text-[#CCFF00] block">Change avatar link</label>
                <input 
                  type="text" 
                  value={editAvatar} 
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-black/40 text-xs text-slate-300 p-2.5 rounded-lg border border-white/5 focus:outline-none"
                  placeholder="Unsplash photo avatar URL..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Tab Content module (occupies 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Selector Headers */}
          <div className="flex bg-[#111111] border border-white/5 rounded-[22px] p-1.5">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 rounded-xl cursor-pointer ${
                activeTab === 'profile' ? 'bg-[#050505] border border-white/5 text-[#CCFF00]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" /> {lang === 'en' ? 'Bio & Profile' : 'Tiểu sử'}
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-3 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 rounded-xl cursor-pointer ${
                activeTab === 'projects' ? 'bg-[#050505] border border-white/5 text-[#CCFF00]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> {lang === 'en' ? 'Active Projects' : 'Đề Tài Tự Phát'} ({userProjects.length})
            </button>
            <button 
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-3 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 rounded-xl cursor-pointer ${
                activeTab === 'activity' ? 'bg-[#050505] border border-white/5 text-[#CCFF00]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> {lang === 'en' ? 'Activity Timeline' : 'Nhật ký Hoạt Động'} ({userActivity.length})
            </button>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 min-h-[300px]">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Biography */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest font-mono">Consolidated Academic Bio</h4>
                  {isSelf && isEditing ? (
                    <textarea 
                      value={editBio} 
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full bg-black/40 border border-white/5 text-slate-300 text-xs p-3 rounded-xl focus:outline-none focus:border-white/20"
                    />
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {isSelf ? currentUser?.biography : profile.biography}
                    </p>
                  )}
                </div>

                {/* Major metadata Focus */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest font-mono">Focus Area / Major Degree focus</h4>
                  {isSelf && isEditing ? (
                    <input 
                      type="text" 
                      value={editMajor} 
                      onChange={(e) => setEditMajor(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 text-slate-300 text-xs p-3 rounded-xl focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-white font-bold font-mono">
                      {profile.major}
                    </p>
                  )}
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest font-mono">Core Career Targets</h4>
                  {isSelf && isEditing ? (
                    <textarea 
                      value={editGoals} 
                      onChange={(e) => setEditGoals(e.target.value)}
                      rows={2}
                      className="w-full bg-black/40 border border-white/5 text-slate-300 text-xs p-3 rounded-xl focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {profile.careerGoals || 'No goals specified yet. Click edit profile to add career aspirations.'}
                    </p>
                  )}
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest font-mono">Personal Interests & Focus</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile.interests.map((intel, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/5 text-slate-300 rounded-lg text-[10px] font-mono border border-white/5">
                        💡 {intel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest font-mono mb-2">Registered Project Workspace Grid</h4>
                {userProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProjects.map((p) => (
                      <div key={p.id} className="p-4 bg-black/30 border border-white/5 rounded-2xl space-y-3">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-[#CCFF00] font-mono font-bold">{p.category}</span>
                          <h5 className="text-xs font-black text-white leading-tight mt-0.5">{p.name}</h5>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Completeness Progress</span>
                            <span>{p.progress}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-xs text-slate-500 font-mono">
                    No registered project proposals for this developer logged.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h4 className="text-xs uppercase text-slate-500 font-bold tracking-widest font-mono mb-2">Academic Audit Trails Timeline</h4>
                {userActivity.length > 0 ? (
                  <div className="relative border-l-2 border-white/5 ml-3 pl-6 space-y-6 pt-2">
                    {userActivity.map((log) => (
                      <div key={log.id} className="relative space-y-1.5">
                        {/* Dot indicator */}
                        <div className="absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#111111]" />
                        
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>{log.timestamp}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 bg-white/5 text-slate-300 rounded">{log.module}</span>
                        </div>
                        <p className="text-xs font-bold text-white leading-snug">{log.action}</p>
                        <span className="text-[9px] font-mono text-slate-500">Secure Audit Node verification: {log.ip}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-xs text-slate-500 font-mono">
                    No recorded activities logged for this academic user.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
