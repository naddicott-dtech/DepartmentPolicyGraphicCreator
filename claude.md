# Department Policy Graphic Creator - Claude Development Guide

## Project Overview

A frontend-only web application for creating department policy graphics, hosted on GitHub Pages. This project uses vanilla JavaScript with a modular architecture—no build step required for deployment.

## Core Development Principles

### 1. Test-Driven Development (TDD)

**Always follow the Red-Green-Refactor cycle:**

1. **Red**: Write a failing test first that describes the expected behavior
2. **Green**: Write the minimum code necessary to make the test pass
3. **Refactor**: Clean up the code while keeping tests green

**Testing requirements:**
- Use Jest for unit testing
- All new features must have tests written BEFORE implementation
- Aim for >80% code coverage on business logic
- Run tests before committing: `npm test`
- Use descriptive test names: `it('should calculate total when items are added')`

**Test file organization:**
```
src/
  components/
    Button.js
tests/
  components/
    Button.test.js
```

### 2. Verification & Quality Checks

**Before considering any task complete:**

- [ ] Run the full test suite: `npm test`
- [ ] Verify no console errors in browser
- [ ] Check that the feature works manually in the browser
- [ ] Validate HTML if applicable: ensure semantic structure

**Use subagents for verification:**
- When implementing complex features, spawn a verification subagent to review the implementation
- Subagents should independently check that tests pass and code meets requirements

### 3. Error Handling - Never Swallow Errors

**Mandatory error handling practices:**

```javascript
// BAD - Swallowing errors
try {
  riskyOperation();
} catch (e) {
  // Silent failure - NEVER DO THIS
}

// GOOD - Proper error handling
try {
  riskyOperation();
} catch (error) {
  console.error('Failed to perform risky operation:', error);
  showUserFriendlyError('Something went wrong. Please try again.');
  // Re-throw if the caller needs to know
  throw error;
}
```

**Error handling rules:**
- Always log errors with context (what operation failed, relevant data)
- Display user-friendly messages for recoverable errors
- Let fatal errors propagate up (don't catch what you can't handle)
- Use custom error classes for domain-specific errors
- Never use empty catch blocks

### 4. Separation of Concerns

**Project follows a layered architecture:**

```
src/
├── components/     # UI components (rendering only)
├── services/       # Business logic & data operations
├── utils/          # Pure utility functions
├── state/          # State management
├── styles/         # CSS files
└── index.html      # Entry point
```

**Layer responsibilities:**

| Layer | Responsibility | Can Import From |
|-------|---------------|-----------------|
| `components/` | DOM manipulation, event binding, rendering | services, utils, state |
| `services/` | Business logic, data transformation | utils |
| `utils/` | Pure functions, helpers | (nothing) |
| `state/` | Application state management | utils |
| `styles/` | Visual presentation | (nothing) |

**Key rules:**
- Components should NOT contain business logic
- Services should NOT manipulate the DOM
- Utils should be pure functions with no side effects
- Keep files focused—one primary responsibility per file

## Tech Stack

- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with CSS Custom Properties
- **Testing**: Jest with jsdom
- **Hosting**: GitHub Pages (static files only)
- **Package Manager**: npm

## Project Structure

```
DepartmentPolicyGraphicCreator/
├── src/
│   ├── index.html          # Main entry point
│   ├── components/         # UI components
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   ├── state/              # State management
│   └── styles/             # CSS files
├── tests/                  # Test files (mirrors src/ structure)
├── assets/                 # Static assets (images, fonts)
├── package.json            # Dependencies & scripts
├── jest.config.js          # Jest configuration
├── claude.md               # This file
└── README.md               # Project documentation
```

## Development Workflow

### Starting a New Feature

1. Create a test file first
2. Write failing tests that describe the feature
3. Implement the minimum code to pass tests
4. Refactor while keeping tests green
5. Run full test suite
6. Manual browser verification
7. Commit with descriptive message

### Commands

```bash
npm install          # Install dependencies
npm test             # Run all tests
npm test -- --watch  # Run tests in watch mode
npm test -- --coverage  # Run tests with coverage report
```

### Commit Message Format

```
<type>: <short description>

<optional body with more details>
```

Types: `feat`, `fix`, `test`, `refactor`, `docs`, `style`, `chore`

## GitHub Pages Deployment

The `src/` directory is configured as the publishing source. Any changes pushed to the main branch will be automatically deployed.

**Constraints:**
- No server-side code
- No build step required (vanilla JS)
- All paths must be relative for GitHub Pages compatibility

## Common Patterns

### Component Pattern

```javascript
// src/components/PolicyCard.js
export function createPolicyCard(policy) {
  const card = document.createElement('div');
  card.className = 'policy-card';
  card.innerHTML = `
    <h3>${escapeHtml(policy.title)}</h3>
    <p>${escapeHtml(policy.description)}</p>
  `;
  return card;
}
```

### Service Pattern

```javascript
// src/services/PolicyService.js
export const PolicyService = {
  validatePolicy(policy) {
    if (!policy.title) {
      throw new Error('Policy must have a title');
    }
    return true;
  },

  formatPolicyForExport(policy) {
    return {
      ...policy,
      exportedAt: new Date().toISOString()
    };
  }
};
```

### State Pattern

```javascript
// src/state/AppState.js
export const AppState = {
  _state: {
    policies: [],
    selectedPolicy: null
  },
  _listeners: [],

  getState() {
    return { ...this._state };
  },

  setState(newState) {
    this._state = { ...this._state, ...newState };
    this._listeners.forEach(listener => listener(this._state));
  },

  subscribe(listener) {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }
};
```

## Checklist for Claude

Before marking any implementation task complete:

- [ ] Tests written first (TDD)
- [ ] All tests passing
- [ ] No swallowed errors
- [ ] Separation of concerns maintained
- [ ] Code reviewed by verification subagent (for complex changes)
- [ ] Manual browser check completed
- [ ] Changes committed with proper message
