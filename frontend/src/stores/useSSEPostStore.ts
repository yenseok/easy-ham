/**
 * SSE posts/stream 데이터 스토어
 * Dashboard에서 받은 새 글들을 저장
 *
 * NOTE: Dashboard에 데이터를 반영하는 로직은 다른 작업자가 담당합니다.
 * 이 스토어는 SSE에서 받은 데이터를 저장하기만 합니다.
 */

import { create } from 'zustand';
import type { NewPostEvent } from '@/services/sse/types';

interface SSEPostState {
  // posts/stream에서 받은 새 글들 (최신순)
  newPosts: NewPostEvent[];

  // 액션
  addPost: (post: NewPostEvent) => void;
  clearPosts: () => void;
  removePost: (postId: string) => void;
}

export const useSSEPostStore = create<SSEPostState>((set) => ({
  newPosts: [],

  addPost: (post) => {
    console.log(`[SSE Post Store] Adding new post: ${post.title}`);
    set((state) => ({
      newPosts: [post, ...state.newPosts],
    }));
  },

  clearPosts: () => {
    console.log('[SSE Post Store] Clearing all posts');
    set({ newPosts: [] });
  },

  removePost: (postId) => {
    console.log(`[SSE Post Store] Removing post: ${postId}`);
    set((state) => ({
      newPosts: state.newPosts.filter((post) => post.postId !== postId),
    }));
  },
}));
