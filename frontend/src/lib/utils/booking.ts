import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Add a date to a service's booked_dates array
 */
export async function addBookedDate(
  supabase: SupabaseClient,
  serviceId: string,
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return { success: false, error: 'Invalid date format. Use YYYY-MM-DD' }
    }

    // Get current booked dates
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('booked_dates')
      .eq('id', serviceId)
      .single()

    if (fetchError) {
      console.error('Error fetching service:', fetchError)
      return { success: false, error: 'Service not found' }
    }

    const currentDates = (service.booked_dates as string[]) || []
    
    // Add new date if not already booked
    if (!currentDates.includes(date)) {
      const updatedDates = [...currentDates, date].sort()

      const { error: updateError } = await supabase
        .from('services')
        .update({ booked_dates: updatedDates })
        .eq('id', serviceId)

      if (updateError) {
        console.error('Error updating booked dates:', updateError)
        return { success: false, error: 'Failed to update booked dates' }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in addBookedDate:', error)
    return { success: false, error: 'Internal error' }
  }
}

/**
 * Remove a date from a service's booked_dates array
 */
export async function removeBookedDate(
  supabase: SupabaseClient,
  serviceId: string,
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current booked dates
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('booked_dates')
      .eq('id', serviceId)
      .single()

    if (fetchError) {
      console.error('Error fetching service:', fetchError)
      return { success: false, error: 'Service not found' }
    }

    const currentDates = (service.booked_dates as string[]) || []
    const updatedDates = currentDates.filter(d => d !== date)

    const { error: updateError } = await supabase
      .from('services')
      .update({ booked_dates: updatedDates })
      .eq('id', serviceId)

    if (updateError) {
      console.error('Error updating booked dates:', updateError)
      return { success: false, error: 'Failed to update booked dates' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in removeBookedDate:', error)
    return { success: false, error: 'Internal error' }
  }
}

/**
 * Check if a date is available for a service
 */
export async function isDateAvailable(
  supabase: SupabaseClient,
  serviceId: string,
  date: string
): Promise<boolean> {
  try {
    const { data: service, error } = await supabase
      .from('services')
      .select('booked_dates')
      .eq('id', serviceId)
      .single()

    if (error || !service) return false

    const bookedDates = (service.booked_dates as string[]) || []
    return !bookedDates.includes(date)
  } catch (error) {
    console.error('Error checking date availability:', error)
    return false
  }
}

/**
 * Get all booked dates for a service
 */
export async function getBookedDates(
  supabase: SupabaseClient,
  serviceId: string
): Promise<string[]> {
  try {
    const { data: service, error } = await supabase
      .from('services')
      .select('booked_dates')
      .eq('id', serviceId)
      .single()

    if (error || !service) return []

    return (service.booked_dates as string[]) || []
  } catch (error) {
    console.error('Error getting booked dates:', error)
    return []
  }
}
