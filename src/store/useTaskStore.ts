import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskStatus } from '../types';
import { INITIAL_TASKS } from '../data';

interface TaskState {
  tasks: Task[];
  addTask: (newTask: Omit<Task, 'id' | 'commentsCount'>) => Task;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: INITIAL_TASKS,

      addTask: (newTask) => {
        const added: Task = {
          ...newTask,
          id: `t_${Date.now()}`,
          commentsCount: 0,
        };
        set((state) => ({ tasks: [added, ...state.tasks] }));
        return added;
      },

      updateTaskStatus: (taskId, newStatus) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          ),
        })),

      setTasks: (tasks) => set({ tasks }),
    }),
    {
      name: 'cfg_tasks_store',
    }
  )
);
export default useTaskStore;
