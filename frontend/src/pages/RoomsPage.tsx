import { useState, useEffect } from "react";
import type { Room } from "../types";
import { roomsAPI } from "../services/api";
import { BookingModal } from "../components/BookingModal";

export const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [minCapacity, setMinCapacity] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, minCapacity, equipmentFilter]);

  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await roomsAPI.getAll();
      setRooms(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors du chargement des salles");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rooms];

    if (minCapacity) {
      const minCap = parseInt(minCapacity);
      filtered = filtered.filter((room) => room.capacity >= minCap);
    }

    if (equipmentFilter) {
      filtered = filtered.filter((room) =>
        room.equipment?.toLowerCase().includes(equipmentFilter.toLowerCase())
      );
    }

    setFilteredRooms(filtered);
  };

  const resetFilters = () => {
    setMinCapacity("");
    setEquipmentFilter("");
  };

  const handleBookingSuccess = () => {
    setSelectedRoom(null);
    alert("Réservation créée avec succès !");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          <p className="text-slate-600">Chargement des salles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
          Salles
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Liste des salles</h1>
        <p className="text-sm text-slate-600">
          Consultez les salles disponibles et réservez celle qui vous convient
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Filtres</h3>
          {(minCapacity || equipmentFilter) && (
            <button
              onClick={resetFilters}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Réinitialiser
            </button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Capacité minimale
            </label>
            <input
              type="number"
              placeholder="Ex: 10"
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
              min="1"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Équipement
            </label>
            <input
              type="text"
              placeholder="Ex: Projecteur"
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {filteredRooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
          <p className="font-medium text-slate-800">Aucune salle trouvée</p>
          <p className="text-sm text-slate-600">
            {rooms.length === 0
              ? "Aucune salle n'est disponible pour le moment"
              : "Essayez de modifier vos critères de filtrage"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900">{room.name}</h3>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <svg
                    className="h-5 w-5 text-slate-400"
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
                  <span>
                    <strong>{room.capacity}</strong> personnes
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400"
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
                  <span>{room.equipment || "Aucun équipement"}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedRoom(room)}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                Réserver
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
