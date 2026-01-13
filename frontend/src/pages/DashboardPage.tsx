import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-primary-100/60">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="p-8 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
              EasyBooking
            </p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">
              Réserve tes salles <span className="text-primary-600">en toute simplicité</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Crée un compte, connecte-toi et planifie rapidement tes créneaux. Visualise la
              disponibilité des salles et gère tes réservations au même endroit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/rooms"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                Voir les salles
              </Link>
              <Link
                to={user ? "/reservations" : "/login"}
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary-700 ring-1 ring-primary-200 transition hover:ring-primary-300"
              >
                {user ? "Mes réservations" : "Se connecter"}
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900 p-8">
            <div className="w-full max-w-md rounded-2xl bg-white/5 p-6 text-white shadow-2xl ring-1 ring-white/20 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">
                Aperçu des actions
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                  <Badge>1</Badge>
                  Créer un compte ou se connecter
                </li>
                <li className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                  <Badge>2</Badge>
                  Choisir une salle et un créneau
                </li>
                <li className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                  <Badge>3</Badge>
                  Confirmer et retrouver ses réservations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          title="Créer un compte"
          description="Inscription rapide : nom, email, mot de passe. Token JWT pour sécuriser tes sessions."
        />
        <InfoCard
          title="Réserver une salle"
          description="Choisis ta salle, sélectionne un créneau et vérifie la disponibilité avant confirmation."
        />
        <InfoCard
          title="Gérer tes réservations"
          description="Retrouve toutes tes réservations et annule si besoin en un clic."
        />
      </section>
    </div>
  );
};

const InfoCard = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-100 ring-1 ring-slate-100">
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
      Étape
    </p>
    <h3 className="mt-2 text-xl font-bold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm text-slate-600">{description}</p>
  </div>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
    {children}
  </span>
);
