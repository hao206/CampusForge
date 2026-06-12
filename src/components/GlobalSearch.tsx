import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderKanban, ClipboardCheck, MessageCircle, FileText } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';
import { useProjectStore } from '../store/useProjectStore';
import { useTaskStore } from '../store/useTaskStore';
import { usePostStore } from '../store/usePostStore';
import { useResourceStore } from '../store/useResourceStore';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'project' | 'task' | 'post' | 'resource';
  route: string;
}

export const GlobalSearch: React.FC = () => {
  const { lang, gQuery, setGQuery, accent } = useUIStore();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const projects = useProjectStore((s) => s.projects);
  const tasks = useTaskStore((s) => s.tasks);
  const posts = usePostStore((s) => s.posts);
  const resources = useResourceStore((s) => s.resources);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === '?') {
        // Option to open helper or shortcut modal
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus when open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Execute search filters
  const results: SearchResult[] = [];
  if (gQuery.trim().length > 0) {
    const q = gQuery.toLowerCase();

    // Projects
    projects.forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.requiredSkills.some((s) => s.toLowerCase().includes(q))
      ) {
        results.push({
          id: p.id,
          title: p.name,
          subtitle: p.category,
          type: 'project',
          route: '/projects',
        });
      }
    });

    // Tasks
    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) {
        results.push({
          id: t.id,
          title: t.title,
          subtitle: `${t.projectName} • ${t.status}`,
          type: 'task',
          route: '/teamflow',
        });
      }
    });

    // Posts
    posts.forEach((p) => {
      if (p.content.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q)) {
        results.push({
          id: p.id,
          title: p.content.slice(0, 60) + '...',
          subtitle: `#${p.topic} by ${p.author}`,
          type: 'post',
          route: '/community',
        });
      }
    });

    // Resources
    resources.forEach((r) => {
      if (r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)) {
        results.push({
          id: r.id,
          title: r.title,
          subtitle: `${r.category} • ${r.size} • Shared by ${r.sharedBy}`,
          type: 'resource',
          route: '/resources',
        });
      }
    });
  }

  // Handle keyboard interaction
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelectResult(results[selectedIndex]);
      }
    }
  };

  const handleSelectResult = (res: SearchResult) => {
    navigate(res.route);
    setIsOpen(false);
    setGQuery('');
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Visual Search trigger bar */}
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full max-w-md bg-[#111111]/70 theme-border-subtle hover:border-white/10 rounded-2xl p-2.5 flex items-center justify-between gap-3 cursor-pointer select-none mx-auto md:mx-0"
      >
        <div className="flex items-center gap-2 text-slate-400">
          <Search className="w-4 h-4" />
          <span className="text-[11px]">
            {lang === 'en' ? 'Search anything... (Cmd+K)' : 'Tìm mọi thứ... (Ctrl+K)'}
          </span>
        </div>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white/5 border border-white/10 text-[9px] font-bold rounded font-mono text-slate-400 uppercase select-none">
          Cmd K
        </kbd>
      </div>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div className="absolute top-12 left-0 right-0 md:w-[480px] bg-[#0E0E0E] border border-white/10 rounded-[24px] shadow-2xl p-4 space-y-3 z-50 animate-fade-in font-sans">
          <div className="flex items-center gap-2 bg-[#141414] border border-white/5 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={gQuery}
              onChange={(e) => {
                setGQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={lang === 'en' ? 'Type keywords (projects, tasks, posts...)' : 'Nhập từ khóa (đề tài, nhiệm vụ, bài viết...)'}
              className="w-full bg-transparent text-xs text-white focus:outline-none"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-3 divide-y divide-white/5">
            {gQuery.trim() === '' ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                {lang === 'en' ? 'Try searching for "JWT", "Parking", or "Figma"' : 'Hãy gõ tìm thử "JWT", "Parking", hoặc "Figma"'}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                {lang === 'en' ? 'No results found' : 'Không tìm thấy kết quả phù hợp'}
              </div>
            ) : (
              <div className="pt-2 space-y-2">
                {results.map((res, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={res.id + '-' + res.type}
                      onClick={() => handleSelectResult(res)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition ${
                        isSelected 
                          ? 'bg-white/5 border-l-2' 
                          : 'hover:bg-white/5'
                      }`}
                      style={{ borderLeftColor: isSelected ? accent : 'transparent' }}
                    >
                      <div className="flex items-center gap-3">
                        {res.type === 'project' && <FolderKanban className="w-4 h-4 text-sky-400" />}
                        {res.type === 'task' && <ClipboardCheck className="w-4 h-4 text-yellow-400" />}
                        {res.type === 'post' && <MessageCircle className="w-4 h-4 text-violet-400" />}
                        {res.type === 'resource' && <FileText className="w-4 h-4 text-emerald-400" />}

                        <div>
                          <h5 className="text-xs font-black text-white line-clamp-1">{res.title}</h5>
                          <span className="text-[10px] text-slate-400 font-mono">{res.subtitle}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                        {res.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
