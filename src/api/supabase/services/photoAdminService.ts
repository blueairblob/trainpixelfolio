// src/api/supabase/services/photoAdminService.ts
import { supabaseClient } from '../client';
import { ApiResponse } from '../types';

/**
 * Service for handling advanced photo admin operations with Supabase
 */
export const photoAdminService = {
  /**
   * Get complete photo data including all related information for editing
   */
  getCompletePhotoData: async (photoId: string): Promise<ApiResponse<any>> => {
    try {
      // Step 1: Get the basic catalog record
      const { data: catalogData, error: catalogError } = await supabaseClient
        .from('catalog')
        .select('*')
        .eq('id', photoId)
        .single();
        
      if (catalogError) throw catalogError;
      if (!catalogData) throw new Error('Photo record not found');
      
      // Step 2: Get the metadata record
      const { data: metadataData, error: metadataError } = await supabaseClient
        .from('catalog_metadata')
        .select(`
          *,
          photographer:photographer_id(id, name),
          location:location_id(id, name),
          organisation:organisation_id(id, name),
          collection:collection_id(id, name)
        `)
        .eq('catalog_id', photoId)
        .maybeSingle();
      
      // Step 3: Get the usage rights
      const { data: usageData, error: usageError } = await supabaseClient
        .from('usage')
        .select('*')
        .eq('catalog_id', photoId)
        .maybeSingle();
      
      // Step 4: Get picture metadata
      const { data: pictureData, error: pictureError } = await supabaseClient
        .from('picture_metadata')
        .select('*')
        .eq('catalog_id', photoId)
        .maybeSingle();
      
      // Step 5: Get builder information
      const { data: builderData, error: builderError } = await supabaseClient
        .from('catalog_builder')
        .select(`
          *,
          builder:builder_id(id, name, code)
        `)
        .eq('catalog_id', photoId);
      
      // Combine all the data into a complete record
      const completePhotoData = {
        ...catalogData,
        metadata: metadataData || {},
        usage: usageData || {},
        picture: pictureData || {},
        builders: builderData || []
      };
      
      // Create a flattened version for easier editing in forms
      const flattenedPhotoData = {
        ...catalogData,
        photographer_id: metadataData?.photographer_id || null,
        photographer_name: metadataData?.photographer?.name || null,
        location_id: metadataData?.location_id || null,
        location_name: metadataData?.location?.name || null,
        organisation_id: metadataData?.organisation_id || null,
        organisation_name: metadataData?.organisation?.name || null,
        collection_id: metadataData?.collection_id || null,
        collection_name: metadataData?.collection?.name || null,
        prints_allowed: usageData?.prints_allowed || false,
        internet_use: usageData?.internet_use || false,
        publications_use: usageData?.publications_use || false,
        file_name: pictureData?.file_name || null,
        file_location: pictureData?.file_location || null,
        width: pictureData?.width || null,
        height: pictureData?.height || null,
        // Add builder info if available
        builder_id: builderData?.length ? builderData[0]?.builder_id : null,
        builder_name: builderData?.length ? builderData[0]?.builder?.name : null,
        works_number: builderData?.length ? builderData[0]?.works_number : null,
        year_built: builderData?.length ? builderData[0]?.year_built : null,
      };
      
      return { 
        data: { 
          complete: completePhotoData,
          flattened: flattenedPhotoData 
        }, 
        error: null, 
        status: 200 
      };
    } catch (error) {
      console.error('Error fetching complete photo data:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },
  
  /**
   * Update a photo record including all related data
   */
  updatePhoto: async (photoId: string, photoData: any): Promise<ApiResponse<null>> => {
    try {
      // Start a transaction by using Supabase batch operations
      
      // 1. Update catalog table
      const catalogUpdate = {
        image_no: photoData.imageNo,
        description: photoData.description,
        category: photoData.category,
        date_taken: photoData.dateTaken,
        gauge: photoData.gauge,
        // Add other fields as needed...
      };
      
      const { error: catalogError } = await supabaseClient
        .from('catalog')
        .update(catalogUpdate)
        .eq('id', photoId);
        
      if (catalogError) throw catalogError;
      
      // 2. Update catalog_metadata table
      const metadataUpdate = {
        photographer_id: photoData.photographer || null,
        location_id: photoData.location || null,
        organisation_id: photoData.organisation || null,
        collection_id: photoData.collection || null,
        // Add other fields as needed...
      };
      
      const { error: metadataError } = await supabaseClient
        .from('catalog_metadata')
        .update(metadataUpdate)
        .eq('catalog_id', photoId);
        
      if (metadataError) throw metadataError;
      
      // 3. Update usage rights
      const usageUpdate = {
        prints_allowed: photoData.printAllowed,
        internet_use: photoData.internetUse,
        publications_use: photoData.publicationUse
      };
      
      const { error: usageError } = await supabaseClient
        .from('usage')
        .update(usageUpdate)
        .eq('catalog_id', photoId);
        
      if (usageError) throw usageError;
      
      // 4. Update builder information if provided
      if (photoData.builder) {
        const builderUpdate = {
          builder_id: photoData.builder,
          works_number: photoData.worksNumber || null,
          year_built: photoData.yearBuilt || null
        };
        
        // Check if a builder record exists
        const { data: existingBuilder } = await supabaseClient
          .from('catalog_builder')
          .select('id')
          .eq('catalog_id', photoId)
          .maybeSingle();
        
        if (existingBuilder) {
          // Update existing builder record
          const { error: builderError } = await supabaseClient
            .from('catalog_builder')
            .update(builderUpdate)
            .eq('id', existingBuilder.id);
            
          if (builderError) throw builderError;
        } else {
          // Create new builder record
          const { error: builderError } = await supabaseClient
            .from('catalog_builder')
            .insert({
              ...builderUpdate,
              catalog_id: photoId,
              builder_order: 1,
              created_by: 'admin', // Ideally this would come from auth context
              created_date: new Date().toISOString()
            });
            
          if (builderError) throw builderError;
        }
      } else if (photoData.builder === null) {
        // If builder is specifically set to null, remove any builder records
        const { error: deleteBuilderError } = await supabaseClient
          .from('catalog_builder')
          .delete()
          .eq('catalog_id', photoId);
          
        if (deleteBuilderError) throw deleteBuilderError;
      }
      
      return { data: null, error: null, status: 200 };
    } catch (error) {
      console.error('Error updating photo:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  }
};

export default photoAdminService;