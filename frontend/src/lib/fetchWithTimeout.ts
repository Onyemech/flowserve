async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 10000 // 10 seconds default
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your internet connection')
    }
    
    if (!navigator.onLine) {
      throw new Error('No internet connection')
    }
    
    throw error
  }
}
