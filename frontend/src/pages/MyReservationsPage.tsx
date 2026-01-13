import { useState, useEffect } from "react";
import type { Reservation } from "../types";
import { reservationsAPI } from "../services/api";

export const MyReservationsPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await reservationsAPI.getMyReservations();
      setReservations(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Erreur lors du chargement des réservations"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) {
      return;
    }

    setDeletingId(id);
    try {
      await reservationsAPI.delete(id);
      setReservations(reservations.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(
        err.response?.data?.error || "Erreur lors de l'annulation de la réservation"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const isPastReservation = (endTime: string) => {
    return new Date(endTime) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          <p className="text-slate-600">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
          Réservations
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Mes réservations</h1>
        <p className="text-sm text-slate-600">
          Consultez et gérez vos réservations de salles
        </p>
      </header>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {reservations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="font-medium text-slate-800">Aucune réservation</p>
          <p className="text-sm text-slate-600">
            Vous n'avez pas encore de réservation
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => {
            const start = formatDateTime(reservation.start_time);
            const end = formatDateTime(reservation.end_time);
            const isPast = isPastReservation(reservation.end_time);

            return (
              <div
                key={reservation.id}
                className={`rounded-2xl border bg-white p-6 shadow-sm transition ${
                  isPast
                    ? "border-slate-200 opacity-60"
                    : "border-slate-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {reservation.room_name || `Salle #${reservation.room_id}`}
                      </h3>
                      {isPast && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          Passée
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="capitalize">{start.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          {start.time} - {end.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isPast && (
                    <button
                      onClick={() => handleDelete(reservation.id)}
                      disabled={deletingId === reservation.id}
                      className="ml-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === reservation.id ? "Annulation..." : "Annuler"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
