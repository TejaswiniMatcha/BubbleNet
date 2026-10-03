import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useExpiryEngine } from './useExpiryEngine.js';
import useBubbleStore from '../store/bubbleStore.js';
import { useUiActions } from '../store/uiStore.js';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  const mockNavigate = vi.fn();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../store/uiStore.js', () => ({
  useUiActions: vi.fn(),
}));

vi.mock('../sim/simulator.js', () => ({
  simulator: { resetDemo: vi.fn() },
}));

describe('useExpiryEngine', () => {
  let addToastMock;

  beforeEach(() => {
    vi.useFakeTimers();
    addToastMock = vi.fn();
    vi.mocked(useUiActions).mockReturnValue({ addToast: addToastMock });
    useBubbleStore.setState({ expiresAt: null, remaining: null, bubble: { id: '1' }, isDissolving: false });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it('sets remaining to null when expiresAt is null', () => {
    renderHook(() => useExpiryEngine(), { wrapper: MemoryRouter });
    expect(useBubbleStore.getState().remaining).toBeNull();
  });

  it('shows 5 minute toast when 5 mins remain', () => {
    const now = Date.now();
    useBubbleStore.setState({ expiresAt: now + 5 * 60 * 1000 + 1000 }); // 5 min 1 sec
    
    renderHook(() => useExpiryEngine(), { wrapper: MemoryRouter });
    
    // Fast forward 1.5 seconds
    act(() => { vi.advanceTimersByTime(1500); });
    
    expect(addToastMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Bubble expires in 5 minutes.', type: 'warning' })
    );
  });

  it('shows 1 minute toast when 1 min remains', () => {
    const now = Date.now();
    useBubbleStore.setState({ expiresAt: now + 60 * 1000 + 1000 }); // 1 min 1 sec
    
    renderHook(() => useExpiryEngine(), { wrapper: MemoryRouter });
    
    act(() => { vi.advanceTimersByTime(1500); });
    
    expect(addToastMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Bubble expires in 1 minute.', type: 'danger' })
    );
  });

  it('triggers dissolve overlay when time is up', () => {
    const now = Date.now();
    useBubbleStore.setState({ expiresAt: now + 1000 }); // 1 second
    
    renderHook(() => useExpiryEngine(), { wrapper: MemoryRouter });
    
    act(() => { vi.advanceTimersByTime(1500); });
    
    expect(useBubbleStore.getState().isDissolving).toBe(true);
  });
});
