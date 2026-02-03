# Architecture: Department Policy Graphic Creator

## Mission Statement

A student-facing infographic generator that helps answer "Is it OK if I use AI for ____?" questions, customized per department. Staff select their department, configure AI usage policies via a traffic-light system, preview the result, and generate an AI image prompt for poster creation.

## User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. SELECT DEPARTMENT                                                    │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│     │ English  │ │  Math    │ │ Science  │ │  Social  │ │  Maker   │...│
│     └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. CONFIGURE POLICIES                      │  3. LIVE PREVIEW          │
│  ┌────────────────────────────────────────┐ │ ┌───────────────────────┐ │
│  │ [Edit Categories]  [Reset to Defaults] │ │ │                       │ │
│  ├────────────────────────────────────────┤ │ │   Student-facing      │ │
│  │ ▼ Research & Sources                   │ │ │   poster preview      │ │
│  │   ├─ Finding sources      🔴 ___       │ │ │                       │ │
│  │   ├─ Summarizing sources  🟡 ___       │ │ │   (updates live)      │ │
│  │   └─ Citing sources       🟢 ___       │ │ │                       │ │
│  │ ▼ Writing                              │ │ │                       │ │
│  │   ├─ Brainstorming        🟢 ___       │ │ │                       │ │
│  │   ├─ First drafts         🔴 ___       │ │ │                       │ │
│  │   └─ Editing/proofreading 🟡 ___       │ │ │                       │ │
│  └────────────────────────────────────────┘ │ └───────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. GENERATE OUTPUT                                                      │
│     ┌──────────────────────────────────────────────────────────────┐    │
│     │  Nano Banana Pro Prompt                            [Copy]    │    │
│     │  ─────────────────────────────────────────────────────────   │    │
│     │  Create a 16:9 infographic about AI usage policies for...    │    │
│     └──────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Model

### Category Tree Structure

Maximum depth: 3 levels (trunk → branch → leaf)

```javascript
{
  "department": "English",
  "categories": [
    {
      "id": "research",
      "label": "Research & Sources",
      "comment": "",           // optional trunk comment
      "status": null,          // null = "depends on sub-item" (has children)
      "children": [
        {
          "id": "research-finding",
          "label": "Finding sources",
          "comment": "",
          "status": "red",     // "red" | "yellow" | "green" | null
          "children": []       // empty = leaf node
        },
        {
          "id": "research-summarizing",
          "label": "Summarizing articles",
          "comment": "Only for initial understanding",
          "status": "yellow",
          "children": []
        }
      ]
    },
    {
      "id": "brainstorming",
      "label": "Brainstorming ideas",  // flat item (no children)
      "comment": "",
      "status": "green",
      "children": []
    }
  ]
}
```

### Status Rules

| Scenario | Default Status | Can Set Status? |
|----------|---------------|-----------------|
| Leaf node (no children) | `"red"` | Yes |
| Parent with children | `null` | Optional (implies "depends") |
| Flat item (no children) | `"red"` | Yes |

### Persistence Schema (localStorage)

```javascript
// Key: "dppgc_state"
{
  "selectedDepartment": "English",
  "departments": {
    "English": {
      "categories": [...],      // edited tree structure
      "isCustomized": false     // true if user edited structure
    },
    "Math": { ... }
  }
}
```

## Component Architecture

```
src/
├── index.html                 # Single page app shell
├── main.js                    # Entry point, bootstrapping
│
├── components/                # UI Components (DOM manipulation only)
│   ├── DepartmentSelector.js  # Department button group
│   ├── CategoryTree.js        # Recursive tree renderer
│   ├── CategoryEditor.js      # Modal/panel for editing structure
│   ├── TrafficLight.js        # 🔴🟡🟢 selector widget
│   ├── CommentField.js        # Inline comment input
│   ├── Preview.js             # Right-side preview panel
│   └── PromptOutput.js        # Generated prompt + copy button
│
├── services/                  # Business Logic (no DOM)
│   ├── StorageService.js      # localStorage read/write
│   ├── CategoryService.js     # Tree manipulation, validation
│   ├── PromptService.js       # Nano Banana prompt generation
│   └── DefaultsService.js     # Load default categories per dept
│
├── state/                     # Reactive State Management
│   └── AppState.js            # Central state + subscriptions
│
├── data/                      # Static Data
│   └── defaults/              # Default category trees
│       ├── english.json
│       ├── math.json
│       ├── science.json
│       ├── social-studies.json
│       ├── maker.json
│       └── foreign-language.json
│
├── utils/                     # Pure Functions
│   ├── escapeHtml.js          # XSS prevention
│   ├── generateId.js          # Unique ID generation
│   └── treeUtils.js           # Tree traversal helpers
│
└── styles/
    ├── main.css               # Layout, variables
    ├── components.css         # Component-specific styles
    └── preview.css            # Preview-specific styles
```

## Key Design Decisions

