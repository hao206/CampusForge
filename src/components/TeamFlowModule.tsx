import React, { useState } from 'react';
import { 
  Kanban, ClipboardList, Flame, ArrowRight, ArrowLeft, Calendar, 
  Play, CheckCircle2, UserCheck, Plus, ListFilter, Loader2 
} from 'lucide-react';
import { Task, TaskStatus, Project } from '../types';
import { translations } from '../translations';

// Zustand store imports
import { useUIStore } from '../store/useUIStore';
import { useTaskStore } from '../store/useTaskStore';
import { useProjectStore } from '../store/useProjectStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAuditStore } from '../store/useAuditStore';
import { useToastStore } from '../store/useToastStore';
import { useNotificationStore } from '../store/useNotificationStore';

// @dnd-kit core imports
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';

// --- SUBMODULE components ---

interface DraggableCardProps {
  task: Task;
  accentColor: string;
  lang: string;
  handlePrevStatus: (id: string, st: TaskStatus) => void;
  handleNextStatus: (id: string, st: TaskStatus) => void;
  colValue: TaskStatus;
}

const DraggableTaskCard: React.FC<DraggableCardProps> = ({
  task,
  accentColor,
  lang,
  handlePrevStatus,
  handleNextStatus,
  colValue
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-[#111111] border border-white/5 rounded-2xl p-4 space-y-3 hover:border-white/10 transition-all shadow-md group select-none"
    >
      <div className="space-y-1.5">
        <div className="flex justify-between items-center gap-2">
          <span className="text-[9px] font-bold text-slate-500 truncate max-w-[130px]">{task.projectName}</span>
          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
            task.priority === 'High' ? 'bg-red-500/15 text-red-400' :
            task.priority === 'Medium' ? 'bg-amber-500/15 text-amber-300' :
            'bg-blue-500/15 text-blue-400'
          }`}>
            {task.priority || 'Medium'}
          </span>
        </div>
        <h4 className="text-xs font-bold text-white leading-tight group-hover:text-[#CCFF00] transition-colors">
          {task.title}
        </h4>
        <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      </div>

      {/* Member Assign & Due Date */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          {task.assignedAvatar ? (
            <img src={task.assignedAvatar} className="w-4 h-4 rounded-full border border-white/10" alt="assignee" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-white">AN</div>
          )}
          <span className="text-[9px] text-slate-400 font-mono font-medium truncate max-w-[70px]">
            {task.assignedTo ? task.assignedTo.split(' ')[0] : 'Unassigned'}
          </span>
        </div>
        <span className="text-[8px] text-slate-500 font-mono">
          {task.dueDate}
        </span>
      </div>

      {/* Mobile-Friendly status movement buttons: stopPropagation so they click fine */}
      <div 
        className="flex justify-between gap-1 pt-1" 
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {colValue !== 'Backlog' ? (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStatus(task.id, task.status);
            }}
            className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded text-[8px] font-bold transition flex items-center justify-center gap-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-2.5 h-2.5" /> {lang === 'en' ? 'Back' : 'Quay lại'}
          </button>
        ) : <div className="flex-1" />}
        
        {colValue !== 'Done' ? (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNextStatus(task.id, task.status);
            }}
            className="flex-1 py-1 hover:bg-opacity-80 text-black text-[8px] font-black uppercase rounded transition flex items-center justify-center gap-0.5 cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            {lang === 'en' ? 'Next' : 'Tiếp tục'} <ArrowRight className="w-2.5 h-2.5" />
          </button>
        ) : (
          <div className="flex-1 text-center text-emerald-400 text-[9px] font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {lang === 'en' ? 'Locked' : 'Đã khóa'}
          </div>
        )}
      </div>
    </div>
  );
};

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`space-y-3 flex-1 overflow-y-auto max-h-[550px] min-h-[180px] p-2 rounded-2xl transition-all ${
        isOver ? 'bg-white/5 border border-dashed border-[#CCFF00]/20' : 'bg-transparent'
      }`}
    >
      {children}
    </div>
  );
};

// --- MAIN PORT MODULE ---

interface TeamFlowProps {
  // Configurable is optional now we use Zustand stores
  currentUserRole?: string;
}

export const TeamFlowModule: React.FC<TeamFlowProps> = ({
  currentUserRole
}) => {
  const { lang, accent: accentColor } = useUIStore();
  const t = translations[lang];

  const tasks = useTaskStore((state) => state.tasks);
  const projects = useProjectStore((state) => state.projects);
  const user = useAuthStore((state) => state.user);
  const addLog = useAuditStore((state) => state.addLog);
  const addToast = useToastStore((state) => state.addToast);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const addTask = useTaskStore((state) => state.addTask);
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);
  const addReputation = useAuthStore((state) => state.addReputation);

  const activeUserRole = currentUserRole || user?.role || 'Student';

  const [showAddTask, setShowAddTask] = useState(false);
  const [showGuestBlockModal, setShowGuestBlockModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskAssigned, setTaskAssigned] = useState('Alex Nguyen');
  const [taskDueDate, setTaskDueDate] = useState('2026-06-25');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 'p1');

  const columns: { label: string; value: TaskStatus; color: string }[] = [
    { label: lang === 'en' ? 'Backlog' : 'Tồn đọng', value: 'Backlog', color: '#ff007f' },
    { label: lang === 'en' ? 'To Do' : 'Cần làm', value: 'To Do', color: '#00e5ff' },
    { label: lang === 'en' ? 'Doing' : 'Đang làm', value: 'Doing', color: '#ffb300' },
    { label: lang === 'en' ? 'Review' : 'Đánh giá', value: 'Review', color: '#bd00ff' },
    { label: lang === 'en' ? 'Done' : 'Hoàn thành', value: 'Done', color: '#10b981' }
  ];

  const handleNextStatus = (taskId: string, currentStatus: TaskStatus) => {
    if (activeUserRole === 'Guest') {
      setShowGuestBlockModal(true);
      return;
    }
    const statusOrder: TaskStatus[] = ['Backlog', 'To Do', 'Doing', 'Review', 'Done'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      updateTaskStatus(taskId, nextStatus);
      addLog(`Advanced task status from '${currentStatus}' to '${nextStatus}'`, 'TeamFlow Pro', user?.fullName || 'Academic Peer');
      addToast(lang === 'en' ? `Task moved to ${nextStatus}` : `Nhiệm vụ chuyển sang ${nextStatus}`, 'info');
      
      if (nextStatus === 'Done') {
        addReputation(120);
        addToast(lang === 'en' ? `Earned +120 Reputation Points!` : `Nhận +120 Điểm Uy Tín!`, 'success');
        addNotification(
          lang === 'en' ? 'Sprint Task Completed ✓' : 'Công việc hoàn thành ✓',
          `You compiled and completed the task card. Dynamic sprint velocity metrics recalculated.`,
          'task'
        );
      }
    }
  };

  const handlePrevStatus = (taskId: string, currentStatus: TaskStatus) => {
    if (activeUserRole === 'Guest') {
      setShowGuestBlockModal(true);
      return;
    }
    const statusOrder: TaskStatus[] = ['Backlog', 'To Do', 'Doing', 'Review', 'Done'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex > 0) {
      const prevStatus = statusOrder[currentIndex - 1];
      updateTaskStatus(taskId, prevStatus);
      addLog(`Moved task status back from '${currentStatus}' to '${prevStatus}'`, 'TeamFlow Pro', user?.fullName || 'Academic Peer');
      addToast(lang === 'en' ? `Task moved back to ${prevStatus}` : `Trở lại trạng thái ${prevStatus}`, 'info');
    }
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeUserRole === 'Guest') {
      setShowGuestBlockModal(true);
      return;
    }
    if (!taskTitle) return;

    if (taskTitle.length < 5) {
      addToast(
        lang === 'en' ? 'Task title must be at least 5 characters long.' : 'Tiêu đề công việc phải có ít nhất 5 ký tự.',
        'error'
      );
      return;
    }

    const matchedProj = projects.find(p => p.id === selectedProjectId);
    const created = addTask({
      projectId: selectedProjectId,
      projectName: matchedProj ? matchedProj.name : 'Individual Task',
      title: taskTitle,
      description: taskDesc,
      priority: taskPriority,
      status: 'To Do',
      assignedTo: taskAssigned,
      assignedAvatar: 
        taskAssigned === 'Alex Nguyen' ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60' :
        taskAssigned === 'Linh Dang' ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60' :
        taskAssigned === 'Minh Hoang' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60' :
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60',
      dueDate: taskDueDate
    });

    addLog(`Dispatched new plan work: ${taskTitle}`, 'TeamFlow Pro', user?.fullName || 'Academic Peer');
    addReputation(40);
    addToast(lang === 'en' ? `Task created successfully +40 XP!` : `Đăng ký công việc thành công +40 XP!`, 'success');

    // Notify assignee
    if (taskAssigned !== user?.fullName) {
      addNotification(
        lang === 'en' ? 'New Task Assigned' : 'Công việc mới được giao',
        `You assigned "${taskTitle}" to ${taskAssigned} inside project workspace.`,
        'task'
      );
    }

    // Reset states
    setTaskTitle('');
    setTaskDesc('');
    setShowAddTask(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (activeUserRole === 'Guest') {
      setShowGuestBlockModal(true);
      return;
    }

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const matchedTask = tasks.find((t) => t.id === taskId);
    if (!matchedTask) return;

    if (matchedTask.status !== newStatus) {
      updateTaskStatus(taskId, newStatus);
      addLog(`Dragged task '${matchedTask.title}' to column '${newStatus}'`, 'TeamFlow Pro', user?.fullName || 'Academic Peer');
      addToast(lang === 'en' ? `Task moved to ${newStatus}` : `Đã chuyển nhiệm vụ sang ${newStatus}`, 'success');

      if (newStatus === 'Done') {
        addReputation(120);
        addToast(lang === 'en' ? `Earned +120 Reputation Points!` : `Nhận +120 Điểm Uy Tín!`, 'success');
        addNotification(
          lang === 'en' ? 'Sprint Task Completed ✓' : 'Công việc hoàn thành ✓',
          `You dragged task "${matchedTask.title}" to Done. Agile stats updated dynamically!`,
          'task'
        );
      }
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const totalTasks = tasks.length || 1;
  const sprintBurnProgress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="p-1 md:p-4 space-y-6">
        {/* Metrics and Burn Down Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#111111] border border-white/5 rounded-[32px] p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[9px] font-bold text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-full font-mono uppercase">
                  {lang === 'en' ? 'Active Sprint Tracker' : 'Theo dõi Sprint Hoạt động'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{lang === 'en' ? 'End Date: June 20, 2026' : 'Hạn sprint: 20 Tháng 6, 2026'}</span>
              </div>
              <h3 className="text-xl font-bold text-white font-display">{t.appName} {lang === 'en' ? 'Sprint Progress' : 'Tiến độ Sprint'}</h3>
              <p className="text-slate-400 text-xs">{lang === 'en' ? 'Tracking graduation team contribution goals across Agile sprints milestones.' : 'Theo dõi mục tiêu đóng góp của nhóm khoa học qua các cột mốc Agile sprint.'}</p>
            </div>

            <div className="space-y-3 mt-6 lg:mt-0">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-yellow-500" /> {t.tfBurnLabel}</span>
                <span className="font-bold text-white">{sprintBurnProgress}% Done ({completedTasks}/{totalTasks} tasks)</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(204,255,0,0.5)]"
                  style={{ width: `${sprintBurnProgress}%`, backgroundColor: accentColor }}
                />
              </div>
            </div>
            <div className="absolute -right-12 -bottom-10 w-48 h-48 blur-[80px] opacity-10 rounded-full" style={{ backgroundColor: accentColor }}></div>
          </div>

          {/* Quick controls panel */}
          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-6 flex flex-col justify-between">
            <div className="space-y-1">
              <h4 className="text-xs text-slate-400 uppercase font-bold tracking-wider font-mono">{lang === 'en' ? 'Agile Action Board' : 'Bảng Hoạt Động Agile'}</h4>
              <p className="text-[11px] text-slate-500">{lang === 'en' ? 'Fast tracking utility tools designed to assign cards instantly.' : 'Các công cụ tiện ích giúp phân công thẻ công việc nhanh chóng.'}</p>
            </div>
            
            <button 
              onClick={() => {
                if (activeUserRole === 'Guest') {
                  setShowGuestBlockModal(true);
                } else {
                  setShowAddTask(true);
                }
              }}
              className="w-full py-3 mt-4 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {t.btnAddTask}
            </button>
          </div>
        </div>

        {/* Kanban Board Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.value);
            return (
              <div 
                key={col.value} 
                className="bg-[#0C0C0C] border border-white/5 rounded-3xl p-4 flex flex-col space-y-4 min-w-[220px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-xs font-black text-white font-display tracking-tight uppercase">{col.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-white/5 text-slate-400 rounded-md">
                    {colTasks.length}
                  </span>
                </div>

                {/* Droppable Columns Area */}
                <DroppableColumn id={col.value}>
                  {colTasks.map(task => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      accentColor={accentColor}
                      lang={lang}
                      handlePrevStatus={handlePrevStatus}
                      handleNextStatus={handleNextStatus}
                      colValue={col.value}
                    />
                  ))}

                  {colTasks.length === 0 && (
                    <div className="h-24 border border-dashed border-white/5 rounded-2xl flex items-center justify-center text-[10px] text-slate-600">
                      {lang === 'en' ? 'Column empty' : 'Cột trống'}
                    </div>
                  )}
                </DroppableColumn>
              </div>
            );
          })}
        </div>

        {/* Dispatch task modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
            <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-[32px] p-6 space-y-4">
              <h3 className="text-lg font-black text-white font-display">{t.addTaskModalTitle}</h3>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Introduce new plans coordinates. Newly added tasks append directly onto the To Do column list.' : 'Nhập thông tin kế hoạch và yêu cầu kỹ thuật. Công việc mới sẽ được hiển thị tại cột Cần làm.'}
              </p>

              <form onSubmit={handleAddTaskSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.categoryTitle}</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-[#161616] border border-white/5 text-xs text-slate-300 rounded-xl p-3 focus:outline-none focus:border-white/20 transition cursor-pointer"
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.taskTitleLabel}</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Implement schema indexes' : 'Vd: Thiết kế quan hệ thực thể database'}
                    className="w-full bg-[#161616] border border-white/5 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-white/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.taskDescLabel}</label>
                  <textarea
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    rows={2}
                    placeholder={lang === 'en' ? 'Reference parameters, acceptance criteria, constraints...' : 'Mô tả đầu ra, tiêu chí kiểm thử, ràng buộc...'}
                    className="w-full bg-[#161616] border border-white/5 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-white/20 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.taskPriorityLabel}</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="w-full bg-[#161616] border border-white/5 text-xs text-slate-300 rounded-xl p-3 focus:outline-none focus:border-white/20 transition cursor-pointer"
                    >
                      <option value="Low">{lang === 'en' ? 'Low Priority' : 'Mức Thấp'}</option>
                      <option value="Medium">{lang === 'en' ? 'Medium Priority' : 'Mức Trung bình'}</option>
                      <option value="High">{lang === 'en' ? 'High Priority' : 'Mức Cao'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.taskDueDateLabel}</label>
                    <input
                      type="date"
                      required
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full bg-[#161616] border border-white/5 text-xs text-slate-300 rounded-xl p-3 focus:outline-none focus:border-white/20 transition cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.taskAssignedLabel}</label>
                  <select
                    value={taskAssigned}
                    onChange={(e) => setTaskAssigned(e.target.value)}
                    className="w-full bg-[#161616] border border-white/5 text-xs text-slate-300 rounded-xl p-3 focus:outline-none focus:border-white/20 transition cursor-pointer"
                  >
                    <option value="Alex Nguyen">Alex Nguyen</option>
                    <option value="Linh Dang">Linh Dang</option>
                    <option value="Minh Hoang">Minh Hoang</option>
                    <option value="Tomas Ly">Tomas Ly</option>
                    <option value="Phuong Mai">Phuong Mai</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className="px-4 py-2 bg-white/5 text-slate-300 text-xs font-bold rounded-xl hover:bg-white/10 cursor-pointer"
                  >
                    {t.btnCancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-black text-xs font-black uppercase rounded-xl cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                  >
                    {t.btnSubmit}
                  </button>
                </div>
              </form>
            </div>
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
              <p className="text-xs text-slate-300 leading-relaxed">
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
    </DndContext>
  );
};
