import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  HIGH_FIDELITY_EVIDENCE_SEEDS, 
  HIGH_FIDELITY_LAWSUITS_SEEDS, 
  HIGH_FIDELITY_DOSSIER_SEEDS 
} from '../utils/seeder';

// Pre-get local initial mock data
export function getInitialLocalData(collectionPath: string): any[] {
  const cached = localStorage.getItem(`firestore_fallback_${collectionPath}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error("Local cache parse error:", e);
    }
  }

  // Pre-populate with high-fidelity seeds if empty
  let seeds: any[] = [];
  if (collectionPath === 'evidence') {
    seeds = HIGH_FIDELITY_EVIDENCE_SEEDS.map((item, idx) => ({
      id: `seed-ev-${idx}`,
      ...item
    }));
  } else if (collectionPath === 'lawsuits') {
    seeds = HIGH_FIDELITY_LAWSUITS_SEEDS.map((item, idx) => ({
      id: `seed-lw-${idx}`,
      ...item
    }));
  } else if (collectionPath === 'dossier') {
    seeds = HIGH_FIDELITY_DOSSIER_SEEDS.map((item, idx) => ({
      id: `seed-ds-${idx}`,
      ...item
    }));
  }
  
  if (seeds.length > 0) {
    localStorage.setItem(`firestore_fallback_${collectionPath}`, JSON.stringify(seeds));
  }
  return seeds;
}

// Safely serialize query constraints without circular dependency errors or infinite loops from freshly instantiated arrays/objects
function serializeConstraints(constraints: QueryConstraint[]): string {
  try {
    return constraints.map((c, idx) => {
      const type = (c as any).type || '';
      // Extract identifying properties if they are standard primitives
      const filter = (c as any)._filter || (c as any).filter || '';
      const orderByVal = (c as any)._orderBy || (c as any).orderBy || '';
      // Pick primitive values to safely serialize
      const filterStr = typeof filter === 'object' && filter !== null ? (filter.op || '') + ':' + (filter.field?.segments?.join('.') || filter.field || '') : String(filter);
      const orderByStr = typeof orderByVal === 'object' && orderByVal !== null ? (orderByVal.field?.segments?.join('.') || orderByVal.field || '') + ':' + (orderByVal.direction || '') : String(orderByVal);
      return `${idx}:${type}:${filterStr}:${orderByStr}`;
    }).join('|');
  } catch (error) {
    console.warn("Could not serialize query constraints safely — fallback to length signature:", error);
    return `len:${constraints.length}`;
  }
}

export function useFirestoreCollection<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
  enabled: boolean = true
) {
  const [data, setData] = useState<T[]>(() => getInitialLocalData(collectionPath));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize constraints signature to prevent unstable dependency array triggers
  const constraintsSignature = serializeConstraints(constraints);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Track if snapshot has responded
    let hasResponded = false;

    // Set a timeout of 1500ms to failover to local mock data if the Firestore backend is unreachable
    const timeoutId = setTimeout(() => {
      if (!hasResponded) {
        console.warn(`Firestore timeout for [${collectionPath}] — engaging offline sandbox fallback.`);
        const localData = getInitialLocalData(collectionPath);
        setData(localData);
        setLoading(false);
      }
    }, 1500);

    let unsubscribe = () => {};

    try {
      const q = query(collection(db, collectionPath), ...constraints);
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          hasResponded = true;
          clearTimeout(timeoutId);
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          
          setData(items);
          setLoading(false);
          // Cache the latest server data in localStorage in case of future offline sessions
          localStorage.setItem(`firestore_fallback_${collectionPath}`, JSON.stringify(items));
        },
        (err) => {
          hasResponded = true;
          clearTimeout(timeoutId);
          console.warn(`Firestore error for [${collectionPath}], falling back to local storage:`, err.message);
          
          setError(err);
          const localData = getInitialLocalData(collectionPath);
          setData(localData);
          setLoading(false);
        }
      );
    } catch (err: any) {
      hasResponded = true;
      clearTimeout(timeoutId);
      console.warn(`Firestore initialization error for [${collectionPath}] (might be offline):`, err.message);
      const localData = getInitialLocalData(collectionPath);
      setData(localData);
      setLoading(false);
    }

    // Also reload data when a local write changes local state
    const handleLocalChange = () => {
      const localData = getInitialLocalData(collectionPath);
      setData(localData);
    };

    window.addEventListener('local-firestore-change', handleLocalChange);

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
      window.removeEventListener('local-firestore-change', handleLocalChange);
    };
  }, [collectionPath, constraintsSignature, enabled]);

  return { data, loading, error };
}

export function addLocalFallbackItem(collectionPath: string, item: any) {
  try {
    const cached = getInitialLocalData(collectionPath);
    const newItem = { id: item.id || `local-${collectionPath}-${Date.now()}`, ...item };
    const updated = [newItem, ...cached];
    localStorage.setItem(`firestore_fallback_${collectionPath}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('local-firestore-change'));
    return newItem;
  } catch (e) {
    console.error("Local add failed:", e);
    return item;
  }
}

export function updateLocalFallbackItem(collectionPath: string, itemId: string, updates: any) {
  try {
    const cached = getInitialLocalData(collectionPath);
    const updated = cached.map((item: any) => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    localStorage.setItem(`firestore_fallback_${collectionPath}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('local-firestore-change'));
  } catch (e) {
    console.error("Local update failed:", e);
  }
}

export function deleteLocalFallbackItem(collectionPath: string, itemId: string, extraMatch?: string) {
  try {
    const cached = getInitialLocalData(collectionPath);
    const updated = cached.filter((item: any) => {
      if (item.id === itemId) return false;
      if (extraMatch) {
        if (item.name && item.name.toLowerCase() === extraMatch.toLowerCase()) return false;
        if (item.title && item.title.toLowerCase() === extraMatch.toLowerCase()) return false;
      }
      return true;
    });
    localStorage.setItem(`firestore_fallback_${collectionPath}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('local-firestore-change'));
  } catch (e) {
    console.error("Local delete failed:", e);
  }
}
