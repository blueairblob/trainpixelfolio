import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/types/supabase";  

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
  image_url?: string;
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

// catalogService.ts
export const fetchCatalogPhotos = async (page: number = 1, limit: number = 10): Promise<CatalogPhoto[]> => {
  try {
    const offset = (page - 1) * limit;
    const { data, error } = await supabase
      .from('mobile_catalog_view')
      .select('*')
      .order('date_taken', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!data || data.length === 0) {
      console.warn('No photos found');
      return [];
    }

    const photosWithUrls = data.map(photo => ({
      ...photo,
      image_url: getImageUrl(photo.image_no)
    }));

    return photosWithUrls;
  } catch (error) {
    console.error('Error in fetchCatalogPhotos:', error);
    throw error;
  }
};

// Function to fetch catalog photos by category
export const fetchPhotosByCategory = async (category: string, page: number = 1, limit: number = 10): Promise<CatalogPhoto[]> => {
  try {
    const offset = (page - 1) * limit;
    const { data, error } = await supabase
      .from('mobile_catalog_view')
      .select('*')
      .eq('category', category)
      .order('date_taken', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!data || data.length === 0) {
      console.warn(`No photos found for category: ${category}`);
      return [];
    }

    const photosWithUrls = data.map(photo => ({
      ...photo,
      image_url: getImageUrl(photo.image_no)
    }));

    return photosWithUrls;
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

// New searchPhotos function
export const searchPhotos = async (
  searchQuery: string,
  page: number = 1,
  limit: number = 20
): Promise<CatalogPhoto[]> => {
  try {
    const searchTerms = searchQuery.toLowerCase().trim();
    
    // Skip search if query is empty
    if (!searchTerms) {
      return fetchCatalogPhotos(page, limit);
    }
    
    // Calculate pagination offset
    const offset = (page - 1) * limit;
    
    // Query using text search capabilities
    const { data, error } = await supabase
      .from('mobile_catalog_view')
      .select('*')
      .or(`description.ilike.%${searchTerms}%,category.ilike.%${searchTerms}%,photographer.ilike.%${searchTerms}%,location.ilike.%${searchTerms}%`)
      .order('date_taken', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.warn('No photos found matching search query:', searchTerms);
      return [];
    }
    
    // Add image URLs to the results
    const photosWithUrls = data.map(photo => ({
      ...photo,
      image_url: getImageUrl(photo.image_no)
    }));
    
    return photosWithUrls;
  } catch (error) {
    console.error('Error searching photos:', error);
    throw error;
  }
};


export const getImageUrl = (imageNo: string): string => {
  // Normalize the image_no by removing spaces to match the file name format
  const normalizedImageNo = imageNo.replace(/\s/g, ''); // e.g., "Class 1800 (10)" -> "Class1800(10)"
  const url = supabase.storage.from('picaloco').getPublicUrl(`images/${normalizedImageNo}.webp`).data.publicUrl;
  console.log(`Generated URL: ${url}`);
  return url;
};