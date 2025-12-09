# Nodify

<div align="center">

  **A powerful visual workflow automation platform built with Next.js**

  Create, automate, and execute complex workflows using a drag-and-drop node-based interface.

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
  [![License](https://img.shields.io/badge/license-Unspecified-lightgrey.svg)](LICENSE)

</div>

---

## Overview

**Nodify** is a visual workflow automation tool (similar to n8n, Zapier, or Make) that enables users to build powerful automations through a visual canvas interface. Connect nodes to create workflows that can trigger webhooks, make HTTP requests, process data, interact with AI models, manipulate databases, and much more—all without writing complex code.

### Key Features

- **Visual Workflow Editor**: Intuitive drag-and-drop interface powered by React Flow
- **60+ Pre-built Nodes**: Triggers, actions, logic gates, data transformations, AI operations
- **Custom Node Creator**: Build your own nodes with custom properties and execution logic (Node Labs)
- **Real-time Execution**: Execute workflows with live debugging and logging
- **Group Stickers**: Organize complex workflows with visual grouping containers
- **Secure Credential Storage**: Encrypted credential management for API keys and tokens
- **Custom Tables**: Create and manage custom database tables within workflows
- **AI Integration**: Built-in AI nodes powered by Google Gemini for intelligent operations
- **User Authentication**: Secure multi-user environment with Firebase Authentication
- **Real-time Sync**: Firestore integration for live collaboration and data persistence

---

## Technical Specifications

### Frontend Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS + shadcn/ui components
- **Canvas**: React Flow (node-based workflow editor)
- **Animations**: Framer Motion
- **Code Editor**: CodeMirror (for in-node code editing)
- **State Management**: React hooks + Firestore real-time listeners

### Backend & Infrastructure

- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore (NoSQL)
  - User-scoped collections at `/users/{userId}/`
  - Collections: `workflows`, `credentials`, `tables`, `notifications`
- **AI Engine**: Firebase Genkit with Google Gemini 2.5 Flash
- **Hosting**: Vercel-ready (Next.js standalone output)
- **Security**: Row-level security with Firestore Security Rules

### Development Tools

- **Package Manager**: npm 9+
- **Runtime**: Node.js 18+ (recommended 20.x)
- **Linting**: ESLint
- **Type Checking**: TypeScript compiler (`tsc --noEmit`)
- **Build Tool**: Next.js with Turbopack
- **CI/CD**: GitHub Actions

---

## Getting Started

### Prerequisites

- Node.js 18 or higher (20.x recommended)
- npm 9 or higher
- Firebase project (for authentication and database)
- Google AI API key (for Gemini integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nodify0/Nodify.git
   cd Nodify
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in your values:

   ```env
   # Webhooks & Security
   WEBHOOK_SECRET_TOKEN=your_webhook_secret
   CRON_SECRET=your_cron_secret

   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin (Server-side)
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_encoded_service_account_json

   # Google AI (Gemini)
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will start on `http://localhost:9003`

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server on port 9003 (with Turbopack) |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint to check code quality |
| `npm run typecheck` | Type-check TypeScript without emitting files |
| `npm run genkit:dev` | Start Genkit AI development server |
| `npm run genkit:watch` | Start Genkit with watch mode |

---

## Project Structure

```
Nodify/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes (login, register)
│   │   ├── (app)/              # Protected application routes
│   │   │   ├── workflows/      # Workflow list and editor
│   │   │   ├── tables/         # Custom database tables
│   │   │   ├── credentials/    # Credential management
│   │   │   ├── node-labs/      # Custom node creator
│   │   │   └── settings/       # User settings
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── workflow/           # Workflow editor components
│   ├── nodes/                  # Node definitions (JSON files)
│   ├── lib/                    # Utilities and helpers
│   ├── hooks/                  # Custom React hooks
│   ├── firebase/               # Firebase configuration and hooks
│   ├── ai/                     # Genkit AI flows
│   └── schemas/                # Validation schemas
├── docs/                       # Project documentation
├── public/                     # Static assets
├── scripts/                    # Maintenance scripts
└── firestore.rules             # Firestore security rules
```

---

## Core Concepts

### Workflows

Workflows are the heart of Nodify. Each workflow consists of:
- **Nodes**: Individual units of work (triggers, actions, logic gates, data transformations)
- **Connections**: Edges that connect node outputs to inputs, defining data flow
- **Status**: `active`, `inactive`, or `draft`

### Node System

Nodes are defined as JSON files in `src/nodes/`. Each node includes:
- **Properties**: Configurable fields (text, numbers, dropdowns, JSON, colors, etc.)
- **Ports**: Input and output connection points
- **Execution Code**: JavaScript that runs when the node executes
- **Visual Appearance**: Shape, color, icon

**Node Categories:**
- **Triggers**: Webhook, Schedule, Manual trigger
- **Actions**: HTTP Request, Database operations, File operations
- **Logic**: IF/ELSE, Switch, Loop, Filter
- **Data**: Transform, Merge, Split, Sort
- **AI**: AI Agent, Text generation, Image analysis
- **Other**: Delay, Debug, Custom code

### Node Execution Context

Each node's execution code has access to a global `context` object:
```javascript
// Available in executionCode:
context.data          // Output from the previous node
context.node.properties  // Current node's configuration
helpers.log()         // Log to the Debug tab
helpers.warn()        // Log warnings
helpers.error()       // Log errors
```

### Group Stickers

Special visual containers that help organize complex workflows:
- Can contain multiple child nodes
- Resizable with adjustable background colors
- Always render behind regular nodes

### Custom Nodes (Node Labs)

Users can create their own nodes through the Node Labs interface:
- Define custom properties, ports, and appearance
- Write custom JavaScript execution logic
- Save as reusable components

---

## Usage Example

### Creating a Simple Workflow

1. **Navigate to Workflows** and click "New Workflow"
2. **Add a Webhook Trigger** from the node palette
3. **Add an HTTP Request node** to fetch external data
4. **Add a Transform node** to process the response
5. **Connect the nodes** by dragging from output ports to input ports
6. **Configure each node** using the settings panel
7. **Execute the workflow** and view logs in the Debug tab

### Example: Auto-responder Bot

```
[Webhook Trigger] → [IF Node] → [HTTP Request] → [Response]
                         ↓
                    [Alternative Response]
```

---

## Security

- **Never commit secrets**: Use `.env.local` for sensitive data (automatically ignored by git)
- **Firestore Security Rules**: All user data is scoped to `/users/{userId}/` with strict access controls
- **Encrypted Credentials**: API keys and tokens are stored securely in Firestore
- **Authentication Required**: All application routes require Firebase authentication

---

## Firebase Configuration

### Firestore Data Structure

```
/users/{userId}
  /workflows/{workflowId}
    - name: string
    - nodes: Node[]
    - connections: Connection[]
    - status: 'active' | 'inactive' | 'draft'

  /credentials/{credentialId}
    - name: string
    - type: string
    - data: encrypted

  /tables/{tableId}
    - name: string
    - schema: object
    - rows: object[]

  /notifications/{notificationId}
    - message: string
    - timestamp: Date
```

### Security Rules

All Firestore operations are protected by security rules that enforce:
- Users can only read/write their own data
- Proper authentication is required
- Data validation on writes

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: Use [Conventional Commits](https://www.conventionalcommits.org/)
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `chore:` for maintenance tasks
4. **Run checks**: `npm run lint` and `npm run typecheck`
5. **Push to your fork**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Code Style

- TypeScript + React
- Tailwind CSS for styling
- 2-space indentation
- Use path aliases: `@/*` → `./src/*`

---

## CI/CD

The project includes GitHub Actions for continuous integration:
- **File**: `.github/workflows/ci.yml`
- **Triggers**: Pull requests and pushes to `main`/`master`
- **Checks**: Linting and type checking
- **Node Version**: 20.x

---

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- `what-is-nodify.md` - Platform overview
- `how-it-works.md` - Architecture explanation
- `workflows.md` - Workflow concepts
- `credentials.md` - Credential management
- `tables.md` - Custom tables
- `nodes-documentation.md` - Node type reference

---

## Roadmap

- [ ] WebSocket support for real-time triggers
- [ ] Advanced scheduling with cron expressions
- [ ] Workflow templates marketplace
- [ ] Multi-user collaboration
- [ ] Workflow versioning and rollback
- [ ] Performance monitoring and analytics
- [ ] More integrations (Slack, Discord, GitHub, etc.)

---

## License

No license specified. Please add a license file if you plan to make this repository public.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/nodify0/Nodify/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nodify0/Nodify/discussions)
- **Documentation**: See the `docs/` folder

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [React Flow](https://reactflow.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI capabilities by [Google Gemini](https://ai.google.dev/)
- Infrastructure by [Firebase](https://firebase.google.com/)

---

<div align="center">
  Made with ❤️ by the Nodify team
</div>
