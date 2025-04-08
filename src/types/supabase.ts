// src/types/supabase.ts
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      mobile_catalog_view: {
        Row: {
          image_no: string;
          category: string | null;
          date_taken: string | null;
          circa: boolean | null;
          imprecise_date: boolean | null;
          description: string | null;
          gauge: string | null;
          thumbnail_url: string | null;
          country: string | null;
          organisation: string | null;
          organisation_type: string | null;
          location: string | null;
          route: string | null;
          collection: string | null;
          photographer: string | null;
          prints_allowed: boolean | null;
          internet_use: boolean | null;
          publications_use: boolean | null;
          builders: any | null;
          file_type: string | null;
          width: number | null;
          height: number | null;
          resolution: number | null;
          colour_space: string | null;
          colour_mode: string | null;
          cd_no: string | null;
          cd_no_hr: string | null;
          bw_image_no: string | null;
          bw_cd_no: string | null;
          active_area: string | null;
          corporate_body: string | null;
          facility: string | null;
          last_updated: string | null;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: {
          user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
  dev: {
    Views: {
      mobile_catalog_view: {
        Row: {
          image_no: string;
          category: string | null;
          date_taken: string | null;
          circa: boolean | null;
          imprecise_date: boolean | null;
          description: string | null;
          gauge: string | null;
          thumbnail_url: string | null;
          country: string | null;
          organisation: string | null;
          organisation_type: string | null;
          location: string | null;
          route: string | null;
          collection: string | null;
          photographer: string | null;
          prints_allowed: boolean | null;
          internet_use: boolean | null;
          publications_use: boolean | null;
          builders: any | null;
          file_type: string | null;
          width: number | null;
          height: number | null;
          resolution: number | null;
          colour_space: string | null;
          colour_mode: string | null;
          cd_no: string | null;
          cd_no_hr: string | null;
          bw_image_no: string | null;
          bw_cd_no: string | null;
          active_area: string | null;
          corporate_body: string | null;
          facility: string | null;
          last_updated: string | null;
        };
      };
    };
    Tables: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
