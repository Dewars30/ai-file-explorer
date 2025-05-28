import { 
  Document, 
  SearchResult, 
  SearchFilters, 
  Snippet, 
  Collection,
  GoogleDriveFolder,
  ApiResponse,
  PaginatedResponse 
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // For development, return mock data when backend is not available
      if (process.env.NODE_ENV === 'development') {
        return this.getMockResponse<T>(endpoint)
      }

      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data, error: undefined }
    } catch (error) {
      console.warn(`API request to ${endpoint} failed (backend not available):`, error)
      return { 
        success: false, 
        data: undefined, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  private getMockResponse<T>(endpoint: string): ApiResponse<T> {
    // Return appropriate mock data based on endpoint
    if (endpoint.includes('/search')) {
      return {
        success: true,
        data: {
          results: [],
          total: 0,
          query: '',
          processingTime: 0
        } as T,
        error: undefined
      }
    }
    
    if (endpoint.includes('/documents')) {
      return {
        success: true,
        data: [] as T,
        error: undefined
      }
    }

    if (endpoint.includes('/snippets')) {
      return {
        success: true,
        data: [] as T,
        error: undefined
      }
    }

    if (endpoint.includes('/health')) {
      return {
        success: true,
        data: {
          status: 'Backend not available (development mode)',
          timestamp: new Date().toISOString()
        } as T,
        error: undefined
      }
    }

    return {
      success: false,
      data: undefined,
      error: 'Backend not available (development mode)'
    }
  }

  // Document endpoints
  async searchDocuments(query: string, filters?: SearchFilters): Promise<ApiResponse<SearchResult>> {
    return this.request<SearchResult>('/api/documents/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    })
  }

  async getDocuments(page = 1, pageSize = 20): Promise<ApiResponse<PaginatedResponse<Document>>> {
    return this.request<PaginatedResponse<Document>>(
      `/api/documents?page=${page}&page_size=${pageSize}`
    )
  }

  async getDocument(id: string): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/api/documents/${id}`)
  }

  async uploadDocument(file: File, metadata?: any): Promise<ApiResponse<Document>> {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }

    return this.request<Document>('/api/documents/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    })
  }

  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/documents/${id}`, {
      method: 'DELETE',
    })
  }

  // Chat endpoints
  async sendChatMessage(message: string, context?: string[]): Promise<ApiResponse<{ response: string, documents?: Document[] }>> {
    return this.request<{ response: string, documents?: Document[] }>('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    })
  }

  async streamChatMessage(message: string, context?: string[]): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, context }),
    })

    if (!response.body) {
      throw new Error('No response body')
    }

    return response.body
  }

  // Snippet endpoints
  async getSnippets(page = 1, pageSize = 50): Promise<ApiResponse<PaginatedResponse<Snippet>>> {
    return this.request<PaginatedResponse<Snippet>>(
      `/api/snippets?page=${page}&page_size=${pageSize}`
    )
  }

  async createSnippet(snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Snippet>> {
    return this.request<Snippet>('/api/snippets', {
      method: 'POST',
      body: JSON.stringify(snippet),
    })
  }

  async updateSnippet(id: string, updates: Partial<Snippet>): Promise<ApiResponse<Snippet>> {
    return this.request<Snippet>(`/api/snippets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deleteSnippet(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/snippets/${id}`, {
      method: 'DELETE',
    })
  }

  // Collection endpoints
  async getCollections(): Promise<ApiResponse<Collection[]>> {
    return this.request<Collection[]>('/api/collections')
  }

  async createCollection(collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Collection>> {
    return this.request<Collection>('/api/collections', {
      method: 'POST',
      body: JSON.stringify(collection),
    })
  }

  async updateCollection(id: string, updates: Partial<Collection>): Promise<ApiResponse<Collection>> {
    return this.request<Collection>(`/api/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deleteCollection(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/collections/${id}`, {
      method: 'DELETE',
    })
  }

  // Google Drive endpoints
  async getGoogleDriveFolders(): Promise<ApiResponse<GoogleDriveFolder[]>> {
    return this.request<GoogleDriveFolder[]>('/api/google-drive/folders')
  }

  async syncGoogleDriveFolder(folderId: string): Promise<ApiResponse<{ message: string, documentsAdded: number }>> {
    return this.request<{ message: string, documentsAdded: number }>('/api/google-drive/sync', {
      method: 'POST',
      body: JSON.stringify({ folderId }),
    })
  }

  async authorizeGoogleDrive(): Promise<ApiResponse<{ authUrl: string }>> {
    return this.request<{ authUrl: string }>('/api/google-drive/authorize')
  }

  async syncGoogleDrive(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/google-drive/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to sync Google Drive')
      }
      
      return response.json()
    } catch (error) {
      console.error('Error syncing Google Drive:', error)
      throw error
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string, timestamp: string }>> {
    return this.request<{ status: string, timestamp: string }>('/api/health')
  }
}

export const apiClient = new ApiClient()
export default apiClient
