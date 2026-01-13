import axios from "axios";
import type {
  AuthResponse,
  Room,
  Reservation,
  CreateReservationData,
  AvailabilityResponse,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const setAuthToken = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
      name,
    });
    return data;
  },
  login: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },
};

export const roomsAPI = {
  getAll: async () => {
    const { data } = await api.get<Room[]>("/rooms");
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<Room>(`/rooms/${id}`);
    return data;
  },
  checkAvailability: async (id: number, startTime: string, endTime: string) => {
    const { data } = await api.get<AvailabilityResponse>(
      `/rooms/${id}/availability`,
      {
        params: { startTime, endTime },
      }
    );
    return data;
  },
};

export const reservationsAPI = {
  create: async (reservationData: CreateReservationData) => {
    const { data } = await api.post<{ message: string; reservation: Reservation }>(
      "/reservations",
      reservationData
    );
    return data;
  },
  getMyReservations: async () => {
    const { data } = await api.get<Reservation[]>("/reservations/me");
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.delete<{ message: string }>(`/reservations/${id}`);
    return data;
  },
};