### 1. Side-by-Side Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header: Department Selector                             │
├──────────────────────────┬──────────────────────────────┤
│  Editor Panel (60%)      │  Preview Panel (40%)         │
│  - Category tree         │  - Live preview              │
│  - Traffic lights        │  - Prompt output             │
│  - Comments              │  - Copy button               │
│  - Edit/Reset buttons    │                              │
└──────────────────────────┴──────────────────────────────┘
```

Target: MacBook Air screens (~1440px width minimum)

### 2. Edit Mode Behavior

When user clicks "Edit Categories":
- Opens a modal or transforms the tree into edit mode
- Can: add, delete, rename, reorganize items
- On save: **resets all traffic light selections** (simpler than diffing)
- Shows confirmation: "This will reset your color selections. Continue?"

### 3. Preview Updates

- **Live updates** as user changes traffic lights/comments
- No separate "render" button needed
- Preview shows exactly what will inform the prompt

### 4. Prompt Generation (Nano Banana Pro)

Output format:
```
Create a 16:9 infographic about AI usage policies for [Department] classes.
Use a clean, minimalist, flat vector style with [school color palette].

Title: "AI in [Department]: What's OK?"

Sections:
✓ GREEN (Go Ahead):
  - [Item]: [comment if any]
  - [Item]

⚠ YELLOW (Ask First):
  - [Item]: [comment if any]

✗ RED (Not Allowed):
  - [Item]: [comment if any]

Layout: Vertical poster format, traffic light color coding (green/yellow/red).
Include icons for each section. Clean typography, readable from 10 feet away.
Target resolution: 4K for large format printing.
```

### 5. Semantic HTML Structure

```html
<body>
  <header role="banner">
    <h1>Department AI Policy Creator</h1>
    <nav aria-label="Department selection">
      <button aria-pressed="true">English</button>
      <button aria-pressed="false">Math</button>
      <!-- ... -->
    </nav>
  </header>

  <main>
    <section aria-label="Policy editor" class="editor-panel">
      <div class="toolbar">
        <button>Edit Categories</button>
        <button>Reset to Defaults</button>
      </div>
      <form aria-label="AI usage policies">
        <ul role="tree" aria-label="Policy categories">
          <li role="treeitem" aria-expanded="true">
            <span class="category-label">Research & Sources</span>
            <ul role="group">
              <li role="treeitem">
                <span class="item-label">Finding sources</span>
                <fieldset class="traffic-light">
                  <legend class="visually-hidden">AI usage for Finding sources</legend>
                  <input type="radio" name="research-finding" value="green" id="rf-green">
                  <label for="rf-green">OK</label>
                  <!-- ... -->
                </fieldset>
                <label>
                  <span class="visually-hidden">Comment for Finding sources</span>
                  <input type="text" placeholder="Add clarification...">
                </label>
              </li>
            </ul>
          </li>
        </ul>
      </form>
    </section>

    <aside aria-label="Preview" class="preview-panel">
      <article class="poster-preview">
        <!-- Generated preview content -->
      </article>
      <section aria-label="Prompt output">
        <h2>Nano Banana Pro Prompt</h2>
        <pre><code><!-- Generated prompt --></code></pre>
        <button>Copy to Clipboard</button>
      </section>
    </aside>
  </main>
</body>
```

### 6. Data Attributes for Testing

All interactive elements include `data-testid` attributes:

```html
<button data-testid="dept-english">English</button>
<input data-testid="status-research-finding-green" type="radio">
<button data-testid="copy-prompt">Copy to Clipboard</button>
```

## Testing Strategy

### Headless (No DOM) - Jest

| Layer | What to Test |
|-------|--------------|
| `services/StorageService` | Read/write/clear, handles missing data |
| `services/CategoryService` | Tree operations, validation, ID generation |
| `services/PromptService` | Prompt formatting, handles all status combinations |
| `services/DefaultsService` | Loads correct defaults per department |
| `state/AppState` | State transitions, subscriber notifications |
| `utils/*` | Pure function edge cases |

### DOM Tests - Jest + jsdom

| Component | What to Test |
|-----------|--------------|
| `DepartmentSelector` | Renders all 6, fires selection event, shows active |
| `CategoryTree` | Renders nested structure, expands/collapses |
| `TrafficLight` | Three states, keyboard accessible |
| `CommentField` | Input updates state, placeholder text |
| `Preview` | Renders from state, omits empty comments |
| `PromptOutput` | Generates correct format, copy button works |

### Integration Tests

1. Full flow: Select dept → Set lights → Verify preview → Copy prompt
2. Persistence: Set state → Reload page → State restored
3. Edit flow: Edit categories → Confirm reset → Verify lights cleared

## Out of Scope (Explicit No)

To prevent feature creep, these are **not** in v1:

- ❌ Multi-department management in one session
- ❌ Export/import configuration files
- ❌ Share configurations with colleagues
- ❌ User accounts / cloud sync
- ❌ Mobile/tablet optimization
- ❌ Print stylesheet (users print from AI-generated image)
- ❌ Undo/redo for edits
- ❌ Drag-and-drop reordering (use simple up/down buttons if needed)

## Open Questions

1. **School branding**: Do you have specific colors/fonts to include, or should I create a placeholder theme system?

2. **Default category content**: Should I draft initial category lists for each department, or do you have existing materials to reference?

3. **Category editing UI**: Preference between:
   - Modal dialog (overlay)
   - Inline editing (transform tree in place)
   - Separate "edit mode" page/view

---

## Checklist Before Implementation

- [ ] Confirm data model meets needs
- [ ] Confirm component breakdown is correct
- [ ] Confirm prompt format is accurate
- [ ] Get school branding details (or confirm placeholder OK)
- [ ] Draft default categories for at least 1 department as example
