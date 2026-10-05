import axios from 'axios'
import { fetchAuthSession } from 'aws-amplify/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession()
    const token = session?.tokens?.idToken?.toString()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // Not authenticated — request will proceed without token
  }
  return config
})

// Normalize error responses
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred'
    const status = error.response?.status
    const enhancedError = new Error(message)
    enhancedError.status = status
    enhancedError.data = error.response?.data
    return Promise.reject(enhancedError)
  }
)

export default apiClient
