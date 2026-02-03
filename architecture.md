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

## Visual Design System (d.tech Branding)

The application uses Design Tech High School's established brand identity.

### Color Palette

```css
:root {
  /* Brand Colors */
  --brand-primary: #E94E1B;    /* d.tech Orange (Persimmon) */
  --brand-dark: #2D2D2D;       /* Footer/Charcoal */
  --brand-light: #FFFFFF;      /* Clean white */

  /* Text Colors */
  --text-main: #333333;        /* Primary text on light bg */
  --text-inverse: #FFFFFF;     /* Text on dark bg */
  --text-muted: #999999;       /* Secondary/help text */

  /* Traffic Light Colors */
  --status-green: #22C55E;     /* OK / Go ahead */
  --status-yellow: #EAB308;    /* Ask first / Depends */
  --status-red: #EF4444;       /* Not allowed */

  /* Typography */
  --font-family-sans: 'Open Sans', 'Roboto', sans-serif;
  --font-heading-weight: 700;
  --font-body-weight: 400;

  /* UI Components */
  --border-radius-card: 12px;
  --border-radius-btn: 6px;
  --border-width-card: 3px;
}
```

### Typography

- **Headings**: Bold (700), geometric sans-serif
- **Body**: Regular (400), clean and legible
- **Navigation**: Uppercase, tracking-adjusted
- **Buttons**: Uppercase labels, white text on orange

### UI Components

