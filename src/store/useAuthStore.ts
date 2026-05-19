import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  let unsubscribeProfile: (() => void) | null = null;

  // Listen for auth changes
  onAuthStateChanged(auth, async (user) => {
    if (unsubscribeProfile) {
      unsubscribeProfile();
      unsubscribeProfile = null;
    }

    if (user) {
      // Get or create profile initially
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const newProfile: UserProfile = {
          uid: user.uid,
          username: user.displayName?.replace(/\s+/g, '_').toLowerCase() || `user_${user.uid.slice(0, 5)}`,
          email: user.email || '',
          karma: 0,
          isAdmin: user.email === 'didhesaythatreally@gmail.com',
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
      }

      // Listen for profile changes live
      unsubscribeProfile = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const profile = snap.data() as UserProfile;
          // Ban check
          if (profile.isBanned) {
            signOut(auth);
            set({ user: null, profile: null, loading: false, initialized: true });
            return;
          }
          // Ensure admin status is reflected in UI if email matches
          if (user.email === 'didhesaythatreally@gmail.com') {
            profile.isAdmin = true;
          }
          set({ user, profile, loading: false, initialized: true });
        }
      }, (error) => {
        console.error("Profile sync error:", error);
      });

    } else {
      set({ user: null, profile: null, loading: false, initialized: true });
    }
  });

  return {
    user: null,
    profile: null,
    loading: true,
    initialized: false,
    setProfile: (profile) => set({ profile }),
    signIn: async () => {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    },
    logout: async () => {
      await signOut(auth);
    }
  };
});
