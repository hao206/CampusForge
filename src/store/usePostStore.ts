import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Post } from '../types';
import { INITIAL_POSTS } from '../data';

interface PostState {
  posts: Post[];
  addPost: (content: string, images: string[], topic: string, author: string, role: string, avatar: string) => Post;
  likePost: (postId: string) => void;
  addComment: (postId: string, commentText: string, author: string) => void;
  moderatePost: (postId: string, action: 'Approve' | 'Reject') => void;
  updatePostAdminState: (postId: string, updates: Pick<Partial<Post>, 'pinned' | 'locked' | 'hidden' | 'moderationStatus'>) => void;
  setPosts: (posts: Post[]) => void;
}

export const usePostStore = create<PostState>()(
  persist(
    (set) => ({
      posts: INITIAL_POSTS,

      addPost: (content, images, topic, author, role, avatar) => {
        const added: Post = {
          id: `post_${Date.now()}`,
          author,
          role,
          avatar,
          content,
          images,
          likes: 0,
          comments: [],
          topic,
          createdAt: 'Just now',
        };
        set((state) => ({ posts: [added, ...state.posts] }));
        return added;
      },

      likePost: (postId) =>
        set((state) => ({
          posts: state.posts.map((post) => {
            if (post.id === postId) {
              const isLoved = !post.loved;
              return {
                ...post,
                likes: isLoved ? post.likes + 1 : post.likes - 1,
                loved: isLoved,
              };
            }
            return post;
          }),
        })),

      addComment: (postId, commentText, author) =>
        set((state) => ({
          posts: state.posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [
                  ...post.comments,
                  { author, content: commentText, time: 'Just now' },
                ],
              };
            }
            return post;
          }),
        })),

      moderatePost: (postId, action) =>
        set((state) => ({
          posts:
            action === 'Reject'
              ? state.posts.filter((p) => p.id !== postId)
              : state.posts, // For simple mock moderation, reject deletes the post.
        })),

      updatePostAdminState: (postId, updates) =>
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId ? { ...post, ...updates } : post
          ),
        })),

      setPosts: (posts) => set({ posts }),
    }),
    {
      name: 'cfg_posts_store',
    }
  )
);
export default usePostStore;
