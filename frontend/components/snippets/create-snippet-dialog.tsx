'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Tag, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Snippet } from '@/lib/types'
import { useSnippetStore } from '@/lib/stores/snippet-store'
import { useDocumentStore } from '@/lib/stores/document-store'
import { useToast } from '@/lib/hooks/use-toast'
import { cn } from '@/lib/utils'

interface CreateSnippetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialText?: string
  sourceDocumentId?: string
}

export function CreateSnippetDialog({ 
  open, 
  onOpenChange, 
  initialText = '',
  sourceDocumentId 
}: CreateSnippetDialogProps) {
  const { addSnippet, collections } = useSnippetStore()
  const { documents } = useDocumentStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    text: initialText,
    tags: [] as string[],
    collections: [] as string[],
    notes: '',
    sourceDocumentId: sourceDocumentId || ''
  })
  
  const [newTag, setNewTag] = useState('')
  const [newCollection, setNewCollection] = useState('')

  const sourceDocument = formData.sourceDocumentId 
    ? documents.find(doc => doc.id === formData.sourceDocumentId)
    : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter some text for the snippet",
        variant: "destructive",
      })
      return
    }

    if (!sourceDocument) {
      toast({
        title: "Source document required",
        description: "Please select a source document",
        variant: "destructive",
      })
      return
    }

    addSnippet({
      title: formData.title.trim() || `Snippet from ${sourceDocument.title}`,
      text: formData.text.trim(),
      sourceDocument,
      sourceLocation: {
        documentId: sourceDocument.id,
        context: formData.text.trim(),
      },
      tags: formData.tags,
      collections: formData.collections,
      notes: formData.notes.trim(),
    })

    toast({
      title: "Snippet created",
      description: "Your snippet has been saved successfully",
    })

    // Reset form
    setFormData({
      title: '',
      text: '',
      tags: [],
      collections: [],
      notes: '',
      sourceDocumentId: ''
    })
    setNewTag('')
    setNewCollection('')
    onOpenChange(false)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const toggleCollection = (collectionId: string) => {
    setFormData(prev => ({
      ...prev,
      collections: prev.collections.includes(collectionId)
        ? prev.collections.filter(id => id !== collectionId)
        : [...prev.collections, collectionId]
    }))
  }

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false)
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Create New Snippet</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter a title for this snippet..."
            />
          </div>

          {/* Source Document */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Source Document *</label>
            <select
              value={formData.sourceDocumentId}
              onChange={(e) => setFormData(prev => ({ ...prev, sourceDocumentId: e.target.value }))}
              className="w-full p-2 border rounded-md bg-background"
              required
            >
              <option value="">Select a document...</option>
              {documents.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))}
            </select>
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Text Content *</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Enter the snippet text..."
              className="w-full h-32 p-3 border rounded-md resize-none bg-background"
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Collections</label>
              <div className="grid grid-cols-2 gap-2">
                {collections.map(collection => (
                  <Button
                    key={collection.id}
                    type="button"
                    variant={formData.collections.includes(collection.id) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggleCollection(collection.id)}
                    className="justify-start"
                  >
                    <Folder className="h-3 w-3 mr-2" />
                    {collection.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes..."
              className="w-full h-20 p-3 border rounded-md resize-none bg-background"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Snippet
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
