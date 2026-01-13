export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: string;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  equipment: string | null;
  created_at: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface ReservationWithDetails extends Reservation {
  room_name?: string;
  user_name?: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload;
}
