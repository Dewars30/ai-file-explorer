# AI File Explorer

A Claude-style AI File Explorer with Google Drive integration, semantic search, and intelligent snippet management.

## 🚀 Features

### Current Implementation
- **Claude-Style Interface**: Clean, split-panel layout inspired by Claude.ai
- **Chat Interface**: Natural language document querying
- **Snippet Management**: Save, organize, and tag document excerpts
- **Document Search**: Semantic search across your document library
- **Responsive Design**: Modern UI with Tailwind CSS and shadcn/ui

### Enhanced with MCP Tools
- **GitHub Integration**: Version control and collaboration
- **Google Drive Sync**: Direct integration with Google Drive API
- **Web Search**: Hybrid document + web search capabilities
- **Memory System**: Persistent storage of user preferences and context
- **Browser Automation**: Advanced document processing and previews

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** for accessible components
- **Zustand** for state management

### Backend (Planned)
- **FastAPI** for API server
- **Supabase** for database and storage
- **Claude API** for AI interactions
- **Google Drive API** for document sync

### MCP Integrations
- **brave-search**: Web search capabilities
- **context7**: Library documentation access
- **github**: Version control and deployment
- **google-sheets**: Google Drive integration
- **memory**: Persistent knowledge graph
- **puppeteer**: Browser automation
- **filesystem**: Advanced file operations

## 🎯 Key Design Principles

1. **Claude-Inspired UX**: Clean, minimal interface with generous white space
2. **Split-Panel Layout**: Chat on left, artifacts/content on right
3. **Artifacts System**: Interactive content and live previews
4. **Real-time Iteration**: Version control through conversation
5. **Semantic Organization**: AI-powered categorization and tagging

## 📁 Project Structure

```
ai-file-explorer/
├── frontend/              # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   │   ├── chat/        # Chat interface components
│   │   ├── documents/   # Document management
│   │   ├── snippets/    # Snippet management
│   │   ├── layout/      # Layout components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utilities and stores
│   └── public/          # Static assets
├── backend/             # FastAPI server (planned)
├── shared/              # Shared types and utilities
└── docs/                # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Dewars30/ai-file-explorer.git
cd ai-file-explorer
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Google Drive Integration (when ready)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Claude API (when ready)
CLAUDE_API_KEY=your_claude_api_key
```

## 📋 Development Roadmap

### Phase 1: Frontend Foundation ✅
- [x] Claude-style interface design
- [x] Chat interface with message handling
- [x] Snippet management system
- [x] Document drawer with animations
- [x] Responsive layout and navigation
- [x] State management with Zustand

### Phase 2: MCP Integration (In Progress)
- [x] GitHub repository setup
- [x] Missing UI components (textarea, etc.)
- [ ] Google Drive authentication
- [ ] Web search integration
- [ ] Memory system implementation
- [ ] Browser automation for previews

### Phase 3: Backend Development
- [ ] FastAPI server setup
- [ ] Database schema design
- [ ] Claude API integration
- [ ] Document processing pipeline
- [ ] Search indexing and retrieval

### Phase 4: Advanced Features
- [ ] Real-time collaboration
- [ ] Advanced document analysis
- [ ] Custom AI workflows
- [ ] Plugin system
- [ ] Mobile application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Claude.ai](https://claude.ai) interface design
- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Enhanced with [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) tools

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Note**: This project is actively developed using AI-assisted development with Claude and various MCP tools for enhanced productivity and capabilities.