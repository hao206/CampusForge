import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '../types';
import { INITIAL_PROJECTS } from '../data';

interface ProjectState {
  projects: Project[];
  createProject: (newProj: Omit<Project, 'id' | 'progress' | 'leaderId' | 'leaderName'>, leaderId: string, leaderName: string) => Project;
  applyProject: (projId: string, remark: string, applicantName: string) => void;
  updateProjectProgress: (projId: string, progress: number) => void;
  updateProjectAdminState: (projId: string, updates: Pick<Partial<Project>, 'reviewStatus' | 'hidden' | 'featured' | 'status'>) => void;
  deleteProject: (projId: string) => void;
  setProjects: (projects: Project[]) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: INITIAL_PROJECTS,

      createProject: (newProj, leaderId, leaderName) => {
        const added: Project = {
          ...newProj,
          id: `p_${Date.now()}`,
          progress: 0,
          leaderId,
          leaderName,
          reviewStatus: 'Pending',
          hidden: false,
          featured: false,
        };
        set((state) => ({ projects: [added, ...state.projects] }));
        return added;
      },

      applyProject: (_projId, _remark, _applicantName) => {
        // Application registration is a simulated system/logging action
        // But we can also set applied flag or just track applications locally if needed.
        // For general usage, we keep the signature and update matching projects team if needed.
      },

      updateProjectProgress: (projId, progress) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projId ? { ...p, progress } : p
          ),
        })),

      updateProjectAdminState: (projId, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projId ? { ...p, ...updates } : p
          ),
        })),

      deleteProject: (projId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projId),
        })),

      setProjects: (projects) => set({ projects }),
    }),
    {
      name: 'cfg_projects_store',
    }
  )
);
