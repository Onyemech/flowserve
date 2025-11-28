import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@/lib/supabase/server';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `flowserve/${user.id}`,
      resource_type: 'auto',
    });

    // Track in database
    await supabase.from('cloudinary_assets').insert({
      user_id: user.id,
      public_id: result.public_id,
      url: result.secure_url,
      secure_url: result.secure_url,
      format: result.format,
      resource_type: result.resource_type,
      size_bytes: result.bytes,
      width: result.width,
      height: result.height,
    });

    // Update usage stats
    const { data: usage } = await supabase
      .from('cloudinary_usage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (usage) {
      await supabase
        .from('cloudinary_usage')
        .update({
          total_storage_mb: usage.total_storage_mb + (result.bytes / 1024 / 1024),
          total_assets: usage.total_assets + 1,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      await supabase.from('cloudinary_usage').insert({
        user_id: user.id,
        total_storage_mb: result.bytes / 1024 / 1024,
        total_assets: 1,
      });
    }

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
