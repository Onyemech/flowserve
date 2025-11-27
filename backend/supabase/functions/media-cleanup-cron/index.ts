import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { config } from '../_shared/config.ts'

serve(async (req) => {
  try {
    const supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    )

    // Get properties that have been sold for 14+ days
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const { data: oldProperties, error: queryError } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'sold')
      .is('deleted_at', null)
      .lt('updated_at', fourteenDaysAgo.toISOString())

    if (queryError) throw queryError

    const { data: properties, error } = await supabase.rpc('cleanup_old_media')
    
    if (error) throw error
    
    if (!oldProperties || oldProperties.length === 0) {
      return new Response(JSON.stringify({ message: 'No properties to cleanup' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`Found ${oldProperties.length} properties to cleanup`)

    // Delete images from Cloudinary
    const cloudinary = {
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    }

    let deletedCount = 0
    let totalStorageFreed = 0
    const processedProperties: string[] = []

    for (const property of oldProperties) {
      const images = property.images as string[]
      
      for (const imageUrl of images) {
        try {
          const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0]
          
          // Delete from Cloudinary
          const timestamp = Math.floor(Date.now() / 1000)
          const signature = await generateCloudinarySignature(
            { public_id: publicId, timestamp },
            cloudinary.api_secret
          )
          
          const deleteResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudinary.cloud_name}/image/destroy`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                public_id: publicId,
                timestamp,
                api_key: cloudinary.api_key,
                signature,
              }),
            }
          )
          
          if (deleteResponse.ok) {
            deletedCount++
            // Estimate 1MB per image
            totalStorageFreed += 1
          }
        } catch (err) {
          console.error(`Failed to delete image: ${imageUrl}`, err)
        }
      }
      
      // Soft delete the property (set deleted_at)
      await supabase
        .from('properties')
        .update({ 
          deleted_at: new Date().toISOString(),
          images: [] 
        })
        .eq('id', property.id)

      processedProperties.push(property.id)
      
      // Update cloudinary_usage
      const { data: usage } = await supabase
        .from('cloudinary_usage')
        .select('*')
        .eq('user_id', property.user_id)
        .single()

      if (usage) {
        await supabase
          .from('cloudinary_usage')
          .update({
            total_storage_mb: Math.max(0, usage.total_storage_mb - totalStorageFreed),
            total_assets: Math.max(0, usage.total_assets - images.length),
            last_updated: new Date().toISOString(),
          })
          .eq('user_id', property.user_id)
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      properties_cleaned: processedProperties.length,
      deleted_images: deletedCount,
      storage_freed_mb: totalStorageFreed,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

async function generateCloudinarySignature(params: Record<string, any>, apiSecret: string) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  const encoder = new TextEncoder()
  const data = encoder.encode(sortedParams + apiSecret)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
