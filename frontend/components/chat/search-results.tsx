'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Eye, MessageSquare, Bookmark, Clock, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchResult, Document } from '@/lib/types'
import { formatDate, formatFileSize, getFileTypeIcon, truncateText } from '@/lib/utils'
import { useSnippetStore } from '@/lib/stores/snippet-store'
import { useToast } from '@/lib/hooks/use-toast'

interface SearchResultsProps {
  results: SearchResult
  onDocumentSelect: (document: Document) => void
}

export function SearchResults({ results, onDocumentSelect }: SearchResultsProps) {
  const { addSnippet } = useSnippetStore()
  const { toast } = useToast()
  const [selectedText, setSelectedText] = useState<string>('')

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
    }
  }

  const handleSaveSnippet = (document: Document, text: string) => {
    if (!text.trim()) {
      toast({
        title: "No text selected",
        description: "Please select some text to save as a snippet.",
        variant: "destructive",
      })
      return
    }

    addSnippet({
      text: text.trim(),
      title: `Snippet from ${document.title}`,
      sourceDocument: document,
      sourceLocation: {
        documentId: document.id,
        context: text.trim(),
      },
      tags: [document.category],
      collections: [],
      notes: '',
    })

    toast({
      title: "Snippet saved",
      description: `Saved snippet from "${document.title}"`,
    })

    // Clear selection
    window.getSelection()?.removeAllRanges()
    setSelectedText('')
  }

  if (!results || results.documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No documents found for your query.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Search Results</h3>
          <span className="text-sm text-muted-foreground">
            {results.totalResults} documents found in {results.searchTime}ms
          </span>
        </div>
      </div>

      {/* Document Results */}
      <div className="grid gap-4">
        {results.documents.map((result, index) => (
          <motion.div
            key={result.document.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
          >
            {/* Document Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-2xl">
                  {getFileTypeIcon(result.document.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    {result.document.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(result.document.updatedAt)}
                    </span>
                    <span>{formatFileSize(result.document.fileSize)}</span>
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {result.document.category}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Relevance Score */}
              <div className="flex items-center gap-2 ml-4">
                <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {Math.round(result.relevanceScore * 100)}% match
                </div>
              </div>
            </div>

            {/* Document Summary/Excerpt */}
            <div 
              className="text-sm text-muted-foreground mb-3 selectable-text"
              onMouseUp={handleTextSelection}
              dangerouslySetInnerHTML={{ 
                __html: truncateText(result.summary, 300)
              }}
            />

            {/* Highlights */}
            {result.highlights && result.highlights.length > 0 && (
              <div className="mb-3">
                <h5 className="text-xs font-medium text-muted-foreground mb-2">
                  Key Excerpts:
                </h5>
                <div className="space-y-1">
                  {result.highlights.slice(0, 3).map((highlight, idx) => (
                    <div 
                      key={idx}
                      className="text-xs p-2 bg-muted/50 rounded selectable-text"
                      onMouseUp={handleTextSelection}
                    >
                      "...{highlight.text}..."
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDocumentSelect(result.document)}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                View Document
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Implement chat with specific document
                  onDocumentSelect(result.document)
                }}
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-3 w-3" />
                Chat with Document
              </Button>

              {selectedText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveSnippet(result.document, selectedText)}
                  className="flex items-center gap-1"
                >
                  <Bookmark className="h-3 w-3" />
                  Save Snippet
                </Button>
              )}
            </div>

            {/* Document Tags */}
            {result.document.tags && result.document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {result.document.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Snippet Results */}
      {results.snippets && results.snippets.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Related Snippets</h3>
          <div className="grid gap-3">
            {results.snippets.map((snippetResult, index) => (
              <motion.div
                key={snippetResult.snippet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (results.documents.length + index) * 0.1 }}
                className="border rounded-lg p-3 bg-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{snippetResult.snippet.title}</h4>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {Math.round(snippetResult.relevanceScore * 100)}% match
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {truncateText(snippetResult.snippet.text, 200)}
                </p>
                
                <div className="text-xs text-muted-foreground">
                  From: {snippetResult.snippet.sourceDocument.title}
                </div>
                
                {snippetResult.snippet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {snippetResult.snippet.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-1 py-0.5 bg-primary/10 text-primary rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
