export type Database = {
  public: {
    Tables: {
      mobile_catalog_view: {
        Row: {
          image_no: string;
          category: string | null;
          date_taken: string | null;
          circa: boolean | null;
          imprecise_date: boolean | null;
          description: string | null;
          gauge: string | null;
          thumbnail_url: string;
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
          builders: any[] | null;
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
        Insert: never;
        Update: never;
      };
    };
    Views: {
      mobile_catalog_view: {
        Row: Database['public']['Tables']['mobile_catalog_view']['Row'];
        Insert: never;
        Update: never;
      };
    };
  };
}; 
