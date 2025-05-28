'use client'

import { useState } from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'
import { DocumentDrawer } from '@/components/documents/document-drawer'
import { SnippetPanel } from '@/components/snippets/snippet-panel'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { PanelLeftOpen, PanelLeftClose, FileText, MessageSquare, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePanel, setActivePanel] = useState<'chat' | 'documents' | 'snippets'>('chat')
  const [artifactOpen, setArtifactOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col border-r border-gray-200 bg-gray-50/50 transition-all duration-300",
        sidebarOpen ? "w-80" : "w-16"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8 p-0"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
          {sidebarOpen && (
            <h1 className="text-sm font-medium text-gray-900">AI File Explorer</h1>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col p-2 space-y-1">
          <Button
            variant={activePanel === 'chat' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('chat')}
            className={cn(
              "justify-start h-10",
              !sidebarOpen && "w-10 p-0 justify-center"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Chat</span>}
          </Button>
          
          <Button
            variant={activePanel === 'documents' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('documents')}
            className={cn(
              "justify-start h-10",
              !sidebarOpen && "w-10 p-0 justify-center"
            )}
          >
            <FileText className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Documents</span>}
          </Button>
          
          <Button
            variant={activePanel === 'snippets' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActivePanel('snippets')}
            className={cn(
              "justify-start h-10",
              !sidebarOpen && "w-10 p-0 justify-center"
            )}
          >
            <Bookmark className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Snippets</span>}
          </Button>
        </div>

        {/* Panel Content */}
        {sidebarOpen && (
          <div className="flex-1 overflow-hidden">
            {activePanel === 'snippets' && <SnippetPanel />}
            {activePanel === 'documents' && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Documents</h3>
                <p className="text-xs text-gray-500">Connect to Google Drive to see your documents</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Content Layout - Claude Style Split */}
        <div className="flex-1 flex">
          {/* Chat Panel - Left Side */}
          <div className={cn(
            "flex flex-col border-r border-gray-200 bg-white",
            artifactOpen ? "w-1/2" : "flex-1"
          )}>
            {activePanel === 'chat' && <ChatInterface />}
            
            {activePanel === 'documents' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AI File Explorer</h2>
                  <p className="text-gray-600 mb-6">
                    Connect your Google Drive to start exploring and chatting with your documents using natural language.
                  </p>
                  <Button onClick={() => setActivePanel('chat')}>
                    Start Chatting
                  </Button>
                </div>
              </div>
            )}
            
            {activePanel === 'snippets' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                  <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Snippet Management</h2>
                  <p className="text-gray-600 mb-6">
                    Save interesting excerpts from your documents and organize them with tags and collections.
                  </p>
                  <Button onClick={() => setSidebarOpen(true)}>
                    View Snippets
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Artifact Panel - Right Side (Claude Style) */}
          {artifactOpen && (
            <div className="w-1/2 flex flex-col bg-gray-50/50 border-l border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <h3 className="text-sm font-medium text-gray-900">Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setArtifactOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                <DocumentDrawer />
              </div>
            </div>
          )}
        </div>
      </div>

      <Toaster />
    </div>
  )
}
