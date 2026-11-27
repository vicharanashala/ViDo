import { getFirebaseInstance } from '../features/auth/firebase';

export async function getAuthHeaders(uid?: string, email?: string): Promise<HeadersInit> {
  const { auth } = getFirebaseInstance();
  let token = '';

  if (auth?.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch {
      // Fallback
    }
  }

  if (!token) {
    const userUid = uid || 'demo-user-uid';
    const userEmail = email || `${userUid}@vido.app`;
    token = `dev-token-${userUid}:${userEmail}`;
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
