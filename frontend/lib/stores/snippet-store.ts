import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { SnippetState, Snippet, Collection } from '@/lib/types'
import { generateId } from '@/lib/utils'

export const useSnippetStore = create<SnippetState>()(
  devtools(
    (set, get) => ({
      snippets: [],
      collections: [],
      selectedCollection: null,
      isLoading: false,

      addSnippet: (snippetData) => {
        const newSnippet: Snippet = {
          ...snippetData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          snippets: [...state.snippets, newSnippet],
        }), false, 'addSnippet')
      },

      updateSnippet: (id, updates) => {
        set((state) => ({
          snippets: state.snippets.map((snippet) =>
            snippet.id === id 
              ? { ...snippet, ...updates, updatedAt: new Date().toISOString() }
              : snippet
          ),
        }), false, 'updateSnippet')
      },

      deleteSnippet: (id) => {
        set((state) => ({
          snippets: state.snippets.filter((snippet) => snippet.id !== id),
          collections: state.collections.map((collection) => ({
            ...collection,
            snippets: collection.snippets.filter((snippetId) => snippetId !== id),
          })),
        }), false, 'deleteSnippet')
      },

      addCollection: (collectionData) => {
        const newCollection: Collection = {
          ...collectionData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          collections: [...state.collections, newCollection],
        }), false, 'addCollection')
      },

      updateCollection: (id, updates) => {
        set((state) => ({
          collections: state.collections.map((collection) =>
            collection.id === id 
              ? { ...collection, ...updates, updatedAt: new Date().toISOString() }
              : collection
          ),
        }), false, 'updateCollection')
      },

      deleteCollection: (id) => {
        set((state) => ({
          collections: state.collections.filter((collection) => collection.id !== id),
          selectedCollection: state.selectedCollection?.id === id ? null : state.selectedCollection,
        }), false, 'deleteCollection')
      },

      setSelectedCollection: (collection) => {
        set({ selectedCollection: collection }, false, 'setSelectedCollection')
      },

      setLoading: (loading) => {
        set({ isLoading: loading }, false, 'setLoading')
      },
    }),
    {
      name: 'snippet-store',
    }
  )
)
