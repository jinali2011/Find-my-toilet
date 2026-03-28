export interface Restroom {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: 'public' | 'commercial' | 'paid';
  is_verified: number;
  is_accessible: number;
  has_baby_changing: number;
  is_gender_neutral: number;
  is_free: number;
  access_type: 'open' | 'customer' | 'key';
  access_code?: string;
  rating: number;
  review_count: number;
  created_at: string;
}

export interface Review {
  id: number;
  restroom_id: number;
  rating: number;
  cleanliness: number;
  safety: number;
  ease_of_access: number;
  comment: string;
  created_at: string;
}

export type FilterState = {
  accessible: boolean;
  family: boolean;
  genderNeutral: boolean;
  free: boolean;
  publicOnly: boolean;
  type: string[];
};
