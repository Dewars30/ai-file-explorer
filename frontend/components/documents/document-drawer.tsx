'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Download, 
  Share, 
  MessageSquare, 
  Bookmark, 
  ExternalLink,
  Clock,
  Tag,
  FileText,
  Eye,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Document } from '@/lib/types'
import { useDocumentStore } from '@/lib/stores/document-store'
import { useSnippetStore } from '@/lib/stores/snippet-store'
import { formatDate, formatFileSize, getFileTypeIcon, cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'
import { useToast } from '@/lib/hooks/use-toast'

export function DocumentDrawer() {
  const { selectedDocument, setSelectedDocument } = useDocumentStore()
  const { addSnippet } = useSnippetStore()
  const { toast } = useToast()
  
  const [documentContent, setDocumentContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatMode, setChatMode] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    if (selectedDocument) {
      loadDocumentContent()
    }
  }, [selectedDocument])

  const loadDocumentContent = async () => {
    if (!selectedDocument) return
    
    setIsLoading(true)
    try {
      const response = await apiClient.getDocumentContent(selectedDocument.id)
      if (response.success && response.data) {
        setDocumentContent(response.data.content)
      }
    } catch (error) {
      console.error('Failed to load document content:', error)
      toast({
        title: "Error",
        description: "Failed to load document content",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedDocument(null)
    setChatMode(false)
    setSelectedText('')
    setDocumentContent('')
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
    }
  }

  const handleSaveSnippet = () => {
    if (!selectedDocument || !selectedText.trim()) {
      toast({
        title: "No text selected",
        description: "Please select some text to save as a snippet.",
        variant: "destructive",
      })
      return
    }

    addSnippet({
      text: selectedText.trim(),
      title: `Snippet from ${selectedDocument.title}`,
      sourceDocument: selectedDocument,
      sourceLocation: {
        documentId: selectedDocument.id,
        context: selectedText.trim(),
      },
      tags: [selectedDocument.category],
      collections: [],
      notes: '',
    })

    toast({
      title: "Snippet saved",
      description: `Saved snippet from "${selectedDocument.title}"`,
    })

    // Clear selection
    window.getSelection()?.removeAllRanges()
    setSelectedText('')
  }

  const handleChatWithDocument = async () => {
    if (!chatInput.trim() || !selectedDocument) return

    const message = chatInput.trim()
    setChatInput('')

    try {
      const response = await apiClient.chatWithDocument(selectedDocument.id, message)
      if (response.success && response.data) {
        // TODO: Handle chat response
        toast({
          title: "Response received",
          description: "Chat response received successfully",
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      toast({
        title: "Error",
        description: "Failed to send chat message",
        variant: "destructive",
      })
    }
  }

  if (!selectedDocument) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isCollapsed ? 'calc(100% - 48px)' : 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-0 right-0 h-full bg-background border-l shadow-lg z-50",
          isCollapsed ? "w-12" : "w-96 lg:w-[32rem]"
        )}
      >
        {/* Collapse/Expand Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border bg-background shadow-md z-10"
        >
          {isCollapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        {!isCollapsed && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="text-xl">
                  {getFileTypeIcon(selectedDocument.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold truncate">{selectedDocument.title}</h2>
                  <div className="text-sm text-muted-foreground">
                    {formatFileSize(selectedDocument.fileSize)} • {formatDate(selectedDocument.updatedAt)}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Document Info */}
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-3 w-3" />
                <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                  {selectedDocument.category}
                </span>
              </div>

              {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedDocument.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {selectedDocument.summary && (
                <p className="text-sm text-muted-foreground">
                  {selectedDocument.summary}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-b">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatMode(!chatMode)}
                  className="flex items-center gap-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  {chatMode ? 'View Document' : 'Chat Mode'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedDocument.url, '_blank')}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open Original
                </Button>

                {selectedText && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveSnippet}
                    className="flex items-center gap-1 col-span-2"
                  >
                    <Bookmark className="h-3 w-3" />
                    Save Selected Text as Snippet
                  </Button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {chatMode ? (
                <div className="h-full flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                      <p>Chat with this document</p>
                      <p className="text-xs">Ask questions about the content</p>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about this document..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleChatWithDocument()
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        onClick={handleChatWithDocument}
                        disabled={!chatInput.trim()}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                        <p className="text-muted-foreground">Loading document...</p>
                      </div>
                    </div>
                  ) : documentContent ? (
                    <div 
                      className="p-4 prose prose-sm max-w-none dark:prose-invert selectable-text"
                      onMouseUp={handleTextSelection}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {documentContent}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <Eye className="h-8 w-8 mx-auto mb-2" />
                        <p>Document preview not available</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedDocument.url, '_blank')}
                          className="mt-2"
                        >
                          Open Original File
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
