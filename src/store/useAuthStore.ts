import { create } from 'zustand';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  authError: string | null;
  showLoginModal: boolean;
  setShowLoginModal: (open: boolean) => void;
  signIn: () => Promise<void>; // Google Pop-up
  signInWithRedirect: () => Promise<void>; // Google Redirect Fallback for strictly sandboxed mobile frames
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  let unsubscribeProfile: (() => void) | null = null;

  // Listen for real Firebase auth changes
  onAuthStateChanged(auth, async (user) => {
    if (unsubscribeProfile) {
      unsubscribeProfile();
      unsubscribeProfile = null;
    }

    if (user) {
      set({ loading: true });
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        const isDeveloperAdmin = user.email === 'didhesaythatreally@gmail.com';

        if (!userSnap.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            username: user.displayName?.replace(/\s+/g, '_').toLowerCase() || `user_${user.uid.slice(0, 5)}`,
            email: user.email || '',
            karma: 15,
            isAdmin: isDeveloperAdmin,
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
              set({ user: null, profile: null, loading: false, initialized: true, authError: "This account has been suspended." });
              return;
            }

            // Sync admin status securely based on whitelisted email
            if (isDeveloperAdmin) {
              profile.isAdmin = true;
            }

            set({ user, profile, loading: false, initialized: true, authError: null });
          }
        }, (error) => {
          console.error("Profile synchronization failure:", error);
          set({ loading: false, initialized: true });
        });
      } catch (err: any) {
        console.error("Auth reference sync error:", err);
        set({ loading: false, initialized: true, authError: err.message });
      }

    } else {
      set({ user: null, profile: null, loading: false, initialized: true });
    }
  });

  return {
    user: null,
    profile: null,
    loading: true,
    initialized: false,
    authError: null,
    showLoginModal: false,
    setShowLoginModal: (open) => set({ showLoginModal: open }),
    setProfile: (profile) => set({ profile }),
    clearError: () => set({ authError: null }),
    
    signIn: async () => {
      set({ loading: true, authError: null });
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup(auth, provider);
      } catch (error: any) {
        set({ loading: false });
        console.error('Google Sign-In Error:', error);
        
        const errMsg = error?.message || "";
        const errCode = error?.code || "";
        if (errCode === 'auth/popup-closed-by-user' || errMsg.includes('popup-closed-by-user')) {
          set({ authError: "popup_closed" });
          return;
        }
        if (errCode === 'auth/cancelled-popup-request' || errMsg.includes('cancelled-popup-request')) {
          set({ authError: "popup_cancelled" });
          return;
        }
        if (errCode === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
          const domain = window.location.hostname;
          set({ authError: `unauthorized_domain:${domain}` });
          return;
        }
        
        // Detailed fallback guide inside sandboxed environments
        set({ authError: error.message || "Google Authentication failed. Please use email registration or the Google Redirect fallback below." });
      }
    },

    signInWithRedirect: async () => {
      set({ loading: true, authError: null });
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithRedirect(auth, provider);
      } catch (error: any) {
        set({ loading: false });
        console.error("Redirect auth failed:", error);
        
        const errMsg = error?.message || "";
        const errCode = error?.code || "";
        if (errCode === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
          const domain = window.location.hostname;
          set({ authError: `unauthorized_domain:${domain}` });
          return;
        }
        
        set({ authError: error.message || "OAuth redirect failed." });
      }
    },

    signUpWithEmail: async (email, password, username) => {
      set({ loading: true, authError: null });
      try {
        const cleanName = username.replace(/\s+/g, '_').trim().toLowerCase();
        if (!cleanName) {
          throw new Error("Codename cannot be blank.");
        }

        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const isDeveloperAdmin = email === 'didhesaythatreally@gmail.com';
        
        // Seed new profile immediately
        const userRef = doc(db, 'users', cred.user.uid);
        const newProfile: UserProfile = {
          uid: cred.user.uid,
          username: cleanName,
          email: email,
          karma: 15,
          isAdmin: isDeveloperAdmin,
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
      } catch (error: any) {
        set({ loading: false });
        console.error('Email Sign-Up Error:', error);
        set({ authError: error.message || "Drafting credentials aborted." });
        throw error;
      }
    },

    signInWithEmail: async (email, password) => {
      set({ loading: true, authError: null });
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        set({ loading: false });
        console.error('Email Sign-In Error:', error);
        set({ authError: error.message || "Access request rejected." });
        throw error;
      }
    },

    sendPasswordReset: async (email) => {
      set({ loading: true, authError: null });
      try {
        await sendPasswordResetEmail(auth, email);
        set({ loading: false });
      } catch (error: any) {
        set({ loading: false });
        console.error('Password Reset Error:', error);
        set({ authError: error.message || "Recovery transmission aborted." });
        throw error;
      }
    },

    logout: async () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
      await signOut(auth);
      set({ user: null, profile: null, loading: false, initialized: true, authError: null });
    }
  };
});
