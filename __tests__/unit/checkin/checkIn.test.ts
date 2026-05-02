/**
 * CHECKIN unit tests — spec: TEST_SPEC.md § Check-in
 */
import { renderHook, act } from '@testing-library/react';
import { useCheckIn } from '@/hooks/useCheckIn';
import { updateDoc } from 'firebase/firestore';

jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'user-abc' } },
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn().mockReturnThis(),
  updateDoc: jest.fn().mockResolvedValue(undefined),
}));

const NOW = 1_700_000_000_000;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useCheckIn — unit', () => {
  it('CHECKIN-U-01 writes checkedInAt and checkInExpiry on checkIn', async () => {
    const { result } = renderHook(() => useCheckIn());

    await act(async () => {
      await result.current.checkIn('facility-xyz');
    });

    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        checkedInAt: 'facility-xyz',
        checkInExpiry: NOW + 2 * 60 * 60 * 1000,
      }),
    );
  });

  it('CHECKIN-U-02 checkInExpiry is now + 2 hours (within 1 second)', async () => {
    const { result } = renderHook(() => useCheckIn());

    await act(async () => {
      await result.current.checkIn('facility-xyz');
    });

    const call = (updateDoc as jest.Mock).mock.calls[0][0];
    const expected = NOW + 2 * 60 * 60 * 1000;
    expect(Math.abs(call.checkInExpiry - expected)).toBeLessThanOrEqual(1000);
  });

  it('CHECKIN-U-03 checkOut clears checkedInAt to null', async () => {
    const { result } = renderHook(() => useCheckIn());

    await act(async () => {
      await result.current.checkOut();
    });

    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ checkedInAt: null }),
    );
  });

  it('CHECKIN-U-04 checking into B overwrites previous check-in at A', async () => {
    const { result } = renderHook(() => useCheckIn());

    await act(async () => {
      await result.current.checkIn('facility-aaa');
      await result.current.checkIn('facility-bbb');
    });

    const lastCall = (updateDoc as jest.Mock).mock.calls.at(-1)[0];
    expect(lastCall.checkedInAt).toBe('facility-bbb');
  });
});
