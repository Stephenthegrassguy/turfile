import React, { useState } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignup) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        // Create user profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
          email,
          role: "admin",         // Start as admin
          propertyId: null       // Will set up property later
        });

        onLogin(); // Notify parent app
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onLogin(); // Notify parent app
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>{isSignup ? "Create Account" : "Login"}</h2>
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />
        <button type="submit">{isSignup ? "Sign Up" : "Log In"}</button>
      </form>

      <button onClick={() => setIsSignup(prev => !prev)} style={{ marginTop: "1rem" }}>
        {isSignup ? "Already have an account?" : "Create an account"}
      </button>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}

export default Login;
