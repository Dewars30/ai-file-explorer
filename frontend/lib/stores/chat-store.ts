import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ChatState, ChatMessage } from '@/lib/types'
import { generateId } from '@/lib/utils'

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      messages: [],
      isLoading: false,
      currentQuery: '',

      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date().toISOString(),
        }
        
        set((state) => ({
          messages: [...state.messages, newMessage],
        }), false, 'addMessage')
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        }), false, 'updateMessage')
      },

      clearMessages: () => {
        set({ messages: [] }, false, 'clearMessages')
      },

      setLoading: (loading) => {
        set({ isLoading: loading }, false, 'setLoading')
      },

      setCurrentQuery: (query) => {
        set({ currentQuery: query }, false, 'setCurrentQuery')
      },
    }),
    {
      name: 'chat-store',
    }
  )
)
