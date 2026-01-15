import { useState, useEffect, useMemo } from "react";
import type { Room } from "../types";
import { roomsAPI } from "../services/api";
import { BookingModal } from "../components/BookingModal";
import { CreateRoomModal } from "../components/CreateRoomModal";

export const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);

  const [selectedCapacities, setSelectedCapacities] = useState<number[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, selectedCapacities, selectedEquipments]);

  const availableEquipments = useMemo(() => {
    const equipments = new Set<string>();
    rooms.forEach((room) => {
      if (room.equipment) {
        room.equipment.split(",").forEach((eq) => {
          equipments.add(eq.trim());
        });
      }
    });
    return Array.from(equipments).sort();
  }, [rooms]);

  const availableCapacities = useMemo(() => {
    const capacities = new Set<number>();
    rooms.forEach((room) => {
      capacities.add(room.capacity);
    });
    return Array.from(capacities).sort((a, b) => a - b);
  }, [rooms]);

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

    if (selectedCapacities.length > 0) {
      filtered = filtered.filter((room) => selectedCapacities.includes(room.capacity));
    }

    if (selectedEquipments.length > 0) {
      filtered = filtered.filter((room) => {
        if (!room.equipment) return false;
        const roomEquipments = room.equipment.split(",").map((eq) => eq.trim());
        return selectedEquipments.some((selected) =>
          roomEquipments.some((eq) => eq.toLowerCase() === selected.toLowerCase())
        );
      });
    }

    setFilteredRooms(filtered);
  };

  const toggleCapacity = (capacity: number) => {
    setSelectedCapacities((prev) =>
      prev.includes(capacity) ? prev.filter((c) => c !== capacity) : [...prev, capacity]
    );
  };

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipments((prev) =>
      prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment]
    );
  };

  const resetFilters = () => {
    setSelectedCapacities([]);
    setSelectedEquipments([]);
  };

  const handleBookingSuccess = () => {
    setSelectedRoom(null);
    alert("Réservation créée avec succès !");
  };

  const handleCreateSuccess = (newRoom: Room) => {
    setRooms([...rooms, newRoom]);
    setShowCreateModal(false);
    alert("Salle créée avec succès !");
  };

  const handleDeleteRoom = async (roomId: number, roomName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la salle "${roomName}" ?`)) {
      return;
    }

    setDeletingRoomId(roomId);
    setError("");

    try {
      await roomsAPI.delete(roomId);
      setRooms(rooms.filter((room) => room.id !== roomId));
      alert("Salle supprimée avec succès !");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la suppression de la salle");
    } finally {
      setDeletingRoomId(null);
    }
  };

  const getRoomColor = (index: number) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-blue-500",
      "from-teal-500 to-cyan-500",
    ];
    return colors[index % colors.length];
  };

  const hasActiveFilters = selectedCapacities.length > 0 || selectedEquipments.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-lg font-medium text-slate-700">Chargement des salles...</p>
          <p className="mt-2 text-sm text-slate-500">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Salles
              </p>
              <h1 className="text-3xl font-bold text-slate-900">Liste des salles</h1>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nouvelle salle
          </button>
        </div>
        <p className="text-slate-600">
          Consultez les salles disponibles et réservez celle qui vous convient
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg transition-all hover:shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <h3 className="text-lg font-bold text-slate-900">Filtres</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Réinitialiser
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Capacité
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCapacities.map((capacity) => {
                const isSelected = selectedCapacities.includes(capacity);
                return (
                  <button
                    key={capacity}
                    onClick={() => toggleCapacity(capacity)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-lg scale-105"
                        : "bg-white text-slate-700 border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    {capacity} {capacity === 1 ? "personne" : "personnes"}
                  </button>
                );
              })}
            </div>
          </div>

          {availableEquipments.length > 0 && (
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
                Équipements
              </label>
              <div className="flex flex-wrap gap-2">
                {availableEquipments.map((equipment) => {
                  const isSelected = selectedEquipments.includes(equipment);
                  return (
                    <button
                      key={equipment}
                      onClick={() => toggleEquipment(equipment)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-purple-600 text-white shadow-lg scale-105"
                          : "bg-white text-slate-700 border-2 border-slate-300 hover:border-purple-400 hover:bg-purple-50"
                      }`}
                    >
                      {equipment}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="animate-slide-down rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {filteredRooms.length === 0 ? (
        <div className="animate-fade-in rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-800">Aucune salle trouvée</p>
          <p className="mt-2 text-sm text-slate-600">
            {rooms.length === 0
              ? "Aucune salle n'est disponible pour le moment"
              : hasActiveFilters
              ? "Aucune salle ne correspond à vos filtres"
              : "Essayez de modifier vos critères de filtrage"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room, index) => (
            <div
              key={room.id}
              className="group animate-fade-in-up relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`absolute top-0 h-2 w-full bg-gradient-to-r ${getRoomColor(index)}`}
              ></div>

              <div className="p-6 pt-8">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{room.name}</h3>
                    <div className="mt-1 flex items-center gap-1">
                      <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-medium text-slate-500">Disponible</span>
                    </div>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getRoomColor(index)} text-white shadow-lg`}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
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

                  <div className="rounded-lg bg-purple-50 px-3 py-2">
                    <div className="mb-1 flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-purple-600"
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
                      <p className="text-xs font-medium text-purple-600">Équipements</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {room.equipment ? (
                        room.equipment.split(",").map((eq, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700"
                          >
                            {eq.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Aucun équipement</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full rounded-xl bg-gradient-to-r ${getRoomColor(index)} px-4 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Réserver maintenant
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id, room.name)}
                    disabled={deletingRoomId === room.id}
                    className="w-full rounded-xl border-2 border-red-200 bg-white px-4 py-2.5 font-semibold text-red-600 shadow-sm transition-all hover:scale-105 hover:border-red-300 hover:bg-red-50 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {deletingRoomId === room.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Suppression...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Supprimer
                      </span>
                    )}
                  </button>
                </div>
              </div>
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

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};
