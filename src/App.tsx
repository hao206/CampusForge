import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter, Routes, Route, Link, useLocation, useNavigate 
} from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, ClipboardCheck, MessageCircle, 
  FileText, Award, Settings, ShieldCheck, Bell, LogOut, X, Menu, ShieldAlert
} from 'lucide-react';

// Core translations
import { translations } from './translations';

// Custom Zustand Stores
import { useUIStore } from './store/useUIStore';
import { useAuthStore } from './store/useAuthStore';
import { useNotificationStore } from './store/useNotificationStore';
import { useToastStore } from './store/useToastStore';
import { useAuditStore } from './store/useAuditStore';

// Page Views
import { Dashboard } from './pages/Dashboard';
import { Achievements } from './pages/Achievements';
import { Settings as SettingsPage } from './pages/Settings';
import { ProfilePage } from './pages/ProfilePage';
import { Admin as AdminPage } from './pages/Admin';

// Submodule Views
import { ProjectHubModule } from './components/ProjectHubModule';
import { TeamFlowModule } from './components/TeamFlowModule';
import { CommunityModule } from './components/CommunityModule';
import { ResourceMarketplaceMentorModule } from './components/ResourceMarketplaceMentor';

// Auth View
import { AuthModule } from './components/AuthModule';

// Global Search
import { GlobalSearch } from './components/GlobalSearch';

// --- SUBMODULE TOAST STACK ---
const ToastStack: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-center justify-between gap-3 animate-fade-in cursor-pointer hover:scale-[1.02] active:scale-95 transition-all text-xs font-sans font-bold ${
            toast.type === 'success' 
              ? 'bg-[#111111]/95 border-emerald-500/30 text-emerald-400' 
              : toast.type === 'error'
              ? 'bg-[#111111]/95 border-red-500/30 text-red-400'
              : 'bg-[#111111]/95 border-[#CCFF00]/30 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{toast.message}</span>
          </div>
          <button className="text-slate-500 hover:text-white ml-2 text-sm leading-none">×</button>
        </div>
      ))}
    </div>
  );
};

