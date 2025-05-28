import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { DocumentState, Document, SearchResult, SearchFilters } from '@/lib/types'

export const useDocumentStore = create<DocumentState>()(
  devtools(
    (set, get) => ({
      documents: [],
      selectedDocument: null,
      searchResults: null,
      filters: {},
      isLoading: false,

      setDocuments: (documents) => {
        set({ documents }, false, 'setDocuments')
      },

      setSelectedDocument: (document) => {
        set({ selectedDocument: document }, false, 'setSelectedDocument')
      },

      setSearchResults: (results) => {
        set({ searchResults: results }, false, 'setSearchResults')
      },

      updateFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }), false, 'updateFilters')
      },

      setLoading: (loading) => {
        set({ isLoading: loading }, false, 'setLoading')
      },
    }),
    {
      name: 'document-store',
    }
  )
)
