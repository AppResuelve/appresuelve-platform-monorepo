import { useState } from "react";
import { Lock } from "lucide-react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "/api"}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: "Error de conexión" }));

        throw new Error(err.error || "Error");
      }

      const { token } = await res.json();

      localStorage.setItem("platform_token", token);
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050816] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-180px] left-[-120px] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[-180px] right-[-120px] w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[140px]" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl scale-110 pointer-events-none" />

        {/* Header */}
        <div className="relative text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-5 shadow-[0_12px_40px_rgba(6,182,212,0.35)]">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white">
            AppResuelve
          </h1>

          <p className="mt-2 text-sm text-slate-400">Panel de administración</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="
            relative
            p-8
            rounded-[2rem]
            border border-white/10
            bg-white/5
            backdrop-blur-2xl
            shadow-[0_20px_80px_rgba(0,0,0,0.45)]
            space-y-5
          "
        >
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
              placeholder="tu@email.com"
              className="
                w-full
                px-4
                py-3
                rounded-xl
                bg-white/5
                border border-white/10
                text-white
                placeholder:text-slate-500
                focus:outline-none
                focus:border-cyan-500/60
                focus:ring-2
                focus:ring-cyan-500/20
                transition-all
              "
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="
                w-full
                px-4
                py-3
                rounded-xl
                bg-white/5
                border border-white/10
                text-white
                placeholder:text-slate-500
                focus:outline-none
                focus:border-cyan-500/60
                focus:ring-2
                focus:ring-cyan-500/20
                transition-all
              "
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              py-3.5
              rounded-xl
              font-semibold
              text-white
              bg-gradient-to-r
              from-cyan-400
              to-blue-600
              shadow-[0_12px_30px_rgba(6,182,212,0.30)]
              hover:-translate-y-0.5
              hover:shadow-[0_20px_40px_rgba(6,182,212,0.40)]
              transition-all
              duration-200
              disabled:opacity-50
              disabled:hover:translate-y-0
            "
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} AppResuelve
        </p>
      </div>
    </div>
  );
}
