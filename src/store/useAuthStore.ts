import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, UserProfile } from '../types';

export interface AuthAccount {
  email: string;
  password: string;
  fullName: string;
  studentId: string;
  role: Role;
}

interface AuthState {
  user: UserProfile | null;
  accounts: AuthAccount[];
  login: (payload: { fullName: string; role: Role; studentId: string; email: string }) => void;
  registerAccount: (account: AuthAccount) => boolean;
  authenticate: (email: string, password: string) => AuthAccount | undefined;
  loginAsGuest: () => void;
  logout: () => void;
  updateProfile: (profileUpdates: Partial<UserProfile>) => void;
  addReputation: (amount: number) => void;
  restoreDefaultAccounts?: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accounts: [
        {
          email: 'admin@example.com',
          password: 'Admin12345',
          fullName: 'Campus Admin',
          studentId: 'ADMIN001',
          role: 'Admin',
        },
        {
          email: 'mod@example.com',
          password: 'Mod12345',
          fullName: 'Forum Moderator',
          studentId: 'MOD001',
          role: 'Moderator',
        },
        {
          email: 'student@example.com',
          password: 'Student123',
          fullName: 'Student Member',
          studentId: '73DCTT20042',
          role: 'Student',
        },
        {
          email: 'guest@st.utt.edu.vn',
          password: 'Guest123',
          fullName: 'Guest Student',
          studentId: 'GUEST01',
          role: 'Guest',
        },
      ],

      login: (payload) => {
        const newUser: UserProfile = {
          id: `u_${Date.now()}`,
          fullName: payload.fullName,
          studentId: payload.studentId,
          email: payload.email,
          role: payload.role,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
          faculty: 'Computer Engineering Department',
          major: 'Software Development',
          academicYear: 'Senior',
          biography: 'Ambitious developer passionate about modular database structures and client-side systems optimization.',
          skills: [
            { name: 'HTML', level: 5 },
            { name: 'CSS', level: 4 },
            { name: 'JavaScript', level: 4 },
            { name: 'React', level: 3 },
            { name: 'NodeJS', level: 2 },
            { name: 'MySQL', level: 3 }
          ],
          interests: ['Academic Hackathons', 'UI Refinements', 'Database Scaling'],
          careerGoals: 'To specialize as a Lead Solutions Architect managing scalable collaborative SaaS frameworks.',
          reputationScore: 2840,
          github: '',
          linkedin: '',
          completedProjects: [],
        };
        set({ user: newUser });
      },

      registerAccount: (account) => {
        let added = false;
        set((state) => {
          const exists = state.accounts.some((item) => item.email.toLowerCase() === account.email.toLowerCase());
          if (exists) return state;
          added = true;
          return {
            ...state,
            accounts: [account, ...state.accounts],
          };
        });
        return added;
      },

      authenticate: (email, password) => {
        const normalized = email.trim().toLowerCase();
        const account = get().accounts.find(
          (accountItem) => accountItem.email.toLowerCase() === normalized && accountItem.password === password
        );
        return account;
      },

      loginAsGuest: () => {
        const guestUser: UserProfile = {
          id: 'u_guest',
          fullName: 'Guest Student',
          studentId: 'GUEST01',
          email: 'guest@st.utt.edu.vn',
          role: 'Guest',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
          faculty: 'General Education Division',
          major: 'None',
          academicYear: 'Freshman',
          biography: 'Currently exploring academic project offerings in read-only guest environment.',
          skills: [],
          interests: [],
          careerGoals: '',
          reputationScore: 0,
          github: undefined,
          linkedin: undefined,
          completedProjects: [],
        };
        set({ user: guestUser });
      },

      logout: () => set({ user: null }),

      updateProfile: (profileUpdates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...profileUpdates } : null,
        })),

      addReputation: (amount) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, reputationScore: state.user.reputationScore + amount }
            : null,
        })),
      restoreDefaultAccounts: () => {
        set(() => ({
          accounts: [
            {
              email: 'admin@example.com',
              password: 'Admin12345',
              fullName: 'Campus Admin',
              studentId: 'ADMIN001',
              role: 'Admin',
            },
            {
              email: 'mod@example.com',
              password: 'Mod12345',
              fullName: 'Forum Moderator',
              studentId: 'MOD001',
              role: 'Moderator',
            },
            {
              email: 'student@example.com',
              password: 'Student123',
              fullName: 'Student Member',
              studentId: '73DCTT20042',
              role: 'Student',
            },
            {
              email: 'guest@st.utt.edu.vn',
              password: 'Guest123',
              fullName: 'Guest Student',
              studentId: 'GUEST01',
              role: 'Guest',
            },
          ],
        }));
      },
    }),
    {
      name: 'cfg_auth_store',
    }
  )
);

// Expose store for quick debugging in browser console: `authStore.getState().restoreDefaultAccounts()`
if (typeof window !== 'undefined') {
  (window as any).authStore = useAuthStore;
}