| Element | Specification |
|---------|--------------|
| Buttons | Solid orange (#E94E1B), white text, rounded (6px), uppercase |
| Cards | White background, 3px orange border, rounded (12px) |
| Icons | Flat, single-color orange, simple silhouettes |
| Footer | Charcoal background (#2D2D2D), white text |

### Nano Banana Pro Style Keywords

For prompt generation, include these style directives:
```
Style: Clean, minimalist, flat vector design.
Colors: Vibrant Persimmon Orange (#E94E1B) for accents, white background, charcoal text.
Typography: Modern geometric sans-serif (Roboto style), bold headings.
Aesthetic: Academic yet innovative, Silicon Valley tech aesthetic, high contrast.
Constraints: No gradients, no drop shadows, purely flat design.
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

### 2. Edit Mode Behavior (Modal with Constrained Operations)

**Decision**: Use a **modal dialog** for category editing.

**Rationale**:
- Clear state separation (editing vs. configuring)
- Prevents accidental structural changes
- Easier to implement cancel/confirm flow
- Reduces edge cases vs. inline editing

**Modal UI**:
```
┌─────────────────────────────────────────────────────────┐
│  Edit Categories                                    [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ▼ Research & Sources          [Rename] [Delete]       │
│    ├─ Finding sources          [Rename] [Delete]       │
│    ├─ Summarizing articles     [Rename] [Delete]       │
│    └─ [+ Add sub-item]                                 │
│                                                         │
│  ▼ Writing                     [Rename] [Delete]       │
│    └─ ...                                              │
│                                                         │
│  [+ Add Category]                                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ⚠ Saving will reset all traffic light selections.     │
│                                                         │
│              [Cancel]              [Save Changes]       │
└─────────────────────────────────────────────────────────┘
```

**Allowed Operations** (constrained to reduce edge cases):
| Operation | Scope | Notes |
|-----------|-------|-------|
| Add category | Top level | Creates new trunk with no children |
| Add sub-item | Under any item | Max depth enforced (3 levels) |
| Rename | Any item | Inline text edit |
| Delete | Any item | Confirms if has children; deletes recursively |
| Reorder | Same level only | Up/down buttons (no drag-drop) |

**NOT Allowed** (to avoid complexity):
- Moving items between parents
- Drag-and-drop reordering
- Copy/paste items
- Bulk operations

**Error Handling**:
All edit errors show inline, human-readable messages:
- "Category name cannot be empty"
- "Maximum depth reached (3 levels)"
- "A category with this name already exists"
- "Cannot delete: please remove sub-items first" (if we want non-recursive delete)

**On Save**:
1. Validate tree structure
2. Show confirmation: "This will reset your color selections. Continue?"
3. If confirmed: save structure, reset all statuses to defaults, close modal
4. If cancelled: discard changes, close modal

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

## Resolved Decisions

| Question | Decision |
|----------|----------|
| School branding | d.tech brand: Orange #E94E1B, Charcoal #2D2D2D, geometric sans-serif |
| Category editing UI | Modal dialog with constrained operations |
| Default categories | Consensus lists developed via multi-perspective review |

---

## Default Category Lists (Final Consensus)

Developed through 24-teacher simulation (4 per department) with varying AI perspectives.
Refined through "brutal copy editor" pass for poster readability.

**Design Principles:**
- **3 categories max** per department (poster-scannable)
- **8-10 items max** per department (readable at a glance)
- **GREEN** = AI explains TO you (learning)
- **YELLOW** = Ask your teacher first (context matters)
- **RED** = AI does it FOR you (not allowed)

---

### English (9 items)

```
UNDERSTANDING
├─ Explain concepts & vocabulary   [GREEN]
├─ Summarizing sources             [YELLOW]
└─ Interpreting text for you       [RED]

WRITING
├─ Brainstorming & outlining       [GREEN]
├─ Feedback on YOUR draft          [GREEN]
└─ Writing or rewriting for you    [RED]

REVISING
├─ Grammar & spelling              [GREEN]
├─ Style suggestions               [YELLOW]
└─ Paraphrasing for you            [RED]
```

---

### Math (9 items)

```
UNDERSTANDING
├─ Explain a concept               [GREEN]
├─ "Why does this work?"           [GREEN]
├─ Visualize & graph               [GREEN]
└─ Find my mistake                 [YELLOW]

SOLVING
├─ Assigned problems               [RED]
├─ Setting up word problems        [RED]
└─ Step-by-step solutions          [RED]

PRACTICING
├─ Generate practice problems      [GREEN]
└─ Check answers (after attempt)   [YELLOW]
```

---

### Science (10 items)

```
UNDERSTANDING
├─ Explain concepts                [GREEN]
├─ Safety information              [GREEN]
└─ Background research             [GREEN]

LAB WORK
├─ Hypothesis & design             [RED]
├─ Collecting data                 [RED]
├─ Writing procedures              [RED]
├─ Interpreting results            [RED]
└─ Grammar & editing               [GREEN]

DATA & WRITING
├─ Checking calculations           [GREEN]
└─ Writing analysis/lit review     [RED]
```

---

### Social Studies (9 items)

```
UNDERSTANDING
├─ Define terms & concepts         [GREEN]
├─ Background context              [YELLOW]
└─ Explore perspectives            [YELLOW]

RESEARCH
├─ Finding source types            [GREEN]
├─ Summarizing sources for you     [RED]
└─ Recent events & data            [RED]

WRITING
├─ Brainstorming & outlining       [GREEN]
├─ Grammar & spelling              [GREEN]
└─ Your analysis & thesis          [RED]
```

---

### Maker (10 items)

```
LEARNING
├─ Explain concepts & tools        [GREEN]
├─ Research & references           [GREEN]
├─ Safety information              [GREEN]
└─ Understanding errors            [GREEN]

CREATING
├─ Brainstorming ideas             [GREEN]
├─ AI-generated designs/models     [RED]
├─ AI-generated code               [RED]
└─ Solving problems for you        [YELLOW]

DOCUMENTING
├─ Spelling & grammar              [GREEN]
└─ Writing your reflection         [RED]
```

---

### Foreign Language (10 items)

```
UNDERSTANDING
├─ Word & phrase lookup            [GREEN]
├─ Grammar rule explanations       [GREEN]
├─ Pronunciation practice          [GREEN]
└─ AI summarizes text for you      [RED]

PRACTICING
├─ Flashcards & study tools        [GREEN]
├─ AI conversation partner         [YELLOW]
└─ Exercise answers                [RED]

PRODUCING
├─ Grammar check on YOUR draft     [YELLOW]
├─ Sentence/text translation       [RED]
└─ AI writes for you               [RED]
```

---

### Summary Statistics

| Department | Categories | Items | GREEN | YELLOW | RED |
|------------|------------|-------|-------|--------|-----|
| English | 3 | 9 | 4 | 2 | 3 |
| Math | 3 | 9 | 5 | 2 | 3 |
| Science | 3 | 10 | 5 | 0 | 5 |
| Social Studies | 3 | 9 | 4 | 2 | 3 |
| Maker | 3 | 10 | 6 | 1 | 3 |
| Foreign Language | 3 | 10 | 4 | 2 | 4 |

### Key Changes from Initial Draft

| Change | Rationale |
|--------|-----------|
| Reduced from 4-6 categories to 3 | Poster readability |
| Reduced from 12-16 items to 9-10 | Quick scanning |
| Merged redundant items | "Explain concepts" + "vocabulary" = one item |
| Added missing critical items | Safety (Science, Maker), Find my mistake (Math) |
| Clarified YELLOW meaning | "Ask your teacher first" |
| Made Science more restrictive | Lab work is the core skill; protect it |
| Consolidated Foreign Lang lookups | 3 redundant items → 1 |

---

## Checklist Before Implementation

- [x] Confirm data model meets needs
- [x] Confirm component breakdown is correct
- [x] Confirm prompt format is accurate
- [x] Get school branding details
- [x] Finalize default categories for all 6 departments
