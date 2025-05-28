'use client'

import { useState } from 'react'
import { Search, Settings, RefreshCw, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/lib/hooks/use-toast'
import { apiClient } from '@/lib/api'
import { useDocumentStore } from '@/lib/stores/document-store'
import { useChatStore } from '@/lib/stores/chat-store'
import { useSnippetStore } from '@/lib/stores/snippet-store'

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()
  
  const { documents } = useDocumentStore()
  const { messages } = useChatStore()
  const { snippets } = useSnippetStore()

  const handleQuickSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      const response = await apiClient.searchDocuments(searchQuery)
      if (response.success && response.data) {
        // Handle search results
        toast({
          title: "Search completed",
          description: `Found ${response.data.totalResults || 0} results`,
        })
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to search documents",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Refresh documents and data
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate refresh
      toast({
        title: "Refreshed",
        description: "Data has been refreshed",
      })
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Unable to refresh data",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSyncGoogleDrive = async () => {
    setIsSyncing(true)
    try {
      const response = await apiClient.syncGoogleDrive()
      if (response.success) {
        toast({
          title: "Sync started",
          description: "Google Drive sync initiated",
        })
      }
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to start Google Drive sync",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
      {/* Left: Search */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <form onSubmit={handleQuickSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 text-sm border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
          />
        </form>
      </div>

      {/* Center: Stats */}
      <div className="flex items-center space-x-6 text-sm text-gray-600">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>{documents.length} docs</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>{snippets.length} snippets</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          <span>{messages.length} messages</span>
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSyncGoogleDrive}
          disabled={isSyncing}
          className="h-8 px-3 text-xs"
        >
          <HardDrive className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-pulse' : ''}`} />
          Sync
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
