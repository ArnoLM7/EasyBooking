import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/", label: "Accueil", requiresAuth: false },
  { to: "/rooms", label: "Salles", requiresAuth: true },
  { to: "/reservations", label: "Mes réservations", requiresAuth: true },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-primary-700">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
            EB
          </div>
          <span>EasyBooking</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            if (link.requiresAuth && !user) return null;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
