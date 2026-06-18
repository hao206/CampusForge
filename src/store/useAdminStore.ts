import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser, NotificationAudience, Role, SystemNotification } from '../types';

const nowLabel = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

const INITIAL_USERS: AdminUser[] = [
  {
    id: 'u1',
    fullName: 'Alex Nguyen',
    email: 'alex@st.utt.edu.vn',
    role: 'Project Leader',
    status: 'Active',
    lastActiveAt: '2026-06-17 21:40:00',
    activityHistory: ['Login', 'Created project', 'Updated task status'],
  },
  {
    id: 'u2',
    fullName: 'Linh Dang',
    email: 'linh@st.utt.edu.vn',
    role: 'Moderator',
    status: 'Active',
    lastActiveAt: '2026-06-17 19:12:00',
    activityHistory: ['Login', 'Uploaded resource', 'Moderated forum post'],
  },
  {
    id: 'u3',
    fullName: 'Minh Hoang',
    email: 'minh@st.utt.edu.vn',
    role: 'Student',
    status: 'Locked',
    lastActiveAt: '2026-06-14 08:22:00',
    activityHistory: ['Login failed', 'Account locked by Admin'],
  },
  {
    id: 'u4',
    fullName: 'Prof. Tran Quang',
    email: 'tran.quang@utt.edu.vn',
    role: 'Admin',
    status: 'Active',
    lastActiveAt: '2026-06-17 22:05:00',
    activityHistory: ['Login', 'Approved resource', 'Changed user role'],
  },
];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'sys_1',
    title: 'Maintenance window',
    channel: 'System',
    audience: 'All',
    message: 'CampusForge will enter read-only maintenance mode at 23:00.',
    createdAt: '2026-06-17 10:00:00',
  },
  {
    id: 'sys_2',
    title: 'Project review reminder',
    channel: 'Email',
    audience: 'Project Leader',
    message: 'Please review pending student applications before Friday.',
    createdAt: '2026-06-17 11:30:00',
  },
];

interface AdminState {
  users: AdminUser[];
  notifications: SystemNotification[];
  createUser: (payload: Pick<AdminUser, 'fullName' | 'email' | 'role'>) => void;
  updateUser: (userId: string, updates: Partial<Pick<AdminUser, 'fullName' | 'email' | 'role'>>) => void;
  deleteUser: (userId: string) => void;
  toggleUserLock: (userId: string) => void;
  resetUserPassword: (userId: string) => void;
  changeUserRole: (userId: string, role: Role) => void;
  addSystemNotification: (payload: Pick<SystemNotification, 'title' | 'channel' | 'audience' | 'message'>) => void;
}

const appendActivity = (user: AdminUser, activity: string): AdminUser => ({
  ...user,
  lastActiveAt: nowLabel(),
  activityHistory: [activity, ...user.activityHistory].slice(0, 8),
});

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      users: INITIAL_USERS,
      notifications: INITIAL_NOTIFICATIONS,

      createUser: (payload) =>
        set((state) => ({
          users: [
            {
              id: `u_${Date.now()}`,
              ...payload,
              status: 'Active',
              lastActiveAt: nowLabel(),
              activityHistory: ['Created by Admin'],
            },
            ...state.users,
          ],
        })),

      updateUser: (userId, updates) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId ? appendActivity({ ...user, ...updates }, 'Profile updated by Admin') : user
          ),
        })),

      deleteUser: (userId) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
        })),

      toggleUserLock: (userId) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? appendActivity(
                  { ...user, status: user.status === 'Active' ? 'Locked' : 'Active' },
                  user.status === 'Active' ? 'Locked by Admin' : 'Unlocked by Admin'
                )
              : user
          ),
        })),

      resetUserPassword: (userId) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId ? appendActivity(user, 'Password reset email sent') : user
          ),
        })),

      changeUserRole: (userId, role) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId ? appendActivity({ ...user, role }, `Role changed to ${role}`) : user
          ),
        })),

      addSystemNotification: (payload) =>
        set((state) => ({
          notifications: [
            {
              id: `sys_${Date.now()}`,
              ...payload,
              audience: payload.audience as NotificationAudience,
              createdAt: nowLabel(),
            },
            ...state.notifications,
          ],
        })),
    }),
    {
      name: 'cfg_admin_store',
    }
  )
);

export default useAdminStore;
