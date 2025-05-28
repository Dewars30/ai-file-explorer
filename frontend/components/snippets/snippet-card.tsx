'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Tag, 
  Clock,
  FileText,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Snippet } from '@/lib/types'
import { useSnippetStore } from '@/lib/stores/snippet-store'
import { useDocumentStore } from '@/lib/stores/document-store'
import { formatDate, truncateText, getFileTypeIcon } from '@/lib/utils'
import { useToast } from '@/lib/hooks/use-toast'

interface SnippetCardProps {
  snippet: Snippet
}

export function SnippetCard({ snippet }: SnippetCardProps) {
  const { updateSnippet, deleteSnippet } = useSnippetStore()
  const { setSelectedDocument } = useDocumentStore()
  const { toast } = useToast()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "Snippet text copied successfully",
    })
  }

  const handleDelete = () => {
    deleteSnippet(snippet.id)
    toast({
      title: "Snippet deleted",
      description: "Snippet has been removed",
    })
  }

  const handleOpenSource = () => {
    setSelectedDocument(snippet.sourceDocument)
  }

  const maxLength = 200
  const shouldTruncate = snippet.text.length > maxLength
  const displayText = isExpanded || !shouldTruncate 
    ? snippet.text 
    : truncateText(snippet.text, maxLength)

  return (
    <motion.div
      layout
      className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{snippet.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDate(snippet.updatedAt)}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              {getFileTypeIcon(snippet.sourceDocument.title, 'h-3 w-3')}
              <span className="truncate max-w-24">
                {snippet.sourceDocument.title}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showActions ? 1 : 0 }}
          className="flex items-center gap-1 ml-2"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-6 w-6"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenSource}
            className="h-6 w-6"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-6 w-6 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{displayText}</p>
          
          {shouldTruncate && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0 h-auto text-xs mt-1"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>

        {/* Tags */}
        {snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {snippet.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
              >
                <Tag className="h-2 w-2" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Collections */}
        {snippet.collections.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {snippet.collections.map((collectionId, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
              >
                <FileText className="h-2 w-2" />
                Collection {collectionId}
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {snippet.notes && (
          <div className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
            {snippet.notes}
          </div>
        )}

        {/* Source Context */}
        {snippet.sourceLocation?.context && snippet.sourceLocation.context !== snippet.text && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
            <strong>Context:</strong> {truncateText(snippet.sourceLocation.context, 100)}
          </div>
        )}
      </div>
    </motion.div>
  )
}
