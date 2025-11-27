import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `flowserve/${user.id}`,
      resource_type: 'auto',
    })

    // Update cloudinary_usage
    const fileSizeMB = file.size / (1024 * 1024)
    
    const { data: usage } = await supabase
      .from('cloudinary_usage')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (usage) {
      await supabase
        .from('cloudinary_usage')
        .update({
          total_storage_mb: usage.total_storage_mb + fileSizeMB,
          total_assets: usage.total_assets + 1,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('cloudinary_usage')
        .insert({
          user_id: user.id,
          total_storage_mb: fileSizeMB,
          total_assets: 1,
        })
    }

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
