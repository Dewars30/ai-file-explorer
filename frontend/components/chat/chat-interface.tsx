'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Search, Globe, FileText, Bookmark, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hybridSearch, type HybridSearchResult } from '@/lib/services/hybrid-search'
import { memoryService } from '@/lib/services/memory'
import { googleDriveService } from '@/lib/services/google-drive'

interface Message {
  id: string
  content: string
  type: 'user' | 'assistant' | 'system'
  timestamp: Date
  searchResults?: HybridSearchResult
  suggestions?: string[]
}

interface ChatInterfaceProps {
  onSearchResults?: (results: any[]) => void
  className?: string
}

export function ChatInterface({ onSearchResults, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI File Explorer assistant. I can help you search through your documents, find information on the web, and organize your knowledge. What would you like to explore today?',
      type: 'assistant',
      timestamp: new Date(),
      suggestions: ['Search my documents', 'Find business plans', 'Web search for trends', 'Organize my files']
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load search suggestions based on user's search patterns
  useEffect(() => {
    const loadSuggestions = async () => {
      if (input.length > 2) {
        const suggestions = await memoryService.getSearchSuggestions(input)
        setSearchSuggestions(suggestions)
      } else {
        setSearchSuggestions([])
      }
    }
    
    const debounceTimer = setTimeout(loadSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      type: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Determine if this is a search query or a conversation
      const isSearchQuery = await determineQueryType(input.trim())
      
      if (isSearchQuery) {
        await handleSearchQuery(input.trim())
      } else {
        await handleConversation(input.trim())
      }
    } catch (error) {
      console.error('Error processing message:', error)
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        type: 'assistant',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const determineQueryType = async (query: string): Promise<boolean> => {
    // Simple heuristics to determine if this is a search query
    const searchKeywords = ['find', 'search', 'look for', 'show me', 'what', 'where', 'when', 'how']
    const lowerQuery = query.toLowerCase()
    
    return searchKeywords.some(keyword => lowerQuery.includes(keyword)) || 
           query.includes('?') || 
           query.length > 50
  }

  const handleSearchQuery = async (query: string) => {
    try {
      // Get user preferences for search behavior
      const includeWeb = await memoryService.getUserPreference('search', 'includeWebResults') ?? true
      
      // Perform hybrid search
      const searchResults = await hybridSearch.searchHybrid(query, {
        includeWeb,
        maxDocumentResults: 10,
        maxWebResults: 5
      })

      // Record search pattern for learning
      const resultTypes = [
        ...(searchResults.documentResults.length > 0 ? ['document'] : []),
        ...(searchResults.webResults.length > 0 ? ['web'] : [])
      ]
      
      const avgRelevance = searchResults.combinedResults.length > 0
        ? searchResults.combinedResults.reduce((sum, r) => sum + r.relevanceScore, 0) / searchResults.combinedResults.length
        : 0

      await memoryService.recordSearchPattern(query, resultTypes, avgRelevance)

      // Create response message with search results
      const responseMessage: Message = {
        id: Date.now().toString(),
        content: `I found ${searchResults.totalResults} results for "${query}" in ${searchResults.searchTime}ms. Here's what I discovered:`,
        type: 'assistant',
        timestamp: new Date(),
        searchResults,
        suggestions: ['Save to snippets', 'Refine search', 'Search web only', 'Search documents only']
      }

      setMessages(prev => [...prev, responseMessage])
      
      // Notify parent component about search results
      onSearchResults?.(searchResults.combinedResults)

    } catch (error) {
      console.error('Search failed:', error)
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'I encountered an issue while searching. Please try rephrasing your query or check your connection.',
        type: 'assistant',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleConversation = async (query: string) => {
    // For now, provide helpful responses based on common queries
    let response = ''
    let suggestions: string[] = []

    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
      response = `I can help you with several tasks:

• **Search Documents**: Find information across your document library
• **Web Search**: Get the latest information from the internet  
• **Google Drive**: Sync and organize your Google Drive files
• **Snippets**: Save and organize important excerpts
• **Smart Organization**: AI-powered categorization and tagging

Would you like me to demonstrate any of these features?`
      suggestions = ['Search my documents', 'Connect Google Drive', 'Show recent files', 'Organize my snippets']
    } else if (lowerQuery.includes('google drive') || lowerQuery.includes('sync')) {
      const isConnected = googleDriveService.isConnected()
      response = isConnected 
        ? 'Your Google Drive is connected! I can help you search files, sync folders, or organize documents. What would you like to do?'
        : 'I can help you connect to Google Drive to sync and search your files. Would you like me to start the authentication process?'
      suggestions = isConnected 
        ? ['Search Drive files', 'Sync a folder', 'Organize documents']
        : ['Connect Google Drive', 'Learn about sync features']
    } else if (lowerQuery.includes('snippet') || lowerQuery.includes('save')) {
      response = 'I can help you save important information as snippets! You can save excerpts from search results, add tags for organization, and easily find them later. Would you like to see your existing snippets or learn how to create new ones?'
      suggestions = ['Show my snippets', 'Create a snippet', 'Search snippets']
    } else {
      response = `I understand you're asking about "${query}". Let me search for relevant information to help answer your question.`
      suggestions = ['Search for this topic', 'Find related documents', 'Web search']
    }

    const responseMessage: Message = {
      id: Date.now().toString(),
      content: response,
      type: 'assistant',
      timestamp: new Date(),
      suggestions
    }

    setMessages(prev => [...prev, responseMessage])
  }

  const handleSuggestionClick = async (suggestion: string) => {
    setInput(suggestion)
    
    // Auto-submit certain suggestions
    if (suggestion.startsWith('Search') || suggestion.includes('find')) {
      setTimeout(() => {
        handleSubmit({ preventDefault: () => {} } as React.FormEvent)
      }, 100)
    }
  }

  const handleSaveToSnippet = async (result: any) => {
    try {
      await hybridSearch.saveSearchToSnippets(result, ['search-result'])
      
      const confirmMessage: Message = {
        id: Date.now().toString(),
        content: `Saved "${result.title}" to your snippets!`,
        type: 'system',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, confirmMessage])
    } catch (error) {
      console.error('Failed to save snippet:', error)
    }
  }

  const renderSearchResults = (searchResults: HybridSearchResult) => {
    return (
      <div className="mt-4 space-y-3">
        {searchResults.combinedResults.slice(0, 5).map((result, index) => (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {result.source === 'document' ? (
                    <FileText className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Globe className="h-4 w-4 text-green-500" />
                  )}
                  <h4 className="font-medium text-sm">{result.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(result.relevanceScore * 100)}% match
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {'excerpt' in result ? result.excerpt : result.snippet}
                </p>
                {result.source === 'web' && 'url' in result && (
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    {result.url}
                  </a>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSaveToSnippet(result)}
                className="ml-2"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-full",
              message.type === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3",
                message.type === 'user'
                  ? "bg-primary text-primary-foreground"
                  : message.type === 'system'
                  ? "bg-blue-50 text-blue-900 border border-blue-200"
                  : "bg-muted"
              )}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              
              {/* Search Results */}
              {message.searchResults && renderSearchResults(message.searchResults)}
              
              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs h-7"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="text-xs opacity-50 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-3 max-w-[85%]">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Search Suggestions */}
      {searchSuggestions.length > 0 && (
        <div className="px-6 pb-2">
          <div className="flex flex-wrap gap-2">
            {searchSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs h-6 px-2"
              >
                <Search className="h-3 w-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-6 border-t bg-background">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your documents, or search for information..."
              className="min-h-[60px] max-h-[120px] resize-none pr-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="h-[60px] px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
