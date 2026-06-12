import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resource } from '../types';
import { INITIAL_RESOURCES } from '../data';

interface ResourceState {
  resources: Resource[];
  addResource: (title: string, category: 'Report' | 'Slides' | 'Source Code' | 'Template' | 'Material', size: string, sharedBy: string) => Resource;
  incrementDownloads: (resId: string) => void;
  setResources: (resources: Resource[]) => void;
}

export const useResourceStore = create<ResourceState>()(
  persist(
    (set) => ({
      resources: INITIAL_RESOURCES,

      addResource: (title, category, size, sharedBy) => {
        const added: Resource = {
          id: `r_${Date.now()}`,
          title,
          category,
          sharedBy,
          downloads: 0,
          size,
          link: '#',
        };
        set((state) => ({ resources: [added, ...state.resources] }));
        return added;
      },

      incrementDownloads: (resId) =>
        set((state) => ({
          resources: state.resources.map((res) =>
            res.id === resId ? { ...res, downloads: res.downloads + 1 } : res
          ),
        })),

      setResources: (resources) => set({ resources }),
    }),
    {
      name: 'cfg_resources_store',
    }
  )
);
export default useResourceStore;
