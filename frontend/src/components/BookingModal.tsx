import { useState, useEffect } from "react";
import type { Room } from "../types";
import { roomsAPI, reservationsAPI } from "../services/api";

type BookingModalProps = {
  room: Room;
  onClose: () => void;
  onSuccess: () => void;
};

export const BookingModal = ({ room, onClose, onSuccess }: BookingModalProps) => {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const startDateTime = startDate && startTime ? `${startDate}T${startTime}:00` : "";
  const endDateTime = startDate && endTime ? `${startDate}T${endTime}:00` : "";

  useEffect(() => {
    if (!startDateTime || !endDateTime) {
      setIsAvailable(null);
      return;
    }

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      setIsAvailable(false);
      setError("L'heure de fin doit être après l'heure de début");
      return;
    }

    const checkAvailability = async () => {
      setIsChecking(true);
      setError("");
      try {
        const result = await roomsAPI.checkAvailability(
          room.id,
          startDateTime,
          endDateTime
        );
        setIsAvailable(result.isAvailable);
        if (!result.isAvailable) {
          setError("Cette salle n'est pas disponible pour ce créneau");
        }
      } catch (err) {
        setError("Erreur lors de la vérification de disponibilité");
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [startDateTime, endDateTime, room.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAvailable) {
      setError("Cette salle n'est pas disponible pour ce créneau");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await reservationsAPI.create({
        roomId: room.id,
        startTime: startDateTime,
        endTime: endDateTime,
      });
      onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Erreur lors de la création de la réservation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg animate-scale-in rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Réserver la salle</h2>
              <p className="text-sm font-medium text-blue-600">{room.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6 space-y-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Capacité</p>
              <p className="text-sm font-bold text-slate-900">
                {room.capacity} {room.capacity === 1 ? "personne" : "personnes"}
              </p>
            </div>
          </div>
          {room.equipment && (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <svg
                  className="h-5 w-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Équipements</p>
                <p className="text-sm text-slate-700">{room.equipment}</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Date de réservation
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              required
              className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Début
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 shadow-sm transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Fin
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 shadow-sm transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
          </div>

          {isChecking && (
            <div className="animate-pulse rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <p className="text-sm font-medium text-blue-700">
                  Vérification de la disponibilité...
                </p>
              </div>
            </div>
          )}

          {!isChecking && isAvailable === true && (
            <div className="animate-slide-down rounded-xl border-2 border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Disponible !</p>
                  <p className="text-xs text-green-600">Cette salle est libre pour ce créneau</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="animate-slide-down rounded-xl border-2 border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isAvailable || isSubmitting || isChecking}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Réservation...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Confirmer
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
