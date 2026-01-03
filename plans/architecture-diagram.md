# Aussie Agents - Architecture Diagrams

## System Architecture Overview

```mermaid
graph TB
    subgraph Frontend["React 19 Frontend"]
        UI[User Interface Layer]
        Components[Component Layer]
        Hooks[Custom Hooks Layer]
        API[API Client Layer]
    end
    
    subgraph Backend["Flask Backend"]
        Routes[API Routes]
        Handlers[API Handlers]
        Agent[Agent Core]
        DB[(Database)]
    end
    
    UI --> Components
    Components --> Hooks
    Hooks --> API
    API -->|HTTP/Long-Poll| Routes
    Routes --> Handlers
    Handlers --> Agent
    Agent --> DB
    
    style Frontend fill:#1a1a2e
    style Backend fill:#16213e
    style UI fill:#34d399
    style API fill:#34d399
```

## Component Architecture

```mermaid
graph LR
    subgraph Presentation["Presentation Layer"]
        Pages[Page Components]
        Layout[Layout Components]
    end
    
    subgraph Feature["Feature Layer"]
        Chat[Chat Components]
        Modals[Modal Components]
        Settings[Settings Components]
    end
    
    subgraph Shared["Shared Layer"]
        UI[UI Primitives]
        Forms[Form Components]
        Display[Display Components]
    end
    
    subgraph Logic["Logic Layer"]
        Hooks[Custom Hooks]
        Utils[Utilities]
        API[API Clients]
    end
    
    Pages --> Layout
    Pages --> Feature
    Feature --> Shared
    Feature --> Logic
    Shared --> Logic
    
    style Presentation fill:#059669
    style Feature fill:#10b981
    style Shared fill:#34d399
    style Logic fill:#6ee7b7
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant UI as UI Components
    participant Hooks as Custom Hooks
    participant API as API Client
    participant Backend as Flask Backend
    participant State as Local State
    
    User->>UI: Interact
    UI->>Hooks: Call hook function
    Hooks->>API: Make API request
    API->>Backend: HTTP Request
    Backend-->>API: JSON Response
    API-->>Hooks: Parsed data
    Hooks->>State: Update state
    State-->>UI: Trigger re-render
    UI-->>User: Display updated UI
```

## State Management Flow

```mermaid
graph TB
    subgraph Global["Global State"]
        Theme[Theme]
        Auth[Authentication]
        Settings[App Settings]
    end
    
    subgraph ServerState["Server State"]
        Contexts[Chat Contexts]
        Logs[Agent Logs]
        Notifications[Notifications]
    end
    
    subgraph LocalState["Component State"]
        Forms[Form Values]
        Modal[Modal States]
        UI[UI State]
    end
    
    subgraph Hooks["Custom Hooks"]
        useAgentZero[useAgentZero]
        usePreferences[usePreferences]
        useToast[useToast]
    end
    
    Hooks --> ServerState
    Hooks --> LocalState
    Global --> Hooks
    
    style Global fill:#fbbf24
    style ServerState fill:#60a5fa
    style LocalState fill:#a78bfa
    style Hooks fill:#34d399
```

## Refactoring Workflow

```mermaid
graph LR
    A[Audit Components] --> B[Extract Design Tokens]
    B --> C[Create UI Library]
    C --> D[Refactor Components]
    D --> E[Enhance Backend Integration]
    E --> F[Performance Optimization]
    F --> G[Polish & Test]
    
    style A fill:#ef4444
    style B fill:#f97316
    style C fill:#f59e0b
    style D fill:#84cc16
    style E fill:#10b981
    style F fill:#06b6d4
    style G fill:#8b5cf6
```

## CSS Design System Hierarchy

```mermaid
graph TB
    Root[CSS Custom Properties]
    
    Root --> Primitives[Primitives]
    Root --> Semantic[Semantic Tokens]
    Root --> Component[Component Tokens]
    
    Primitives --> Colors[Colors]
    Primitives --> Spacing[Spacing Scale]
    Primitives --> Typography[Typography]
    Primitives --> Radius[Border Radius]
    
    Semantic --> Primary[Primary Actions]
    Semantic --> Success[Success States]
    Semantic --> Error[Error States]
    Semantic --> Warning[Warning States]
    
    Component --> Button[Button Variants]
    Component --> Input[Input Styles]
    Component --> Modal[Modal Styles]
    Component --> Card[Card Styles]
    
    style Root fill:#1f2937
    style Primitives fill:#374151
    style Semantic fill:#4b5563
    style Component fill:#6b7280
```

## Performance Optimization Strategy

```mermaid
graph LR
    subgraph Initial["Initial Load"]
        CodeSplit[Code Splitting]
        TreeShake[Tree Shaking]
        Compression[Compression]
    end
    
    subgraph Runtime["Runtime"]
        Memo[Memoization]
        Virtual[Virtual Lists]
        Lazy[Lazy Loading]
    end
    
    subgraph Network["Network"]
        Cache[API Caching]
        Retry[Retry Logic]
        Prefetch[Prefetching]
    end
    
    subgraph Backend["Backend"]
        DBCache[DB Caching]
        Query[Query Optimization]
        Compress[Response Compression]
    end
    
    Initial --> Runtime
    Runtime --> Network
    Network --> Backend
    
    style Initial fill:#dc2626
    style Runtime fill:#ea580c
    style Network fill:#16a34a
    style Backend fill:#2563eb
```

