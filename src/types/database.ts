export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          is_premium: boolean;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          is_premium?: boolean;
          stripe_customer_id?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          is_premium?: boolean;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
      };
      trainings: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          bunny_video_id: string;
          bunny_library_id: string;
          duration_seconds: number;
          order_index: number;
          week_number: number;
          category: "cesta" | "klinika";
          timestamps: Json;
          thumbnail_url: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          title: string;
          bunny_video_id: string;
          bunny_library_id: string;
          duration_seconds?: number;
          order_index?: number;
          week_number?: number;
          category?: "cesta" | "klinika";
          timestamps?: Json;
          thumbnail_url?: string | null;
          is_published?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          order_index?: number;
          is_published?: boolean;
          timestamps?: Json;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          training_id: string;
          watched_seconds: number;
          is_completed: boolean;
          last_watched_at: string;
        };
        Insert: {
          user_id: string;
          training_id: string;
          watched_seconds?: number;
          is_completed?: boolean;
        };
        Update: {
          watched_seconds?: number;
          is_completed?: boolean;
          last_watched_at?: string;
        };
      };
      audio_tracks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          file_url: string;
          cover_url: string | null;
          duration_seconds: number;
          category: string;
          order_index: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          title: string;
          file_url: string;
          cover_url?: string | null;
          duration_seconds?: number;
          category?: string;
          order_index?: number;
          is_published?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          is_published?: boolean;
          order_index?: number;
        };
      };
      user_audio_progress: {
        Row: {
          id: string;
          user_id: string;
          track_id: string;
          position_seconds: number;
          last_listened_at: string;
        };
        Insert: {
          user_id: string;
          track_id: string;
          position_seconds?: number;
        };
        Update: {
          position_seconds?: number;
          last_listened_at?: string;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Training = Database["public"]["Tables"]["trainings"]["Row"];
export type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];
export type AudioTrack = Database["public"]["Tables"]["audio_tracks"]["Row"];
export type UserAudioProgress = Database["public"]["Tables"]["user_audio_progress"]["Row"];

export interface Timestamp {
  label: string;
  seconds: number;
}
