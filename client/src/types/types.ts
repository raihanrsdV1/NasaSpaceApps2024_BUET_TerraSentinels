export interface AuthContextProps {
  message: string | null;
  user: any;
  loginUser: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  logoutUser: () => void;
  updateToken: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  token_type: string | null;
  exp: number | null;
  iat: number | null;
  jti: string | null;
  user_id: number | null;
  email: string | null; // todo: last 4 should not be null for production.
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
}

// src/types/types.ts

export interface Filters {
  content: string;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  tags: string[];
  isAlert: boolean | null;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  tag_names: string[];
  is_question: boolean;
  is_answered: boolean;
}

export interface Alert {
  id: number;
  post: Post;
  alert_type: string;
  alert_location_lat: number;
  alert_location_lon: number;
  alert_region: string;
}