## Component Dependency Graph

```mermaid
graph TB
    App[App.tsx]
    
    App --> ChatApp[ChatApp]
    App --> ErrorBoundary[ErrorBoundary]
    App --> Aurora[AuroraBackground]
    
    ChatApp --> TopBar[TopBar]
    ChatApp --> Sidebar[Sidebar]
    ChatApp --> Messages[Message Area]
    ChatApp --> ChatInput[ChatInput]
    ChatApp --> Modals[Modal Components]
    
    Messages --> UserMessage[UserMessage]
    Messages --> ResponseBlock[ResponseBlock]
    Messages --> ToolWidget[ToolWidget]
    Messages --> ThinkingWidget[ThinkingWidget]
    
    ChatInput --> FileUpload[File Upload Logic]
    ChatInput --> FormAction[Form Actions]
    
    Modals --> Settings[SettingsModal]
    Modals --> Memory[MemoryModal]
    Modals --> Projects[ProjectsModal]
    Modals --> Files[FilesModal]
    Modals --> History[HistoryModal]
    
    style App fill:#34d399
    style ChatApp fill:#10b981
    style Messages fill:#059669
    style Modals fill:#047857
```

## API Integration Architecture

```mermaid
graph LR
    subgraph Frontend["Frontend API Layer"]
        AgentAPI[agentZeroApi.ts]
        BaseAPI[api.ts]
        Types[types.ts]
    end
    
    subgraph Backend["Backend Routes"]
        Poll[/poll]
        Message[/message_async]
        Settings[/settings_*]
        Projects[/projects]
        Memory[/memory_dashboard]
        Files[/upload_work_dir_files]
    end
    
    subgraph Missing["Missing Integrations"]
        Transcribe[/transcribe]
        Synthesize[/synthesize]
        Knowledge[/knowledge_*]
        Subagents[/subagents]
        ContextWindow[/ctx_window_get]
    end
    
    AgentAPI --> Poll
    AgentAPI --> Message
    AgentAPI --> Settings
    AgentAPI --> Projects
    AgentAPI --> Memory
    AgentAPI --> Files
    
    Missing -.->|To Implement| AgentAPI
    
    BaseAPI --> AgentAPI
    Types --> AgentAPI
    
    style Frontend fill:#3b82f6
    style Backend fill:#10b981
    style Missing fill:#ef4444
```

## Testing Strategy

```mermaid
graph TB
    subgraph Unit["Unit Tests"]
        Hooks[Custom Hooks]
        Utils[Utility Functions]
        APIClient[API Client Methods]
    end
    
    subgraph Integration["Integration Tests"]
        UserFlow[User Flows]
        APIIntegration[API Integration]
        StateManagement[State Management]
    end
    
    subgraph E2E["End-to-End Tests"]
        ChatFlow[Complete Chat Flow]
        SettingsFlow[Settings Modification]
        FileUpload[File Upload Process]
    end
    
    Unit --> Integration
    Integration --> E2E
    
    style Unit fill:#22c55e
    style Integration fill:#eab308
    style E2E fill:#3b82f6
```

## Accessibility Implementation

```mermaid
graph LR
    subgraph Keyboard["Keyboard Navigation"]
        TabOrder[Tab Order]
        FocusManagement[Focus Management]
        Shortcuts[Keyboard Shortcuts]
    end
    
    subgraph Screen["Screen Reader"]
        ARIA[ARIA Labels]
        LiveRegions[Live Regions]
        SemanticHTML[Semantic HTML]
    end
    
    subgraph Visual["Visual"]
        Contrast[Color Contrast]
        FocusIndicators[Focus Indicators]
        ReducedMotion[Reduced Motion]
    end
    
    Keyboard --> Screen
    Screen --> Visual
    
    style Keyboard fill:#8b5cf6
    style Screen fill:#ec4899
    style Visual fill:#f59e0b
```

## Deployment Pipeline

```mermaid
graph LR
    Dev[Development] --> Lint[Linting]
    Lint --> Test[Testing]
    Test --> Build[Build]
    Build --> Preview[Preview]
    Preview --> Review[Code Review]
    Review --> Deploy[Deploy]
    
    style Dev fill:#64748b
    style Lint fill:#f59e0b
    style Test fill:#eab308
    style Build fill:#84cc16
    style Preview fill:#22c55e
    style Review fill:#14b8a6
    style Deploy fill:#06b6d4
```

---

## Legend

### Component Types
- **Presentation**: User-facing page components
- **Feature**: Domain-specific feature modules
- **Shared**: Reusable UI components
- **Logic**: Business logic and utilities

### State Types
- **Global State**: Application-wide state
- **Server State**: Data fetched from backend
- **Local State**: Component-specific state
- **Derived State**: Computed from other state

### Priority Levels
- 🔴 High Priority: Critical for MVP
- 🟡 Medium Priority: Important for UX
- 🟢 Low Priority: Nice to have features
