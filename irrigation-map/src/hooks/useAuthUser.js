// src/hooks/useAuthUser.js
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export function useAuthUser() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        const profileSnap = await getDoc(doc(db, "users", fbUser.uid));
        if (profileSnap.exists()) {
          setUserProfile(profileSnap.data());
        } else {
          console.error("User profile not found.");
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoadingUser(false);
    });
    return unsub;
  }, []);

  return { user, userProfile, loadingUser };
}
