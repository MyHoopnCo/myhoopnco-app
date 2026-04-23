import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export function useCheckIn() {
  async function checkIn(facilityId: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');

    await updateDoc(doc(db, 'users', uid), {
      checkedInAt: facilityId,
      checkInExpiry: Date.now() + 2 * 60 * 60 * 1000,
    });
  }

  async function checkOut() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');

    await updateDoc(doc(db, 'users', uid), {
      checkedInAt: null,
      checkInExpiry: null,
    });
  }

  return { checkIn, checkOut };
}
