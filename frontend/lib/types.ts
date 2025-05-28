// Core types for the AI File Explorer

export interface Document {
  id: string
  title: string
  content: string
  summary?: string
  filePath: string
  fileSize: number
  fileType: string
  createdAt: string
  updatedAt: string
  tags: string[]
  category: DocumentCategory
  quality: QualityTier
  googleDriveId?: string
  embeddings?: number[]
  metadata: DocumentMetadata
}

export interface DocumentMetadata {
  author?: string
  lastModified: string
  wordCount: number
  pageCount?: number
  language: string
  extractedText?: string
  thumbnailUrl?: string
}

export type DocumentCategory = 
  | 'BusinessPlan' 
  | 'Marketing' 
  | 'Financial' 
  | 'Product' 
  | 'Pitch' 
  | 'Legal' 
  | 'Research' 
  | 'General'

export type QualityTier = 'Best' | 'Good' | 'Archive'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  documents?: DocumentReference[]
  snippets?: SnippetReference[]
  isStreaming?: boolean
}

export interface DocumentReference {
  documentId: string
  title: string
  relevanceScore: number
  excerpt: string
  pageNumber?: number
}

export interface SnippetReference {
  snippetId: string
  text: string
  sourceDocument: string
  tags: string[]
}

export interface Snippet {
  id: string
  text: string
  title: string
  sourceDocument: Document
  sourceLocation: SourceLocation
  tags: string[]
  collections: string[]
  createdAt: string
  updatedAt: string
  notes?: string
}

export interface SourceLocation {
  documentId: string
  pageNumber?: number
  startOffset?: number
  endOffset?: number
  context: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  snippets: string[] // snippet IDs
  tags: string[]
  createdAt: string
  updatedAt: string
  color?: string
}

export interface SearchResult {
  documents: DocumentSearchResult[]
  snippets: SnippetSearchResult[]
  totalResults: number
  query: string
  searchTime: number
}

export interface DocumentSearchResult {
  document: Document
  relevanceScore: number
  highlights: SearchHighlight[]
  summary: string
}

export interface SnippetSearchResult {
  snippet: Snippet
  relevanceScore: number
  highlights: SearchHighlight[]
}

export interface SearchHighlight {
  text: string
  startOffset: number
  endOffset: number
  type: 'exact' | 'semantic' | 'fuzzy'
}

export interface SearchFilters {
  categories?: DocumentCategory[]
  qualityTiers?: QualityTier[]
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  fileTypes?: string[]
  collections?: string[]
}

export interface GoogleDriveFolder {
  id: string
  name: string
  path: string
  parentId?: string
  children: GoogleDriveFolder[]
  files: GoogleDriveFile[]
}

export interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  size: number
  createdTime: string
  modifiedTime: string
  webViewLink: string
  downloadUrl?: string
  thumbnailLink?: string
}

export interface AIProvider {
  name: string
  model: string
  apiKey: string
  baseUrl?: string
  maxTokens: number
  temperature: number
}

export interface AppConfig {
  aiProvider: AIProvider
  supabaseUrl: string
  supabaseKey: string
  googleDriveApiKey: string
  redisUrl?: string
  features: {
    googleDriveSync: boolean
    snippetCapture: boolean
    aiChat: boolean
    documentPreview: boolean
  }
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
}

// Store types
export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  currentQuery: string
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setCurrentQuery: (query: string) => void
}

export interface DocumentState {
  documents: Document[]
  selectedDocument: Document | null
  searchResults: SearchResult | null
  filters: SearchFilters
  isLoading: boolean
  setDocuments: (documents: Document[]) => void
  setSelectedDocument: (document: Document | null) => void
  setSearchResults: (results: SearchResult | null) => void
  updateFilters: (filters: Partial<SearchFilters>) => void
  setLoading: (loading: boolean) => void
}

export interface SnippetState {
  snippets: Snippet[]
  collections: Collection[]
  selectedCollection: Collection | null
  isLoading: boolean
  addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateSnippet: (id: string, updates: Partial<Snippet>) => void
  deleteSnippet: (id: string) => void
  addCollection: (collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateCollection: (id: string, updates: Partial<Collection>) => void
  deleteCollection: (id: string) => void
  setSelectedCollection: (collection: Collection | null) => void
  setLoading: (loading: boolean) => void
}
