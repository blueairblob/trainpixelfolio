// src/api/supabase/services/photoAdminService.ts
import { supabaseClient } from '../client';
import { ApiResponse } from '../types';
import { adminService } from './adminService';

/**
 * Service for handling advanced photo admin operations with Supabase
 */
export const photoAdminService = {
  /**
   * Get complete photo data including all related information for editing
   */
  getCompletePhotoData: async (photoId: string): Promise<ApiResponse<any>> => {
    try {
      console.log('Using database ID for photo lookup:', photoId);
      
      // Get the catalog record using the image_no
      const { data: catalogData, error: catalogError } = await adminService.getRecords('catalog', {
        filters: { image_no: photoId },
        limit: 1
      });
      
      if (catalogError) throw catalogError;
      if (!catalogData || catalogData.length === 0) throw new Error('Photo not found');
      
      // Get the UUID we'll use for related records
      const actualId = catalogData[0].id;
      
      // Get metadata record - use maybeSingle to avoid errors if missing
      const { data: metadataData, error: metadataError } = await supabaseClient
        .from('catalog_metadata')
        .select(`
          *,
          photographer:photographer_id(id, name),
          location:location_id(id, name),
          organisation:organisation_id(id, name),
          collection:collection_id(id, name)
        `)
        .eq('catalog_id', actualId)
        .maybeSingle();
      
      if (metadataError) throw metadataError;
      
      // Get usage rights - use maybeSingle to avoid errors if missing
      const { data: usageData, error: usageError } = await supabaseClient
        .from('usage')
        .select('*')
        .eq('catalog_id', actualId)
        .maybeSingle();
      
      if (usageError) throw usageError;
      
      // Get picture metadata - use maybeSingle to avoid errors if missing
      const { data: pictureData, error: pictureError } = await supabaseClient
        .from('picture_metadata')
        .select('*')
        .eq('catalog_id', actualId)
        .maybeSingle();
      
      // We'll ignore pictureError since the picture metadata might be missing
      
      // Get builder information - this might return an empty array which is fine
      const { data: builderData, error: builderError } = await supabaseClient
        .from('catalog_builder')
        .select(`
          *,
          builder:builder_id(id, name, code)
        `)
        .eq('catalog_id', actualId);
      
      if (builderError) throw builderError;
      
      // Combine all the data
      const completePhotoData = {
        ...catalogData[0],
        metadata: metadataData || {},
        usage: usageData || {},
        picture: pictureData || {},
        builders: builderData || []
      };
      
      // Create the flattened version for the form
      const flattenedPhotoData = {
        ...catalogData[0],
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
      // 1. Update catalog table
      const catalogUpdate = {
        image_no: photoData.imageNo,
        description: photoData.description,
        category: photoData.category,
        date_taken: photoData.dateTaken,
        gauge: photoData.gauge,
        // Add other fields as needed
      };
      
      const { error: catalogError } = await adminService.updateRecord(
        'catalog',
        photoId,
        catalogUpdate
      );
          
      if (catalogError) throw catalogError;
      
      // 2. Update catalog_metadata table
      const metadataUpdate = {
        photographer_id: photoData.photographer || null,
        location_id: photoData.location || null,
        organisation_id: photoData.organisation || null,
        collection_id: photoData.collection || null,
      };
      
      // First check if metadata record exists
      const { data: existingMetadata } = await adminService.getRecords(
        'catalog_metadata',
        { filters: { catalog_id: photoId } }
      );
      
      if (existingMetadata && existingMetadata.length > 0) {
        // Update existing record
        await adminService.updateRecord(
          'catalog_metadata',
          existingMetadata[0].id,
          metadataUpdate
        );
      } else {
        // Create new record
        await adminService.createRecord(
          'catalog_metadata',
          {
            ...metadataUpdate,
            catalog_id: photoId,
            created_by: 'admin', // Ideally from auth context
            created_date: new Date().toISOString()
          }
        );
      }
      
      // 3. Update usage rights
      const usageUpdate = {
        prints_allowed: photoData.printAllowed,
        internet_use: photoData.internetUse,
        publications_use: photoData.publicationUse
      };
      
      // Check if usage record exists
      const { data: existingUsage } = await adminService.getRecords(
        'usage',
        { filters: { catalog_id: photoId } }
      );
      
      if (existingUsage && existingUsage.length > 0) {
        // Update existing record
        await adminService.updateRecord(
          'usage',
          existingUsage[0].id,
          usageUpdate,
          { idField: 'catalog_id' }
        );
      } else {
        // Create new record
        await adminService.createRecord(
          'usage',
          {
            ...usageUpdate,
            catalog_id: photoId,
            created_by: 'admin',
            created_date: new Date().toISOString()
          }
        );
      }
      
      // 4. Update builder information if provided
      if (photoData.builder) {
        const builderUpdate = {
          builder_id: photoData.builder,
          works_number: photoData.worksNumber || null,
          year_built: photoData.yearBuilt || null
        };
        
        // Check if a builder record exists
        const { data: existingBuilder } = await adminService.getRecords(
          'catalog_builder',
          { filters: { catalog_id: photoId } }
        );
        
        if (existingBuilder && existingBuilder.length > 0) {
          // Update existing builder record
          await adminService.updateRecord(
            'catalog_builder',
            existingBuilder[0].id, 
            builderUpdate
          );
        } else {
          // Create new builder record
          await adminService.createRecord(
            'catalog_builder',
            {
              ...builderUpdate,
              catalog_id: photoId,
              builder_order: 1,
              created_by: 'admin',
              created_date: new Date().toISOString()
            }
          );
        }
      } else if (photoData.builder === null) {
        // If builder is specifically set to null, remove any builder records
        const { data: existingBuilders } = await adminService.getRecords(
          'catalog_builder',
          { filters: { catalog_id: photoId } }
        );
        
        if (existingBuilders && existingBuilders.length > 0) {
          // Delete all builder records for this photo
          for (const builder of existingBuilders) {
            await adminService.deleteRecord('catalog_builder', builder.id);
          }
        }
      }
      
      return { data: null, error: null, status: 200 };
    } catch (error) {
      console.error('Error updating photo:', error);
      return { data: null, error: error as Error, status: 500 };
    }
  },

  createPhoto: async (photoData: any, imageFile: any): Promise<ApiResponse<string>> => {
  try {
    // 1. Create the catalog entry
    const catalogData = {
      image_no: photoData.imageNo,
      description: photoData.description,
      category: photoData.category,
      date_taken: photoData.dateTaken,
      gauge: photoData.gauge,
      created_by: 'admin', // Ideally from auth context
      created_date: new Date().toISOString()
    };
    
    const { data: newCatalog, error: catalogError } = await adminService.createRecord(
      'catalog',
      catalogData
    );
    
    if (catalogError) throw catalogError;
    if (!newCatalog) throw new Error('Failed to create catalog record');
    
    const photoId = newCatalog.id;
    
    // 2. Create metadata record
    if (photoData.photographer || photoData.location || 
        photoData.organisation || photoData.collection) {
      await adminService.createRecord(
        'catalog_metadata',
        {
          catalog_id: photoId,
          photographer_id: photoData.photographer || null,
          location_id: photoData.location || null,
          organisation_id: photoData.organisation || null,
          collection_id: photoData.collection || null,
          created_by: 'admin',
          created_date: new Date().toISOString()
        }
      );
    }
    
    // 3. Create usage rights record
    await adminService.createRecord(
      'usage',
      {
        catalog_id: photoId,
        prints_allowed: photoData.printAllowed || false,
        internet_use: photoData.internetUse || false,
        publications_use: photoData.publicationUse || false,
        created_by: 'admin',
        created_date: new Date().toISOString()
      }
    );
    
    // 4. Create picture metadata
    if (imageFile) {
      await adminService.createRecord(
        'picture_metadata',
        {
          catalog_id: photoId,
          file_name: `${photoData.imageNo.replace(/\s/g, '')}.webp`,
          file_location: `images/${photoData.imageNo.replace(/\s/g, '')}.webp`,
          file_type: 'webp',
          file_size: imageFile.fileSize || 0,
          width: imageFile.width || null,
          height: imageFile.height || null,
          created_by: 'admin',
          created_date: new Date().toISOString()
        }
      );
    }
    
    // 5. Create builder information if provided
    if (photoData.builder) {
      await adminService.createRecord(
        'catalog_builder',
        {
          catalog_id: photoId,
          builder_id: photoData.builder,
          works_number: photoData.worksNumber || null,
          year_built: photoData.yearBuilt || null,
          builder_order: 1,
          created_by: 'admin',
          created_date: new Date().toISOString()
        }
      );
    }
    
    return { data: photoId, error: null, status: 201 };
  } catch (error) {
    console.error('Error creating photo:', error);
    return { data: null, error: error as Error, status: 500 };
  }
}

};

export default photoAdminService;