'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Tag, 
  Folder,
  BookmarkPlus,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SnippetCard } from './snippet-card'
import { CreateSnippetDialog } from './create-snippet-dialog'
import { useSnippetStore } from '@/lib/stores/snippet-store'
import { cn } from '@/lib/utils'

type SortOption = 'created' | 'updated' | 'title' | 'source'
type SortDirection = 'asc' | 'desc'

export function SnippetPanel() {
  const { 
    snippets, 
    collections, 
    selectedCollection,
    setSelectedCollection,
    searchSnippets 
  } = useSnippetStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('updated')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    snippets.forEach(snippet => {
      snippet.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [snippets])

  // Filter and sort snippets
  const filteredSnippets = useMemo(() => {
    let filtered = snippets

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = searchSnippets(searchQuery.trim())
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(snippet =>
        selectedTags.some(tag => snippet.tags.includes(tag))
      )
    }

    // Filter by selected collection
    if (selectedCollection) {
      filtered = filtered.filter(snippet =>
        snippet.collections.includes(selectedCollection)
      )
    }

    // Sort snippets
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'source':
          comparison = a.sourceDocument.title.localeCompare(b.sourceDocument.title)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [snippets, searchQuery, selectedTags, selectedCollection, sortBy, sortDirection, searchSnippets])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(option)
      setSortDirection('desc')
    }
  }

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId)
      } else {
        newSet.add(collectionId)
      }
      return newSet
    })
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Snippets</h2>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            New Snippet
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort('updated')}
            className={cn(
              "flex items-center gap-1",
              sortBy === 'updated' && "bg-primary/10"
            )}
          >
            {sortBy === 'updated' && sortDirection === 'desc' ? (
              <SortDesc className="h-3 w-3" />
            ) : (
              <SortAsc className="h-3 w-3" />
            )}
            Recent
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort('title')}
            className={cn(
              "flex items-center gap-1",
              sortBy === 'title' && "bg-primary/10"
            )}
          >
            {sortBy === 'title' && sortDirection === 'desc' ? (
              <SortDesc className="h-3 w-3" />
            ) : (
              <SortAsc className="h-3 w-3" />
            )}
            Title
          </Button>
        </div>
      </div>

      {/* Collections Sidebar */}
      {collections.length > 0 && (
        <div className="border-b">
          <div className="p-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Collections</h3>
            <div className="space-y-1">
              <Button
                variant={selectedCollection === null ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedCollection(null)}
                className="w-full justify-start text-xs"
              >
                <Folder className="h-3 w-3 mr-2" />
                All Snippets ({snippets.length})
              </Button>
              
              {collections.map(collection => {
                const snippetCount = snippets.filter(s => 
                  s.collections.includes(collection.id)
                ).length
                
                return (
                  <div key={collection.id}>
                    <Button
                      variant={selectedCollection === collection.id ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedCollection(collection.id)}
                      className="w-full justify-start text-xs"
                    >
                      <Folder className="h-3 w-3 mr-2" />
                      {collection.name} ({snippetCount})
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="border-b">
          <div className="p-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {allTags.slice(0, 10).map(tag => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => toggleTag(tag)}
                  className="text-xs h-6"
                >
                  <Tag className="h-2 w-2 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Snippets List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSnippets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <BookmarkPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">
              {searchQuery || selectedTags.length > 0 || selectedCollection
                ? 'No snippets found'
                : 'No snippets yet'
              }
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || selectedTags.length > 0 || selectedCollection
                ? 'Try adjusting your search or filters'
                : 'Save interesting excerpts from your documents'
              }
            </p>
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            >
              Create Your First Snippet
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <AnimatePresence>
              {filteredSnippets.map((snippet, index) => (
                <motion.div
                  key={snippet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SnippetCard snippet={snippet} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Snippet Dialog */}
      <CreateSnippetDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
}
