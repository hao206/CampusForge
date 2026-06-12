import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  login: (payload: { fullName: string; role: string; studentId: string; email: string }) => void;
  loginAsGuest: () => void;
  logout: () => void;
  updateProfile: (profileUpdates: Partial<UserProfile>) => void;
  addReputation: (amount: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

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
        };
        set({ user: newUser });
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
    }),
    {
      name: 'cfg_auth_store',
    }
  )
);
