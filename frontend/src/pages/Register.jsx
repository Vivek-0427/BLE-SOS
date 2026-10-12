import { useState } from "react";
import { registerUser } from "../services/authService.js";
import {  Eye, EyeOff } from "lucide-react";
import background from "../assets/background.jpg";
import Icon from "../components/Icon.jsx";
import ICONS from "../data/constants.jsx";

const Register = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(email, password);
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-800 text-zinc-200 font-mono bg-cover bg-center " style={{fontFamily: "'JetBrains Mono', 'Fira Code', monospace", backgroundImage: `url(${background})`}}>
      
      <div className="auth-card flex flex-col items-center justify-center p-8 rounded-4xl bg-zinc-900/60 border border-zinc-800 shadow-lg">
        <div className="flex items-center p-3 gap-3 mb-2 mr-3">
        <div className="w-7 h-7 rounded-lg bg-red-950 border border-red-800/60 flex items-center justify-center">
          <Icon path={ICONS.shield} size={14} className="text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-shadow-blue-200">
          Create Account
        </h1>
      </div>

        <p  className="text-xs text-zinc-400 mb-4">Register for the SOS emergency system</p>

        <form onSubmit={handleRegister}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full mb-4 px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-4 py-2 pr-12 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>


          <div className="relative mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="block w-full px-4 py-2 pr-12 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <p className="auth-error mb-4 font-mono text-xs text-red-400">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className={`inline-block whitespace-nowrap py-2 px-4 rounded-lg bg-zinc-700 text-zinc-200 font-semibold hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}>
            {loading ? "Creating account..." : "Register"}
          </button>

        </form>

        <p className="text-sm text-zinc-400 mt-4">
          Already have an account?
          <button type="button" onClick={onLogin} className="ml-1 text-zinc-200 text-sm hover:underline">
            Login
          </button>
        </p>

      </div>
    </div>
  );
};

export default Register;