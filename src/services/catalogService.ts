
import { supabase } from "@/integrations/supabase/client";

// Define the types for the catalog data
export interface CatalogPhoto {
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
}

// Function to fetch all photo catalog entries
export const fetchCatalogPhotos = async (): Promise<CatalogPhoto[]> => {
  try {
    const { data, error } = await supabase
      .from('mobile_catalog_view')
      .select('*')
      .order('date_taken', { ascending: false });
    
    if (error) {
      console.error('Error fetching catalog photos:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchCatalogPhotos:', error);
    throw error;
  }
};

// Function to fetch catalog photos by category
export const fetchPhotosByCategory = async (category: string): Promise<CatalogPhoto[]> => {
  try {
    const { data, error } = await supabase
      .from('mobile_catalog_view')
      .select('*')
      .eq('category', category)
      .order('date_taken', { ascending: false });
    
    if (error) {
      console.error('Error fetching photos by category:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchPhotosByCategory:', error);
    throw error;
  }
};

// Function to fetch a single photo by image_no
export const fetchPhotoById = async (imageNo: string): Promise<CatalogPhoto | null> => {
  try {
    const { data, error } = await supabase
      .from('mobile_catalog_view')
      .select('*')
      .eq('image_no', imageNo)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching photo by ID:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchPhotoById:', error);
    throw error;
  }
};

// Function to get unique categories
export const fetchCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('mobile_catalog_view')
      .select('category')
      .not('category', 'is', null);
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    // Extract unique categories
    const categories = data
      .map(item => item.category)
      .filter((value, index, self) => value && self.indexOf(value) === index) as string[];
    
    return categories;
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    throw error;
  }
};

// Get real image URL from Supabase storage
export const getImageUrl = (imageNo: string): string => {
  return supabase.storage.from('picaloco').getPublicUrl(`${imageNo}.jpg`).data.publicUrl;
};
