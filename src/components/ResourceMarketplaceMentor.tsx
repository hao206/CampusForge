import React, { useState } from 'react';
import { Download, Upload, Sparkles, Star, HelpCircle, Check, Search } from 'lucide-react';
import { Resource, SkillExchangeOffer, Mentor } from '../types';
import { SKILL_EXCHANGE_DATA, INITIAL_MENTORS } from '../data';

// Zustand stores
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { useResourceStore } from '../store/useResourceStore';
import { useAuditStore } from '../store/useAuditStore';
import { useToastStore } from '../store/useToastStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { translations } from '../translations';

interface ResourceMarketplaceMentorProps {
  currentUserRole?: string;
}

export const ResourceMarketplaceMentorModule: React.FC<ResourceMarketplaceMentorProps> = ({
  currentUserRole
}) => {
  const { lang, accent: accentColor } = useUIStore();
  const t = translations[lang];

  const user = useAuthStore((s) => s.user);
  const resources = useResourceStore((s) => s.resources);
  const addResource = useResourceStore((s) => s.addResource);
  const incrementDownloads = useResourceStore((s) => s.incrementDownloads);

  const addLog = useAuditStore((s) => s.addLog);
  const addToast = useToastStore((s) => s.addToast);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addReputation = useAuthStore((s) => s.addReputation);

  const activeUserRole = currentUserRole || user?.role || 'Student';

  const [activeTab, setActiveTab] = useState<'resources' | 'skills' | 'mentors'>('resources');
  
  // Resource states
  const [searchResQuery, setSearchResQuery] = useState('');
  const [resCatFilter, setResCatFilter] = useState('All');
  const [newResTitle, setNewResTitle] = useState('');
  const [newResCat, setNewResCat] = useState<Resource['category']>('Template');

  // Skill marketplace states
  const [skillsSearch, setSkillsSearch] = useState('');
  const [matchSuggestion, setMatchSuggestion] = useState<SkillExchangeOffer | null>(null);

  // Mentor states
  const [mentorsList, setMentorsList] = useState<Mentor[]>(INITIAL_MENTORS);
  const [questionText, setQuestionText] = useState('');
  const [bookedSessions, setBookedSessions] = useState<Record<string, boolean>>({});
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  const [showGuestBlockModal, setShowGuestBlockModal] = useState(false);
  const [guestBlockContext, setGuestBlockContext] = useState('');

  const triggerGuestIntercept = (act: string) => {
    setGuestBlockContext(act);
    setShowGuestBlockModal(true);
  };

  // Resource functions
  const handleUploadResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUserRole === 'Guest') {
      triggerGuestIntercept(lang === 'en' ? 'Publish Educational Resource File' : 'Đăng tải Giáo trình & Tài liệu học tập');
      return;
    }
    if (!newResTitle) return;

    if (newResTitle.length < 5) {
      addToast(
        lang === 'en' ? 'Resource title must be at least 5 characters.' : 'Tiêu đề tài liệu phải có ít nhất 5 ký tự.',
        'error'
      );
      return;
    }

    addResource(
      newResTitle,
      newResCat,
      '2.4 MB',
      user?.fullName || 'Academic Peer'
    );

    addLog(`Uploaded database shared resource file: ${newResTitle}`, 'Resource Center', user?.fullName || 'Academic Peer');
    addReputation(50);
    addToast(lang === 'en' ? 'Document uploaded successfully +50 XP!' : 'Đồng bộ tài liệu thành công +50 XP!', 'success');
    
    setNewResTitle('');
  };

  const handleDownloadClick = (id: string, title: string) => {
    incrementDownloads(id);
    addLog(`Downloaded library resource file: ${title}`, 'Resource Center', user?.fullName || 'Academic Peer');
    addReputation(20);
    addToast(lang === 'en' ? 'Document downloaded +20 XP!' : 'Đã tải thành công tài liệu học tập +20 XP!', 'success');
  };

  const filteredResources = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchResQuery.toLowerCase()) || 
                        r.sharedBy.toLowerCase().includes(searchResQuery.toLowerCase());
    const matchCat = resCatFilter === 'All' || r.category === resCatFilter;
    return matchSearch && matchCat;
  });

  // Skill matching engine (Module 10 auto matchmaking)
  const runSkillMatcher = () => {
    if (activeUserRole === 'Guest') {
      triggerGuestIntercept(lang === 'en' ? 'Synergy Match Diagnostic' : 'Phân tích Ghép cặp kỹ năng sinh viên');
      return;
    }
    if (!user) return;
    const userSkillsNames = user.skills.map(s => s.name.toLowerCase());
    
    // Find candidate who offers skills not fully expert in user profile
    const match = SKILL_EXCHANGE_DATA.find(peer => 
      peer.offers.some(off => !userSkillsNames.includes(off.toLowerCase()))
    );

    if (match) {
      setMatchSuggestion(match);
      addLog(`Triggered Skill Exchange Auto-Match algorithm. Found counterpart: ${match.studentName}`, 'Skill Exchange', user.fullName);
      addToast(lang === 'en' ? 'Autonomous Matchmaking engine successfully resolved partner!' : 'Hệ thống tự động đã phân tích đối tác phù hợp!', 'success');
    } else {
      setMatchSuggestion(null);
      addToast(lang === 'en' ? 'All catalog parameters already matched. Adjust skills filter.' : 'Đã hoàn tất kiểm tra kỹ năng hiện có.', 'info');
    }
  };

  // Mentor booking / questions
  const handleBookSession = (mentor: Mentor) => {
    if (activeUserRole === 'Guest') {
      triggerGuestIntercept(lang === 'en' ? 'Book Expert Mentor Session' : 'Đặt lịch hẹn Cố vấn học thuật');
      return;
    }
    setMentorsList(prev => 
      prev.map(m => m.id === mentor.id ? { ...m, sessionsBooked: m.sessionsBooked + 1 } : m)
    );
    setBookedSessions(prev => ({ ...prev, [mentor.id]: true }));
    addLog(`Reserved specialized mentorship hour with Prof. ${mentor.name}`, 'Mentorship HUB', user?.fullName || 'Academic Peer');
    addReputation(40);
    addToast(lang === 'en' ? 'Mentorship session reserved +40 XP!' : 'Đã kết nối lịch hẹn với Giáo sư +40 XP!', 'success');
  };

  const submitQuestionToMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUserRole === 'Guest') {
      triggerGuestIntercept(lang === 'en' ? 'Submit Question To Faculty Member' : 'Đặt câu hỏi phản biện khoa học');
      return;
    }
    if (!questionText.trim() || !selectedMentor) return;

    setBookingSuccessMsg(`Your academic request: "${questionText.slice(0, 30)}..." has been dispatched. Professor ${selectedMentor.name} will respond via student mailbox.`);
    addLog(`Dispatched analytical inquiry to Prof. ${selectedMentor.name}`, 'Mentorship HUB', user?.fullName || 'Academic Peer');
    addReputation(30);
    addToast(lang === 'en' ? 'Inquiry dispatched!' : 'Yêu cầu thảo luận đã được gửi tới Cố vấn!', 'success');
    
    setQuestionText('');
    setTimeout(() => setBookingSuccessMsg(''), 7000);
  };

  const filteredSkillsExchange = SKILL_EXCHANGE_DATA.filter(p => 
    p.studentName.toLowerCase().includes(skillsSearch.toLowerCase()) ||
    p.offers.some(s => s.toLowerCase().includes(skillsSearch.toLowerCase())) ||
    p.requests.some(s => s.toLowerCase().includes(skillsSearch.toLowerCase()))
  );

  return (
    <div className="p-1 md:p-4 space-y-6 font-sans">
      
      {/* Sub Tabs selector header card */}
      <div className="flex bg-[#111111] border border-white/5 rounded-3xl p-1.5 max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex-1 py-3 text-xs font-bold uppercase transition rounded-2xl cursor-pointer ${
            activeTab === 'resources' ? 'bg-[#050505] text-[#CCFF00] border border-white/5 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          📁 {t.resourceCenter}
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-3 text-xs font-bold uppercase transition rounded-2xl cursor-pointer ${
            activeTab === 'skills' ? 'bg-[#050505] text-[#CCFF00] border border-white/5 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🤝 {t.skillExchange}
        </button>
        <button
          onClick={() => setActiveTab('mentors')}
          className={`flex-1 py-3 text-xs font-bold uppercase transition rounded-2xl cursor-pointer ${
            activeTab === 'mentors' ? 'bg-[#050505] text-[#CCFF00] border border-white/5 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          👨‍🏫 {t.mentorConnect}
        </button>
      </div>

      {/* RENDER TAB 1: SHARED EDUCATION RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side upload tool */}
            <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 space-y-4 h-fit">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base font-display">{t.uploadResTitle}</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Support peers in completing academic milestones by sharing sample documentations, templates indices, and PDF files.
                </p>
              </div>

              <form onSubmit={handleUploadResource} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 font-mono">{t.resTitleLabel}</label>
                  <input
                    type="text"
                    required
                    value={newResTitle}
                    onChange={(e) => setNewResTitle(e.target.value)}
                    placeholder="e.g., JWT Route Middleware Template"
                    className="w-full bg-[#161616] border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 font-mono">{t.resCatLabel}</label>
                  <select
                    value={newResCat}
                    onChange={(e) => setNewResCat(e.target.value as any)}
                    className="w-full bg-[#161616] border border-white/5 text-slate-300 text-xs rounded-xl p-3 focus:outline-none cursor-pointer"
                  >
                    <option value="Syllabus">Syllabus • Đề cương</option>
                    <option value="Template">Template • Biểu mẫu</option>
                    <option value="Material">Material • Tài liệu</option>
                    <option value="Source Code">Source Code • Mã nguồn</option>
                    <option value="Report">Report • Báo cáo khoa học</option>
                    <option value="Slides">Slides • Báo cáo trình chiếu</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-black text-xs font-black uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: accentColor }}
                >
                  <Upload className="w-4 h-4" />
                  {t.uploadResBtn}
                </button>
              </form>
            </div>

            {/* Right side catalog listings */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col md:flex-row gap-3 bg-[#0C0C0C] border border-white/5 p-4 rounded-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'Filter files...' : 'Tìm tài liệu học tập...'}
                    value={searchResQuery}
                    onChange={(e) => setSearchResQuery(e.target.value)}
                    className="w-full bg-[#161616] border border-white/5 text-sm text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none"
                  />
                </div>
                <select
                  value={resCatFilter}
                  onChange={(e) => setResCatFilter(e.target.value)}
                  className="bg-[#161616] border border-white/5 text-slate-300 text-xs rounded-xl px-4 py-3 focus:outline-none cursor-pointer"
                >
                  <option value="All">{lang === 'en' ? 'All Classes' : 'Tất cả tài liệu'}</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Template">Template</option>
                  <option value="Material">Material</option>
                  <option value="Source Code">Source Code</option>
                  <option value="Report">Report</option>
                  <option value="Slides">Slides</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map(res => (
                  <div key={res.id} className="p-4 bg-[#111111] border border-white/5 rounded-[22px] flex flex-col justify-between hover:border-white/10 transition-all group">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] uppercase tracking-wider text-[#CCFF00] font-bold font-mono px-2 py-0.5 bg-[#CCFF00]/10 rounded-full" style={{ color: accentColor, backgroundColor: `${accentColor}12` }}>{res.category}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{res.size}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#CCFF00] transition-colors line-clamp-2 leading-snug">{res.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Shared by student: {res.sharedBy}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <span className="text-[9px] text-slate-400 font-mono">Downloads: {res.downloads}</span>
                      <button
                        onClick={() => handleDownloadClick(res.id, res.title)}
                        className="px-3 py-1.5 bg-white/5 text-white hover:bg-white/10 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-slate-400" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RENDER TAB 2: SKILL COLLABORATIVE MARKETPLACE */}
      {activeTab === 'skills' && (
        <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-display text-white">{t.skillsOffersTitle}</h3>
              <p className="text-slate-400 text-xs">Verify peer alignments and coordinate educational skills exchange sessions.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={runSkillMatcher}
                className="px-5 py-3 text-black text-xs font-black uppercase rounded-xl flex items-center gap-2 transition hover:opacity-95 cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                <Sparkles className="w-4 h-4" /> {t.matchEngineBtn}
              </button>
            </div>
          </div>

          {/* Peer recommendations box if triggered */}
          {matchSuggestion && (
            <div className="p-6 bg-gradient-to-r from-emerald-950/20 to-black border border-emerald-500/30 rounded-2xl animate-fade-in relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase rounded-full tracking-wide">Counterpart Match Found</span>
                  <span className="text-xs text-slate-500 font-mono">Peer ID: {matchSuggestion.id}</span>
                </div>
                <h4 className="text-sm font-black text-white">{matchSuggestion.studentName} is ready to exchange skills!</h4>
                
                <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-mono text-[10px] block">THEY ARE GIVING:</span>
                    <span className="text-white font-bold">{matchSuggestion.offers.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono text-[10px] block">THEY ARE REQUESTING:</span>
                    <span className="text-slate-400">{matchSuggestion.requests.join(', ')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  addToast(lang === 'en' ? 'Direct skill transaction invitation dispatched!' : 'Yêu cầu ghép cặp kỹ năng đã được chuyển đi!', 'success');
                  setMatchSuggestion(null);
                }}
                className="px-5 py-3 bg-emerald-500 text-black text-xs font-bold rounded-xl shrink-0 cursor-pointer hover:bg-emerald-600 transition"
              >
                Direct Connect Messenger
              </button>
            </div>
          )}

          {/* Filtering peers list */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={lang === 'en' ? 'Search by skills prefix...' : 'Tìm kiếm kỹ năng...'}
                value={skillsSearch}
                onChange={(e) => setSkillsSearch(e.target.value)}
                className="w-full bg-[#161616] border border-white/5 text-xs text-white rounded-xl pl-9 pr-3 py-2.5 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkillsExchange.map(peer => (
                <div key={peer.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white leading-none">{peer.studentName}</h4>
                    <span className="text-[9px] text-slate-500 font-mono">ID: {peer.id}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[9px] font-bold block uppercase tracking-wider">Capable skills (Offers)</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {peer.offers.map(s => <span key={s} className="px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded text-[9px] font-bold">{s}</span>)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[9px] font-bold block uppercase tracking-wider">Seeking tutoring (Requests)</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {peer.requests.map(s => <span key={s} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[9px]">{s}</span>)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addToast(lang === 'en' ? `Invited ${peer.studentName} to study panel` : `Đã kết nối với ${peer.studentName}`, 'success')}
                    className="w-full py-2 bg-white/5 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold transition cursor-pointer"
                  >
                    Send Exchange Invite
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 3: PROFESSORS & EXPERT MENTOR CONSULTATION */}
      {activeTab === 'mentors' && (
        <div className="space-y-6">
          {bookingSuccessMsg && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-mono animate-fade-in flex items-center gap-3">
              <Check className="w-4 h-4 shrink-0" />
              <span>{bookingSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentorsList.map(mentor => {
              const isSessionBooked = bookedSessions[mentor.id];
              return (
                <div key={mentor.id} className="bg-[#111111] border border-white/5 rounded-3xl p-6 space-y-4 flex flex-col justify-between hover:border-white/10 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <img src={mentor.avatar} className="w-12 h-12 rounded-full object-cover border border-white/5" alt="avatar" />
                      <div>
                        <h4 className="text-xs font-black text-white">{mentor.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono block">{mentor.role}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{mentor.bio}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {mentor.skills.map(s => <span key={s} className="px-2 py-0.5 bg-[#CCFF00]/10 text-[#CCFF00] rounded text-[9px]" style={{ color: accentColor, backgroundColor: `${accentColor}12` }}>{s}</span>)}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>Booked Hours: {mentor.sessionsBooked} overall</span>
                      <span>Rate: ★ {mentor.rating} (5.0)</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedMentor(mentor)}
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Inquiry
                      </button>

                      {isSessionBooked ? (
                        <div className="flex-1 text-center py-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 border border-emerald-500/20">
                          Scheduled ✓
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBookSession(mentor)}
                          className="flex-1 py-2.5 text-black text-[10px] font-black uppercase rounded-xl transition cursor-pointer"
                          style={{ backgroundColor: accentColor }}
                        >
                          Book Hour
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick ask popup form */}
          {selectedMentor && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
              <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-[30px] p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h4 className="text-sm font-black text-white">Ask Professor {selectedMentor.name}</h4>
                  <button onClick={() => setSelectedMentor(null)} className="text-slate-400 text-xs font-bold leading-none">Close</button>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Submit concrete inquiries, coursework concerns, or request database reviews. Faculty members respond within 48h.
                </p>

                <form onSubmit={submitQuestionToMentor} className="space-y-4">
                  <textarea
                    required
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={4}
                    placeholder="Enter academic questions, syllabus comments, or repository file references..."
                    className="w-full bg-[#161616] border border-white/5 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-white/20 transition font-sans"
                  />
                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedMentor(null)}
                      className="px-4 py-2 bg-white/5 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-black text-xs font-black uppercase rounded-xl cursor-pointer"
                      style={{ backgroundColor: accentColor }}
                    >
                      Submit inquiry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guest Mode Restriction Popup Modal Interceptor */}
      {showGuestBlockModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#111111] border border-yellow-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-yellow-400">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-black font-display uppercase">{t.guestReqTitle}</h3>
            </div>
            <div className="bg-[#050505] p-3 rounded-xl border border-white/5 text-white font-mono text-center text-xs">
              Action: {guestBlockContext}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed text-center">
              {t.guestDescRestricted}
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={() => setShowGuestBlockModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 transition text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                {t.backToGuestBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
