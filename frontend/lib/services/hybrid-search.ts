import { apiClient } from '@/lib/api'

export interface WebSearchResult {
  title: string
  url: string
  description: string
  snippet: string
  source: 'web'
  relevanceScore: number
}

export interface DocumentSearchResult {
  id: string
  title: string
  content: string
  excerpt: string
  source: 'document'
  relevanceScore: number
  documentType: string
  lastModified: string
}

export interface HybridSearchResult {
  query: string
  documentResults: DocumentSearchResult[]
  webResults: WebSearchResult[]
  combinedResults: (DocumentSearchResult | WebSearchResult)[]
  totalResults: number
  searchTime: number
}

export class HybridSearchService {
  private static instance: HybridSearchService
  
  static getInstance(): HybridSearchService {
    if (!HybridSearchService.instance) {
      HybridSearchService.instance = new HybridSearchService()
    }
    return HybridSearchService.instance
  }

  async searchHybrid(query: string, options?: {
    includeWeb?: boolean
    maxDocumentResults?: number
    maxWebResults?: number
  }): Promise<HybridSearchResult> {
    const startTime = Date.now()
    const {
      includeWeb = true,
      maxDocumentResults = 10,
      maxWebResults = 5
    } = options || {}

    try {
      // Search documents first (always included)
      const documentSearchPromise = this.searchDocuments(query, maxDocumentResults)
      
      // Search web if enabled
      const webSearchPromise = includeWeb 
        ? this.searchWeb(query, maxWebResults)
        : Promise.resolve([])

      const [documentResults, webResults] = await Promise.all([
        documentSearchPromise,
        webSearchPromise
      ])

      // Combine and rank results
      const combinedResults = this.combineAndRankResults(documentResults, webResults)
      
      const searchTime = Date.now() - startTime

      return {
        query,
        documentResults,
        webResults,
        combinedResults,
        totalResults: documentResults.length + webResults.length,
        searchTime
      }
    } catch (error) {
      console.error('Hybrid search error:', error)
      throw new Error('Failed to perform hybrid search')
    }
  }

  private async searchDocuments(query: string, maxResults: number): Promise<DocumentSearchResult[]> {
    try {
      const response = await apiClient.searchDocuments(query)
      
      if (response.success && response.data?.documents) {
        return response.data.documents.slice(0, maxResults).map(doc => ({
          id: doc.document.id,
          title: doc.document.title,
          content: doc.document.content || '',
          excerpt: doc.summary || '',
          source: 'document' as const,
          relevanceScore: doc.relevanceScore,
          documentType: doc.document.type || 'unknown',
          lastModified: doc.document.lastModified || ''
        }))
      }
      
      return []
    } catch (error) {
      console.error('Document search error:', error)
      return []
    }
  }

  private async searchWeb(query: string, maxResults: number): Promise<WebSearchResult[]> {
    try {
      // This would integrate with Brave Search MCP
      // For now, return mock data to demonstrate the structure
      return [
        {
          title: `Web result for: ${query}`,
          url: 'https://example.com',
          description: 'Mock web search result',
          snippet: `This is a mock web search result for the query: ${query}`,
          source: 'web' as const,
          relevanceScore: 0.8
        }
      ].slice(0, maxResults)
    } catch (error) {
      console.error('Web search error:', error)
      return []
    }
  }

  private combineAndRankResults(
    documentResults: DocumentSearchResult[],
    webResults: WebSearchResult[]
  ): (DocumentSearchResult | WebSearchResult)[] {
    // Combine all results
    const allResults: (DocumentSearchResult | WebSearchResult)[] = [
      ...documentResults,
      ...webResults
    ]

    // Sort by relevance score (descending)
    return allResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    // This could integrate with web search APIs to get query suggestions
    const suggestions = [
      `${query} best practices`,
      `${query} examples`,
      `${query} tutorial`,
      `${query} documentation`,
      `${query} comparison`
    ]
    
    return suggestions.slice(0, 5)
  }

  async saveSearchToSnippets(
    result: DocumentSearchResult | WebSearchResult,
    tags: string[] = []
  ): Promise<void> {
    // This would integrate with the snippet management system
    const snippet = {
      title: result.title,
      content: 'excerpt' in result ? result.excerpt : result.snippet,
      source: result.source === 'document' ? 'document' : 'web',
      sourceUrl: result.source === 'web' ? (result as WebSearchResult).url : undefined,
      tags: [...tags, 'search-result'],
      createdAt: new Date().toISOString()
    }
    
    console.log('Saving snippet:', snippet)
    // TODO: Implement actual snippet saving
  }
}

export const hybridSearch = HybridSearchService.getInstance()