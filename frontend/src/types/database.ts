export interface User {
  id: string
  email: string
  full_name?: string
  business_name?: string
  business_type?: 'real_estate' | 'event_planning'
  bank_name?: string
  account_number?: string
  account_name?: string
  bank_code?: string
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  user_id: string
  title: string
  price: number
  description?: string
  location?: string
  images: string[] // Cloudinary URLs
  status: 'available' | 'sold'
  deleted_at?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  user_id: string
  name: string
  description?: string
  price: number
  images: string[] // Cloudinary URLs
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  customer_name?: string
  customer_phone: string
  customer_email?: string
  order_type: 'property' | 'service'
  item_id: string
  amount: number
  payment_method: 'paystack' | 'manual'
  payment_status: 'pending' | 'completed' | 'failed'
  paystack_reference?: string
  transfer_status?: 'pending' | 'completed' | 'failed'
  transfer_reference?: string
  created_at: string
  updated_at: string
}

export interface WhatsAppSession {
  id: string
  user_id: string
  customer_phone: string
  session_data: Record<string, any>
  last_message_at: string
  created_at: string
}

export interface CloudinaryUsage {
  id: string
  user_id: string
  total_storage_mb: number
  total_assets: number
  last_updated: string
}

export type BusinessType = 'real_estate' | 'event_planning'
export type PaymentMethod = 'paystack' | 'manual'
export type PaymentStatus = 'pending' | 'completed' | 'failed'
export type PropertyStatus = 'available' | 'sold'
