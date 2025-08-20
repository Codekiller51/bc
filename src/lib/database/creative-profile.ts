import { Database } from '@/types/supabase';

export type CreativeProfile = Database['public']['Tables']['creative_profiles']['Row'];

export interface CreativeProfileWithAvailability extends CreativeProfile {
  recurring_availability?: {
    [day: string]: {
      start: string;
      end: string;
    }[];
  } | null;
  buffer_time?: number;
}

export interface CreativeProfileWithRating extends CreativeProfile {
  average_rating?: number;
  total_reviews?: number;
}

export interface CreativeProfileWithBookings extends CreativeProfile {
  bookings?: {
    id: string;
    status: string;
    start_time: string;
    end_time: string;
  }[];
}

export interface CreativeSearchFilters {
  selectedRating?: number;
  selectedExperience?: string;
  priceRange?: [number, number];
  selectedAvailability?: string[];
  page?: number;
  limit?: number;
}