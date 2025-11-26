'use client';

import { ReactNode, useEffect } from 'react';
import { ToastProvider } from './Toast';
import { useAccountStore } from '@/stores';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * クライアントサイドプロバイダーのラッパー
 * - トースト通知
 * - アカウント状態の初期化
 */
export function Providers({ children }: ProvidersProps) {
  const setAccountId = useAccountStore((state) => state.setAccountId);
  const accountId = useAccountStore((state) => state.accountId);

  // localStorageとcookieからアカウントIDを同期
  useEffect(() => {
    // localStorageから復元（Zustand persistで自動的に行われる）
    // cookieにも同期
    if (accountId) {
      document.cookie = `account_id=${accountId}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }

    // 旧localStorage形式からの移行
    const legacyAccountId = localStorage.getItem('account_id');
    if (legacyAccountId && !accountId) {
      setAccountId(legacyAccountId);
      document.cookie = `account_id=${legacyAccountId}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }
  }, [accountId, setAccountId]);

  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}
