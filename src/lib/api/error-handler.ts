import { toast } from 'sonner'

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

export class ApiErrorHandler {
  static handle(error: any): ApiError {
    console.error('API Error:', error)

    // Supabase errors
    if (error.code) {
      return this.handleSupabaseError(error)
    }

    // Network errors
    if (error.name === 'NetworkError' || !navigator.onLine) {
      return {
        message: 'Network connection error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        status: 0
      }
    }

    // Timeout errors
    if (error.name === 'TimeoutError') {
      return {
        message: 'Request timed out. Please try again.',
        code: 'TIMEOUT_ERROR',
        status: 408
      }
    }

    // Generic error
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      status: 500
    }
  }

  private static handleSupabaseError(error: any): ApiError {
    switch (error.code) {
      case 'PGRST301':
        return {
          message: 'You do not have permission to perform this action',
          code: 'UNAUTHORIZED',
          status: 401
        }

      case 'PGRST116':
        return {
          message: 'The requested resource was not found',
          code: 'NOT_FOUND',
          status: 404
        }

      case '23505':
        return {
          message: 'This record already exists',
          code: 'DUPLICATE_ENTRY',
          status: 409
        }

      case '23503':
        return {
          message: 'Referenced record does not exist',
          code: 'FOREIGN_KEY_VIOLATION',
          status: 400
        }

      case '23514':
        return {
          message: 'Invalid data provided',
          code: 'CHECK_VIOLATION',
          status: 400
        }

      case 'invalid_credentials':
        return {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
          status: 401
        }

      case 'email_not_confirmed':
        return {
          message: 'Please verify your email address before signing in',
          code: 'EMAIL_NOT_CONFIRMED',
          status: 401
        }

      case 'signup_disabled':
        return {
          message: 'Account registration is currently disabled',
          code: 'SIGNUP_DISABLED',
          status: 403
        }

      case 'weak_password':
        return {
          message: 'Password is too weak. Please choose a stronger password',
          code: 'WEAK_PASSWORD',
          status: 400
        }

      case 'email_address_invalid':
        return {
          message: 'Please enter a valid email address',
          code: 'INVALID_EMAIL',
          status: 400
        }

      default:
        return {
          message: error.message || 'Database operation failed',
          code: error.code,
          status: 500,
          details: error
        }
    }
  }

  static showError(error: ApiError, options?: {
    showToast?: boolean
    logError?: boolean
  }) {
    const { showToast = true, logError = true } = options || {}

    if (logError) {
      console.error('API Error:', error)
    }

    if (showToast) {
      toast.error(error.message)
    }
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    options?: {
      showToast?: boolean
      retries?: number
      retryDelay?: number
    }
  ): Promise<T | null> {
    const { showToast = true, retries = 0, retryDelay = 1000 } = options || {}
    
    let lastError: ApiError | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = this.handle(error)
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(lastError)) {
          break
        }

        // Wait before retrying
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
        }
      }
    }

    if (lastError) {
      this.showError(lastError, { showToast })
    }

    return null
  }

  private static shouldNotRetry(error: ApiError): boolean {
    const nonRetryableCodes = [
      'UNAUTHORIZED',
      'NOT_FOUND',
      'INVALID_CREDENTIALS',
      'EMAIL_NOT_CONFIRMED',
      'DUPLICATE_ENTRY',
      'INVALID_EMAIL',
      'WEAK_PASSWORD'
    ]

    return nonRetryableCodes.includes(error.code || '')
  }
}

// Utility function for API calls with error handling
export async function apiCall<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    const apiError = ApiErrorHandler.handle(error)
    
    if (errorMessage) {
      apiError.message = errorMessage
    }
    
    ApiErrorHandler.showError(apiError)
    return null
  }
}

// React hook for error handling
export function useApiErrorHandler() {
  const handleError = (error: any, customMessage?: string) => {
    const apiError = ApiErrorHandler.handle(error)
    
    if (customMessage) {
      apiError.message = customMessage
    }
    
    ApiErrorHandler.showError(apiError)
    return apiError
  }

  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    options?: {
      showToast?: boolean
      retries?: number
      customMessage?: string
    }
  ): Promise<T | null> => {
    try {
      return await ApiErrorHandler.withErrorHandling(operation, options)
    } catch (error) {
      return handleError(error, options?.customMessage)
    }
  }

  return {
    handleError,
    withErrorHandling
  }
}