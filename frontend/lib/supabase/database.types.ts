/**
 * Typed shape of the Phase 5 Supabase tables.
 * AI and application code should treat these as the persisted platform records.
 */
export type SiteStatus = "draft" | "published";

export interface ProfileRow {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface SiteRow {
  id: string;
  owner_id: string;
  business_name: string;
  slug: string;
  status: SiteStatus;
  style: string | null;
  site_config: unknown;
  created_at: string;
  updated_at: string;
}

export interface MediaRow {
  id: string;
  site_id: string;
  storage_path: string;
  type: "image" | "video";
  description: string | null;
  created_at: string;
}

export interface SiteVersionRow {
  id: string;
  site_id: string;
  version_number: number;
  config: unknown;
  created_at: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          display_name?: string | null;
        };
        Relationships: [];
      };
      sites: {
        Row: SiteRow;
        Insert: {
          id?: string;
          owner_id: string;
          business_name: string;
          slug: string;
          status?: SiteStatus;
          style?: string | null;
          site_config?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          business_name?: string;
          slug?: string;
          status?: SiteStatus;
          style?: string | null;
          site_config?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sites_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      media: {
        Row: MediaRow;
        Insert: {
          id?: string;
          site_id: string;
          storage_path: string;
          type: "image" | "video";
          description?: string | null;
          created_at?: string;
        };
        Update: {
          storage_path?: string;
          type?: "image" | "video";
          description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
        ];
      };
      site_versions: {
        Row: SiteVersionRow;
        Insert: {
          id?: string;
          site_id: string;
          version_number: number;
          config: Json;
          created_at?: string;
        };
        Update: {
          version_number?: number;
          config?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "site_versions_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
