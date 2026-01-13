import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || "/rooms";

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Format d'email invalide (ex: nom@exemple.com)");
    } else {
      setEmailError(null);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value && value.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
    } else {
      setPasswordError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateEmail(email)) {
      setEmailError("Format d'email invalide");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Impossible de se connecter. Vérifie tes identifiants.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-8 shadow-lg shadow-primary-100/70">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
            Connexion
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Ravis de te revoir</h1>
          <p className="mt-2 text-slate-600">
            Accède à EasyBooking pour gérer tes réservations de salle.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              className={`mt-2 w-full rounded-xl border px-3 py-3 text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 ${
                emailError
                  ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-200 bg-slate-50 focus:border-primary-400 focus:ring-primary-100"
              }`}
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-600">{emailError}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              className={`mt-2 w-full rounded-xl border px-3 py-3 text-slate-900 shadow-inner shadow-slate-100 focus:outline-none focus:ring-2 ${
                passwordError
                  ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
                  : "border-slate-200 bg-slate-50 focus:border-primary-400 focus:ring-primary-100"
              }`}
              placeholder="Au moins 6 caractères"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-600">{passwordError}</p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!emailError || !!passwordError}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Pas encore de compte ?{" "}
          <Link to="/register" className="font-semibold text-primary-600">
            Inscription
          </Link>
        </p>
      </div>

      <div className="hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900 p-8 text-white shadow-xl lg:block">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          EasyBooking
        </p>
        <h2 className="mt-4 text-3xl font-bold">Planifie tes salles en quelques clics</h2>
        <p className="mt-3 text-white/80">
          Réserve, visualise les disponibilités et retrouve toutes tes réservations au
          même endroit.
        </p>
        <div className="mt-10 space-y-4">
          <FeatureItem title="Disponibilité en temps réel" />
          <FeatureItem title="Réservations sécurisées (JWT)" />
          <FeatureItem title="Annulation simple" />
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ title }: { title: string }) => (
  <div className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
      ✓
    </span>
    <p className="text-sm font-medium text-white">{title}</p>
  </div>
);
