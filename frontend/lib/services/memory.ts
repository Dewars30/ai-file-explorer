export interface UserPreference {
  id: string
  category: 'ui' | 'search' | 'sync' | 'general'
  key: string
  value: any
  description?: string
  createdAt: string
  updatedAt: string
}

export interface SearchPattern {
  query: string
  frequency: number
  lastUsed: string
  resultTypes: string[]
  avgRelevance: number
}

export interface DocumentInteraction {
  documentId: string
  documentTitle: string
  action: 'view' | 'search' | 'snippet' | 'share'
  timestamp: string
  context?: string
}

export interface ProjectContext {
  currentProject?: string
  recentDocuments: string[]
  frequentSearches: SearchPattern[]
  preferredCategories: string[]
  workflowPatterns: string[]
}

export class MemoryService {
  private static instance: MemoryService
  private cache = new Map<string, any>()
  
  static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService()
    }
    return MemoryService.instance
  }

  // User Preferences Management
  async getUserPreferences(): Promise<UserPreference[]> {
    try {
      // This would use the Memory MCP to retrieve stored preferences
      const cached = this.cache.get('user_preferences')
      if (cached) return cached

      // Mock data for now
      const preferences: UserPreference[] = [
        {
          id: 'pref1',
          category: 'ui',
          key: 'theme',
          value: 'light',
          description: 'UI theme preference',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'pref2',
          category: 'search',
          key: 'includeWebResults',
          value: true,
          description: 'Include web search results by default',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z'
        }
      ]

      this.cache.set('user_preferences', preferences)
      return preferences
    } catch (error) {
      console.error('Failed to get user preferences:', error)
      return []
    }
  }

  async setUserPreference(category: UserPreference['category'], key: string, value: any): Promise<void> {
    try {
      const preferences = await this.getUserPreferences()
      const existingIndex = preferences.findIndex(p => p.category === category && p.key === key)
      
      const preference: UserPreference = {
        id: existingIndex >= 0 ? preferences[existingIndex].id : `pref_${Date.now()}`,
        category,
        key,
        value,
        createdAt: existingIndex >= 0 ? preferences[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (existingIndex >= 0) {
        preferences[existingIndex] = preference
      } else {
        preferences.push(preference)
      }

      this.cache.set('user_preferences', preferences)
      
      // This would use the Memory MCP to persist the preference
      console.log('Saved preference:', preference)
    } catch (error) {
      console.error('Failed to set user preference:', error)
      throw error
    }
  }

  async getUserPreference(category: UserPreference['category'], key: string): Promise<any> {
    const preferences = await this.getUserPreferences()
    const preference = preferences.find(p => p.category === category && p.key === key)
    return preference?.value
  }

  // Search Pattern Learning
  async recordSearchPattern(query: string, resultTypes: string[], relevanceScore: number): Promise<void> {
    try {
      const patterns = await this.getSearchPatterns()
      const existingPattern = patterns.find(p => p.query.toLowerCase() === query.toLowerCase())

      if (existingPattern) {
        // Update existing pattern
        existingPattern.frequency++
        existingPattern.lastUsed = new Date().toISOString()
        existingPattern.avgRelevance = (existingPattern.avgRelevance + relevanceScore) / 2
        existingPattern.resultTypes = [...new Set([...existingPattern.resultTypes, ...resultTypes])]
      } else {
        // Create new pattern
        patterns.push({
          query,
          frequency: 1,
          lastUsed: new Date().toISOString(),
          resultTypes,
          avgRelevance: relevanceScore
        })
      }

      this.cache.set('search_patterns', patterns)
      console.log('Recorded search pattern:', query)
    } catch (error) {
      console.error('Failed to record search pattern:', error)
    }
  }

  async getSearchPatterns(): Promise<SearchPattern[]> {
    try {
      const cached = this.cache.get('search_patterns')
      if (cached) return cached

      // Mock data for now
      const patterns: SearchPattern[] = [
        {
          query: 'business plan',
          frequency: 15,
          lastUsed: '2024-01-15T00:00:00Z',
          resultTypes: ['document', 'web'],
          avgRelevance: 0.85
        },
        {
          query: 'financial projections',
          frequency: 8,
          lastUsed: '2024-01-14T00:00:00Z',
          resultTypes: ['document'],
          avgRelevance: 0.92
        }
      ]

      this.cache.set('search_patterns', patterns)
      return patterns
    } catch (error) {
      console.error('Failed to get search patterns:', error)
      return []
    }
  }

  async getSearchSuggestions(partialQuery: string): Promise<string[]> {
    const patterns = await this.getSearchPatterns()
    
    return patterns
      .filter(p => p.query.toLowerCase().includes(partialQuery.toLowerCase()))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)
      .map(p => p.query)
  }

  // Document Interaction Tracking
  async recordDocumentInteraction(
    documentId: string,
    documentTitle: string,
    action: DocumentInteraction['action'],
    context?: string
  ): Promise<void> {
    try {
      const interactions = await this.getDocumentInteractions()
      
      interactions.push({
        documentId,
        documentTitle,
        action,
        timestamp: new Date().toISOString(),
        context
      })

      // Keep only last 1000 interactions
      if (interactions.length > 1000) {
        interactions.splice(0, interactions.length - 1000)
      }

      this.cache.set('document_interactions', interactions)
      console.log('Recorded document interaction:', action, documentTitle)
    } catch (error) {
      console.error('Failed to record document interaction:', error)
    }
  }

  async getDocumentInteractions(): Promise<DocumentInteraction[]> {
    try {
      const cached = this.cache.get('document_interactions')
      if (cached) return cached

      // Return empty array for now
      const interactions: DocumentInteraction[] = []
      this.cache.set('document_interactions', interactions)
      return interactions
    } catch (error) {
      console.error('Failed to get document interactions:', error)
      return []
    }
  }

  async getRecentDocuments(limit = 10): Promise<string[]> {
    const interactions = await this.getDocumentInteractions()
    
    const recentDocs = interactions
      .filter(i => i.action === 'view')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map(i => i.documentId)

    // Remove duplicates while preserving order
    return [...new Set(recentDocs)]
  }

  // Project Context Management
  async getProjectContext(): Promise<ProjectContext> {
    try {
      const cached = this.cache.get('project_context')
      if (cached) return cached

      const [recentDocuments, searchPatterns] = await Promise.all([
        this.getRecentDocuments(),
        this.getSearchPatterns()
      ])

      const context: ProjectContext = {
        recentDocuments,
        frequentSearches: searchPatterns.slice(0, 10),
        preferredCategories: ['business-plan', 'financial', 'marketing'],
        workflowPatterns: ['search-then-snippet', 'bulk-categorize']
      }

      this.cache.set('project_context', context)
      return context
    } catch (error) {
      console.error('Failed to get project context:', error)
      return {
        recentDocuments: [],
        frequentSearches: [],
        preferredCategories: [],
        workflowPatterns: []
      }
    }
  }

  async updateProjectContext(updates: Partial<ProjectContext>): Promise<void> {
    try {
      const context = await this.getProjectContext()
      const updatedContext = { ...context, ...updates }
      
      this.cache.set('project_context', updatedContext)
      console.log('Updated project context:', updates)
    } catch (error) {
      console.error('Failed to update project context:', error)
    }
  }

  // Cache Management
  clearCache(): void {
    this.cache.clear()
    console.log('Memory cache cleared')
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const memoryService = MemoryService.getInstance()