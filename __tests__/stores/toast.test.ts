import { useToastStore, toast } from '@/stores/toast';
import { act } from '@testing-library/react';

describe('Toast Store', () => {
  beforeEach(() => {
    // ストアをリセット
    act(() => {
      useToastStore.getState().clearToasts();
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('addToast', () => {
    it('should add a toast with generated id', () => {
      act(() => {
        useToastStore.getState().addToast({
          type: 'success',
          message: 'Test message',
        });
      });

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Test message');
      expect(toasts[0].id).toBeDefined();
    });

    it('should add multiple toasts', () => {
      act(() => {
        useToastStore.getState().addToast({ type: 'success', message: 'First' });
        useToastStore.getState().addToast({ type: 'error', message: 'Second' });
      });

      const { toasts } = useToastStore.getState();
      expect(toasts).toHaveLength(2);
    });

    it('should auto-remove toast after duration', () => {
      act(() => {
        useToastStore.getState().addToast({
          type: 'info',
          message: 'Auto remove',
          duration: 3000,
        });
      });

      expect(useToastStore.getState().toasts).toHaveLength(1);

      // 3秒後
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('removeToast', () => {
    it('should remove a specific toast', () => {
      act(() => {
        useToastStore.getState().addToast({ type: 'success', message: 'Keep' });
        useToastStore.getState().addToast({ type: 'error', message: 'Remove' });
      });

      const toasts = useToastStore.getState().toasts;
      const toRemove = toasts.find((t) => t.message === 'Remove');

      act(() => {
        useToastStore.getState().removeToast(toRemove!.id);
      });

      const remaining = useToastStore.getState().toasts;
      expect(remaining).toHaveLength(1);
      expect(remaining[0].message).toBe('Keep');
    });
  });

  describe('clearToasts', () => {
    it('should remove all toasts', () => {
      act(() => {
        useToastStore.getState().addToast({ type: 'success', message: 'One' });
        useToastStore.getState().addToast({ type: 'error', message: 'Two' });
        useToastStore.getState().addToast({ type: 'info', message: 'Three' });
      });

      expect(useToastStore.getState().toasts).toHaveLength(3);

      act(() => {
        useToastStore.getState().clearToasts();
      });

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('helper functions', () => {
    it('toast.success should add success toast', () => {
      act(() => {
        toast.success('Success message');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Success message');
    });

    it('toast.error should add error toast', () => {
      act(() => {
        toast.error('Error message');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('error');
    });

    it('toast.info should add info toast', () => {
      act(() => {
        toast.info('Info message');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('info');
    });

    it('toast.warning should add warning toast', () => {
      act(() => {
        toast.warning('Warning message');
      });

      const { toasts } = useToastStore.getState();
      expect(toasts[0].type).toBe('warning');
    });
  });
});
