# Projectec — Frontend Deep Dive

> Companion to the System Design doc. This covers everything the top-level doc glosses over:
> Zustand stores, slug routing, ID↔name resolution, dropdown population, and every component that matters.

---

## Table of Contents

1. [URL & Slug Architecture](#1-url--slug-architecture)
2. [ID ↔ Name Resolution](#2-id--name-resolution)
3. [Zustand Store Design](#3-zustand-store-design)
4. [Dropdown Population Patterns](#4-dropdown-population-patterns)
5. [Page Inventory (deep)](#5-page-inventory-deep)
6. [Component Hierarchy](#6-component-hierarchy)
7. [Data Flow: Issue Detail (end-to-end)](#7-data-flow-issue-detail-end-to-end)
8. [Optimistic Updates & Error Recovery](#8-optimistic-updates--error-recovery)
9. [Real-time: WebSocket → Query Cache](#9-real-time-websocket--query-cache)
10. [Permissions in the UI](#10-permissions-in-the-ui)

---

## 1. URL & Slug Architecture

### 1.1 Why Slugs on the Surface, IDs Underneath

The user sees clean, readable URLs. The API always receives UUIDs. The router is the translation layer.

```
User sees:     /acme/api-platform/issues/42
DB stores:     org_id=uuid, project_id=uuid, issue.number=42
API receives:  GET /api/v1/issues/APIP-42   ← project key + number
```

There are three slug types and they behave differently:

| Slug | Source | Mutable? | Example |
|------|--------|----------|---------|
| `orgSlug` | `organizations.slug` | Yes (rare, redirect old) | `acme` |
| `projectKey` | `projects.key` | No (immutable) | `api-platform` → key: `APIP` |
| `issueNumber` | `issues.number` | No (auto-increment) | `42` |

**Decision: project key in URL, not project slug.**

Projects use their `key` (e.g. `APIP`) as part of the URL prefix for issues (`APIP-42`), but we use a separate human-readable `slug` derived from name for the base project URL:

```
/:orgSlug/:projectSlug/issues/42
           ↑
           "api-platform" (derived from "API Platform", stored in projects.slug)
           NOT the same as projects.key ("APIP")
```

The `projects` table needs a `slug` column (separate from `key`):
```sql
ALTER TABLE projects ADD COLUMN slug TEXT NOT NULL;
ALTER TABLE projects ADD CONSTRAINT projects_org_slug_unique UNIQUE(org_id, slug);
```

### 1.2 Route Definitions

```tsx
// app/router.tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    loader: rootLoader,         // loads current user + org list
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "standup", element: <StandupPage /> },
      
      {
        path: ":orgSlug",
        element: <OrgLayout />,
        loader: orgLoader,      // loads org by slug → sets active org in Zustand
        children: [
          { index: true, element: <OrgDashboardPage /> },
          { path: "projects", element: <ProjectListPage /> },
          { path: "reports/workload", element: <WorkloadReportPage /> },
          {
            path: "settings",
            element: <OrgSettingsLayout />,
            children: [
              { index: true, element: <OrgGeneralSettingsPage /> },
              { path: "members", element: <MembersPage /> },
              { path: "webhooks", element: <WebhooksPage /> },
              { path: "api", element: <APIKeysPage /> },
              { path: "billing", element: <BillingPage /> },
            ]
          },
          {
            path: ":projectSlug",
            element: <ProjectLayout />,
            loader: projectLoader,   // loads project by (org_id, slug)
            children: [
              { index: true, element: <Navigate to="issues" replace /> },
              { path: "issues", element: <IssueListPage /> },
              { path: "issues/:issueNumber", element: <IssueDetailPage /> },
              { path: "board", element: <KanbanBoardPage /> },
              { path: "board/sprint", element: <ScrumBoardPage /> },
              { path: "backlog", element: <BacklogPage /> },
              {
                path: "sprints",
                children: [
                  { path: ":sprintId/plan", element: <SprintPlanningPage /> },
                  { path: ":sprintId/review", element: <SprintReviewPage /> },
                ]
              },
              {
                path: "reports",
                children: [
                  { path: "burndown", element: <BurndownPage /> },
                  { path: "velocity", element: <VelocityPage /> },
                ]
              },
              {
                path: "docs",
                element: <DocsLayout />,
                children: [
                  { index: true, element: <DocSpacePage /> },
                  { path: ":docId", element: <DocEditorPage /> },
                ]
              },
              {
                path: "settings",
                element: <ProjectSettingsLayout />,
                children: [
                  { index: true, element: <ProjectGeneralPage /> },
                  { path: "workflow", element: <WorkflowPage /> },
                  { path: "fields", element: <CustomFieldsPage /> },
                  { path: "labels", element: <LabelsPage /> },
                  { path: "members", element: <ProjectMembersPage /> },
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // Auth routes — outside AppShell (no sidebar)
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/invite/:token", element: <AcceptInvitePage /> },
  { path: "/auth/google/callback", element: <OAuthCallbackPage /> },
]);
```

### 1.3 Loaders: Slug → ID Translation

Loaders run before the component renders and populate the Zustand store, giving every child component access to resolved IDs without prop-drilling.

```ts
// app/loaders/orgLoader.ts
export async function orgLoader({ params }: LoaderFunctionArgs) {
  const { orgSlug } = params;
  
  // Check Zustand cache first (user may have navigated here before)
  const cached = useAppStore.getState().orgs[orgSlug];
  if (cached) {
    useAppStore.getState().setActiveOrg(cached);
    return cached;
  }

  // Fetch from API — this is the ONLY place we resolve slug → org object
  const org = await api.get<Org>(`/orgs/${orgSlug}`);
  useAppStore.getState().setActiveOrg(org);
  useAppStore.getState().cacheOrg(org);
  return org;
}

// app/loaders/projectLoader.ts
export async function projectLoader({ params }: LoaderFunctionArgs) {
  const { orgSlug, projectSlug } = params;
  const org = useAppStore.getState().activeOrg!;  // guaranteed by parent loader
  
  const cacheKey = `${org.id}:${projectSlug}`;
  const cached = useAppStore.getState().projects[cacheKey];
  if (cached) {
    useAppStore.getState().setActiveProject(cached);
    return cached;
  }

  // API: /orgs/:slug/projects?slug=api-platform (returns single match)
  const project = await api.get<Project>(`/orgs/${orgSlug}/projects/${projectSlug}`);
  useAppStore.getState().setActiveProject(project);
  useAppStore.getState().cacheProject(cacheKey, project);
  return project;
}
```

### 1.4 Issue Number Resolution

Issues use `PROJ-42` style identifiers in the URL. The API supports lookup by either UUID or this composite key:

```
GET /api/v1/issues/APIP-42     → resolves project key from URL context
```

In the frontend, the `IssueDetailPage` does:

```tsx
// features/issues/pages/IssueDetailPage.tsx
export function IssueDetailPage() {
  const { projectSlug, issueNumber } = useParams();
  const project = useActiveProject();   // from Zustand, set by loader
  const issueRef = `${project.key}-${issueNumber}`;   // e.g. "APIP-42"

  const { data: issue } = useQuery({
    queryKey: ['issues', issueRef],
    queryFn: () => api.get<Issue>(`/issues/${issueRef}`),
  });

  // ...
}
```

### 1.5 Generating Links (always from IDs)

Never hardcode slug lookups in component logic. Use a `useIssueUrl` hook that gets the slugs from Zustand:

```ts
// hooks/useIssueUrl.ts
export function useIssueUrl(issue: Issue): string {
  // Zustand has org slug + project slug already loaded
  const org = useAppStore(s => s.activeOrg);
  const project = useAppStore(s => s.activeProject);
  return `/${org.slug}/${project.slug}/issues/${issue.number}`;
}

// In any component:
const url = useIssueUrl(issue);
<Link to={url}>{issue.title}</Link>
```

For cross-project links (e.g. linked issues from another project), the API returns denormalized data:

```ts
// The API response for a linked issue includes:
{
  id: "uuid",
  number: 7,
  title: "Fix payment timeout",
  project: {               // ← denormalized on read
    id: "uuid",
    key: "PAY",
    slug: "payments",
    name: "Payments Service"
  },
  org: {
    slug: "acme"
  }
}

// So link = `/${issue.org.slug}/${issue.project.slug}/issues/${issue.number}`
```

---

## 2. ID ↔ Name Resolution

### 2.1 The Core Problem

The API deals in UUIDs:
- `assignee_id: "uuid-user"`
- `status_id: "uuid-status"`
- `label_ids: ["uuid-label-1", "uuid-label-2"]`

The UI needs names, colors, and avatars. The answer is a **reference data layer** — small, cacheable lookup tables loaded once per project session.

### 2.2 Reference Data: What It Is

```ts
// types/referenceData.ts
export interface ProjectReferenceData {
  members: Member[];          // users in this project
  statuses: IssueStatus[];    // workflow statuses
  labels: Label[];            // project labels
  customFields: CustomField[];
  sprints: Sprint[];          // active + recent sprints
}

// Lookup maps — built from arrays, used for O(1) access
export interface ProjectLookups {
  membersById: Map<string, Member>;
  statusesById: Map<string, IssueStatus>;
  labelsById: Map<string, Label>;
  customFieldsById: Map<string, CustomField>;
  sprintsById: Map<string, Sprint>;
}
```

### 2.3 Loading Reference Data

```ts
// hooks/useProjectReferenceData.ts
export function useProjectReferenceData(projectId: string) {
  return useQuery({
    queryKey: ['project-ref', projectId],
    queryFn: async () => {
      // Single batch request — backend aggregates this
      const data = await api.get<ProjectReferenceData>(
        `/projects/${projectId}/reference-data`
      );
      // Build lookup maps once, on load
      return {
        ...data,
        lookups: buildLookups(data),
      };
    },
    staleTime: 5 * 60 * 1000,     // 5 minutes — this data changes infrequently
    gcTime: 30 * 60 * 1000,        // keep in memory 30 min after last use
  });
}

function buildLookups(data: ProjectReferenceData): ProjectLookups {
  return {
    membersById: new Map(data.members.map(m => [m.id, m])),
    statusesById: new Map(data.statuses.map(s => [s.id, s])),
    labelsById: new Map(data.labels.map(l => [l.id, l])),
    customFieldsById: new Map(data.customFields.map(f => [f.id, f])),
    sprintsById: new Map(data.sprints.map(s => [s.id, s])),
  };
}
```

**Backend endpoint** (aggregate, avoids 5 round trips):
```
GET /api/v1/projects/:id/reference-data
→ { members, statuses, labels, customFields, sprints }
```

### 2.4 Consuming Lookups in Components

```tsx
// features/issues/components/IssueCard.tsx
export function IssueCard({ issue }: { issue: Issue }) {
  const { data: ref } = useProjectReferenceData(issue.project_id);
  
  // O(1) lookups — no find(), no filter()
  const status = ref?.lookups.statusesById.get(issue.status_id);
  const assignee = ref?.lookups.membersById.get(issue.assignee_id ?? '');
  const labels = issue.label_ids.map(id => ref?.lookups.labelsById.get(id));

  return (
    <div className="issue-card">
      <StatusBadge status={status} />
      <span>{issue.title}</span>
      <div className="labels">
        {labels.map(label => label && (
          <LabelChip key={label.id} label={label} />
        ))}
      </div>
      {assignee && <Avatar user={assignee} size="sm" />}
    </div>
  );
}
```

### 2.5 Invalidating Reference Data

When a label is created, a status is renamed, or a member is added:

```ts
// After mutating a label, status, or member:
queryClient.invalidateQueries({ queryKey: ['project-ref', projectId] });

// This refetches reference data for all components using that project
// Because staleTime=5min, it won't re-fetch on every render
```

For real-time updates, the WebSocket handler also invalidates:
```ts
ws.on('project:ref_updated', ({ projectId }) => {
  queryClient.invalidateQueries({ queryKey: ['project-ref', projectId] });
});
```

---

## 3. Zustand Store Design

### 3.1 Store Philosophy

**Zustand holds UI state. React Query holds server state.**

Never put fetched data in Zustand. Never put modal open/close state in React Query.

| What | Where |
|------|-------|
| Active org, active project | Zustand (set by loaders, read everywhere) |
| Current user | Zustand (set on login, persisted to localStorage) |
| Board column widths | Zustand |
| Command palette open | Zustand |
| Sidebar collapsed | Zustand (persisted) |
| Issue list filter state | Zustand (per-project, URL-synced) |
| Notification count | Zustand (incremented via WS) |
| Issues data, comments | React Query |
| Reference data (members, statuses) | React Query |

### 3.2 The App Store

```ts
// store/appStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AppState {
  // ─── Active context ───────────────────────────────────────────────
  activeOrg: Org | null;
  activeProject: Project | null;
  currentUser: CurrentUser | null;

  // ─── Slug → entity caches (avoids re-fetching on navigation) ─────
  orgs: Record<string, Org>;           // keyed by slug
  projects: Record<string, Project>;   // keyed by "orgId:projectSlug"

  // ─── UI state ─────────────────────────────────────────────────────
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  notificationCount: number;

  // ─── Actions ──────────────────────────────────────────────────────
  setActiveOrg: (org: Org) => void;
  setActiveProject: (project: Project) => void;
  setCurrentUser: (user: CurrentUser) => void;
  cacheOrg: (org: Org) => void;
  cacheProject: (key: string, project: Project) => void;
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  incrementNotifications: () => void;
  resetNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    immer((set) => ({
      activeOrg: null,
      activeProject: null,
      currentUser: null,
      orgs: {},
      projects: {},
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      notificationCount: 0,

      setActiveOrg: (org) => set(state => { state.activeOrg = org; }),
      setActiveProject: (project) => set(state => { state.activeProject = project; }),
      setCurrentUser: (user) => set(state => { state.currentUser = user; }),
      
      cacheOrg: (org) => set(state => { state.orgs[org.slug] = org; }),
      cacheProject: (key, project) => set(state => { state.projects[key] = project; }),
      
      toggleSidebar: () => set(state => { state.sidebarCollapsed = !state.sidebarCollapsed; }),
      openCommandPalette: () => set(state => { state.commandPaletteOpen = true; }),
      closeCommandPalette: () => set(state => { state.commandPaletteOpen = false; }),
      
      incrementNotifications: () => set(state => { state.notificationCount++; }),
      resetNotifications: () => set(state => { state.notificationCount = 0; }),
    })),
    {
      name: 'projectec-app',
      storage: createJSONStorage(() => localStorage),
      // Only persist preferences — NOT active org/project (those come from URL)
      partialize: (state) => ({
        currentUser: state.currentUser,
        sidebarCollapsed: state.sidebarCollapsed,
        orgs: state.orgs,        // cache persists: fast navigation after refresh
        projects: state.projects,
      }),
    }
  )
);

// Typed selectors — use these in components, not raw store access
export const useActiveOrg = () => useAppStore(s => s.activeOrg);
export const useActiveProject = () => useAppStore(s => s.activeProject);
export const useCurrentUser = () => useAppStore(s => s.currentUser);
```

### 3.3 The Board Store

```ts
// store/boardStore.ts
// Separate store — only mounted when a board page is active

interface BoardState {
  // Which sprint is selected in the sprint board
  activeSprint: Sprint | null;

  // Collapsed columns (user preference per project)
  collapsedColumns: Record<string, boolean>;  // statusId → boolean

  // Cards being dragged (for visual feedback)
  draggingCardId: string | null;
  draggingOverColumnId: string | null;

  // Grouping + display options
  groupBy: 'status' | 'assignee' | 'priority' | 'label';
  showSubtasks: boolean;
  cardDensity: 'compact' | 'default' | 'comfortable';

  setActiveSprint: (sprint: Sprint) => void;
  toggleColumn: (statusId: string) => void;
  setDragging: (cardId: string | null, overColumnId: string | null) => void;
  setGroupBy: (by: BoardState['groupBy']) => void;
  toggleSubtasks: () => void;
  setCardDensity: (density: BoardState['cardDensity']) => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    immer((set) => ({
      activeSprint: null,
      collapsedColumns: {},
      draggingCardId: null,
      draggingOverColumnId: null,
      groupBy: 'status',
      showSubtasks: true,
      cardDensity: 'default',

      setActiveSprint: (sprint) => set(s => { s.activeSprint = sprint; }),
      toggleColumn: (id) => set(s => { s.collapsedColumns[id] = !s.collapsedColumns[id]; }),
      setDragging: (cardId, colId) => set(s => {
        s.draggingCardId = cardId;
        s.draggingOverColumnId = colId;
      }),
      setGroupBy: (by) => set(s => { s.groupBy = by; }),
      toggleSubtasks: () => set(s => { s.showSubtasks = !s.showSubtasks; }),
      setCardDensity: (d) => set(s => { s.cardDensity = d; }),
    })),
    {
      name: 'projectec-board',
      // Persist preferences but not drag state
      partialize: (state) => ({
        collapsedColumns: state.collapsedColumns,
        groupBy: state.groupBy,
        showSubtasks: state.showSubtasks,
        cardDensity: state.cardDensity,
      }),
    }
  )
);
```

### 3.4 The Filter Store

Issue list filters live in Zustand AND are synced to URL search params. This lets users share filtered views.

```ts
// store/filterStore.ts
interface FilterState {
  // Keyed by projectId — each project remembers its own filters
  filters: Record<string, IssueFilters>;
  
  setFilter: (projectId: string, filters: Partial<IssueFilters>) => void;
  clearFilters: (projectId: string) => void;
}

export interface IssueFilters {
  types: IssueType[];
  statusIds: string[];
  assigneeIds: string[];          // special: "me" | "unassigned" | uuid
  priorities: IssuePriority[];
  labelIds: string[];
  sprintId: string | null;        // "current" | "backlog" | uuid
  q: string;                      // free text
  sort: SortConfig;
  groupBy: 'none' | 'status' | 'assignee' | 'priority' | 'label' | 'epic';
  page: number;
  perPage: 25 | 50 | 100;
}

// URL ↔ Filter sync hook
export function useFilterSync(projectId: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilter } = useFilterStore();
  
  const projectFilters = filters[projectId] ?? DEFAULT_FILTERS;

  // On mount: parse URL into filter state
  useEffect(() => {
    const fromUrl = parseFiltersFromURL(searchParams);
    if (Object.keys(fromUrl).length > 0) {
      setFilter(projectId, fromUrl);
    }
  }, []);

  // On filter change: update URL (without navigation)
  useEffect(() => {
    setSearchParams(serializeFiltersToURL(projectFilters), { replace: true });
  }, [projectFilters]);

  return projectFilters;
}

// URL format:
// ?type=bug,story&status=in_progress&assignee=me&priority=high&q=payment
```

---

## 4. Dropdown Population Patterns

Dropdowns are the biggest UX/data challenge. There are three kinds and each needs a different approach.

### 4.1 Reference Data Dropdowns (statuses, labels, members)

These come from reference data already loaded. Zero additional requests.

```tsx
// components/dropdowns/StatusSelect.tsx
interface StatusSelectProps {
  projectId: string;
  value: string | null;        // status UUID
  onChange: (statusId: string) => void;
}

export function StatusSelect({ projectId, value, onChange }: StatusSelectProps) {
  const { data: ref } = useProjectReferenceData(projectId);
  const statuses = ref?.statuses ?? [];

  // Group by category for visual separation
  const grouped = groupBy(statuses, s => s.category);
  // { todo: [...], in_progress: [...], done: [...], cancelled: [...] }

  const selected = ref?.lookups.statusesById.get(value ?? '');

  return (
    <Dropdown
      trigger={
        <button>
          <StatusDot color={selected?.color} />
          <span>{selected?.name ?? 'No Status'}</span>
          <ChevronDown size={14} />
        </button>
      }
    >
      {Object.entries(grouped).map(([category, items]) => (
        <DropdownGroup key={category} label={STATUS_CATEGORY_LABELS[category]}>
          {items.map(status => (
            <DropdownItem
              key={status.id}
              selected={status.id === value}
              onSelect={() => onChange(status.id)}
            >
              <StatusDot color={status.color} />
              {status.name}
            </DropdownItem>
          ))}
        </DropdownGroup>
      ))}
    </Dropdown>
  );
}
```

```tsx
// components/dropdowns/AssigneeSelect.tsx
export function AssigneeSelect({ projectId, value, onChange, allowUnassigned = true }) {
  const { data: ref } = useProjectReferenceData(projectId);
  const members = ref?.members ?? [];
  
  const [search, setSearch] = useState('');
  
  const filtered = members.filter(m =>
    m.displayName.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dropdown>
      <DropdownSearch value={search} onChange={setSearch} placeholder="Search members..." />
      {allowUnassigned && (
        <DropdownItem
          selected={value === null}
          onSelect={() => onChange(null)}
        >
          <UnassignedAvatar />
          Unassigned
        </DropdownItem>
      )}
      {filtered.map(member => (
        <DropdownItem
          key={member.id}
          selected={member.id === value}
          onSelect={() => onChange(member.id)}
        >
          <Avatar user={member} size="xs" />
          {member.displayName}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
```

### 4.2 Search-as-you-type Dropdowns (issue links, epics)

For linking issues, you can't load all issues upfront. Use a debounced search.

```tsx
// components/dropdowns/IssuePicker.tsx
interface IssuePickerProps {
  projectId: string;
  value: string | null;       // issue UUID
  onChange: (issueId: string | null) => void;
  excludeIds?: string[];      // don't show current issue, children, etc.
}

export function IssuePicker({ projectId, value, onChange, excludeIds = [] }: IssuePickerProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);   // 250ms debounce

  const { data: results, isLoading } = useQuery({
    queryKey: ['issue-search', projectId, debouncedQuery],
    queryFn: () =>
      api.get<Issue[]>(`/projects/${projectId}/issues`, {
        params: { q: debouncedQuery, per_page: 10 }
      }),
    enabled: debouncedQuery.length > 0,
    staleTime: 30_000,
  });

  // Also fetch the currently selected issue (to show its name)
  const { data: selectedIssue } = useQuery({
    queryKey: ['issue', value],
    queryFn: () => api.get<Issue>(`/issues/${value}`),
    enabled: !!value,
    staleTime: 5 * 60 * 1000,
  });

  const displayItems = (results ?? []).filter(i => !excludeIds.includes(i.id));

  return (
    <Combobox value={value} onChange={onChange}>
      <ComboboxInput
        value={query}
        onChange={e => setQuery(e.target.value)}
        displayValue={() => selectedIssue ? `${selectedIssue.identifier} · ${selectedIssue.title}` : ''}
        placeholder="Search issues..."
      />
      <ComboboxOptions>
        {isLoading && <LoadingSpinner />}
        {displayItems.map(issue => (
          <ComboboxOption key={issue.id} value={issue.id}>
            <IssueIdentifier issue={issue} />  {/* PROJ-42 badge */}
            <span>{issue.title}</span>
            <StatusDot status={issue.status} />
          </ComboboxOption>
        ))}
        {!isLoading && displayItems.length === 0 && query && (
          <EmptyState>No issues found for "{query}"</EmptyState>
        )}
      </ComboboxOptions>
    </Combobox>
  );
}
```

### 4.3 Async Paginated Dropdowns (sprint selector with history)

```tsx
// components/dropdowns/SprintSelect.tsx
// Sprints can be many — active + completed. Load active first, paginate history.

export function SprintSelect({ projectId, value, onChange }) {
  const { data: ref } = useProjectReferenceData(projectId);
  // Reference data already has active + recent (last 3) sprints
  const sprints = ref?.sprints ?? [];

  const [showAll, setShowAll] = useState(false);

  // Only load all sprints if user clicks "Show more"
  const { data: allSprints } = useQuery({
    queryKey: ['sprints', projectId, 'all'],
    queryFn: () => api.get<Sprint[]>(`/projects/${projectId}/sprints`),
    enabled: showAll,
    staleTime: 60_000,
  });

  const displayed = showAll ? (allSprints ?? sprints) : sprints;
  const active = displayed.find(s => s.status === 'active');
  const planning = displayed.filter(s => s.status === 'planning');
  const completed = displayed.filter(s => s.status === 'completed');

  return (
    <Dropdown>
      {/* Quick options */}
      <DropdownItem selected={value === 'backlog'} onSelect={() => onChange('backlog')}>
        📋 Backlog
      </DropdownItem>
      
      {active && (
        <DropdownGroup label="Active">
          <DropdownItem selected={value === active.id} onSelect={() => onChange(active.id)}>
            🟢 {active.name}
            <span className="text-muted text-xs">ends {formatDate(active.endDate)}</span>
          </DropdownItem>
        </DropdownGroup>
      )}

      {planning.length > 0 && (
        <DropdownGroup label="Planning">
          {planning.map(s => (
            <DropdownItem key={s.id} selected={value === s.id} onSelect={() => onChange(s.id)}>
              📅 {s.name}
            </DropdownItem>
          ))}
        </DropdownGroup>
      )}

      {completed.length > 0 && (
        <DropdownGroup label="Completed">
          {completed.slice(0, 3).map(s => (
            <DropdownItem key={s.id} selected={value === s.id} onSelect={() => onChange(s.id)}>
              ✅ {s.name}
            </DropdownItem>
          ))}
        </DropdownGroup>
      )}

      {!showAll && (
        <DropdownItem onClick={() => setShowAll(true)} className="text-muted">
          Show all sprints...
        </DropdownItem>
      )}
    </Dropdown>
  );
}
```

### 4.4 The Custom Field Renderer

Custom fields need their dropdowns populated from their `config.options`:

```tsx
// features/issues/components/CustomFieldRenderer.tsx

interface CustomFieldRendererProps {
  field: CustomField;
  value: unknown;
  onChange: (value: unknown) => void;
  mode: 'edit' | 'view';
}

export function CustomFieldRenderer({ field, value, onChange, mode }: CustomFieldRendererProps) {
  // The field.config contains options for select types:
  // { options: [{ id: "uuid", label: "Production", color: "#..." }] }

  if (mode === 'view') {
    return <CustomFieldValue field={field} value={value} />;
  }

  switch (field.fieldType) {
    case 'text':
      return <Input value={value as string} onChange={e => onChange(e.target.value)} />;

    case 'number':
      return <Input type="number" value={value as number} onChange={e => onChange(+e.target.value)} />;

    case 'date':
      return <DatePicker value={value as string} onChange={onChange} />;

    case 'checkbox':
      return <Switch checked={value as boolean} onCheckedChange={onChange} />;

    case 'select':
      return (
        <Dropdown>
          {field.config.options.map(opt => (
            <DropdownItem
              key={opt.id}
              selected={value === opt.id}
              onSelect={() => onChange(opt.id)}
            >
              {opt.color && <ColorDot color={opt.color} />}
              {opt.label}
            </DropdownItem>
          ))}
        </Dropdown>
      );

    case 'multi_select':
      const selected = (value as string[]) ?? [];
      return (
        <MultiSelect
          options={field.config.options}
          value={selected}
          onChange={onChange}
          renderOption={opt => (
            <>
              {opt.color && <ColorDot color={opt.color} />}
              {opt.label}
            </>
          )}
        />
      );

    case 'user':
      // Needs project context — get from Zustand
      const project = useActiveProject();
      return (
        <AssigneeSelect
          projectId={project!.id}
          value={value as string}
          onChange={onChange}
          allowUnassigned={!field.isRequired}
        />
      );

    case 'url':
      return <Input type="url" value={value as string} onChange={e => onChange(e.target.value)} />;

    default:
      return <span className="text-muted">Unknown field type</span>;
  }
}
```

---

## 5. Page Inventory (deep)

### 5.1 IssueListPage

```
State: filter state (Zustand), sort, groupBy, page
Data:  issues (React Query, paginated), reference data (React Query)
URL:   /:org/:proj/issues?type=bug&assignee=me&priority=high

Layout:
┌─────────────────────────────────────────────────────────────┐
│  [IssueListHeader]                                          │
│   Title "Issues"   [+ New Issue]  [Filter]  [Group ▾]     │
│   [Sort: Priority ▾]  [Layout: List | Board | Backlog]     │
├─────────────────────────────────────────────────────────────┤
│  [ActiveFilters]  ← chips showing active filters + clear   │
├─────────────────────────────────────────────────────────────┤
│  IF groupBy = 'none':                                       │
│    [IssueRow] × N  ← virtualized with @tanstack/virtual    │
│  IF groupBy = 'status':                                     │
│    [IssueGroupHeader: "In Progress (12)"]                   │
│      [IssueRow] × 12                                        │
│    [IssueGroupHeader: "Done (38)"] [collapsed]              │
├─────────────────────────────────────────────────────────────┤
│  [Pagination]  Page 1 of 4  ← or infinite scroll option    │
└─────────────────────────────────────────────────────────────┘
```

```tsx
// features/issues/pages/IssueListPage.tsx
export function IssueListPage() {
  const project = useActiveProject()!;
  const filters = useFilterSync(project.id);   // reads + syncs URL
  const { data: ref } = useProjectReferenceData(project.id);
  const { setFilter } = useFilterStore();

  const { data, isLoading, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['issues', project.id, filters],
    queryFn: ({ pageParam = 1 }) =>
      api.get<PaginatedResponse<Issue>>(`/projects/${project.id}/issues`, {
        params: {
          ...serializeFilters(filters),
          page: pageParam,
          per_page: filters.perPage,
        }
      }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

  const issues = data?.pages.flatMap(p => p.items) ?? [];
  const grouped = groupIssues(issues, filters.groupBy, ref?.lookups);

  return (
    <div className="issue-list-page">
      <IssueListHeader
        project={project}
        filters={filters}
        onFilterChange={f => setFilter(project.id, f)}
      />
      <ActiveFilters
        filters={filters}
        ref={ref}
        onRemove={(key) => setFilter(project.id, { [key]: DEFAULT_FILTERS[key] })}
      />
      <IssueTable
        grouped={grouped}
        ref={ref}
        isLoading={isLoading}
        onLoadMore={fetchNextPage}
        isFetchingMore={isFetchingNextPage}
      />
    </div>
  );
}
```

### 5.2 IssueDetailPage

```
Layout: 2/3 main | 1/3 sidebar (collapsible on mobile)

Main pane:
  IssueHeader          ← title (editable inline), breadcrumb, type badge
  IssueDescription     ← Tiptap editor (view → edit on click)
  IssueChildList       ← subtasks (if any)
  IssueLinkedIssues    ← blocks/is-blocked-by/relates-to
  IssueComments        ← threaded, rich text
  IssueActivity        ← immutable change history

Sidebar:
  [Status dropdown]
  [Priority select]
  [Assignee select]
  [Labels multi-select]
  [Sprint select]
  [Epic select]
  [Dates: Due date, Started]
  [Story points]
  [Custom fields]     ← CustomFieldRenderer × N
  [Attachments]
  [Links to docs]
```

```tsx
// features/issues/pages/IssueDetailPage.tsx
export function IssueDetailPage() {
  const { issueNumber } = useParams();
  const project = useActiveProject()!;
  const issueRef = `${project.key}-${issueNumber}`;
  
  const { data: issue, isLoading } = useQuery({
    queryKey: ['issues', issueRef],
    queryFn: () => api.get<IssueDetail>(`/issues/${issueRef}`),
    // IssueDetail has more fields than Issue (full description, linked issues, etc.)
  });

  const { data: ref } = useProjectReferenceData(project.id);

  // Field update mutation — used by every sidebar field
  const updateIssue = useOptimisticIssueUpdate(issueRef);

  if (isLoading) return <IssueDetailSkeleton />;
  if (!issue) return <NotFoundPage />;

  return (
    <div className="issue-detail">
      <IssueMain issue={issue} onUpdate={updateIssue} />
      <IssueSidebar issue={issue} ref={ref} onUpdate={updateIssue} />
    </div>
  );
}
```

```tsx
// features/issues/components/IssueDetail/IssueSidebar.tsx
export function IssueSidebar({ issue, ref, onUpdate }: IssueSidebarProps) {
  const project = useActiveProject()!;

  return (
    <aside className="issue-sidebar">
      <SidebarField label="Status">
        <StatusSelect
          projectId={project.id}
          value={issue.status_id}
          onChange={statusId => onUpdate({ status_id: statusId })}
        />
      </SidebarField>

      <SidebarField label="Priority">
        <PrioritySelect
          value={issue.priority}
          onChange={priority => onUpdate({ priority })}
        />
      </SidebarField>

      <SidebarField label="Assignee">
        <AssigneeSelect
          projectId={project.id}
          value={issue.assignee_id}
          onChange={assigneeId => onUpdate({ assignee_id: assigneeId })}
        />
      </SidebarField>

      <SidebarField label="Sprint">
        <SprintSelect
          projectId={project.id}
          value={issue.sprint_id}
          onChange={sprintId => onUpdate({ sprint_id: sprintId })}
        />
      </SidebarField>

      <SidebarField label="Epic">
        <IssuePicker
          projectId={project.id}
          value={issue.epic_id}
          onChange={epicId => onUpdate({ epic_id: epicId })}
          filter={{ type: 'epic' }}
          excludeIds={[issue.id]}
        />
      </SidebarField>

      {/* Custom fields — rendered dynamically from ref data */}
      {ref?.customFields.map(field => (
        <SidebarField key={field.id} label={field.name} required={field.isRequired}>
          <CustomFieldRenderer
            field={field}
            value={issue.custom_fields[field.key]}
            onChange={val => onUpdate({
              custom_fields: { ...issue.custom_fields, [field.key]: val }
            })}
            mode="edit"
          />
        </SidebarField>
      ))}
    </aside>
  );
}
```

### 5.3 KanbanBoardPage

```
Layout: Horizontal scroll of columns

Each column = 1 status
Each card = 1 issue (virtualized within column if > 50 cards)

Header bar:
  [Grouping ▾]  [Display ▾]  [Filter active: 2 ×]  [Sprint: Current ▾]

Column structure:
┌──────────────────┐
│ ● In Progress    │  ← StatusDot + name + count
│                  │
│ [BoardCard]      │  ← draggable
│ [BoardCard]      │
│ [BoardCard]      │
│                  │
│ [+ Add issue]    │  ← quick-create in column
└──────────────────┘
```

```tsx
// features/board/pages/KanbanBoardPage.tsx
export function KanbanBoardPage() {
  const project = useActiveProject()!;
  const { groupBy, draggingCardId, setDragging } = useBoardStore();
  const { data: ref } = useProjectReferenceData(project.id);
  
  const { data: issues } = useQuery({
    queryKey: ['issues', project.id, 'board'],
    queryFn: () =>
      api.get<Issue[]>(`/projects/${project.id}/issues`, {
        params: { per_page: 500, status: 'not:done' }  // board shows active work
      }),
  });

  // Build columns from statuses (they define order via `position`)
  const columns = ref?.statuses.sort((a, b) => a.position - b.position) ?? [];
  
  // Group issues by status_id
  const issuesByStatus = groupBy(issues ?? [], i => i.status_id);

  const updateIssue = useOptimisticIssueUpdate();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDragging(null, null);
    if (!over || active.id === over.id) return;

    const newStatusId = over.data.current?.statusId;
    if (!newStatusId) return;

    // Optimistic update: move card to new column immediately
    updateIssue(active.id as string, { status_id: newStatusId });
  };

  return (
    <DndContext onDragStart={e => setDragging(e.active.id as string, null)} onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {columns.map(status => (
          <BoardColumn
            key={status.id}
            status={status}
            issues={issuesByStatus[status.id] ?? []}
            ref={ref}
          />
        ))}
      </div>
      <DragOverlay>
        {draggingCardId && (
          <BoardCard
            issue={issues?.find(i => i.id === draggingCardId)!}
            ref={ref}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
```

### 5.4 SprintPlanningPage

```
Layout: 2-pane

Left:  Backlog (unassigned to any sprint, sorted by priority)
Right: Sprint issues (target sprint)

Drag from backlog → sprint: assigns issue to sprint
Drag within sprint: reorders
Top shows sprint capacity (story points committed vs velocity)
```

```tsx
// features/sprints/pages/SprintPlanningPage.tsx
export function SprintPlanningPage() {
  const { sprintId } = useParams();
  const project = useActiveProject()!;

  const { data: sprint } = useQuery({
    queryKey: ['sprints', sprintId],
    queryFn: () => api.get<Sprint>(`/sprints/${sprintId}`),
  });

  const { data: backlogIssues } = useQuery({
    queryKey: ['issues', project.id, 'backlog'],
    queryFn: () =>
      api.get<Issue[]>(`/projects/${project.id}/issues`, {
        params: { sprint: 'backlog', sort: 'priority:desc', per_page: 200 }
      }),
  });

  const { data: sprintIssues } = useQuery({
    queryKey: ['sprints', sprintId, 'issues'],
    queryFn: () => api.get<Issue[]>(`/sprints/${sprintId}/issues`),
  });

  const totalPoints = sprintIssues?.reduce((sum, i) => sum + (i.storyPoints ?? 0), 0) ?? 0;

  const addToSprint = useMutation({
    mutationFn: (issueId: string) =>
      api.post(`/sprints/${sprintId}/issues`, { issue_id: issueId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', sprintId, 'issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues', project.id, 'backlog'] });
    },
  });

  return (
    <div className="sprint-planning">
      <SprintCapacityBar committed={totalPoints} velocity={sprint?.teamVelocity} />
      <div className="planning-panes">
        <BacklogPane issues={backlogIssues} onAddToSprint={addToSprint.mutate} />
        <SprintPane sprint={sprint} issues={sprintIssues} />
      </div>
    </div>
  );
}
```

### 5.5 StandupDashboardPage

```
Layout: 3 columns per member

For me:
  Yesterday   → issues moved to Done in last 24h
  Today       → issues In Progress, assigned to me
  Blockers    → issues with "blocks" links where I'm assignee

Team view:
  One row per member, same 3 columns
  Editable: members can type freeform standup notes
```

```tsx
// features/standup/pages/StandupDashboardPage.tsx
export function StandupDashboardPage() {
  const { currentUser } = useAppStore();
  const org = useActiveOrg()!;

  const { data: standup } = useQuery({
    queryKey: ['standup', currentUser?.id],
    queryFn: () => api.get<StandupData>('/me/standup'),
    staleTime: 60_000,   // refresh every minute if page stays open
    refetchInterval: 60_000,
  });

  const { data: teamStandup } = useQuery({
    queryKey: ['standup', 'team', org.id],
    queryFn: () => api.get<TeamStandupData>(`/orgs/${org.slug}/standup`),
    staleTime: 60_000,
  });

  return (
    <div className="standup-dashboard">
      <StandupHeader date={new Date()} />
      <MyStandup data={standup} />
      <Divider />
      <TeamStandup data={teamStandup} />
    </div>
  );
}
```

---

## 6. Component Hierarchy

### 6.1 The Full Tree

```
AppShell
├── Sidebar
│   ├── OrgSwitcher           ← shows all orgs current user belongs to
│   ├── ProjectList           ← projects in active org (collapsible)
│   │   └── ProjectNavItem × N
│   ├── SidebarNavSection "Workspace"
│   │   ├── NavItem: Dashboard
│   │   ├── NavItem: My Issues
│   │   └── NavItem: Standup
│   └── SidebarNavSection "Admin" (conditional on role)
│       ├── NavItem: Members
│       └── NavItem: Settings
│
├── Header
│   ├── Breadcrumb            ← Org > Project > Issues > PROJ-42
│   ├── CommandPaletteButton  ← Cmd+K trigger
│   ├── NotificationBell      ← badge count from Zustand
│   └── UserMenu
│       ├── Avatar
│       ├── Theme Toggle
│       └── Logout
│
└── <Outlet />                ← page content

─── Shared Components ────────────────────────────────────────────

Avatar
  props: user | userId, size: xs/sm/md/lg, showTooltip
  If userId is passed without user object → fetches from React Query cache
  Shows initials if avatar_url is null
  Tooltip shows displayName + email on hover

StatusBadge
  props: status | statusId, projectId (to lookup from ref data)
  Shows colored dot + status name

PriorityBadge
  props: priority enum
  Maps: critical→red, high→orange, medium→yellow, low→blue, none→gray
  Icon + label

IssueIdentifier
  props: issue | { key, number }
  Renders: "PROJ-42" in monospace with project color accent
  Links to issue detail page

UserSelect
  props: projectId, value, onChange, multi
  Wraps AssigneeSelect; used in filters and forms

DatePicker
  Wraps a headless calendar (react-day-picker)
  Handles null, shows "No date" state
  Relative display: "Tomorrow", "In 3 days", "2 weeks ago" (overdue)

EmptyState
  props: title, description, action?, icon?
  Used when list is empty (no issues matching filter, etc.)

─── Issue Components ─────────────────────────────────────────────

IssueRow (list view)
  Props: issue, ref (lookups)
  Layout: [Priority] [Identifier] [Title] [Assignee] [Status] [Due]
  Clickable → IssueDetailPage
  Keyboard: j/k navigation, Enter to open, Space to select (bulk ops)

IssueCard (board view)
  Props: issue, ref, isDragging
  Layout: [Type badge] [Title] [Labels] [Assignee Avatar] [Priority dot]
  Compact variant (cardDensity='compact'): just title + avatar

IssueForm (create/edit modal)
  Fields: type, title, description (Tiptap), status, priority, assignee, labels, sprint, epic, due date, story points, custom fields
  Submit: POST /projects/:id/issues or PATCH /issues/:id
  Smart defaults: status = project default, priority = medium

SubtaskList
  Props: parentIssue, subtasks
  Quick-add inline: input + Enter creates subtask
  Each row: [checkbox] [title] [assignee] → checking moves to Done

LinkedIssuesList
  Props: links (source + target + type)
  Groups by type: "Blocks", "Blocked by", "Relates to", "Duplicates"
  Add link: IssuePicker → POST /issues/:id/links
```

### 6.2 The IssueForm In Depth

The create-issue form is the most used component. Every field maps to an API field.

```tsx
// features/issues/components/IssueForm.tsx
interface IssueFormProps {
  projectId: string;
  defaults?: Partial<IssueCreatePayload>;
  onSuccess: (issue: Issue) => void;
  onCancel: () => void;
}

// Internal form state — not the API payload directly
// because some fields need UI-only state (e.g. label search)
interface IssueFormState {
  type: IssueType;
  title: string;
  description: JSONContent | null;  // Tiptap doc
  statusId: string;
  priority: IssuePriority;
  assigneeId: string | null;
  labelIds: string[];
  sprintId: string | null;
  epicId: string | null;
  dueDate: string | null;
  storyPoints: number | null;
  customFields: Record<string, unknown>;
}

export function IssueForm({ projectId, defaults, onSuccess, onCancel }: IssueFormProps) {
  const { data: ref } = useProjectReferenceData(projectId);
  
  // Default status = the one marked is_default in the project
  const defaultStatus = ref?.statuses.find(s => s.isDefault)?.id ?? null;

  const { register, handleSubmit, control, watch, setValue } = useForm<IssueFormState>({
    defaultValues: {
      type: 'task',
      title: '',
      description: null,
      statusId: defaultStatus ?? '',
      priority: 'medium',
      assigneeId: null,
      labelIds: [],
      sprintId: null,
      epicId: null,
      dueDate: null,
      storyPoints: null,
      customFields: {},
      ...defaults,
    }
  });

  const createIssue = useMutation({
    mutationFn: (data: IssueFormState) =>
      api.post<Issue>(`/projects/${projectId}/issues`, {
        type: data.type,
        title: data.title,
        description: data.description,
        status_id: data.statusId,
        priority: data.priority,
        assignee_id: data.assigneeId,
        label_ids: data.labelIds,
        sprint_id: data.sprintId,
        epic_id: data.epicId,
        due_date: data.dueDate,
        story_points: data.storyPoints,
        custom_fields: data.customFields,
      }),
    onSuccess: (issue) => {
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
      onSuccess(issue);
    },
  });

  return (
    <form onSubmit={handleSubmit(d => createIssue.mutate(d))}>
      {/* Type selector — tabs */}
      <Controller name="type" control={control} render={({ field }) => (
        <IssueTypeTabs value={field.value} onChange={field.onChange} />
      )} />

      {/* Title — autofocused */}
      <Input {...register('title', { required: true })} autoFocus placeholder="Issue title" />

      {/* Description — Tiptap */}
      <Controller name="description" control={control} render={({ field }) => (
        <RichTextEditor
          content={field.value}
          onChange={field.onChange}
          placeholder="Add description..."
          minHeight={120}
        />
      )} />

      {/* Quick-select row */}
      <div className="form-fields-row">
        <Controller name="statusId" control={control} render={({ field }) => (
          <StatusSelect projectId={projectId} value={field.value} onChange={field.onChange} />
        )} />
        <Controller name="priority" control={control} render={({ field }) => (
          <PrioritySelect value={field.value} onChange={field.onChange} />
        )} />
        <Controller name="assigneeId" control={control} render={({ field }) => (
          <AssigneeSelect projectId={projectId} value={field.value} onChange={field.onChange} />
        )} />
        <Controller name="labelIds" control={control} render={({ field }) => (
          <LabelSelect projectId={projectId} value={field.value} onChange={field.onChange} />
        )} />
      </div>

      {/* Advanced — collapsible */}
      <Collapsible label="More options">
        <Controller name="sprintId" control={control} render={({ field }) => (
          <SprintSelect projectId={projectId} value={field.value} onChange={field.onChange} />
        )} />
        <Controller name="epicId" control={control} render={({ field }) => (
          <IssuePicker
            projectId={projectId}
            value={field.value}
            onChange={field.onChange}
            filter={{ type: 'epic' }}
          />
        )} />
        <Controller name="dueDate" control={control} render={({ field }) => (
          <DatePicker value={field.value} onChange={field.onChange} label="Due date" />
        )} />
        <Input type="number" {...register('storyPoints')} placeholder="Story points" min={0} />
        
        {/* Custom fields */}
        {ref?.customFields.map(field => (
          <Controller key={field.id} name={`customFields.${field.key}`} control={control} render={({ field: f }) => (
            <CustomFieldRenderer field={field} value={f.value} onChange={f.onChange} mode="edit" />
          )} />
        ))}
      </Collapsible>

      <div className="form-actions">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={createIssue.isPending}>Create Issue</Button>
      </div>
    </form>
  );
}
```

---

## 7. Data Flow: Issue Detail (end-to-end)

A complete walkthrough of what happens when a user navigates to `PROJ-42`.

```
1. User clicks IssueRow in IssueListPage

2. navigate(`/${org.slug}/${project.slug}/issues/42`)

3. React Router matches /:orgSlug/:projectSlug/issues/:issueNumber

4. Loaders run (if data not in Zustand cache):
   orgLoader   → GET /orgs/acme → setActiveOrg(org)
   projectLoader → GET /orgs/acme/projects/api-platform → setActiveProject(project)

5. IssueDetailPage renders
   - Reads project from Zustand (already there)
   - Builds issueRef = "APIP-42"
   - useQuery(['issues', 'APIP-42']) fires:
     GET /api/v1/issues/APIP-42
     Response: full IssueDetail with nested project + org slugs

6. useProjectReferenceData(project.id) fires (if not cached):
   GET /api/v1/projects/:id/reference-data
   Builds lookup maps

7. Component renders:
   - issue.status_id → ref.lookups.statusesById.get(id) → { name, color }
   - issue.assignee_id → ref.lookups.membersById.get(id) → { displayName, avatarUrl }
   - issue.label_ids → map over ref.lookups.labelsById → [{ name, color }]
   - issue.custom_fields → ref.customFields → render CustomFieldRenderer per field

8. User changes status (clicks StatusSelect, picks "In Review")
   → onChange("new-status-uuid") fires
   → useOptimisticIssueUpdate is called:

     a. queryClient.cancelQueries(['issues', 'APIP-42'])
     b. snapshot = queryClient.getQueryData(['issues', 'APIP-42'])
     c. queryClient.setQueryData(['issues', 'APIP-42'], old => ({
          ...old, status_id: "new-status-uuid"
        }))
        ← UI updates instantly, no flash

     d. PATCH /api/v1/issues/APIP-42 { status_id: "new-status-uuid" }

     e. onError: setQueryData back to snapshot, toast("Update failed")
     f. onSettled: invalidateQueries(['issues', 'APIP-42'])
        ← refetch to get server truth (timestamps, updated_at)

9. Server writes activity_log entry:
   { action: "status_changed", old: {...}, new: {...} }

10. WebSocket broadcasts to all clients in that org:
    { type: "issue:updated", issueId: "uuid", projectId: "uuid" }

11. Other clients receive WS event:
    → invalidateQueries(['issues', issueId]) on their side
    → their issue detail or board re-renders with new status
```

---

## 8. Optimistic Updates & Error Recovery

### 8.1 The Shared Hook

```ts
// hooks/useOptimisticIssueUpdate.ts
export function useOptimisticIssueUpdate(issueRef?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ref, update }: { ref: string; update: Partial<IssueUpdatePayload> }) =>
      api.patch<Issue>(`/issues/${ref}`, update),

    onMutate: async ({ ref, update }) => {
      const queryKey = ['issues', ref];
      
      // Cancel any outgoing refetches for this issue
      await queryClient.cancelQueries({ queryKey });

      // Snapshot before the optimistic update
      const previousIssue = queryClient.getQueryData<IssueDetail>(queryKey);

      // Optimistically update
      queryClient.setQueryData<IssueDetail>(queryKey, old => old ? { ...old, ...update } : old);

      // Also update in any list queries that contain this issue
      // (board, issue list) — find and update in-place
      queryClient.setQueriesData<PaginatedResponse<Issue>>(
        { queryKey: ['issues'], type: 'active' },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages?.map(page => ({
              ...page,
              items: page.items.map(i =>
                i.id === previousIssue?.id ? { ...i, ...update } : i
              )
            }))
          };
        }
      );

      return { previousIssue, queryKey };
    },

    onError: (err, variables, context) => {
      if (context?.previousIssue) {
        queryClient.setQueryData(context.queryKey, context.previousIssue);
      }
      toast.error(`Failed to update issue: ${err.message}`);
    },

    onSettled: (data, error, { ref }) => {
      queryClient.invalidateQueries({ queryKey: ['issues', ref] });
    },
  });
}

// Usage in any component:
const updateIssue = useOptimisticIssueUpdate();
updateIssue.mutate({ ref: 'APIP-42', update: { status_id: newStatusId } });
```

### 8.2 Conflict Detection

When two users edit the same issue simultaneously, the server uses `updated_at` for optimistic locking:

```ts
// PATCH /issues/:ref
// Body includes: { ...update, expected_updated_at: "2024-01-01T10:00:00Z" }

// Server: if issue.updated_at !== expected_updated_at → 409 Conflict

// Client handles 409:
onError: (err) => {
  if (err.status === 409) {
    // Someone else updated this issue while you were editing
    queryClient.invalidateQueries(['issues', ref]);  // get fresh data
    toast.warning("Issue was updated by another user. Your changes have been discarded.");
  }
}
```

---

## 9. Real-time: WebSocket → Query Cache

### 9.1 Connection Setup

```ts
// hooks/useWebSocket.ts
export function useWebSocket() {
  const { currentUser } = useAppStore();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!currentUser) return;

    const socket = io('/ws', {
      auth: { token: getAccessToken() },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('[WS] Connected');
    });

    // Subscribe to events — just invalidate React Query cache
    // No complex client-side state management
    socket.on('issue:created', ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
    });

    socket.on('issue:updated', ({ issueId, projectId, issueRef }) => {
      queryClient.invalidateQueries({ queryKey: ['issues', issueRef] });
      queryClient.invalidateQueries({ queryKey: ['issues', projectId] });
    });

    socket.on('comment:added', ({ issueId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
    });

    socket.on('sprint:updated', ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-ref', projectId] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    });

    socket.on('notification', (notification) => {
      useAppStore.getState().incrementNotifications();
      toast.custom(<NotificationToast notification={notification} />);
    });

    socket.on('project:ref_updated', ({ projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-ref', projectId] });
    });

    return () => { socket.disconnect(); };
  }, [currentUser?.id]);
}
```

The `useWebSocket` hook is called once in `AppShell`. It doesn't manage issue data — it just pokes React Query to refetch, which then propagates to every subscribed component automatically.

---

## 10. Permissions in the UI

### 10.1 The Hook

```ts
// hooks/usePermissions.ts
export type Permission =
  | 'issue:create' | 'issue:update' | 'issue:delete'
  | 'sprint:manage' | 'project:admin' | 'member:invite' | 'billing:manage';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  viewer:  ['issue:read'],
  member:  ['issue:read', 'issue:create', 'issue:update'],
  admin:   ['issue:read', 'issue:create', 'issue:update', 'issue:delete',
             'sprint:manage', 'project:admin', 'member:invite'],
  owner:   ['*'],   // all permissions
};

export function usePermissions() {
  const { currentUser } = useAppStore();
  const project = useActiveProject();
  const org = useActiveOrg();

  // Effective role: max(org role, project role)
  const orgRole = currentUser?.orgMemberships?.[org?.id ?? '']?.role ?? 'viewer';
  const projectRole = currentUser?.projectMemberships?.[project?.id ?? '']?.role;
  const effectiveRole = maxRole(orgRole, projectRole);

  const can = (permission: Permission): boolean => {
    if (effectiveRole === 'owner') return true;
    return ROLE_PERMISSIONS[effectiveRole]?.includes(permission) ?? false;
  };

  return { can, role: effectiveRole };
}
```

### 10.2 Usage Patterns

```tsx
// Conditional rendering
const { can } = usePermissions();

{can('issue:create') && (
  <Button onClick={openCreateIssueModal}>+ New Issue</Button>
)}

{can('issue:delete') && (
  <DropdownItem onClick={handleDelete} variant="destructive">
    Delete Issue
  </DropdownItem>
)}

// Disabled state (better UX than hiding — user knows feature exists)
<Button
  disabled={!can('sprint:manage')}
  title={!can('sprint:manage') ? 'Only admins can manage sprints' : undefined}
  onClick={startSprint}
>
  Start Sprint
</Button>

// Page-level guard
export function ProjectSettingsPage() {
  const { can } = usePermissions();
  if (!can('project:admin')) return <AccessDeniedPage />;
  // ...
}
```

### 10.3 The CurrentUser Object

To avoid an extra API call for permissions, the `/auth/me` endpoint returns the user with all membership roles pre-computed:

```ts
// GET /auth/me response:
interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  
  // All org memberships this user has
  orgMemberships: Record<string, { role: OrgRole; orgId: string; }>;
  
  // All project memberships (only for projects user has explicit project-level role)
  projectMemberships: Record<string, { role: ProjectRole; projectId: string; }>;
}
```

Org and project memberships are updated in Zustand after any membership change and re-fetched on navigation.

---

*Frontend Deep Dive v1.0 — May 2026*
