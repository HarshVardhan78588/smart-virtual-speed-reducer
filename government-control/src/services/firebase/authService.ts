import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  UserCredential,
  Unsubscribe
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

export const GOVT_ADMIN_UID = 'MFT8QS5528ha8ZC2Xl8uMmu6QNz1';
export const DEFAULT_ADMIN_EMAIL = 'admin@svsr-demo.in';

export interface AuthActionResult {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: string;
}

export const authService = {
  /**
   * Authenticate authority user using Firebase email/password
   */
  async loginWithEmail(email: string, password: string): Promise<AuthActionResult> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      return {
        success: true,
        user: userCredential.user
      };
    } catch (err: any) {
      const code = err?.code || '';
      let message = 'Failed to authenticate authority credentials.';

      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        message = 'Invalid email or password. Please verify your Government Authority credentials.';
      } else if (code === 'auth/invalid-email') {
        message = 'The specified email address format is invalid.';
      } else if (code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to too many failed attempts. Please try again later.';
      } else if (code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      } else if (err?.message) {
        message = err.message;
      }

      return {
        success: false,
        error: message,
        errorCode: code
      };
    }
  },

  /**
   * End authority console session
   */
  async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('[authService.logout] Sign out error:', err);
    }
  },

  /**
   * Realtime observer for current authority authentication state
   */
  subscribeToAuthState(callback: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  },

  /**
   * Get currently active session user synchronously
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  /**
   * Check if a given user has the designated Government Administrator authority UID
   */
  isGovernmentAdmin(user: User | null): boolean {
    if (!user) return false;
    return user.uid === GOVT_ADMIN_UID || user.email === DEFAULT_ADMIN_EMAIL;
  }
};
