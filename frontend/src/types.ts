export type AuthUser = {
  id: number;
  email: string;
  name: string;
};

export type AuthResponse = {
  message: string;
  user: AuthUser;
  token: string;
};

export type Room = {
  id: number;
  name: string;
  capacity: number;
  equipment: string;
  created_at: string;
};

export type Reservation = {
  id: number;
  user_id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  created_at: string;
  room_name?: string;
  user_name?: string;
};

export type CreateReservationData = {
  roomId: number;
  startTime: string;
  endTime: string;
};

export type AvailabilityResponse = {
  roomId: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
};
