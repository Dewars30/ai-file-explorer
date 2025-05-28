'use client'

import { User, Bot, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Button } from '@/components/ui/button'
import { ChatMessage as ChatMessageType } from '@/lib/types'
import { formatDate, cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = message.role === 'user'

  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg",
      isUser 
        ? "bg-primary/10 ml-12" 
        : "bg-muted/50 mr-12"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted-foreground/20"
      )}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatDate(message.timestamp)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Message Content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
                // Custom styling for markdown elements
                h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-semibold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-medium mb-1">{children}</h3>,
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Document References */}
        {message.documents && message.documents.length > 0 && (
          <div className="mt-3 space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Referenced Documents:
            </h4>
            <div className="space-y-1">
              {message.documents.map((doc, index) => (
                <div
                  key={index}
                  className="text-xs p-2 rounded bg-background border"
                >
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-muted-foreground">
                    Relevance: {Math.round(doc.relevanceScore * 100)}%
                  </div>
                  {doc.excerpt && (
                    <div className="mt-1 text-muted-foreground line-clamp-2">
                      {doc.excerpt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Snippet References */}
        {message.snippets && message.snippets.length > 0 && (
          <div className="mt-3 space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Related Snippets:
            </h4>
            <div className="space-y-1">
              {message.snippets.map((snippet, index) => (
                <div
                  key={index}
                  className="text-xs p-2 rounded bg-background border"
                >
                  <div className="font-medium">{snippet.sourceDocument}</div>
                  <div className="mt-1 text-muted-foreground">
                    {snippet.text}
                  </div>
                  {snippet.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {snippet.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-1 py-0.5 bg-primary/10 text-primary rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
