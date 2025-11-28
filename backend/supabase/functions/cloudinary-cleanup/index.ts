import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const cloudinaryCloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')!;
const cloudinaryApiKey = Deno.env.get('CLOUDINARY_API_KEY')!;
const cloudinaryApiSecret = Deno.env.get('CLOUDINARY_API_SECRET')!;

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find assets older than 14 days that are marked for deletion
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: assetsToDelete, error } = await supabase
      .from('cloudinary_assets')
      .select('*')
      .not('deleted_at', 'is', null)
      .lt('deleted_at', fourteenDaysAgo.toISOString());

    if (error) throw error;

    if (!assetsToDelete || assetsToDelete.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No assets to cleanup' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete from Cloudinary
    const deletePromises = assetsToDelete.map(async (asset) => {
      try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = await generateSignature(asset.public_id, timestamp);

        const formData = new FormData();
        formData.append('public_id', asset.public_id);
        formData.append('signature', signature);
        formData.append('api_key', cloudinaryApiKey);
        formData.append('timestamp', timestamp.toString());

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/destroy`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const result = await response.json();

        if (result.result === 'ok') {
          // Delete from database
          await supabase
            .from('cloudinary_assets')
            .delete()
            .eq('id', asset.id);

          return { success: true, asset_id: asset.id };
        }

        return { success: false, asset_id: asset.id, error: result };
      } catch (error) {
        console.error(`Failed to delete asset ${asset.id}:`, error);
        return { success: false, asset_id: asset.id, error };
      }
    });

    const results = await Promise.all(deletePromises);
    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({
        message: `Cleanup completed`,
        total: assetsToDelete.length,
        deleted: successCount,
        failed: assetsToDelete.length - successCount,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function generateSignature(publicId: string, timestamp: number): Promise<string> {
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${cloudinaryApiSecret}`;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}
