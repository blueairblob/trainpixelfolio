// src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  dev: {
    Tables: {
      builder: {
        Row: {
          builder_plant: string | null
          code: string
          created_by: string
          created_date: string
          id: string
          location_id: string | null
          modified_by: string | null
          modified_date: string | null
          name: string | null
          plant_code: string | null
          remarks: string | null
        }
        Insert: {
          builder_plant?: string | null
          code: string
          created_by: string
          created_date?: string
          id?: string
          location_id?: string | null
          modified_by?: string | null
          modified_date?: string | null
          name?: string | null
          plant_code?: string | null
          remarks?: string | null
        }
        Update: {
          builder_plant?: string | null
          code?: string
          created_by?: string
          created_date?: string
          id?: string
          location_id?: string | null
          modified_by?: string | null
          modified_date?: string | null
          name?: string | null
          plant_code?: string | null
          remarks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog: {
        Row: {
          accession_no: number | null
          active_area: string | null
          bw_cd_no: string | null
          bw_image_no: string | null
          category: string | null
          cd_no: string | null
          cd_no_hr: string | null
          circa: string | null
          condition: string | null
          corporate_body: string | null
          created_by: string
          created_date: string
          date_taken: string | null
          description: string | null
          entry_date: string | null
          facility: string | null
          gauge: string | null
          id: string
          image_no: string
          imgref_stem: string | null
          imprecise_date: string | null
          modified_by: string | null
          modified_date: string | null
          owners_ref: string | null
          parent_folder: string | null
          picture: string | null
          plant_code: string | null
          search_vector: unknown | null
          valuation: number | null
          website: string | null
          works_number: string | null
          year_built: string | null
        }
        Insert: {
          accession_no?: number | null
          active_area?: string | null
          bw_cd_no?: string | null
          bw_image_no?: string | null
          category?: string | null
          cd_no?: string | null
          cd_no_hr?: string | null
          circa?: string | null
          condition?: string | null
          corporate_body?: string | null
          created_by: string
          created_date?: string
          date_taken?: string | null
          description?: string | null
          entry_date?: string | null
          facility?: string | null
          gauge?: string | null
          id?: string
          image_no: string
          imgref_stem?: string | null
          imprecise_date?: string | null
          modified_by?: string | null
          modified_date?: string | null
          owners_ref?: string | null
          parent_folder?: string | null
          picture?: string | null
          plant_code?: string | null
          search_vector?: unknown | null
          valuation?: number | null
          website?: string | null
          works_number?: string | null
          year_built?: string | null
        }
        Update: {
          accession_no?: number | null
          active_area?: string | null
          bw_cd_no?: string | null
          bw_image_no?: string | null
          category?: string | null
          cd_no?: string | null
          cd_no_hr?: string | null
          circa?: string | null
          condition?: string | null
          corporate_body?: string | null
          created_by?: string
          created_date?: string
          date_taken?: string | null
          description?: string | null
          entry_date?: string | null
          facility?: string | null
          gauge?: string | null
          id?: string
          image_no?: string
          imgref_stem?: string | null
          imprecise_date?: string | null
          modified_by?: string | null
          modified_date?: string | null
          owners_ref?: string | null
          parent_folder?: string | null
          picture?: string | null
          plant_code?: string | null
          search_vector?: unknown | null
          valuation?: number | null
          website?: string | null
          works_number?: string | null
          year_built?: string | null
        }
        Relationships: []
      }
      catalog_builder: {
        Row: {
          builder_id: string | null
          builder_order: number
          catalog_id: string | null
          created_by: string
          created_date: string
          id: string
          modified_by: string | null
          modified_date: string | null
          plant_code: string | null
          works_number: string | null
          year_built: string | null
        }
        Insert: {
          builder_id?: string | null
          builder_order: number
          catalog_id?: string | null
          created_by: string
          created_date?: string
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          plant_code?: string | null
          works_number?: string | null
          year_built?: string | null
        }
        Update: {
          builder_id?: string | null
          builder_order?: number
          catalog_id?: string | null
          created_by?: string
          created_date?: string
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          plant_code?: string | null
          works_number?: string | null
          year_built?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_builder_builder_id_fkey"
            columns: ["builder_id"]
            isOneToOne: false
            referencedRelation: "builder"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_builder_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_metadata: {
        Row: {
          catalog_id: string | null
          collection_id: string | null
          created_by: string
          created_date: string
          id: string
          location_id: string | null
          modified_by: string | null
          modified_date: string | null
          organisation_id: string | null
          photographer_id: string | null
          route_id: string | null
        }
        Insert: {
          catalog_id?: string | null
          collection_id?: string | null
          created_by: string
          created_date?: string
          id?: string
          location_id?: string | null
          modified_by?: string | null
          modified_date?: string | null
          organisation_id?: string | null
          photographer_id?: string | null
          route_id?: string | null
        }
        Update: {
          catalog_id?: string | null
          collection_id?: string | null
          created_by?: string
          created_date?: string
          id?: string
          location_id?: string | null
          modified_by?: string | null
          modified_date?: string | null
          organisation_id?: string | null
          photographer_id?: string | null
          route_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_metadata_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: true
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_metadata_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_metadata_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_metadata_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_metadata_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_metadata_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "route"
            referencedColumns: ["id"]
          },
        ]
      }
      collection: {
        Row: {
          created_by: string
          created_date: string
          donor: string | null
          id: string
          modified_by: string | null
          modified_date: string | null
          name: string
          owner: string | null
          storage_location: string | null
        }
        Insert: {
          created_by: string
          created_date?: string
          donor?: string | null
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          name: string
          owner?: string | null
          storage_location?: string | null
        }
        Update: {
          created_by?: string
          created_date?: string
          donor?: string | null
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          name?: string
          owner?: string | null
          storage_location?: string | null
        }
        Relationships: []
      }
      country: {
        Row: {
          created_by: string
          created_date: string
          id: string
          modified_by: string | null
          modified_date: string | null
          name: string
        }
        Insert: {
          created_by: string
          created_date?: string
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          name: string
        }
        Update: {
          created_by?: string
          created_date?: string
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          name?: string
        }
        Relationships: []
      }
      location: {
        Row: {
          country_id: string | null
          created_by: string
          created_date: string
          id: string
          modified_by: string | null
          modified_date: string | null
          name: string
        }
        Insert: {
          country_id?: string | null
          created_by: string
          created_date?: string
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          name: string
        }
        Update: {
          country_id?: string | null
          created_by?: string
          created_date?: string
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "country"
            referencedColumns: ["id"]
          },
        ]
      }
      organisation: {
        Row: {
          country_id: string | null
          created_by: string
          created_date: string
          id: string
          modified_by: string | null
          modified_date: string | null
          name: string | null
          type: string | null
        }
        Insert: {
          country_id?: string | null
          created_by: string
          created_date?: string
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          name?: string | null
          type?: string | null
        }
        Update: {
          country_id?: string | null
          created_by?: string
          created_date?: string
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          name?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organisation_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "country"
            referencedColumns: ["id"]
          },
        ]
      }
      photographer: {
        Row: {
          created_by: string
          created_date: string
          id: string
          modified_by: string | null
          modified_date: string | null
          name: string
        }
        Insert: {
          created_by: string
          created_date?: string
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          name: string
        }
        Update: {
          created_by?: string
          created_date?: string
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          name?: string
        }
        Relationships: []
      }
      picture_metadata: {
        Row: {
          ai_description: string | null
          catalog_id: string | null
          colour_mode: string | null
          colour_space: string | null
          created_by: string
          created_date: string
          file_location: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          height: number | null
          id: string
          modified_by: string | null
          modified_date: string | null
          resolution: string | null
          tags: string[] | null
          width: number | null
        }
        Insert: {
          ai_description?: string | null
          catalog_id?: string | null
          colour_mode?: string | null
          colour_space?: string | null
          created_by: string
          created_date?: string
          file_location?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          height?: number | null
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          resolution?: string | null
          tags?: string[] | null
          width?: number | null
        }
        Update: {
          ai_description?: string | null
          catalog_id?: string | null
          colour_mode?: string | null
          colour_space?: string | null
          created_by?: string
          created_date?: string
          file_location?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          height?: number | null
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          resolution?: string | null
          tags?: string[] | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "picture_metadata_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: true
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picture_metadata_catalog_id_fkey1"
            columns: ["catalog_id"]
            isOneToOne: true
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      route: {
        Row: {
          created_by: string
          created_date: string
          end_location_id: string | null
          id: string
          modified_by: string | null
          modified_date: string | null
          name: string
          start_location_id: string | null
        }
        Insert: {
          created_by: string
          created_date?: string
          end_location_id?: string | null
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          name: string
          start_location_id?: string | null
        }
        Update: {
          created_by?: string
          created_date?: string
          end_location_id?: string | null
          id?: string
          modified_by?: string | null
          modified_date?: string | null
          name?: string
          start_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_end_location_id_fkey"
            columns: ["end_location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_start_location_id_fkey"
            columns: ["start_location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
        ]
      }
      usage: {
        Row: {
          catalog_id: string | null
          created_by: string
          created_date: string
          internet_use: boolean | null
          modified_by: string | null
          modified_date: string | null
          prints_allowed: boolean | null
          publications_use: boolean | null
        }
        Insert: {
          catalog_id?: string | null
          created_by: string
          created_date?: string
          internet_use?: boolean | null
          modified_by?: string | null
          modified_date?: string | null
          prints_allowed?: boolean | null
          publications_use?: boolean | null
        }
        Update: {
          catalog_id?: string | null
          created_by?: string
          created_date?: string
          internet_use?: boolean | null
          modified_by?: string | null
          modified_date?: string | null
          prints_allowed?: boolean | null
          publications_use?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: true
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mobile_catalog_view: {
        Row: {
          active_area: string | null
          builders: Json[] | null
          bw_cd_no: string | null
          bw_image_no: string | null
          category: string | null
          cd_no: string | null
          cd_no_hr: string | null
          circa: string | null
          collection: string | null
          colour_mode: string | null
          colour_space: string | null
          corporate_body: string | null
          country: string | null
          date_taken: string | null
          description: string | null
          facility: string | null
          file_type: string | null
          gauge: string | null
          height: number | null
          image_no: string | null
          imprecise_date: string | null
          internet_use: boolean | null
          last_updated: string | null
          location: string | null
          organisation: string | null
          organisation_type: string | null
          photographer: string | null
          prints_allowed: boolean | null
          publications_use: boolean | null
          resolution: string | null
          route: string | null
          search_vector: unknown | null
          thumbnail_url: string | null
          width: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_rows_from_query: {
        Args: { query_text: string }
        Returns: number
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      search_all_columns: {
        Args: {
          p_table_name: string
          p_schema_name: string
          p_search_string: string
        }
        Returns: {
          found_column_name: string
          row_identifier: string
          column_value: string
        }[]
      }
      total_size_in_bucket: {
        Args: { bucket_name: string; bucket_prefix: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  dev: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
