# Handoff Document: Department Policy Graphic Creator

**Date**: 2026-02-03
**Branch**: `main` (Phases 1-3 complete)
**Tests**: 109 passing

---

## Project Overview

A frontend-only web app for d.tech High School. Staff select their department, configure AI usage policies via traffic lights (green/yellow/red), and generate a Nano Banana Pro prompt for creating classroom posters.

**Key docs:**
- `architecture.md` - Full system design, data model, behavioral rules
- `claude.md` - Development principles (TDD, error handling, separation of concerns)

---

## Current State

### Completed (Phases 1-3)

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ | Project foundation - package.json, Jest, CSS variables, HTML shell |
| 2 | ✅ | Data layer - utils, services, default JSON files for 6 departments |
| 3 | ✅ | State management (AppState) and PromptService |

### Remaining (Phases 4-5)

| Phase | Status | Description |
|-------|--------|-------------|
| 4 | 🔲 | UI components - wire up DOM rendering |
| 5 | 🔲 | Integration - main.js, CategoryEditor modal |

---

## File Structure

```
src/
├── index.html              # ✅ Shell ready, needs JS wiring
├── main.js                 # 🔲 NOT CREATED - entry point
├── components/             # 🔲 EMPTY - need to create:
│   ├── DepartmentSelector.js
│   ├── CategoryTree.js
│   ├── TrafficLight.js
│   ├── CommentField.js
│   ├── Preview.js
│   ├── PromptOutput.js
│   └── CategoryEditor.js   # Modal for editing structure
├── services/               # ✅ Complete
│   ├── CategoryService.js
│   ├── DefaultsService.js
│   ├── PromptService.js
│   └── StorageService.js
├── state/                  # ✅ Complete
│   └── AppState.js
├── utils/                  # ✅ Complete
│   ├── escapeHtml.js
│   ├── generateId.js
│   └── treeUtils.js
├── data/defaults/          # ✅ Complete - 6 JSON files
└── styles/                 # ✅ Complete
    ├── variables.css
    ├── main.css
    └── components.css

tests/                      # ✅ 109 tests passing
├── services/
├── state/
└── utils/
```

---

## What Phase 4 Needs

### 1. Create `src/main.js`

Entry point that:
- Imports AppState and all components
- Calls `AppState.init()` on DOMContentLoaded
- Renders initial UI
- Sets up event delegation

```javascript
// Pseudocode structure
import { AppState } from './state/AppState.js';
import { DepartmentSelector } from './components/DepartmentSelector.js';
// ... other imports

document.addEventListener('DOMContentLoaded', () => {
  AppState.init();

  // Initial render
  DepartmentSelector.render(document.querySelector('[data-testid="department-nav"]'));

  // Subscribe to state changes
  AppState.subscribe((state) => {
    CategoryTree.render(state.categories);
    Preview.render(state);
    PromptOutput.render(state);
  });
});
```

### 2. Create UI Components

Each component should follow this pattern:

```javascript
export const ComponentName = {
  render(container, data) {
    container.innerHTML = this.generateHtml(data);
    this.attachEventListeners(container);
  },

  generateHtml(data) {
    // Return HTML string
  },

  attachEventListeners(container) {
    // Use event delegation where possible
  }
};
```

**Components to create:**

| Component | Renders | Events |
|-----------|---------|--------|
| `DepartmentSelector` | 6 department buttons | Click → `AppState.selectDepartment()` |
| `CategoryTree` | Categories with items, traffic lights, comments | Status change, comment input |
| `TrafficLight` | Radio button group (green/yellow/red) | Change → `AppState.setStatus()` |
| `CommentField` | Text input | Input → `AppState.setComment()` |
| `Preview` | Poster preview HTML | None (display only) |
| `PromptOutput` | Prompt text + copy button | Click → copy to clipboard |
| `CategoryEditor` | Modal for editing structure | Add/rename/delete/reorder |

### 3. Wire Up Modal

The edit modal (`#edit-modal`) needs:
- Open on "Edit Categories" button click
- Close on Cancel, X, or outside click
- Save → `AppState.updateCategories()`
- Working add/rename/delete/reorder within modal

---

## Key APIs to Use

### AppState (already complete)

```javascript
import { AppState } from './state/AppState.js';

AppState.init();                           // Load from localStorage
AppState.selectDepartment('English');      // Switch department
AppState.setStatus(nodeId, 'green');       // Update traffic light
AppState.setComment(nodeId, 'text');       // Update comment
AppState.resetToDefaults();                // Reset current dept
AppState.updateCategories(newTree);        // Save edited structure
AppState.subscribe(callback);              // React to changes
AppState.getState();                       // Get current state
```

### PromptService (already complete)

```javascript
import { PromptService } from './services/PromptService.js';

PromptService.generatePrompt(department, categories);     // For copy button
PromptService.generatePreviewHtml(department, categories); // For preview panel
```

### DefaultsService (already complete)

```javascript
import { DefaultsService } from './services/DefaultsService.js';

DefaultsService.getDepartments();                 // ['English', 'Math', ...]
DefaultsService.getDefaultCategories('English');  // Default tree
```

---

## Testing Notes

- Run tests: `npm test`
- Tests use Jest with ES modules (`--experimental-vm-modules`)
- DOM tests need `jest-environment-jsdom` (already configured)
- All interactive elements have `data-testid` attributes

---

## Style Notes

- d.tech branding: Orange `#E94E1B`, Charcoal `#2D2D2D`
- CSS variables in `src/styles/variables.css`
- Component styles in `src/styles/components.css`
- Traffic light styling already done (`.traffic-light`, `.status-green`, etc.)
- Modal styling already done (`.modal`, `.modal-content`, etc.)

---

## Behavioral Rules (from architecture.md)

1. **Parents never have status** - only leaf items get traffic lights
2. **New items default to RED** - conservative default
3. **Edit modal resets everything** - statuses AND comments cleared on structure save
4. **Delete is recursive** - deleting parent deletes all children
5. **No expand/collapse** - static nested list, always visible
6. **1200px minimum width** - horizontal scroll below that

---

## Quick Start for Next Session

```bash
# Verify current state
npm test              # Should show 109 passing

# Create new branch
git checkout -b claude/implementation-phase4-[session-id]

# Start with main.js
touch src/main.js
# Then create components one by one with tests
```

**Priority order:**
1. `main.js` + `DepartmentSelector` (get something rendering)
2. `CategoryTree` + `TrafficLight` + `CommentField` (core editing)
3. `Preview` + `PromptOutput` (output side)
4. `CategoryEditor` (modal - most complex)

---

## Potential Gotchas

1. **ES modules in browser** - Use `type="module"` in script tag (already in index.html)
2. **JSON imports** - Need `with { type: 'json' }` syntax
3. **localStorage mock** - Already set up in tests, import `jest` from `@jest/globals`
4. **Event delegation** - Prefer delegating to parent containers vs. individual listeners
