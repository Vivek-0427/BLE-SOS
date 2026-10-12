import { useState } from "react";
import { logInUser } from "../services/authService.js";
import background from "../assets/background.jpg";
import {Eye, EyeOff} from "lucide-react";
import Icon from "../components/Icon.jsx";
import ICONS from "../data/constants.jsx";


const Login = ({ onRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await logInUser(email, password);
    } catch (error) {
      console.error(error);

      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else {
        setError("Login failed. Please try again.");
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
          SOS System
        </h1>
      </div>

        <p className="text-xs text-zinc-400 mb-4">Login to your emergency dashboard</p>

        <form onSubmit={handleLogin}>

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

          {error && (
            <p className="auth-error mb-4 font-mono text-xs text-red-400">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className={`inline-block whitespace-nowrap py-2 px-4 rounded-lg bg-zinc-700 text-zinc-200 font-semibold hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="mt-4 text-sm text-zinc-400">
          Don't have an account?
          <button type="button" onClick={onRegister} className=" text-sm ml-2 text-blue-500 hover:underline">
            Register
          </button>
        </p>

      </div>
    </div>
  );
};



export default Login;