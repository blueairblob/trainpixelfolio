// src/types/user.ts
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  orders: any[];
  favorites: any[];
  memberSince: string;
}