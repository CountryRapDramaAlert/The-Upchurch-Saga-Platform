import { create } from 'zustand';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword
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
  signIn: () => Promise<void>; // Google Pop-up for Admin
  signInWithRedirect: () => Promise<void>; // Google Redirect Fallback for Admin
  signInWithEmail: (email: string, password: string) => Promise<void>; // Admin Password fallback
  logout: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
  clearError: () => void;
  loginAsSimulatedAdmin: () => void;
}

const ADMIN_EMAIL_WHITELIST = ['didhesaythatreally@gmail.com'];

export const useAuthStore = create<AuthState>((set, get) => {
  let unsubscribeProfile: (() => void) | null = null;

  // Listen for real Firebase auth changes (restricted to admin)
  onAuthStateChanged(auth, async (user) => {
    if (unsubscribeProfile) {
      unsubscribeProfile();
      unsubscribeProfile = null;
    }

    if (user) {
      const isWhitelisted = user.email ? ADMIN_EMAIL_WHITELIST.includes(user.email.toLowerCase()) : false;

      if (!isWhitelisted) {
        // If not the authorized administrator, immediately force log out and block access
        await signOut(auth);
        set({ user: null, profile: null, loading: false, initialized: true, authError: "ACCESS_DENIED: Unauthorized administrative portal." });
        return;
      }

      set({ loading: true });
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        // Seed/ensure admin profile exists in Firestore
        if (!userSnap.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            username: 'administrator',
            email: user.email || '',
            karma: 9999,
            isAdmin: true,
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, newProfile);
        }

        // Listen for admin profile live updates
        unsubscribeProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const profile = snap.data() as UserProfile;
            profile.isAdmin = true; // Always true for the whitelisted account
            set({ user, profile, loading: false, initialized: true, authError: null });
          }
        }, (error) => {
          console.error("Admin session synchronization failure:", error);
          set({ loading: false, initialized: true });
        });
      } catch (err: any) {
        console.error("Auth database sync error:", err);
        set({ loading: false, initialized: true, authError: err.message });
      }

    } else {
      // Check if we have an active simulated bypass stored in local storage
      const isSimulated = localStorage.getItem('admin_simulated') === 'true';
      if (isSimulated) {
        set({
          user: { uid: 'admin_bypass_uid', email: 'didhesaythatreally@gmail.com' } as User,
          profile: {
            uid: 'admin_bypass_uid',
            username: 'administrator',
            email: 'didhesaythatreally@gmail.com',
            karma: 9999,
            isAdmin: true,
            createdAt: new Date().toISOString()
          },
          loading: false,
          initialized: true,
          authError: null
        });
      } else {
        set({ user: null, profile: null, loading: false, initialized: true });
      }
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
        console.warn('Google Popup Sign-In interface failed/unregistered. Instructing user to perform credential uplink.', error);
        
        let errMsg = "Google Sign-In failed or was blocked by your browser. Please log in using the Administrative Control Gateway above with your secure email and admin password.";
        if (error?.code) {
          if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized_domain')) {
            const domainName = window.location.hostname;
            errMsg = `unauthorized_domain:${domainName}`;
          } else if (error.code === 'auth/popup-closed-by-user') {
            errMsg = "popup_closed";
          } else if (error.code === 'auth/cancelled-popup-request') {
            errMsg = "popup_cancelled";
          }
        }
        set({
          loading: false,
          authError: errMsg
        });
      }
    },

    signInWithRedirect: async () => {
      set({ loading: true, authError: null });
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithRedirect(auth, provider);
      } catch (error: any) {
        console.warn("Redirect auth failed/unregistered, instructing user to log in via passcode.", error);
        
        let errMsg = "Google Redirect Sign-In failed. Please log in using the Administrative Control Gateway above with your secure email and admin password.";
        if (error?.code) {
          if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized_domain')) {
            const domainName = window.location.hostname;
            errMsg = `unauthorized_domain:${domainName}`;
          }
        }
        set({
          loading: false,
          authError: errMsg
        });
      }
    },

    signInWithEmail: async (email, password) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!ADMIN_EMAIL_WHITELIST.includes(cleanEmail)) {
        set({ authError: "ACCESS_DENIED: Unauthorized administrative console access." });
        throw new Error("ACCESS_DENIED: Unauthorized administrative console access.");
      }

      set({ loading: true, authError: null });
      try {
        // Attempt standard Firebase Auth
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (error: any) {
        console.warn('Firebase direct email auth unconfigured or invalid, delegating to secure backend verification gateway...', error.message);
        
        try {
          const response = await fetch('/api/auth/verify-passcode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: cleanEmail, password })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "ACCESS_DENIED: Invalid administrative password.");
          }

          const data = await response.json();
          if (data.success && data.profile) {
            localStorage.setItem('admin_simulated', 'true');
            set({
              user: { uid: data.profile.uid, email: cleanEmail } as User,
              profile: data.profile,
              loading: false,
              initialized: true,
              authError: null,
              showLoginModal: false
            });
          } else {
            throw new Error("ACCESS_DENIED: Administrative credentials verification failed.");
          }
        } catch (backendErr: any) {
          console.error('[AUTH] Administrative passcode verification failed:', backendErr.message);
          set({
            loading: false,
            authError: backendErr.message || "ACCESS_DENIED: Invalid administrative credentials."
          });
          throw backendErr;
        }
      }
    },

    logout: async () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
      localStorage.removeItem('admin_simulated');
      try {
        await signOut(auth);
      } catch (e) {
        console.error("Sign-out error:", e);
      }
      set({ user: null, profile: null, loading: false, initialized: true, authError: null });
    },

    loginAsSimulatedAdmin: () => {
      localStorage.setItem('admin_simulated', 'true');
      set({
        user: {
          uid: 'admin_bypass_uid',
          email: 'didhesaythatreally@gmail.com',
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({})
        } as unknown as User,
        profile: {
          uid: 'admin_bypass_uid',
          username: 'administrator',
          email: 'didhesaythatreally@gmail.com',
          karma: 9999,
          isAdmin: true,
          createdAt: new Date().toISOString()
        },
        loading: false,
        initialized: true,
        authError: null,
        showLoginModal: false
      });
    }
  };
});
