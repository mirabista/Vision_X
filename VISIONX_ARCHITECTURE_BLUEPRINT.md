# VisionX Architecture Blueprint

> **Version:** 1.0.0
> **Status:** OFFICIAL — Single Source of Truth
> **Date:** 2026-01-08

This document defines the complete architecture of VisionX. Every implementation must follow this blueprint exactly. Any deviation requires explicit architectural review and documentation update.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Folder Responsibility Matrix](#2-folder-responsibility-matrix)
3. [File Responsibility Matrix](#3-file-responsibility-matrix)
4. [Class Responsibility Matrix](#4-class-responsibility-matrix)
5. [Function Responsibility Matrix](#5-function-responsibility-matrix)
6. [Complete Request Flow Diagrams](#6-complete-request-flow-diagrams)
7. [Authentication Flow](#7-authentication-flow)
8. [AI Orchestration Design](#8-ai-orchestration-design)
9. [Pipeline Specifications](#9-pipeline-specifications)
10. [Agent Specifications](#10-agent-specifications)
11. [Service Layer Design](#11-service-layer-design)
12. [Repository Layer Design](#12-repository-layer-design)
13. [Event System Design](#13-event-system-design)
14. [Frontend Architecture](#14-frontend-architecture)
15. [API Specifications](#15-api-specifications)
16. [Database Design](#16-database-design)
17. [Communication Rules](#17-communication-rules)
18. [Import Dependency Rules](#18-import-dependency-rules)
19. [Naming Conventions](#19-naming-conventions)
20. [Error Handling Strategy](#20-error-handling-strategy)
21. [Testing Strategy](#21-testing-strategy)
22. [Architecture Rules](#22-architecture-rules)

---

## 1. Project Structure

```
VisionX/
├── frontend/                    # Next.js 14 frontend application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/         # Reusable UI components
│   │   ├── features/           # Feature-specific components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # Frontend API services
│   │   ├── state/              # State management
│   │   ├── types/              # TypeScript type definitions
│   │   ├── lib/                # Utilities and API client
│   │   ├── utils/              # Helper functions
│   │   └── styles/             # Global styles
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
│
├── backend/                     # FastAPI backend application
│   ├── main.py                 # Unified entry point
│   ├── api/                    # API routes and middleware
│   │   ├── routes.py           # V4 API endpoints
│   │   ├── mounts.py           # Frontend-facing mounts
│   │   ├── middleware.py       # CORS, error handling, correlation ID
│   │   ├── dependencies.py     # Auth dependencies
│   │   ├── health.py           # Health check endpoints
│   │   └── versioning.py       # API versioning
│   ├── core/                   # Core infrastructure
│   │   ├── config.py           # Application settings
│   │   ├── exceptions.py       # Custom exceptions
│   │   ├── logging.py          # Logging configuration
│   │   └── security.py         # JWT verification
│   ├── ai/                     # AI orchestration and agents
│   │   ├── orchestrator/       # Central coordinator
│   │   │   ├── orchestrator.py # AnalysisOrchestrator
│   │   │   ├── context.py      # AnalysisContext
│   │   │   ├── dependency_graph.py  # DAG definitions
│   │   │   └── pipeline_executor.py # Pipeline execution
│   │   ├── agents/             # Agent implementations
│   │   │   ├── base_agent.py   # BaseAgent ABC
│   │   │   ├── image_forensics.py
│   │   │   ├── metadata.py
│   │   │   ├── ocr.py
│   │   │   ├── ai_detection.py
│   │   │   ├── claim_extraction.py
│   │   │   ├── evidence_fusion.py
│   │   │   ├── trust_scoring.py
│   │   │   ├── report_generator.py
│   │   │   └── news_verification/
│   │   ├── models/             # AI provider abstraction
│   │   │   └── provider.py     # AIProvider, GeminiProvider
│   │   ├── tools/              # AI tools (future)
│   │   └── pipelines/          # Pipeline definitions
│   │       ├── registry.py     # Pipeline registry
│   │       ├── image_pipeline.py
│   │       ├── video_pipeline.py
│   │       ├── document_pipeline.py
│   │       ├── news_pipeline.py
│   │       └── prompts/        # LLM prompts
│   ├── services/               # Business logic layer
│   │   ├── analysis_service.py
│   │   ├── dashboard_service.py
│   │   ├── report_service.py
│   │   └── incident_service.py
│   ├── repositories/           # Data access layer
│   │   ├── analysis_repository.py
│   │   ├── evidence_repository.py
│   │   ├── report_repository.py
│   │   ├── incident_repository.py
│   │   └── storage_repository.py
│   ├── schemas/                # Pydantic schemas
│   │   └── analysis.py
│   ├── models/                 # SQLAlchemy ORM models
│   │   └── analysis.py
│   ├── events/                 # Event bus and SSE
│   │   ├── event_bus.py
│   │   ├── event_types.py
│   │   └── websocket/
│   ├── workers/                # Background workers
│   │   └── analysis_worker.py
│   ├── utils/                  # Utility modules
│   │   ├── cache.py
│   │   ├── metrics.py
│   │   ├── feature_flags.py
│   │   └── audit.py
│   └── requirements.txt
│
├── supabase/                   # Supabase configuration
│   ├── migrations/
│   └── storage/
│
├── docs/                       # Documentation
│   ├── architecture/
│   ├── api/
│   └── user/
│
└── scripts/                    # Utility scripts
    ├── migrate.py
    ├── seed.py
    └── deploy.sh
```

---

## 2. Folder Responsibility Matrix

### 2.1 Backend Folders

| Folder | Purpose | Responsibilities | Allowed Dependencies | Forbidden Dependencies | Typical Files | Communication |
|--------|---------|------------------|---------------------|----------------------|---------------|---------------|
| **api/** | HTTP interface | Route definitions, request/response handling, auth middleware | core, schemas, services, ai.orchestrator | Direct database access, AI models | routes.py, mounts.py, middleware.py | Frontend → API → Services |
| **core/** | Infrastructure | Configuration, logging, exceptions, security | stdlib, pydantic | Business logic, AI, database | config.py, logging.py, exceptions.py | All layers import core |
| **ai/orchestrator/** | Central coordinator | Pipeline execution, agent scheduling, dependency resolution, progress tracking | core, events, ai.agents, ai.models | HTTP, direct database | orchestrator.py, context.py, dependency_graph.py | Services → Orchestrator → Agents |
| **ai/agents/** | Analysis modules | Single-responsibility analysis tasks | core, ai.models, utils | HTTP, direct database, orchestrator | base_agent.py, image_forensics.py, ocr.py | Orchestrator → Agents |
| **ai/models/** | AI providers | AI model abstraction (Gemini, OpenAI, Claude) | core, google-auth, openai | HTTP routing, business logic | provider.py | Agents → Models |
| **ai/tools/** | AI tools | Tool-based agent capabilities (future) | core, ai.models | HTTP, business logic | (empty) | Agents → Tools |
| **ai/pipelines/** | Pipeline definitions | Pipeline registry, DAG definitions, prompt templates | ai.orchestrator, ai.agents | HTTP, database | registry.py, image_pipeline.py | Orchestrator → Pipelines |
| **services/** | Business logic | Workflow orchestration, validation, business rules | core, schemas, ai.orchestrator, repositories | HTTP routing, direct AI calls | analysis_service.py | API → Services → Orchestrator/Repositories |
| **repositories/** | Data access | CRUD operations, Supabase communication | core, models, supabase | Business logic, AI, HTTP | analysis_repository.py | Services → Repositories → Supabase |
| **schemas/** | Data validation | Pydantic request/response schemas | pydantic, core | Database, AI | analysis.py | API uses schemas |
| **models/** | ORM definitions | SQLAlchemy models, table definitions | sqlalchemy, core | Business logic, AI, HTTP | analysis.py | Repositories → Models |
| **events/** | Event system | Event bus, SSE, WebSocket management | core, asyncio | Database, AI | event_bus.py | Orchestrator → Events → SSE |
| **workers/** | Background jobs | Async task execution, job queues | core, ai.orchestrator, events | HTTP routing | analysis_worker.py | Orchestrator → Workers |
| **utils/** | Utilities | Caching, metrics, feature flags, audit logging | core, redis | Business logic, AI | cache.py, metrics.py | All layers can use utils |

### 2.2 Frontend Folders

| Folder | Purpose | Responsibilities | Forbidden Imports | Communication |
|--------|---------|------------------|-------------------|---------------|
| **app/** | Next.js App Router | Page components, route definitions, SSR/SSG | Direct API calls (use services instead) | Components ← Pages |
| **components/** | Reusable UI | Presentational components, layout | Business logic | Pages → Components |
| **features/** | Feature modules | Feature-specific components and hooks | Cross-feature imports | Features are isolated |
| **hooks/** | React hooks | Custom hooks for state, API, SSE | Direct Supabase queries | Components ← Hooks ← Services |
| **services/** | API layer | API client, authentication service | Direct database | Components → Services → API |
| **state/** | State management | Global state, context providers | Business logic | Components ← State |
| **types/** | TypeScript types | Type definitions, interfaces | Implementation | All TypeScript files |
| **lib/** | Utilities | API client, Supabase client, helpers | Business logic | Services ← Lib |
| **utils/** | Helpers | Formatting, validation, parsing | Business logic | All frontend layers |

---

## 3. File Responsibility Matrix

### 3.1 Backend Critical Files

| File | Purpose | Why It Exists | Public Classes/Functions | Inputs | Outputs | Dependencies | Who Calls It | Who Must Never Call It | Stateful? | Size | Business Logic | DB Access | AI Access | Exposes API |
|------|---------|---------------|------------------------|--------|---------|--------------|--------------|----------------------|-----------|------|----------------|-----------|----------|-------------|
| **main.py** | Entry point | Unified app startup | `app: FastAPI` | Env vars | FastAPI app | core, api, events | uvicorn | None | No | Small | No | No | No | Yes (app) |
| **api/routes.py** | V4 API routes | Endpoint definitions | `router: APIRouter` | HTTP requests | JSON responses | core, schemas, services, ai.orchestrator | FastAPI app | None | No | Large | No | No | No | Yes |
| **api/mounts.py** | Frontend mounts | Frontend-facing wrappers | `router: APIRouter` | HTTP requests | JSON/SSE responses | core, services, ai.orchestrator | FastAPI app | None | No | Medium | No | No | No | Yes |
| **api/middleware.py** | HTTP middleware | CORS, errors, correlation ID | `CorrelationIDMiddleware`, `ErrorHandlingMiddleware` | HTTP requests | Modified requests/responses | core | FastAPI app | None | No | Medium | No | No | No | No (middleware) |
| **api/dependencies.py** | Auth dependencies | JWT verification, user extraction | `get_current_user()` | JWT token | User object | core.security | API routes | None | No | Small | No | No | No | No |
| **core/config.py** | Configuration | Settings from environment | `settings: Settings` | Env vars | Config object | pydantic | All layers | None | No | Small | No | No | No | No |
| **core/exceptions.py** | Error definitions | Typed exception hierarchy | `VisionXError`, `AnalysisError`, etc. | Error details | Exception objects | core | All layers | None | No | Medium | No | No | No | No |
| **core/logging.py** | Logging setup | Centralized logging configuration | `get_logger()` | Module name | Logger instance | structlog | All layers | None | No | Small | No | No | No | No |
| **core/security.py** | Security | JWT verification, token handling | `verify_jwt()`, `get_user_from_token()` | JWT token | User payload | core, supabase | api.dependencies | None | No | Medium | No | No | No | No |
| **ai/orchestrator/orchestrator.py** | Central coordinator | Pipeline execution, agent scheduling | `AnalysisOrchestrator` | Analysis request | Agent results | core, events, ai.agents, ai.pipelines | services, api | None | Yes | Large | Yes | No | No | No |
| **ai/orchestrator/context.py** | Context management | Shared analysis state | `AnalysisContext`, `AnalysisContextManager` | Analysis ID | Context object | core | ai.orchestrator | None | Yes | Medium | No | No | No | No |
| **ai/orchestrator/dependency_graph.py** | DAG definitions | Agent dependency graphs | `DependencyGraph`, `DependencyNode` | Module type | Execution plan | None | ai.orchestrator | None | No | Medium | No | No | No | No |
| **ai/orchestrator/pipeline_executor.py** | Pipeline execution | Executes agents with parallelism | `PipelineExecutor` | Analysis context, agent configs | Execution results | core, events, ai.agents | ai.orchestrator | None | Yes | Large | Yes | No | No | No |
| **events/event_bus.py** | Event system | Pub/sub events, SSE streaming | `EventBus`, `Event`, `EventType` | Event data | Published events | core, asyncio | ai.orchestrator, api | None | Yes | Large | No | No | No | No |
| **services/analysis_service.py** | Business logic | Coordinates analysis workflow | `AnalysisService` | Analysis request | Analysis ID, status | core, schemas, ai.orchestrator, repositories | api.routes, api.mounts | None | No | Medium | Yes | No | No | No |
| **services/dashboard_service.py** | Dashboard aggregation | Aggregates stats for dashboard | `DashboardService` | User ID, filters | Dashboard stats | core, repositories | api.routes | None | No | Medium | Yes | No | No | No |
| **services/report_service.py** | Report management | Report CRUD operations | `ReportService` | Report ID, user ID | Report object | core, repositories, ai.agents | api.routes | None | No | Medium | Yes | No | No | No |
| **repositories/analysis_repository.py** | Data access | Analysis CRUD | `AnalysisRepository` | Analysis filters | Analysis records | core, models, supabase | services | None | No | Medium | No | Yes | No | No |
| **repositories/storage_repository.py** | File storage | Upload/download/delete | `StorageRepository` | File, bucket | File URL/path | core, supabase | services, ai.agents | None | No | Medium | No | Yes | No | No |
| **ai/agents/base_agent.py** | Agent interface | Base class for all agents | `BaseAgent` (ABC), `AgentContext`, `AgentResult` | Agent input | Agent result | core, ai.models | ai.orchestrator | None | No | Medium | Yes | No | Yes | No |
| **ai/agents/image_forensics.py** | Image forensics | OpenCV-based image analysis | `ImageForensicsAgent` | Image data | Forensics results | core, ai.models, utils | ai.orchestrator | None | No | Large | Yes | No | No | No |
| **ai/agents/metadata.py** | Metadata extraction | EXIF/metadata parsing | `MetadataAgent` | File/binary | Metadata dict | core, utils | ai.orchestrator | None | No | Medium | Yes | No | No | No |
| **ai/agents/ocr.py** | OCR processing | Text extraction from images | `OCRAgent` | Image data | OCR results | core, utils | ai.orchestrator | None | No | Large | Yes | No | Yes | No |
| **ai/agents/ai_detection.py** | AI detection | Detects AI-generated content | `AIDetectionAgent` | Analysis context | Detection results | core, ai.models | ai.orchestrator | None | No | Large | Yes | No | Yes | No |
| **ai/agents/evidence_fusion.py** | Evidence fusion | Aggregates agent results | `EvidenceFusionAgent` | Agent results | Fused evidence | core, utils | ai.orchestrator | None | No | Medium | Yes | No | No | No |
| **ai/agents/trust_scoring.py** | Trust scoring | Computes final trust score | `TrustScoringAgent` | Fused evidence | Trust score | core, utils | ai.orchestrator | None | No | Medium | Yes | No | No | No |
| **ai/agents/report_generator.py** | Report generation | Generates PDF/JSON reports | `ReportGenerator` | Analysis results | Report document | core, ai.models, utils | ai.orchestrator, services | None | No | Large | Yes | No | Yes | No |
| **ai/models/provider.py** | AI provider | Gemini/OpenAI/Claude abstraction | `AIProvider`, `GeminiProvider`, `AIProviderFactory` | Text/image prompts | AI responses | core, google-auth | ai.agents | None | No | Large | No | No | Yes | No |

### 3.2 Frontend Critical Files

| File | Purpose | Why It Exists | Public Exports | Dependencies | Who Calls It |
|------|---------|---------------|----------------|--------------|--------------|
| **src/lib/api-client.ts** | API client | Centralized API communication | `apiClient: APIClient` | fetch, types | All components |
| **src/lib/supabase.ts** | Supabase client | Auth, database, storage | `supabase: SupabaseClient` | @supabase/supabase-js | Auth context, services |
| **src/context/AuthContext.tsx** | Auth state | User authentication state | `AuthProvider`, `useAuth()` | supabase, api-client | Root layout, components |
| **src/hooks/useAnalysis.ts** | Analysis hook | SSE-based analysis tracking | `useAnalysis()` | api-client, useState | Analysis pages |
| **src/hooks/useSSE.ts** | SSE hook | Server-sent events | `useSSE()` | EventSource | Analysis pages |
| **src/components/AnalyzePage.tsx** | Analysis UI | Unified analysis interface | Component | hooks, services, components | App Router |
| **src/components/DashboardPage.tsx** | Dashboard | Stats and charts | Component | hooks, services, components | App Router |
| **src/app/page.tsx** | Landing page | Marketing landing page | Component | components | Next.js router |
| **src/app/api/callback/route.ts** | Auth callback | OAuth callback handler | `GET` handler | supabase | Next.js router |

---

## 4. Class Responsibility Matrix

### 4.1 Backend Classes

| Class | Responsibility | Single Responsibility? | Dependencies | Methods | State | Thread-Safe |
|-------|----------------|------------------------|--------------|---------|-------|-------------|
| **AnalysisOrchestrator** | Coordinates pipeline execution | ✅ Yes | EventBus, AgentRegistry, DependencyGraph | `start_analysis()`, `cancel_analysis()`, `_run_pipeline()`, `_execute_agent()` | Active jobs, running agents | Yes (asyncio.Lock) |
| **AnalysisContext** | Shared state for analysis | ✅ Yes | None (dataclass) | `update_section()`, `get_section()`, `mark_agent_completed()` | Analysis state | No (single-task) |
| **AnalysisContextManager** | Manages all contexts | ✅ Yes | AnalysisContext | `create_context()`, `get_context()`, `delete_context()` | Context dict | Yes (asyncio.Lock) |
| **DependencyGraph** | DAG for agent dependencies | ✅ Yes | None | `add_node()`, `is_ready()`, `get_execution_order()`, `has_cycles()` | Nodes, groups | No (build-time) |
| **PipelineExecutor** | Executes pipelines with parallelism | ✅ Yes | EventBus, AgentRegistry, AnalysisContext | `execute_pipeline()`, `_execute_parallel()`, `_execute_agent()` | Executions | Yes (asyncio.Lock) |
| **EventBus** | Pub/sub event system | ✅ Yes | None | `publish()`, `subscribe()`, `subscribe_sse()`, `get_history()` | Handlers, SSE queues, history | Yes (asyncio.Lock) |
| **Event** | Typed event message | ✅ Yes | None | `to_json()`, `to_sse()` | Type, data, timestamp | Yes (immutable) |
| **BaseAgent** (ABC) | Agent interface | ✅ Yes | None | `run()`, `initialize()`, `validate_input()`, `build_evidence()` | None | Yes (stateless) |
| **AgentContext** | Agent input/output | ✅ Yes | None | `to_dict()`, `from_dict()` | Context data | No (single-task) |
| **AgentResult** | Agent execution result | ✅ Yes | None | `to_dict()` | Result data | No (single-task) |
| **AIProvider** (ABC) | AI model abstraction | ✅ Yes | None | `generate_text()`, `generate_json()`, `analyze_image()` | None | Yes (stateless) |
| **GeminiProvider** | Google Gemini implementation | ✅ Yes | AIProvider, google-auth | Same as AIProvider | API client | Yes (thread-safe) |
| **AnalysisService** | Business logic for analysis | ✅ Yes | Orchestrator, Repositories | `start_analysis()`, `get_status()`, `cancel_analysis()` | None | Yes (stateless) |
| **AnalysisRepository** | Analysis data access | ✅ Yes | Supabase, Models | `create()`, `get()`, `list()`, `update()`, `delete()` | None | Yes (stateless) |
| **StorageRepository** | File storage access | ✅ Yes | Supabase | `upload()`, `download()`, `delete()`, `get_url()` | None | Yes (stateless) |

---

## 5. Function Responsibility Matrix

### 5.1 Backend Critical Functions

| Function | Purpose | Inputs | Outputs | Side Effects | Error Handling | Who Calls It |
|-----------|---------|--------|---------|--------------|----------------|--------------|
| **AnalysisOrchestrator.start_analysis()** | Starts a new analysis pipeline | analysis_id, module, input_content, input_type, source_url, user_id, metadata | None (async) | Creates asyncio task, publishes events | Publishes ANALYSIS_FAILED on error | Services, API routes |
| **AnalysisOrchestrator._run_pipeline()** | Executes full pipeline | Same as start_analysis | None | Executes agents, publishes events | Publishes ANALYSIS_FAILED, raises OrchestratorError | start_analysis() |
| **AnalysisOrchestrator._execute_agent()** | Executes single agent with retry | analysis_id, agent_name, context, previous_results, dependency_graph | AgentResult | Publishes AGENT_STARTED/COMPLETED/FAILED | Retries on failure, raises PipelineError if critical | _run_pipeline() |
| **AnalysisOrchestrator.cancel_analysis()** | Cancels running analysis | analysis_id | bool | Cancels asyncio task, publishes event | Returns False if not running | API routes |
| **EventBus.publish()** | Publishes event to handlers | Event | None | Adds to history, notifies handlers, pushes to SSE | None (fire-and-forget) | Orchestrator, Agents |
| **EventBus.subscribe_sse()** | Subscribes to SSE events | analysis_id | asyncio.Queue | Adds queue to subscribers | None | API routes (SSE endpoints) |
| **BaseAgent.run()** | Executes agent logic | AgentContext | AgentResult | May publish events, build evidence | Returns failed status on error | PipelineExecutor |
| **AnalysisService.start_analysis()** | Coordinates analysis start | AnalysisRequest | str (analysis_id) | Calls orchestrator, creates DB record | Raises AnalysisError | API routes |
| **AnalysisRepository.create()** | Creates analysis record | AnalysisCreate schema | Analysis model | Inserts into Supabase | Raises DatabaseError | Services |
| **StorageRepository.upload()** | Uploads file to storage | File, bucket, path | File URL | Uploads to Supabase Storage | Raises StorageError | Services, Agents |

---

## 6. Complete Request Flow Diagrams

### 6.1 Image Upload & Analysis Flow

```
┌─────────────┐
│ Frontend     │
│ User uploads │
│ image file   │
└──────┬──────┘
       │ POST /api/analyze/upload (multipart/form-data)
       │ Headers: Authorization: Bearer <JWT>
       ▼
┌─────────────────────┐
│ API Layer           │
│ 1. Validate auth    │
│ 2. Validate file    │
│ 3. Extract metadata │
│ 4. Return analysis_id│
└──────┬──────────────┘
       │ 202 Accepted
       │ { analysis_id, status: "queued" }
       ▼
┌─────────────────────┐
│ Service Layer       │
│ AnalysisService     │
│ 1. Create DB record │
│ 2. Upload file to S3 │
│ 3. Call orchestrator│
└──────┬──────────────┘
       │ start_analysis(analysis_id, "image", ...)
       ▼
┌─────────────────────┐
│ Orchestrator        │
│ 1. Create context   │
│ 2. Build DAG        │
│ 3. Publish STARTED  │
│ 4. Execute pipeline │
└──────┬──────────────┘
       │
       ▼
┌───────────────────────────────────────────┐
│ Pipeline Execution (Parallel Groups)      │
│                                           │
│ Group 1 (Sequential):                     │
│   └── Image Validation Agent              │
│                                           │
│ Group 2 (Parallel):                       │
│   ├── Metadata Agent                       │
│   ├── OCR Agent                            │
│   ├── AI Detection Agent                   │
│   ├── Image Forensics Agent                │
│   └── Reverse Search Agent                 │
│                                           │
│ Group 3 (Sequential):                     │
│   ├── Evidence Fusion Agent                │
│   ├── Trust Scoring Agent                  │
│   └── Report Generator Agent               │
└───────────────────────────────────────────┘
       │
       │ Each agent publishes events:
       │ - AGENT_STARTED
       │ - AGENT_COMPLETED (with evidence)
       │ - EVIDENCE_COLLECTED
       ▼
┌─────────────────────┐
│ Event Bus            │
│ 1. Publish to SSE    │
│ 2. Update history    │
│ 3. Notify handlers   │
└──────┬──────────────┘
       │ SSE stream
       ▼
┌─────────────────────┐
│ Frontend             │
│ 1. Receive events    │
│ 2. Update UI         │
│ 3. Show progress     │
│ 4. Display report    │
└─────────────────────┘
```

### 6.2 Video Upload & Analysis Flow

```
Similar to Image Upload, but with different pipeline:

Video Validation Agent (sequential)
    ↓
Frame Extraction Agent (parallel)
Audio Analysis Agent (parallel)
Scene Analysis Agent (parallel)
Deepfake Detection Agent (parallel)
    ↓
Evidence Fusion Agent (sequential)
Trust Scoring Agent (sequential)
Report Generator Agent (sequential)
```

### 6.3 PDF/Document Upload & Analysis Flow

```
Document Validation Agent (sequential)
    ↓
OCR Agent (parallel)
Document Metadata Agent (parallel)
Tampering Detection Agent (parallel)
    ↓
Evidence Fusion Agent (sequential)
Trust Scoring Agent (sequential)
Report Generator Agent (sequential)
```

### 6.4 URL Analysis Flow

```
URL Validation Agent (sequential)
    ↓
Article Extraction Agent (parallel)
    ├── Fetches URL content
    ├── Extracts article text
    └── Parses metadata
    ↓
Claim Extraction Agent (parallel)
    ├── Extracts claims from text
    └── Identifies assertions
    ↓
NER Agent (parallel)
    ├── Named entities
    ├── Organizations
    └── Locations
    ↓
Source Verification Agent (parallel)
    ├── Checks source credibility
    └── Validates domain
    ↓
Evidence Fusion Agent (sequential)
Trust Scoring Agent (sequential)
Report Generator Agent (sequential)
```

### 6.5 News Verification Flow

```
News Validation Agent (sequential)
    ↓
OCR Agent (parallel - if screenshot)
Article Extraction Agent (parallel)
Claim Extraction Agent (parallel)
Source Verification Agent (parallel)
Cross Reference Agent (parallel)
Fact Check Agent (parallel)
    ↓
LLM Reasoning Agent (sequential - depends on all above)
    ↓
Evidence Fusion Agent (sequential)
Trust Scoring Agent (sequential)
Report Generator Agent (sequential)
```

### 6.6 Social Media Screenshot Flow

```
Screenshot Analysis Agent (sequential)
    ↓
OCR Agent (parallel)
Platform Metadata Agent (parallel)
Context Verification Agent (parallel)
Reverse Search Agent (parallel)
    ↓
Evidence Fusion Agent (sequential)
Trust Scoring Agent (sequential)
Report Generator Agent (sequential)
```

---

## 7. Authentication Flow

### 7.1 Complete Authentication Lifecycle

```
┌─────────────┐
│ Frontend     │
│ User clicks  │
│ Login        │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Frontend Auth Context  │
│ 1. Show login form      │
│ 2. Call Supabase auth   │
│ 3. Receive JWT          │
│ 4. Store in memory      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Frontend API Client     │
│ 1. Attach JWT to        │
│    Authorization header │
│ 2. Call backend API     │
└──────┬──────────────────┘
       │ HTTP Request with JWT
       ▼
┌─────────────────────────┐
│ FastAPI Middleware      │
│ 1. Extract JWT from     │
│    Authorization header │
│ 2. Verify JWT signature │
│ 3. Extract user payload │
│ 4. Attach to request    │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ API Dependencies        │
│ get_current_user()      │
│ 1. Read user from req   │
│ 2. Validate not None   │
│ 3. Return user_id       │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Service Layer           │
│ AnalysisService         │
│ 1. Receive user_id      │
│ 2. Call orchestrator    │
│ 3. No JWT knowledge     │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Orchestrator            │
│ 1. Receive user_id      │
│ 2. Execute pipeline     │
│ 3. No JWT knowledge     │
└─────────────────────────┘
```

### 7.2 Authentication Boundaries

| Layer | Knows About JWT? | Knows About Supabase? | Responsibilities |
|-------|------------------|----------------------|------------------|
| **Frontend** | Yes (stores, sends) | Yes (auth) | Login, logout, token refresh |
| **API Middleware** | Yes (verifies) | Yes (verifies) | JWT verification, user extraction |
| **API Dependencies** | No (receives user) | No | Provides user context |
| **Services** | No | No | Business logic only |
| **Orchestrator** | No | No | Pipeline execution only |
| **Agents** | No | No | Analysis only |
| **Repositories** | No | Yes (data access) | Database operations only |

### 7.3 Forbidden Patterns

```
❌ Frontend → Repository (bypass API)
❌ Frontend → Orchestrator (bypass API)
❌ Agent → Supabase (bypass repositories)
❌ Repository → AI (no AI in data layer)
❌ Service → HTTP Response (use API layer)
❌ Orchestrator → Database (no direct DB access)
❌ Agent → EventBus (orchestrator handles events)
```

---

## 8. AI Orchestration Design

### 8.1 Orchestrator Responsibilities

| Responsibility | Description | Implementation |
|----------------|-------------|----------------|
| **Pipeline Selection** | Chooses correct pipeline based on module type | DependencyGraph.create_for_module(module) |
| **Dependency Resolution** | Builds execution plan from DAG | get_execution_order() |
| **Parallel Execution** | Runs independent agents in parallel | asyncio.gather() |
| **Sequential Execution** | Runs dependent agents in order | Sequential awaits |
| **Agent Scheduling** | Dispatches agents at correct time | _execute_agent() |
| **Retry Strategy** | Retries failed agents (configurable) | AGENT_MAX_RETRIES, AGENT_RETRY_DELAY |
| **Timeout Strategy** | Enforces per-agent timeouts | asyncio.wait_for(timeout) |
| **Error Recovery** | Handles failures gracefully | Non-critical failures don't stop pipeline |
| **Cancellation** | Cancels running analyses | task.cancel() |
| **Progress Tracking** | Tracks execution progress | event_bus.publish_analysis_progress() |
| **Result Aggregation** | Collects and merges results | AgentResults dict |
| **Event Publishing** | Emits lifecycle events | EventBus convenience methods |

### 8.2 Orchestrator Execution Lifecycle

```
1. Receive Analysis Request
   ↓
2. Create AnalysisContext
   ↓
3. Build DependencyGraph for module
   ↓
4. Validate DAG (no cycles)
   ↓
5. Publish ANALYSIS_STARTED event
   ↓
6. Get execution groups (parallel batches)
   ↓
7. For each group:
   a. Filter ready agents (dependencies met)
   b. Execute ready agents in parallel (asyncio.gather)
   c. Collect results
   d. Publish AGENT_COMPLETED/FAILED events
   e. Update progress
   ↓
8. Collect final results
   ↓
9. Compute verdict and confidence
   ↓
10. Publish ANALYSIS_COMPLETED event
   ↓
11. Cleanup context
```

### 8.3 Parallel Execution Strategy

```
Group 1: Sequential (Validation Agent)
    ↓
Group 2: Parallel (Metadata, OCR, AI Detection, Forensics, Reverse Search)
    ↓ (all depend on Group 1)
Group 3: Sequential (Evidence Fusion - depends on all Group 2)
    ↓
Group 4: Sequential (Trust Scoring - depends on Group 3)
    ↓
Group 5: Sequential (Report Generator - depends on Group 4)
```

### 8.4 Retry Strategy

| Agent Type | Max Retries | Backoff | Timeout |
|------------|-------------|---------|---------|
| **Critical Agents** | 3 | Exponential (1s, 2s, 4s) | 120s |
| **Non-Critical Agents** | 2 | Fixed (2s) | 60s |
| **AI Agents** | 3 | Exponential | 30s |
| **Deterministic Agents** | 1 | None | 30s |

### 8.5 Error Recovery

```
Agent Failure
    ↓
Is Critical?
    ├── Yes → Fail pipeline, publish ANALYSIS_FAILED
    └── No → Log error, continue with remaining agents
        ↓
        Partial Success?
        ├── Yes → Compute from successful agents
        └── No → Return "Unable to determine"
```

---

## 9. Pipeline Specifications

### 9.1 Image Pipeline

| Property | Value |
|----------|-------|
| **Module** | image |
| **Input Types** | image/jpeg, image/png, image/webp |
| **Expected Runtime** | 45-90 seconds |
| **Parallel Groups** | 2 |
| **Total Agents** | 7 |

**Execution Order:**

```
Group 1 (Sequential):
  └── Image Validation Agent
      ↓
Group 2 (Parallel):
  ├── Metadata Agent
  ├── OCR Agent
  ├── AI Detection Agent
  ├── Image Forensics Agent
  └── Reverse Search Agent
      ↓
Group 3 (Sequential):
  ├── Evidence Fusion Agent
  ├── Trust Scoring Agent
  └── Report Generator Agent
```

**Failure Strategy:** Non-critical agents (Reverse Search) can fail without stopping pipeline.

### 9.2 Video Pipeline

| Property | Value |
|----------|-------|
| **Module** | video |
| **Input Types** | video/mp4, video/avi, video/mov |
| **Expected Runtime** | 120-300 seconds |
| **Parallel Groups** | 2 |
| **Total Agents** | 6 |

**Execution Order:**

```
Group 1 (Sequential):
  └── Video Validation Agent
      ↓
Group 2 (Parallel):
  ├── Frame Extraction Agent
  ├── Audio Analysis Agent
  ├── Scene Analysis Agent
  └── Deepfake Detection Agent
      ↓
Group 3 (Sequential):
  ├── Evidence Fusion Agent
  ├── Trust Scoring Agent
  └── Report Generator Agent
```

**Failure Strategy:** Frame Extraction is critical; others can fail.

### 9.3 Document Pipeline

| Property | Value |
|----------|-------|
| **Module** | document |
| **Input Types** | application/pdf, application/docx, application/odt |
| **Expected Runtime** | 30-60 seconds |
| **Parallel Groups** | 2 |
| **Total Agents** | 5 |

**Execution Order:**

```
Group 1 (Sequential):
  └── Document Validation Agent
      ↓
Group 2 (Parallel):
  ├── OCR Agent
  ├── Document Metadata Agent
  └── Tampering Detection Agent
      ↓
Group 3 (Sequential):
  ├── Evidence Fusion Agent
  ├── Trust Scoring Agent
  └── Report Generator Agent
```

### 9.4 News Pipeline

| Property | Value |
|----------|-------|
| **Module** | news |
| **Input Types** | text/url, text/article, image/screenshot |
| **Expected Runtime** | 60-120 seconds |
| **Parallel Groups** | 3 |
| **Total Agents** | 8 |

**Execution Order:**

```
Group 1 (Sequential):
  └── News Validation Agent
      ↓
Group 2 (Parallel):
  ├── OCR Agent (if screenshot)
  ├── Article Extraction Agent
  ├── Claim Extraction Agent
  ├── NER Agent
  ├── Source Verification Agent
  ├── Cross Reference Agent
  ├── Fact Check Agent
  └── Reverse Image Agent
      ↓
Group 3 (Sequential):
  └── LLM Reasoning Agent
      ↓
Group 4 (Sequential):
  ├── Evidence Fusion Agent
  ├── Trust Scoring Agent
  └── Report Generator Agent
```

**Failure Strategy:** Fact Check and NER are non-critical.

### 9.5 Audio Pipeline

| Property | Value |
|----------|-------|
| **Module** | audio |
| **Input Types** | audio/mp3, audio/wav, audio/ogg |
| **Expected Runtime** | 60-180 seconds |
| **Parallel Groups** | 2 |
| **Total Agents** | 5 |

**Execution Order:**

```
Group 1 (Sequential):
  └── Audio Validation Agent
      ↓
Group 2 (Parallel):
  ├── Speech Analysis Agent
  ├── Voice Clone Detection Agent
  └── Audio Forensics Agent
      ↓
Group 3 (Sequential):
  ├── Evidence Fusion Agent
  ├── Trust Scoring Agent
  └── Report Generator Agent
```

---

## 10. Agent Specifications

### 10.1 Common Agents

#### **Validation Agent** (All Pipelines)

| Property | Value |
|----------|-------|
| **Purpose** | Validates input before processing |
| **Input** | Raw file/data, module type |
| **Output** | ValidationResult { valid: bool, errors: list } |
| **Dependencies** | None (runs first) |
| **AI Model** | None (deterministic) |
| **Parallel** | No (sequential) |
| **Execution Time** | < 1s |
| **Failure Handling** | Critical - stops pipeline if fails |
| **Retry Policy** | 3 attempts, exponential backoff |
| **Confidence** | 1.0 (if valid) |
| **Evidence** | Validation errors if invalid |

#### **Evidence Fusion Agent** (All Pipelines)

| Property | Value |
|----------|-------|
| **Purpose** | Aggregates evidence from all agents |
| **Input** | Dict of agent results |
| **Output** | FusedEvidence { summary, confidence, evidence_list } |
| **Dependencies** | All analysis agents |
| **AI Model** | None (weighted algorithm) |
| **Parallel** | No (sequential) |
| **Execution Time** | < 1s |
| **Failure Handling** | Critical - stops pipeline |
| **Retry Policy** | 2 attempts |
| **Confidence** | Weighted average of input confidences |
| **Evidence** | Combined evidence from all agents |

#### **Trust Scoring Agent** (All Pipelines)

| Property | Value |
|----------|-------|
| **Purpose** | Computes final trust score |
| **Input** | FusedEvidence |
| **Output** | TrustScore { verdict, confidence, risk_level } |
| **Dependencies** | Evidence Fusion Agent |
| **AI Model** | None (deterministic algorithm) |
| **Parallel** | No (sequential) |
| **Execution Time** | < 1s |
| **Failure Handling** | Critical |
| **Retry Policy** | 2 attempts |
| **Confidence** | Inherited from Evidence Fusion |
| **Evidence** | Scoring breakdown |

#### **Report Generator Agent** (All Pipelines)

| Property | Value |
|----------|-------|
| **Purpose** | Generates analysis report |
| **Input** | TrustScore, all agent results |
| **Output** | Report { summary, findings, recommendations } |
| **Dependencies** | Trust Scoring Agent |
| **AI Model** | Gemini (text generation) |
| **Parallel** | No (sequential) |
| **Execution Time** | 5-15s |
| **Failure Handling** | Critical |
| **Retry Policy** | 2 attempts |
| **Confidence** | Same as Trust Score |
| **Evidence** | Full report content |

### 10.2 Image-Specific Agents

#### **Metadata Agent**

| Property | Value |
|----------|-------|
| **Purpose** | Extracts EXIF metadata from image |
| **Input** | Image file/binary |
| **Output** | Metadata { camera, date, gps, software, etc. } |
| **Dependencies** | Image Validation |
| **AI Model** | None (PIL/Pillow) |
| **Parallel** | Yes |
| **Execution Time** | < 2s |
| **Failure Handling** | Non-critical |
| **Evidence** | EXIF data, anomalies |

#### **OCR Agent** (Image)

| Property | Value |
|----------|-------|
| **Purpose** | Extracts text from image |
| **Input** | Image file/binary |
| **Output** | OCRResult { text, confidence, bounding_boxes } |
| **Dependencies** | Image Validation |
| **AI Model** | EasyOCR |
| **Parallel** | Yes |
| **Execution Time** | 3-10s |
| **Failure Handling** | Non-critical |
| **Evidence** | Extracted text, OCR confidence |

#### **AI Detection Agent** (Image)

| Property | Value |
|----------|-------|
| **Purpose** | Detects AI-generated images |
| **Input** | Image file/binary |
| **Output** | AIDetection { is_ai_generated, confidence, artifacts } |
| **Dependencies** | Image Validation |
| **AI Model** | Gemini Vision |
| **Parallel** | Yes |
| **Execution Time** | 5-15s |
| **Failure Handling** | Non-critical |
| **Evidence** | AI probability, detected artifacts |

#### **Image Forensics Agent**

| Property | Value |
|----------|-------|
| **Purpose** | Detects manipulation in images |
| **Input** | Image file/binary |
| **Output** | Forensics { manipulations_detected, techniques, confidence } |
| **Dependencies** | Image Validation |
| **AI Model** | None (OpenCV) |
| **Parallel** | Yes |
| **Execution Time** | 2-5s |
| **Failure Handling** | Non-critical |
| **Evidence** | ELA results, clone detection, noise analysis |

### 10.3 Document/OCR Agents

#### **OCR Agent** (Document)

| Property | Value |
|----------|-------|
| **Purpose** | Extracts text from documents |
| **Input** | PDF/DOCX file |
| **Output** | OCRResult { text, pages, confidence } |
| **Dependencies** | Document Validation |
| **AI Model** | EasyOCR + pdfplumber |
| **Parallel** | Yes |
| **Execution Time** | 5-20s |
| **Failure Handling** | Non-critical |
| **Evidence** | Extracted text, page count |

### 10.4 Video Agents

#### **Frame Extraction Agent**

| Property | Value |
|----------|-------|
| **Purpose** | Extracts keyframes from video |
| **Input** | Video file |
| **Output** | Frames { frame_count, frame_paths, timestamps } |
| **Dependencies** | Video Validation |
| **AI Model** | None (OpenCV) |
| **Parallel** | Yes |
| **Execution Time** | 10-30s |
| **Failure Handling** | Critical |
| **Evidence** | Frame count, extraction success |

### 10.5 News Agents

#### **Claim Extraction Agent**

| Property | Value |
|----------|-------|
| **Purpose** | Extracts factual claims from text |
| **Input** | Article text |
| **Output** | Claims { claim_list, count, confidence } |
| **Dependencies** | News Validation |
| **AI Model** | Gemini (text generation) |
| **Parallel** | Yes |
| **Execution Time** | 5-15s |
| **Failure Handling** | Non-critical |
| **Evidence** | Extracted claims |

#### **Source Verification Agent**

| Property | Value |
|----------|-------|
| **Purpose** | Verifies source credibility |
| **Input** | Source URL, domain |
| **Output** | SourceCredibility { reputation, score, details } |
| **Dependencies** | News Validation |
| **AI Model** | None (deterministic) |
| **Parallel** | Yes |
| **Execution Time** | < 2s |
| **Failure Handling** | Non-critical |
| **Evidence** | Domain reputation, historical data |

---

## 11. Service Layer Design

### 11.1 AnalysisService

**Purpose:** Coordinates analysis workflow from API to Orchestrator.

**Responsibilities:**
- Receives analysis requests from API
- Validates request parameters
- Creates database records
- Calls orchestrator to start pipeline
- Returns analysis ID to API

**Public Methods:**

| Method | Input | Output | Side Effects | Events |
|--------|-------|--------|--------------|--------|
| `start_analysis(request: AnalysisRequest)` | Module, input data | str (analysis_id) | Creates DB record, starts pipeline | ANALYSIS_CREATED |
| `get_analysis(analysis_id: str)` | Analysis ID | AnalysisResponse | None | None |
| `get_analysis_status(analysis_id: str)` | Analysis ID | StatusResponse | None | None |
| `cancel_analysis(analysis_id: str)` | Analysis ID | bool | Cancels pipeline | ANALYSIS_CANCELLED |
| `list_analyses(filters)` | User, module, status | List[Analysis] | None | None |

**Repositories Used:**
- AnalysisRepository
- StorageRepository

**Events Emitted:**
- ANALYSIS_CREATED
- ANALYSIS_CANCELLED

**Business Rules:**
- User must be authenticated
- Module must be valid
- User must own analysis (RLS)
- Max concurrent analyses per user: 5

### 11.2 DashboardService

**Purpose:** Aggregates statistics for dashboard.

**Responsibilities:**
- Fetches analysis statistics
- Computes trends
- Returns dashboard data

**Public Methods:**

| Method | Input | Output | Side Effects |
|--------|-------|--------|--------------|
| `get_stats(user_id: str)` | User ID | DashboardStats | None |
| `get_recent_analyses(user_id: str, limit: int)` | User ID, limit | List[Analysis] | None |
| `get_trends(user_id: str, period: str)` | User ID, period | Trends | None |

**Repositories Used:**
- AnalysisRepository

**Events Emitted:**
- None

### 11.3 ReportService

**Purpose:** Manages report generation and retrieval.

**Responsibilities:**
- Generates reports from analysis results
- Stores report metadata
- Retrieves reports

**Public Methods:**

| Method | Input | Output | Side Effects |
|--------|-------|--------|--------------|
| `generate_report(analysis_id: str)` | Analysis ID | Report | Calls Report Generator Agent |
| `get_report(report_id: str)` | Report ID | Report | None |
| `list_reports(user_id: str)` | User ID | List[Report] | None |
| `delete_report(report_id: str)` | Report ID | None | Deletes report |

**Repositories Used:**
- ReportRepository
- AnalysisRepository

**Agents Called:**
- ReportGeneratorAgent

**Events Emitted:**
- REPORT_GENERATED

### 11.4 IncidentService

**Purpose:** Manages incident reports.

**Responsibilities:**
- Creates incidents from suspicious analyses
- Updates incident status
- Links reports to incidents

**Public Methods:**

| Method | Input | Output | Side Effects |
|--------|-------|--------|--------------|
| `create_incident(data: IncidentCreate)` | Incident data | Incident | Creates DB record |
| `get_incident(incident_id: str)` | Incident ID | Incident | None |
| `list_incidents(filters)` | User, status | List[Incident] | None |
| `update_incident(incident_id: str, data)` | Incident ID, updates | Incident | Updates DB record |
| `add_report(incident_id: str, report_id: str)` | IDs | None | Links report |

**Repositories Used:**
- IncidentRepository
- ReportRepository

**Events Emitted:**
- INCIDENT_CREATED
- INCIDENT_UPDATED

---

## 12. Repository Layer Design

### 12.1 AnalysisRepository

**Purpose:** CRUD operations for analyses.

**Tables Used:**
- `analyses` (visionx schema)
- `analysis_jobs` (if separate)

**CRUD Methods:**

| Method | SQL Operation | Returns | Transactions |
|--------|---------------|---------|--------------|
| `create(data: AnalysisCreate)` | INSERT | Analysis | Single |
| `get(analysis_id: str)` | SELECT WHERE id = $1 | Analysis | None |
| `list(user_id: str, filters)` | SELECT WHERE user_id = $1 | List[Analysis] | None |
| `update(analysis_id: str, data)` | UPDATE WHERE id = $1 | Analysis | Single |
| `delete(analysis_id: str)` | DELETE WHERE id = $1 | None | Single |

**Indexes Used:**
- `idx_analyses_user_id` on user_id
- `idx_analyses_status` on status
- `idx_analyses_created_at` on created_at

**RLS:** Enabled (user_id = auth.uid())

**Caching:** None (reads are infrequent)

**Business Logic:** None (data access only)

### 12.2 EvidenceRepository

**Purpose:** CRUD operations for evidence.

**Tables Used:**
- `analysis_evidence` (visionx schema)

**CRUD Methods:**

| Method | SQL Operation | Returns |
|--------|---------------|---------|
| `create(evidence: EvidenceCreate)` | INSERT | Evidence |
| `get_by_analysis(analysis_id: str)` | SELECT WHERE analysis_id = $1 | List[Evidence] |
| `bulk_create(evidence_list)` | INSERT many | List[Evidence] |
| `delete(evidence_id: str)` | DELETE | None |

**Relationships:**
- Belongs to Analysis (FK: analysis_id)

**Indexes Used:**
- `idx_evidence_analysis_id` on analysis_id

### 12.3 ReportRepository

**Purpose:** CRUD operations for reports.

**Tables Used:**
- `reports` (visionx schema)

**CRUD Methods:**

| Method | SQL Operation | Returns |
|--------|---------------|---------|
| `create(report: ReportCreate)` | INSERT | Report |
| `get(report_id: str)` | SELECT WHERE id = $1 | Report |
| `list(user_id: str)` | SELECT WHERE user_id = $1 | List[Report] |
| `update(report_id: str, data)` | UPDATE | Report |
| `delete(report_id: str)` | DELETE | None |

**Storage Buckets:**
- `visionx-reports` (PDF files)

### 12.4 StorageRepository

**Purpose:** File storage operations.

**Storage Buckets Used:**
- `uploads` (user uploads)
- `visionx-reports` (generated reports)
- `thumbnails` (image thumbnails)

**Methods:**

| Method | Input | Output | Side Effects |
|--------|-------|--------|--------------|
| `upload(file, bucket, path)` | File, bucket, path | File URL | Uploads to Supabase Storage |
| `download(bucket, path)` | Bucket, path | File bytes | Downloads from Supabase |
| `delete(bucket, path)` | Bucket, path | None | Deletes from Supabase |
| `get_url(bucket, path)` | Bucket, path | str (URL) | None |
| `get_signed_url(bucket, path, expires)` | Bucket, path, expiry | str (URL) | None |

**Business Logic:** None (pure data access)

---

## 13. Event System Design

### 13.1 Event Types

| Event Type | Source | Trigger | Data |
|------------|--------|---------|------|
| `analysis.created` | API | Analysis request received | module, user_id, input_type |
| `analysis.started` | Orchestrator | Pipeline begins | module, total_agents |
| `analysis.progress` | Orchestrator | Progress update | progress %, current_agent, current_stage |
| `analysis.completed` | Orchestrator | Pipeline finishes | verdict, confidence, duration, agent_stats |
| `analysis.failed` | Orchestrator | Pipeline fails | error, analysis_id |
| `analysis.cancelled` | Orchestrator | User cancels | analysis_id |
| `agent.started` | Orchestrator | Agent begins | agent_name, agent_order, total_agents |
| `agent.completed` | Orchestrator | Agent succeeds | agent_name, confidence, summary, evidence |
| `agent.failed` | Orchestrator | Agent fails | agent_name, error, is_critical |
| `agent.skipped` | Orchestrator | Agent skipped | agent_name, reason |
| `evidence.collected` | Orchestrator | Evidence found | agent_name, evidence_type, key, confidence |
| `decision.generated` | Agent | Decision made | verdict, confidence, reasoning |
| `report.generated` | Agent | Report complete | report_url |
| `system.error` | Any | System error | error, component |
| `system.health` | Health check | Health status | status, checks |

### 13.2 Event Payload Schema

```typescript
interface Event {
  type: EventType;
  analysis_id: string;
  data: Record<string, any>;
  timestamp: string; // ISO 8601
  correlation_id?: string;
  source: string; // component that emitted
}
```

### 13.3 SSE Event Format

```
event: analysis.started
data: {"type":"analysis.started","analysis_id":"xxx","data":{"module":"image","total_agents":7},"timestamp":"2026-01-08T..."}

event: agent.completed
data: {"type":"agent.completed","analysis_id":"xxx","data":{"agent_name":"OCR Agent","agent_order":3,"total_agents":7,"progress":30,"confidence":0.95,"summary":"Text extracted"},"timestamp":"..."}
```

### 13.4 Event Flow Rules

| Rule | Description | Enforcement |
|------|-------------|-------------|
| **Ordering** | Events for same analysis are ordered | EventBus appends to history |
| **Idempotency** | Same event can be published multiple times | Frontend deduplicates by timestamp |
| **Retention** | Events kept for 24 hours | EventBus._max_history = 1000 |
| **Replay** | Late-joining clients get recent events | get_history() returns last N events |
| **Filtering** | Subscribers can filter by event type | subscribe() accepts EventType |
| **Wildcards** | Pattern matching for event types | subscribe_pattern("analysis.*") |

---

## 14. Frontend Architecture

### 14.1 App Router Structure

```
src/app/
├── layout.tsx              # Root layout (AuthProvider, fonts, globals)
├── page.tsx                # Landing page
├── not-found.tsx           # 404 page
├── globals.css             # Tailwind v4 + custom styles
├── about/page.tsx          # About page
├── analyze/
│   ├── page.tsx            # Unified analyze page
│   └── [id]/page.tsx       # Analysis detail page
├── analysis/
│   └── [jobId]/page.tsx    # Job tracking page
├── dashboard/page.tsx      # Dashboard
├── history/page.tsx        # Analysis history
├── incidents/page.tsx      # Incident management
├── incidents/[id]/page.tsx # Incident detail
├── reports/page.tsx        # Reports list
├── reports/[id]/page.tsx   # Report detail
├── settings/page.tsx       # User settings
├── auth/
│   ├── callback/route.ts   # OAuth callback
│   ├── login/page.tsx      # Login page
│   └── signup/page.tsx     # Signup page
```

### 14.2 Component Architecture

| Component Pattern | Description | Example |
|-------------------|-------------|---------|
| **Page Components** | Top-level route components, contain state and orchestration | `AnalyzePage`, `DashboardPage` |
| **Feature Components** | Feature-specific, reusable within feature | `UploadZone`, `AnalysisResults` |
| **UI Components** | Generic, reusable across features | `Button`, `Card`, `Modal` |

**Rule:** Page → Feature → UI. No skipping layers.

### 14.3 State Management

| State Type | Solution | Location |
|------------|----------|----------|
| **Server State** | React Query / SWR | `src/state/` |
| **Client State** | Context + useReducer | `src/state/` |
| **URL State** | Next.js router | App Router |
| **Form State** | React Hook Form | Feature components |
| **Cache State** | React Query | `src/state/` |

### 14.4 Hooks

| Hook | Purpose | Returns | Dependencies |
|------|---------|---------|--------------|
| `useAuth()` | Auth state | User, login, logout, loading | AuthContext |
| `useAnalysis(analysisId)` | SSE-based analysis tracking | Analysis state, progress | api-client, EventSource |
| `useSSE(url)` | Generic SSE hook | Event stream | EventSource |
| `useDebounce(value, delay)` | Debounce value | Debounced value | useState, useEffect |
| `usePagination()` | Pagination logic | Page, limit, offset | useState |
| `useUpload()` | File upload | Upload progress, result | api-client |

### 14.5 Services Layer

| Service | Purpose | Methods |
|---------|---------|---------|
| **api-client.ts** | HTTP client | All API methods |
| **supabase.ts** | Supabase client | Auth, DB, Storage |
| **analysis.service.ts** | Analysis operations | startAnalysis, getAnalysis, listAnalyses |
| **dashboard.service.ts** | Dashboard data | getStats, getTrends |
| **report.service.ts** | Report operations | generate, get, list, delete |
| **incident.service.ts** | Incident operations | CRUD |

**Rule:** Components never call API directly. Always use services.

---

## 15. API Specifications

### 15.1 Authentication Endpoints

| Route | Method | Auth | Input | Output | Errors |
|-------|--------|------|-------|--------|--------|
| `/api/auth/register` | POST | None | { email, password, full_name } | { success, user, session } | 400, 409 |
| `/api/auth/login` | POST | None | { email, password } | { success, user, session } | 401, 400 |
| `/api/auth/logout` | POST | JWT | None | { success } | 401 |
| `/api/auth/me` | GET | JWT | None | { success, user } | 401 |
| `/api/auth/profile` | PUT | JWT | { full_name, avatar_url, ... } | { success, profile } | 401, 400 |
| `/api/auth/reset-password` | POST | None | { email } | { success } | 400 |

### 15.2 Analysis Endpoints (V4)

| Route | Method | Auth | Input | Output | Events | Errors |
|-------|--------|------|-------|--------|--------|--------|
| `/api/v4/analyze` | POST | JWT | StartAnalysisRequest | StartAnalysisResponse | ANALYSIS_CREATED | 400, 401, 422 |
| `/api/v4/analyze/upload` | POST | JWT | multipart/form-data | StartAnalysisResponse | ANALYSIS_CREATED | 400, 401, 413 |
| `/api/v4/analyses/{id}` | GET | JWT | - | AnalysisDetailResponse | - | 401, 404 |
| `/api/v4/analyses/{id}/status` | GET | JWT | - | StatusResponse | - | 401, 404 |
| `/api/v4/analyses/{id}/events` | GET | JWT | - | SSE stream | Real-time events | 401, 404 |
| `/api/v4/analyses` | GET | JWT | Query params | AnalysisListResponse | - | 401 |
| `/api/v4/analyses/{id}` | DELETE | JWT | - | { success } | ANALYSIS_CANCELLED | 401, 404 |
| `/api/v4/analyses/{id}/cancel` | POST | JWT | - | { success } | ANALYSIS_CANCELLED | 401, 404 |

### 15.3 Frontend Mounts

| Route | Method | Auth | Input | Output | Purpose |
|-------|--------|------|-------|--------|---------|
| `/api/analyze` | POST | JWT | { module, input_type, input_content } | { success, analysis_id } | Unified analyze endpoint |
| `/api/analysis/{id}/events` | GET | Query token | - | SSE stream | SSE with token fallback |
| `/api/v2/analysis/{id}/events` | GET | Query token | - | SSE stream | V2 compat |
| `/api/v2/analyze` | POST | JWT | Same as /api/analyze | { success, analysis_id } | V2 compat |
| `/api/analyze/news` | POST | JWT | Form data | { success, analysis_id } | News analysis |
| `/api/reports` | GET | JWT | Query params | { success, reports } | List reports |
| `/api/reports/{id}/download` | GET | JWT | - | PDF/JSON | Download report |

### 15.4 Health & Info

| Route | Method | Auth | Input | Output |
|-------|--------|------|-------|--------|
| `/health` | GET | None | - | { status, version } |
| `/info` | GET | None | - | { name, version, features } |
| `/api/v4/pipelines/{module}` | GET | JWT | - | PipelineDefinitionResponse |
| `/api/v4/pipelines` | GET | JWT | - | ModuleListResponse |

---

## 16. Database Design

### 16.1 Tables (Existing Supabase Schema)

**Do NOT redesign. Use existing schema.**

| Table | Schema | Purpose | Primary Key | Foreign Keys | Indexes |
|-------|--------|---------|-------------|--------------|---------|
| `analyses` | visionx | Analysis records | id (uuid) | user_id → auth.users | user_id, status, created_at |
| `analysis_evidence` | visionx | Evidence items | id (uuid) | analysis_id → analyses | analysis_id, agent_name |
| `reports` | visionx | Generated reports | id (uuid) | analysis_id → analyses, user_id → auth.users | user_id, created_at |
| `incidents` | visionx | Incident reports | id (uuid) | analysis_id → analyses, user_id → auth.users | user_id, status, created_at |
| `analysis_jobs` | visionx | Job tracking (if separate) | id (uuid) | analysis_id → analyses | status, created_at |
| `profiles` | public | User profiles | id (uuid) | id → auth.users | id |
| `news_analyses` | public | News analysis (DEPRECATE - move to visionx) | id (uuid) | user_id → auth.users | user_id, status |

### 16.2 Storage Buckets

| Bucket | Purpose | Access | Path Pattern |
|--------|---------|--------|--------------|
| `uploads` | User uploads | Private (authenticated) | `{user_id}/{analysis_id}/{filename}` |
| `visionx-reports` | Generated reports | Private (authenticated) | `{user_id}/{report_id}.pdf` |
| `thumbnails` | Image thumbnails | Public | `{analysis_id}/thumb.jpg` |

### 16.3 Row-Level Security (RLS)

**All tables must have RLS enabled.**

| Table | Policy | Condition |
|-------|--------|-----------|
| `analyses` | Users can view own | `auth.uid() = user_id` |
| `analyses` | Users can insert own | `auth.uid() = user_id` |
| `analyses` | Users can update own | `auth.uid() = user_id` |
| `analyses` | Users can delete own | `auth.uid() = user_id` |
| `reports` | Users can view own | `auth.uid() = user_id` |
| `incidents` | Users can view own | `auth.uid() = user_id` |
| `storage.uploads` | Users can upload to own folder | `auth.uid() = owner_id` |

### 16.4 Relationships

```
auth.users (Supabase)
    │
    │ 1:N
    ▼
analyses (visionx)
    │
    │ 1:N
    ▼
analysis_evidence (visionx)

analyses (visionx)
    │
    │ 1:1
    ▼
reports (visionx)

analyses (visionx)
    │
    │ 1:N
    ▼
incidents (visionx)
```

---

## 17. Communication Rules

### 17.1 Layer-to-Layer Communication

```
┌───────────────────────────────────────────────────────────┐
│ FRONTEND                                                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│ │ Pages    │ │Components│ │  Hooks  │ │   Services    │ │
│ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│      │            │            │               │          │
│      └────────────┴────────────┴───────────────┘          │
│                         │                                 │
│                    API Client                             │
└─────────────────────────┬─────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┬─────────────────────────────────┐
│ BACKEND - API LAYER      │                                 │
│ ┌───────────────────────▼──────────────────────────────┐ │
│ │ routes.py, mounts.py                                  │ │
│ │ - Parse request                                       │ │
│ │ - Validate auth                                       │ │
│ │ - Call service                                        │ │
│ └───────────────────────┬──────────────────────────────┘ │
│                         │                                 │
│ ┌───────────────────────▼──────────────────────────────┐ │
│ │ middleware.py                                          │ │
│ │ - CORS                                                │ │
│ │ - Error handling                                       │ │
│ │ - Correlation ID                                      │ │
│ └───────────────────────┬──────────────────────────────┘ │
└─────────────────────────┬─────────────────────────────────┘
                          │
┌─────────────────────────┬─────────────────────────────────┐
│ BACKEND - SERVICE LAYER  │                                 │
│ ┌───────────────────────▼──────────────────────────────┐ │
│ │ analysis_service.py                                   │ │
│ │ - Business rules                                      │ │
│ │ - Validation                                          │ │
│ │ - Call orchestrator or repository                     │ │
│ └───────────────────────┬──────────────────────────────┘ │
└─────────────────────────┬─────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌──────────────────┐          ┌──────────────────────┐
│ ORCHESTRATOR      │          │ REPOSITORIES         │
│ ┌───────────────▼───┐      │ ┌──────────────────▼─┐ │
│ │ orchestrator.py   │      │ │ analysis_repo.py   │ │
│ │ - Pipeline exec    │      │ │ - CRUD operations  │ │
│ │ - Agent scheduling  │      │ │ - Supabase calls   │ │
│ │ - Event publishing  │      │ │ - No business logic│ │
│ └───────────────┬───┘      │ └──────────────────┬─┘ │
│                 │          └────────────────────┘    │
│ ┌───────────────▼───┐                              │
│ │ context.py        │                              │
│ │ - Shared state    │                              │
│ └───────────────┬───┘                              │
│                 │                                  │
│ ┌───────────────▼───┐                              │
│ │ event_bus.py      │                              │
│ │ - Event pub/sub   │                              │
│ │ - SSE streaming   │                              │
│ └───────────────────┘                              │
└─────────────────────────────────────────────────────┘
                          │
                          │ schedules
                          ▼
┌──────────────────────────────────────────────────────┐
│ AGENTS                                                │
│ ┌────────────┐ ┌────────┐ ┌────────┐ ┌───────────┐ │
│ │ Forensics  │ │ Metadata│ │  OCR   │ │   AI      │ │
│ │   Agent    │ │  Agent  │ │  Agent  │ │ Detection │ │
│ └────────────┘ └────────┘ └────────┘ └───────────┘ │
│                                                       │
│ Each agent:                                           │
│ - Receives AgentContext                               │
│ - Performs single responsibility                      │
│ - Returns AgentResult                                 │
│ - May call AI models                                  │
│ - Must never access HTTP or DB directly               │
└───────────────────────────────────────────────────────┘
                          │
                          │ calls
                          ▼
┌──────────────────────────────────────────────────────┐
│ AI MODELS                                             │
│ ┌──────────────────────────────────────────────────┐ │
│ │ provider.py                                       │ │
│ │ - AIProvider ABC                                  │ │
│ │ - GeminiProvider, OpenAIProvider                  │ │
│ │ - Text generation, JSON mode, Vision              │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
                          │
                          │ data access
                          ▼
┌──────────────────────────────────────────────────────┐
│ REPOSITORIES → SUPABASE                               │
│ ┌────────────┐  ┌─────────────┐  ┌────────────────┐ │
│ │  Postgres  │  │  Storage    │  │    Auth        │ │
│ │  (CRUD)    │  │  (Files)    │  │   (JWT)        │ │
│ └────────────┘  └─────────────┘  └────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 17.2 Communication Rules

| From | To | Allowed? | Method |
|------|-----|----------|--------|
| Frontend | API | ✅ Yes | HTTP/SSE |
| API | Service | ✅ Yes | Direct function call |
| API | Repository | ❌ No | Must use service |
| API | Orchestrator | ❌ No | Must use service |
| Service | Orchestrator | ✅ Yes | Direct function call |
| Service | Repository | ✅ Yes | Direct function call |
| Service | AI | ❌ No | Must use orchestrator/agents |
| Orchestrator | Agent | ✅ Yes | Direct function call |
| Orchestrator | EventBus | ✅ Yes | Direct function call |
| Orchestrator | Repository | ❌ No | Must use service |
| Orchestrator | HTTP | ❌ No | Forbidden |
| Agent | Orchestrator | ❌ No | Returns result only |
| Agent | EventBus | ❌ No | orchestrator handles events |
| Agent | AI Models | ✅ Yes | Direct function call |
| Agent | Repository | ❌ No | Forbidden |
| Agent | HTTP | ❌ No | Forbidden |
| Repository | AI | ❌ No | Forbidden |
| Repository | HTTP | ❌ No | Forbidden |
| Repository | Orchestrator | ❌ No | Forbidden |

---

## 18. Import Dependency Rules

### 18.1 Allowed Imports

| Layer | Can Import | Cannot Import |
|-------|-----------|---------------|
| **frontend/** | types, lib, services, hooks, utils, components | backend/, api/, repositories/, models/ |
| **backend/api/** | core, schemas, services, ai.orchestrator, ai.agents | ai.models, repositories, models, workers, utils |
| **backend/core/** | stdlib, pydantic, third-party libs | All backend layers (except by core) |
| **backend/ai/orchestrator/** | core, events, ai.agents, ai.models, ai.pipelines | api, repositories, models, services, workers, utils |
| **backend/ai/agents/** | core, ai.models, utils | api, repositories, models, services, workers, events |
| **backend/ai/models/** | core, third-party AI libs | All other backend layers |
| **backend/ai/pipelines/** | core, ai.orchestrator, ai.agents | api, repositories, models, services, workers, utils |
| **backend/services/** | core, schemas, ai.orchestrator, repositories | api, models, workers, utils, events |
| **backend/repositories/** | core, models, supabase | api, ai, services, workers, utils, events |
| **backend/schemas/** | pydantic, core | All backend layers |
| **backend/models/** | sqlalchemy, core | All backend layers |
| **backend/events/** | core, asyncio | All backend layers (except core) |
| **backend/workers/** | core, ai.orchestrator, events | api, repositories, models, services, utils |
| **backend/utils/** | core, third-party libs | All backend layers (except core) |

### 18.2 Forbidden Import Patterns

```
❌ frontend → backend
❌ api → repositories
❌ api → models
❌ api → workers
❌ services → api
❌ services → events
❌ orchestrator → repositories
❌ orchestrator → http
❌ orchestrator → services
❌ agents → repositories
❌ agents → http
❌ agents → events
❌ agents → services
❌ agents → orchestrator
❌ repositories → services
❌ repositories → orchestrator
❌ repositories → ai
❌ repositories → events
❌ models → services
❌ models → orchestrator
❌ utils → services
❌ utils → orchestrator
```

### 18.3 Circular Dependency Prevention

| Rule | Enforcement |
|------|-------------|
| No circular imports | Code review + CI check |
| Dependencies point inward | Domain → Application → Infrastructure |
| Inner layers know nothing about outer layers | Enforced by import rules |

**Dependency Direction:**
```
frontend → api → services → orchestrator → agents → models
                            ↓
                      repositories → supabase
```

---

## 19. Naming Conventions

### 19.1 Files

| Type | Convention | Example |
|------|-----------|---------|
| **Routes** | `{resource}_routes.py` or `{resource}.py` | `analysis_routes.py`, `routes.py` |
| **Services** | `{domain}_service.py` | `analysis_service.py` |
| **Repositories** | `{entity}_repository.py` | `analysis_repository.py` |
| **Agents** | `{purpose}_agent.py` | `image_forensics_agent.py` |
| **Models** | `{entity}.py` (ORM), `{type}_schema.py` (Pydantic) | `analysis.py`, `analysis_schema.py` |
| **Events** | `event_bus.py`, `{entity}_events.py` | `event_bus.py` |
| **Utils** | `{purpose}.py` | `cache.py`, `metrics.py` |
| **Tests** | `test_{module}.py` | `test_orchestrator.py` |

### 19.2 Classes

| Type | Convention | Example |
|------|-----------|---------|
| **Services** | PascalCase + Service | `AnalysisService`, `ReportService` |
| **Repositories** | PascalCase + Repository | `AnalysisRepository` |
| **Agents** | PascalCase + Agent | `ImageForensicsAgent`, `OCRAgent` |
| **Models** | PascalCase (singular) | `Analysis`, `Report`, `Incident` |
| **Schemas** | PascalCase + Schema/Request/Response | `AnalysisRequest`, `AnalysisResponse` |
| **Events** | PascalCase + Event | `AnalysisStarted`, `AgentCompleted` |
| **Exceptions** | PascalCase + Error | `AnalysisError`, `ValidationError` |

### 19.3 Functions

| Type | Convention | Example |
|------|-----------|---------|
| **Public methods** | snake_case | `start_analysis()`, `get_analysis()` |
| **Private methods** | _snake_case | `_execute_agent()`, `_build_context()` |
| **HTTP handlers** | Same as public methods | `start_analysis()`, `get_analysis()` |

### 19.4 Variables

| Type | Convention | Example |
|------|-----------|---------|
| **Local variables** | snake_case | `analysis_id`, `module_type` |
| **Instance variables** | _snake_case | `_active_jobs`, `_running_agents` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `AGENT_TIMEOUT` |
| **Booleans** | is_, has_, should_ prefix | `is_running`, `has_completed`, `should_retry` |

---

## 20. Error Handling Strategy

### 20.1 Error Hierarchy

```
VisionXError (base)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── TokenExpiredError (401)
├── InvalidTokenError (401)
├── NotFoundError (404)
├── ConflictError (409)
├── ValidationError (422)
│   └── FileValidationError
├── AnalysisError (500)
│   ├── AgentError
│   ├── PipelineError
│   └── OrchestratorError
├── ExternalServiceError (502)
│   ├── DatabaseError
│   ├── StorageError
│   └── AIServiceError
├── RateLimitError (429)
├── ConfigurationError (500)
└── DegradedOperationError (200)
```

### 20.2 Error Propagation

```
Agent Failure
    ↓
Agent returns AgentResult(status="failed", error_message="...")
    ↓
Orchestrator catches failure
    ↓
Is critical?
    ├── Yes → Raise PipelineError → Service catches → HTTP 500
    └── No → Log error, continue pipeline
        ↓
        Partial success?
        ├── Yes → Compute from available results
        └── No → Return "Unable to determine"
    ↓
Service catches OrchestratorError
    ↓
Maps to HTTP exception
    ↓
Middleware handles exception
    ↓
Returns structured JSON error
    ↓
Frontend displays error
```

### 20.3 Retry Behavior

| Layer | Retry? | Strategy | Max Attempts |
|-------|--------|----------|-------------|
| **Agent** | Yes | Exponential backoff | 3 |
| **Pipeline** | No | Fail fast | 1 |
| **API** | Yes | Fixed delay | 1 (for 401) |
| **Repository** | No | Fail fast (Supabase handles retries) | 1 |
| **AI Models** | Yes | Exponential backoff | 3 |

### 20.4 Partial Success

```
Pipeline with 5 agents:
- Agent 1: Success
- Agent 2: Success
- Agent 3: Failed (non-critical)
- Agent 4: Success
- Agent 5: Success

Result:
- status: "completed_with_errors"
- verdict: Computed from Agents 1, 2, 4, 5
- confidence: Weighted average
- failed_agents: ["Agent 3"]
- error_message: "Agent 3 failed after 3 attempts: ..."
```

---

## 21. Testing Strategy

### 21.1 Test Layers

| Layer | Test Type | Framework | Coverage Target |
|-------|-----------|-----------|-----------------|
| **Unit** | Pure functions, classes | pytest | 90% |
| **Integration** | API endpoints, services | pytest + httpx | 80% |
| **Pipeline** | Agent execution | pytest + asyncio | 70% |
| **Repository** | Database operations | pytest + testcontainers | 80% |
| **Frontend** | Components, hooks | Jest + React Testing Library | 80% |
| **E2E** | Full user flows | Playwright | 50% |

### 21.2 Test Organization

```
backend/
├── tests/
│   ├── unit/
│   │   ├── test_agents.py
│   │   ├── test_orchestrator.py
│   │   ├── test_event_bus.py
│   │   └── test_utils.py
│   ├── integration/
│   │   ├── test_api_routes.py
│   │   ├── test_services.py
│   │   └── test_repositories.py
│   ├── pipeline/
│   │   ├── test_image_pipeline.py
│   │   ├── test_video_pipeline.py
│   │   └── test_news_pipeline.py
│   └── conftest.py

frontend/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── pages/
```

### 21.3 Test Responsibilities

| Layer | What to Test | What NOT to Test |
|-------|--------------|------------------|
| **Agents** | Agent logic, confidence calculation | AI model responses (mock) |
| **Orchestrator** | Pipeline execution, dependency resolution | Agent logic (mock agents) |
| **Services** | Business rules, validation | HTTP routing, DB queries (mock) |
| **Repositories** | CRUD operations, queries | Business logic |
| **API** | Request/response, auth | Agent logic, DB (mock) |
| **Frontend** | Component rendering, state | API responses (mock) |

---

## 22. Architecture Rules

### 22.1 The VisionX Constitution

These rules are non-negotiable. Violation requires architectural review.

1. **Single Responsibility:** Every class and function does exactly one thing.
2. **Dependency Inversion:** Inner layers define interfaces; outer layers implement.
3. **No Circular Dependencies:** Dependencies point inward only.
4. **Separation of Concerns:** API ≠ Services ≠ Orchestrator ≠ Agents ≠ Repositories.
5. **Event-Driven:** Components communicate via events, not direct calls (where possible).
6. **Stateless Services:** Services have no instance state (except caches).
7. **Immutable Events:** Events are immutable once published.
8. ** typed Interfaces:** All public methods have type hints.
9. **Explicit Errors:** All errors are typed (VisionXError hierarchy).
10. **Testability:** Every public method must be testable in isolation.

### 22.2 Anti-Patterns (Forbidden)

| Anti-Pattern | Why Forbidden | Correct Approach |
|--------------|---------------|------------------|
| God Class | Violates SRP | Split into focused classes |
| Circular Imports | Creates tight coupling | Use dependency injection |
| Direct DB Access from API | Violates separation | Use repositories via services |
| Agent → HTTP | Agents must be pure | Orchestrator handles HTTP |
| Business Logic in Repository | Violates SRP | Business logic in services |
| Magic Numbers | Hard to maintain | Use named constants |
| Global State | Hard to test | Use dependency injection |
| Tight Coupling | Hard to change | Use interfaces/ABCs |
| Silent Failures | Hard to debug | Always log errors |
| Mixed Abstraction Levels | Confusing | One level per layer |

### 22.3 Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p95) | < 200ms | APM tooling |
| Agent Execution Time (p95) | < 30s | EventBus metrics |
| Pipeline Completion Time (p95) | < 120s | EventBus metrics |
| SSE Event Latency | < 100ms | EventBus timing |
| Database Query Time (p95) | < 50ms | APM tooling |
| Frontend TTI | < 3s | Lighthouse |
| Frontend FID | < 100ms | Lighthouse |

### 22.4 Security Requirements

| Requirement | Enforcement |
|-------------|-------------|
| All API routes require auth (except /health, /info) | Middleware |
| JWT verification on every request | api.dependencies |
| RLS on all database tables | Supabase policies |
| File upload validation | API layer + StorageRepository |
| Rate limiting | Middleware (future) |
| CORS properly configured | Middleware |
| No secrets in code | CI/CD scan |
| Prompt injection protection | AI provider layer |

### 22.5 Monitoring Requirements

| Metric | Where to Track | Alert Threshold |
|--------|---------------|-----------------|
| API errors | Middleware | > 1% error rate |
| Agent failures | Orchestrator | > 10% failure rate |
| Pipeline duration | EventBus | > 2x expected |
| SSE subscriber count | EventBus | > 1000 concurrent |
| Database connections | Repository | > 80% pool usage |
| AI API latency | AI Provider | > 5s p95 |
| Frontend errors | Frontend | > 1% error rate |

---

## Appendix A: Example Implementation Checklist

When implementing a new feature:

- [ ] Update this blueprint if architecture changes
- [ ] Define folder structure (if new)
- [ ] Define file responsibilities
- [ ] Define class interfaces
- [ ] Define function signatures
- [ ] Define input/output schemas
- [ ] Define error handling
- [ ] Define tests
- [ ] Update API documentation
- [ ] Update frontend types
- [ ] Code review against blueprint

---

## Appendix B: Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-08 | Initial blueprint - complete architecture definition |

---

**This document is the single source of truth for VisionX architecture. All implementations must conform to this blueprint. Deviations require explicit architectural review and documentation updates.**