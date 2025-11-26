import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AccountProfile {
  id: string;
  threads_user_id: string;
  username: string;
  profile_picture_url?: string;
}

interface AccountState {
  accountId: string | null;
  profile: AccountProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAccountId: (id: string | null) => void;
  setProfile: (profile: AccountProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchProfile: () => Promise<void>;
  logout: () => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accountId: null,
      profile: null,
      isLoading: false,
      error: null,

      setAccountId: (id) => set({ accountId: id }),

      setProfile: (profile) => set({ profile }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      fetchProfile: async () => {
        const { accountId } = get();
        if (!accountId) return;

        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/profile');
          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }

          const data = await response.json();
          set({
            profile: data.profile,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      logout: () => {
        // Cookieをクリア（サーバーサイドで処理が必要な場合もある）
        document.cookie = 'account_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        set({
          accountId: null,
          profile: null,
          error: null,
        });
      },
    }),
    {
      name: 'account-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accountId: state.accountId,
      }),
    }
  )
);

// アカウントIDを取得するヘルパー（SSRセーフ）
export function getAccountId(): string | null {
  if (typeof window === 'undefined') return null;
  return useAccountStore.getState().accountId;
}