// --- APP CONTENT LAYOUT WRAPPER ---
const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { lang, setLang, accent, mobileMenuOpen, setMobileMenuOpen, guestBlockAction, setGuestBlockAction } = useUIStore();
  const t = translations[lang];

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Notifications Store
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.hasAttribute('contenteditable')
      ) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '?')) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }

      const key = e.key.toLowerCase();
      if (key === 'd') {
        navigate('/');
        addToast(lang === 'en' ? 'Navigated to Dashboard' : 'Đã chuyển sang Trang tổng quan', 'info');
      } else if (key === 'p') {
        navigate('/projects');
        addToast(lang === 'en' ? 'Navigated to Project Hub' : 'Đã chuyển sang Cổng dự án', 'info');
      } else if (key === 't') {
        navigate('/teamflow');
        addToast(lang === 'en' ? 'Navigated to TeamFlow' : 'Đã chuyển sang Quy trình nhóm', 'info');
      } else if (key === 'c') {
        navigate('/community');
        addToast(lang === 'en' ? 'Navigated to Community' : 'Đã chuyển sang Cộng đồng', 'info');
      } else if (key === 'r') {
        navigate('/resources');
        addToast(lang === 'en' ? 'Navigated to Resources' : 'Đã chuyển sang Thư viện tài nguyên', 'info');
      } else if (key === 'l') {
        navigate('/achievements');
        addToast(lang === 'en' ? 'Navigated to Leaderboard' : 'Đã chuyển sang Xếp hạng & Huy chương', 'info');
      } else if (key === 's') {
        navigate('/settings');
        addToast(lang === 'en' ? 'Navigated to Settings' : 'Đã chuyển sang Cơ bản & Giao diện', 'info');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, addToast, lang]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isGovUser = user?.role === 'Admin' || user?.role === 'Project Leader';

  const tabItems = [
    { label: t.dashboard, path: '/', icon: LayoutDashboard },
    { label: t.projectHub, path: '/projects', icon: FolderKanban },
    { label: t.teamFlow, path: '/teamflow', icon: ClipboardCheck },
    { label: t.community, path: '/community', icon: MessageCircle },
    { label: t.resourceCenter, path: '/resources', icon: FileText },
    { label: t.achievements, path: '/achievements', icon: Award },
    { label: t.settings, path: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] flex select-none relative [color-scheme:dark]">
      {/* Dynamic accent background layout glow */}
      <div 
        className="fixed top-0 left-12 w-[400px] h-[400px] blur-[150px] opacity-5 rounded-full pointer-events-none transition-all duration-700" 
        style={{ backgroundColor: accent }}
      />

      {/* LEFT PERSISTENT NAVIGATION SIDEBAR FOR DESKTOP */}
      <aside className="hidden lg:flex w-72 border-r border-white/5 flex-col justify-between p-6 sticky top-0 h-screen shrink-0 font-sans">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-black tracking-tighter text-sm italic transition duration-500 shadow-[0_0_20px_rgba(204,255,0,0.3)] select-none" 
              style={{ backgroundColor: accent }}
            >
              CF
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-widest font-display block uppercase">{t.appName}</span>
              <span className="text-[9px] font-mono font-bold text-slate-500 tracking-wider">v4.0.0 PROD STABLE</span>
            </div>
          </div>

          <nav className="space-y-1.5 pt-4">
            {tabItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left text-xs font-semibold leading-none cursor-pointer ${
                  isActive(item.path) 
                    ? 'border-white/10 text-white font-black' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                style={{ 
                  backgroundColor: isActive(item.path) ? `${accent}15` : 'transparent',
                  color: isActive(item.path) ? accent : undefined
                }}
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}

            {isGovUser && (
              <Link
                to="/admin"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left text-xs font-semibold leading-none cursor-pointer ${
                  isActive('/admin') 
                    ? 'border-white/10 text-white font-black' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                style={{ 
                  backgroundColor: isActive('/admin') ? `${accent}15` : 'transparent',
                  color: isActive('/admin') ? accent : undefined
                }}
              >
                <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                <span>{lang === 'en' ? 'Audit Logs' : 'Nhật ký Hệ thống'}</span>
              </Link>
            )}
          </nav>
        </div>

        {/* User stats widget in sidebar bottom */}
        {user && (
          <div className="bg-[#111111]/90 rounded-[28px] p-5 theme-border-subtle relative overflow-hidden select-none">
            <div className="relative z-10 space-y-3">
              <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                <span>Reputation Stats</span>
                <span>{user.reputationScore} XP</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((user.reputationScore / 5000) * 100, 100)}%`, backgroundColor: accent }}
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                  <img src={user.avatar} className="w-6.5 h-6.5 rounded-full object-cover border border-white/15" alt="user avatar" />
                  <span className="text-[10px] font-bold text-white max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition"
                  title="Logout Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTAINER CONTENT DECK */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* TOP GLASSMORPHIC HEADER CENTER */}
        <header className="h-20 border-b border-white/5 px-4 md:px-8 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between shrink-0 select-none">
          
          {/* Logo and Search widgets */}
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 bg-white/5 hover:bg-[#141414] rounded-xl text-slate-400 hover:text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Part B2 - Global Search */}
            <GlobalSearch />
          </div>

          {/* Right utilities */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Lang toggle */}
            <button 
              onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
              className="p-2 w-9 h-9 rounded-xl border border-white/5 text-[9px] font-mono font-bold text-slate-400 tracking-tight bg-white/5 hover:text-white cursor-pointer"
            >
              {lang === 'en' ? 'VI' : 'EN'}
            </button>

            {/* Notification drop center (Part B4) */}
            <div className="relative font-sans">
              <button 
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-[#141414] border border-white/5 rounded-xl transition relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <div className="w-4 h-4 bg-red-500 text-white rounded-full absolute -top-1.5 -right-1.5 border border-[#050505] text-[8px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </div>
                )}
              </button>

              {showNotificationDrawer && (
                <div className="absolute right-0 mt-3.5 w-80 bg-[#0E0E0E] border border-white/10 rounded-3xl p-4 shadow-2xl space-y-4 z-50 animate-fade-in">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-xs font-black text-white uppercase tracking-wider font-mono">Academic Logs ({unreadCount})</span>
                    <div className="flex gap-2">
                      <button onClick={markAllAsRead} className="text-[9px] text-[#CCFF00] hover:underline" style={{ color: accent }}>Read All</button>
                      <button onClick={clearAll} className="text-[9px] text-red-400 hover:underline">Clear</button>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          markAsRead(notif.id);
                          if (notif.type === 'task') navigate('/teamflow');
                          if (notif.type === 'apply') navigate('/projects');
                          if (notif.type === 'comment') navigate('/community');
                          if (notif.type === 'badge') navigate('/achievements');
                        }}
                        className={`p-3 rounded-2xl flex flex-col space-y-1 transition cursor-pointer border ${
                          notif.read 
                            ? 'bg-[#121212]/30 border-white/5 hover:bg-[#121212]' 
                            : 'bg-[#181818] border-white/10 hover:bg-[#1c1c1c]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className={`${notif.read ? 'text-slate-500' : 'text-slate-300'} font-bold`}>{notif.title}</span>
                          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" style={{ backgroundColor: accent }} />}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">{notif.description}</p>
                        <span className="text-[8px] text-slate-500 font-mono mt-1">{notif.time}</span>
                      </div>
                    ))}

                    {notifications.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-600 font-mono">No incoming logs.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Quick Navigator */}
            {user && (
              <div className="flex items-center gap-2 border-l border-white/5 pl-2 md:pl-4">
                <div className="text-right hidden sm:block">
                  <div className="text-[11px] font-black text-white hover:text-[#CCFF00] cursor-pointer" onClick={() => navigate('/profile/me')}>{user.fullName}</div>
                  <div className="text-[9px] text-slate-500 font-sans tracking-tight">{user.major.split(' ')[0]}</div>
                </div>
                <img 
                  onClick={() => navigate('/profile/me')}
                  src={user.avatar} 
                  className="w-8.5 h-8.5 rounded-full object-cover border border-white/10 cursor-pointer hover:border-white/20 transition" 
                  alt="me avatar" 
                />
              </div>
            )}
          </div>
        </header>

        {/* MOBILE Sidenav Drawer overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/95 z-50 flex flex-col p-6 space-y-6 lg:hidden font-sans">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-base font-black text-white tracking-widest font-display uppercase">{t.appName}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {tabItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left text-sm ${
                    isActive(item.path) 
                      ? 'border-white/10 text-white font-bold' 
                      : 'border-transparent text-slate-400'
                  }`}
                  style={{ 
                    backgroundColor: isActive(item.path) ? `${accent}15` : 'transparent',
                    color: isActive(item.path) ? accent : undefined
                  }}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              {user && (
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Reputation Academic Level:</span>
                  <span className="text-white font-bold">{user.reputationScore} XP</span>
                </div>
              )}
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }} 
                className="w-full py-3 bg-red-500/25 text-red-100 font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer"
              >
                {t.terminateSession}
              </button>
            </div>
          </div>
        )}

        {/* Guest Mode alert banner */}
        {user?.role === 'Guest' && (
          <div className="mx-4 md:mx-8 mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans animate-fade-in relative overflow-hidden select-none">
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accent }} />
            <div className="flex items-center gap-3">
              <span className="text-xl shrink-0">👀</span>
              <div>
                <h4 className="text-yellow-400 font-bold uppercase tracking-wide">{t.guestModeBannerTitle}</h4>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  {t.guestModeBannerDesc}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 hover:scale-105 active:scale-95 transition text-black font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer shrink-0"
              style={{ backgroundColor: accent }}
            >
              {t.guestModeLoginBtn}
            </button>
          </div>
        )}

        {/* ROUTER SWITCH VIEWPORT */}
        <main className="p-4 md:p-8 flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectHubModule />} />
            <Route path="/teamflow" element={<TeamFlowModule />} />
            <Route path="/community" element={<CommunityModule />} />
            <Route path="/resources" element={<ResourceMarketplaceMentorModule />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        {/* BOTTOM NAV FOR MOBILE */}
        <footer className="lg:hidden h-16 border-t border-white/5 bg-[#050505]/95 backdrop-blur-md sticky bottom-0 z-40 flex justify-around items-center px-4 shrink-0 select-none">
          {tabItems.slice(0, 5).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
              style={{ color: isActive(item.path) ? accent : undefined }}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="text-[8px] font-medium font-mono mt-0.5 tracking-tight">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </footer>

      </div>

      {/* Guest Block action alerts popup */}
      {guestBlockAction && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-[32px] p-8 shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="inline-flex w-16 h-16 rounded-3xl bg-yellow-500/10 border border-yellow-500/30 items-center justify-center mb-4">
                <span className="text-3xl text-yellow-500">🔒</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight font-display mb-2 uppercase">Yêu Cầu Thành Viên</h3>
              <p className="text-slate-400 text-xs text-center">
                Bạn đang truy cập hệ thống <strong className="text-[#CCFF00]" style={{ color: accent }}>CampusForge</strong> với tư cách là <strong className="text-white">Khách (Guest Mode)</strong>.
              </p>
            </div>

            <div className="bg-[#161616] border border-white/5 rounded-2xl p-4 mb-6">
              <p className="text-slate-300 text-xs font-semibold uppercase font-mono mb-1 tracking-wider text-center">Hành động bị hạn chế:</p>
              <div className="text-white text-xs font-bold text-center bg-black/30 py-2.5 rounded-lg font-mono">
                {guestBlockAction}
              </div>
              <p className="text-slate-400 text-[11px] mt-2 text-center leading-relaxed font-sans">
                Chế độ khách chỉ cho phép tra cứu, xem dữ liệu, và tải tài liệu học tập. Vui lòng đăng nhập bằng tài khoản sinh viên/admin để đăng tin hoặc thực hiện các hoạt động nhóm khác.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setGuestBlockAction(null);
                  handleLogout();
                }}
                className="w-full py-3 hover:scale-[1.01] active:scale-95 transition text-black font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer shadow-lg"
                style={{ backgroundColor: accent }}
              >
                🔐 Đăng Nhập Tài Khoản
              </button>
              <button
                type="button"
                onClick={() => setGuestBlockAction(null)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold rounded-xl transition duration-200 cursor-pointer border border-white/5"
              >
                Trở lại duyệt (Khách)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts overlay panel modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xl">⌨️</span>
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                  {lang === 'en' ? 'Keyboard Navigation Shortcuts' : 'Phím tắt Điều Thướng Nhanh'}
                </h3>
              </div>
              <button 
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-500 hover:text-white text-xs font-mono font-bold uppercase transition px-2 py-1 rounded bg-white/5 active:scale-95"
              >
                {lang === 'en' ? 'Close' : 'Đóng'}
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lang === 'en' 
                ? 'Type these letters dynamic trigger directly when no input fields are active to teleport instantly:' 
                : 'Nhấn các phím tắt sau đây khi không ở trong ô nhập liệu để dịch chuyển tức thời qua phân khu học thuật:'}
            </p>

            <div className="space-y-2 pt-2">
              {[
                { keys: ['?'], label: lang === 'en' ? 'Toggle this helpers guide popup' : 'Bật/Tắt hướng dẫn phím tắt này' },
                { keys: ['D'], label: lang === 'en' ? 'Teleport to Dashboard overview' : 'Xem Trang tổng quan' },
                { keys: ['P'], label: lang === 'en' ? 'Teleport to Project Initiatives Hub' : 'Xem Cổng đề tài khoa học' },
                { keys: ['T'], label: lang === 'en' ? 'Teleport to TeamFlow Agile Kanban Board' : 'Xem Quy trình nhóm Sprint' },
                { keys: ['C'], label: lang === 'en' ? 'Teleport to Community Discussion Threads' : 'Xem Diễn đàn Cộng đồng' },
                { keys: ['R'], label: lang === 'en' ? 'Teleport to Shared Resource Vault' : 'Xem Thư viện giáo trình & Cố vấn' },
                { keys: ['L'], label: lang === 'en' ? 'Teleport to Leaderboard & Badges Index' : 'Xem Xếp hạng & Huy chương' },
                { keys: ['S'], label: lang === 'en' ? 'Teleport to Personalization Layout' : 'Truy cập tab Cá nhân hóa' },
              ].map((shortcut, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-none text-xs">
                  <span className="text-slate-300 font-medium">{shortcut.label}</span>
                  <div className="flex gap-1.5 shrink-0">
                    {shortcut.keys.map(k => (
                      <kbd 
                        key={k} 
                        className="px-2 py-1 bg-white/5 border border-white/10 text-slate-200 rounded font-mono text-[10px] font-bold shadow-sm"
                        style={{ borderColor: `${accent}30` }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0A0A0A] p-3 rounded-2xl text-[10px] text-slate-500 font-mono text-center">
              CampusForge Hotkey Router • Active
            </div>
          </div>
        </div>
      )}

      {/* Real-time custom Toast Notifications Stack Component */}
      <ToastStack />
    </div>
  );
};

// --- CORE APP ENTRY WRAPPER ---
export default function App() {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const loginAsGuest = useAuthStore((s) => s.loginAsGuest);
  const addLog = useAuditStore((s) => s.addLog);
  const { lang, accent } = useUIStore();
  const t = translations[lang];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#FAFAFA] flex items-center justify-center p-4 relative [color-scheme:dark]">
        {/* Glow */}
        <div className="fixed top-1/4 left-1/4 w-[350px] h-[350px] bg-[#CCFF00] blur-[150px] opacity-[0.03] rounded-full pointer-events-none" />
        <div className="w-full max-w-md">
          <AuthModule 
            t={t}
            accentColor={accent}
            onLoginSuccess={login}
            logAction={(action, moduleName) => addLog(action, moduleName, 'Unauthenticated Student')}
            onContinueAsGuest={loginAsGuest}
          />
        </div>
        <ToastStack />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
