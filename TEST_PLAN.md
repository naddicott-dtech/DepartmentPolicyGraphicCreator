# Browser Test Plan: Department Policy Graphic Creator

**Target URL**: `https://naddicott-dtech.github.io/DepartmentPolicyGraphicCreator/src/`
**Test Agent Instructions**: Execute each test case sequentially. Report PASS/FAIL for each. Note any unexpected behavior.

---

## Pre-Test Setup

1. **Clear browser state** before testing:
   - Open browser DevTools (F12)
   - Go to Application > Storage > Local Storage
   - Delete any entries for `dppgc_state`
   - Refresh the page

2. **Verify initial state**:
   - [ ] Page loads without console errors
   - [ ] Header shows "AI Policy Creator" with d.tech logo
   - [ ] 6 department buttons visible: English, Math, Science, Social Studies, Maker, Foreign Language
   - [ ] No department is selected (none have orange background)
   - [ ] Editor panel shows "Select a department to get started."
   - [ ] Preview panel shows empty state message
   - [ ] Toolbar (Edit Categories, Reset to Defaults) is hidden

---

## Test Suite 1: Department Selection

### T1.1: Select First Department
**Steps**:
1. Click "English" button

**Expected**:
- [ ] English button turns orange (selected state)
- [ ] Toolbar becomes visible
- [ ] Category tree shows 3 categories: UNDERSTANDING, WRITING, REVISING
- [ ] Each category has 3 items with traffic light controls
- [ ] Traffic lights show default selections (mix of green/yellow/red)
- [ ] Preview panel updates to show "AI in English: What's OK?"
- [ ] Preview shows items grouped by Go Ahead / Ask First / Not Allowed
- [ ] Prompt text area shows generated Nano Banana prompt

### T1.2: Switch Departments
**Steps**:
1. Click "Math" button

**Expected**:
- [ ] Math button turns orange, English button returns to normal
- [ ] Categories change to: UNDERSTANDING, SOLVING, PRACTICING
- [ ] Preview updates to "AI in Math: What's OK?"
- [ ] Prompt updates with Math content

### T1.3: All Departments Load Correctly
**Steps**: Click through each department and verify categories load

| Department | Expected Categories |
|------------|---------------------|
| English | UNDERSTANDING, WRITING, REVISING |
| Math | UNDERSTANDING, SOLVING, PRACTICING |
| Science | UNDERSTANDING, LAB WORK, DATA & WRITING |
| Social Studies | UNDERSTANDING, RESEARCH, WRITING |
| Maker | LEARNING, CREATING, DOCUMENTING |
| Foreign Language | UNDERSTANDING, PRACTICING, PRODUCING |

**Expected for each**:
- [ ] Categories load without error
- [ ] Preview updates correctly
- [ ] No console errors

---

## Test Suite 2: Traffic Light Controls

### T2.1: Change Status to Green
**Steps**:
1. Select "English" department
2. Find first item under UNDERSTANDING ("Explain concepts & vocabulary")
3. Click the green (✓) traffic light

**Expected**:
- [ ] Green circle fills solid green
- [ ] Preview "Go Ahead" section includes this item
- [ ] Prompt text updates to include item under GREEN section

### T2.2: Change Status to Yellow
**Steps**:
1. Find same item
2. Click yellow (?) traffic light

**Expected**:
- [ ] Yellow circle fills solid yellow
- [ ] Green circle returns to outline only
- [ ] Preview moves item to "Ask First" section
- [ ] Prompt updates accordingly

### T2.3: Change Status to Red
**Steps**:
1. Click red (✗) traffic light

**Expected**:
- [ ] Red circle fills solid red
- [ ] Preview moves item to "Not Allowed" section
- [ ] Prompt updates accordingly

### T2.4: Keyboard Navigation
**Steps**:
1. Tab to a traffic light fieldset
2. Use arrow keys to change selection

**Expected**:
- [ ] Focus indicator visible on traffic light
- [ ] Arrow keys change selection
- [ ] Preview updates on change

---

## Test Suite 3: Comments

### T3.1: Add Comment
**Steps**:
1. Find comment field for first item (text input with "Add clarification..." placeholder)
2. Type "Only for studying"

**Expected**:
- [ ] Text appears in input field
- [ ] After ~300ms pause, preview updates to show comment with item
- [ ] Prompt includes comment (e.g., "Explain concepts: Only for studying")

### T3.2: Edit Comment
**Steps**:
1. Change comment to "Use sparingly"

**Expected**:
- [ ] Preview updates with new comment text
- [ ] Prompt updates accordingly

### T3.3: Clear Comment
**Steps**:
1. Delete all text from comment field

**Expected**:
- [ ] Preview shows item without comment/dash
- [ ] Prompt shows item without colon/comment

### T3.4: Special Characters in Comment
**Steps**:
1. Enter comment: `<script>alert("test")</script>`

**Expected**:
- [ ] Text displays safely escaped in preview (shows literal text, not executed)
- [ ] No XSS vulnerability / no alert box appears
- [ ] Prompt includes escaped/safe version

---

## Test Suite 4: Preview Panel

### T4.1: Live Updates
**Steps**:
1. Make several rapid status changes

**Expected**:
- [ ] Preview updates in real-time with each change
- [ ] No lag or visual glitches
- [ ] Correct items in correct sections

### T4.2: Section Visibility
**Steps**:
1. Set ALL items to green

**Expected**:
- [ ] "Go Ahead" section shows all items
- [ ] "Ask First" section is empty or hidden
- [ ] "Not Allowed" section is empty or hidden

### T4.3: Empty Sections
**Steps**:
1. Return some items to yellow and red

**Expected**:
- [ ] All three sections visible with appropriate items
- [ ] Section headers have correct colors (green/yellow/red)

---

## Test Suite 5: Copy to Clipboard

### T5.1: Copy Prompt
**Steps**:
1. Click "Copy to Clipboard" button

**Expected**:
- [ ] Button text changes to "Copied!"
- [ ] Button may turn green briefly
- [ ] After ~2 seconds, button returns to "Copy to Clipboard"

### T5.2: Verify Clipboard Content
**Steps**:
1. Open a text editor or new browser tab
2. Paste (Ctrl+V / Cmd+V)

**Expected**:
- [ ] Pasted content matches prompt text shown on page
- [ ] Includes all sections (GREEN, YELLOW, RED)
- [ ] Includes style directives and 4K resolution note
- [ ] Includes d.tech colors (#E94E1B)

---

## Test Suite 6: Persistence

### T6.1: Page Refresh
**Steps**:
1. Make several changes (status, comments)
2. Note the current state
3. Refresh the page (F5)

**Expected**:
- [ ] Same department is still selected
- [ ] All status changes preserved
- [ ] All comments preserved
- [ ] Preview matches pre-refresh state

### T6.2: Close and Reopen
**Steps**:
1. Close browser tab
2. Open URL again

**Expected**:
- [ ] State fully restored from localStorage
- [ ] Department, statuses, comments all preserved

### T6.3: Switch Department and Return
**Steps**:
1. On English, change an item to yellow and add comment
2. Switch to Math
3. Switch back to English

**Expected**:
- [ ] English state is preserved (yellow status, comment)
- [ ] Math loaded its own state (not affected by English changes)

---

## Test Suite 7: Reset to Defaults

### T7.1: Reset Confirmation
**Steps**:
1. Make several changes
2. Click "Reset to Defaults" button

**Expected**:
- [ ] Confirmation dialog appears
- [ ] Dialog asks to confirm reset

### T7.2: Cancel Reset
**Steps**:
1. Click Cancel on confirmation dialog

**Expected**:
- [ ] No changes made
- [ ] All modifications preserved

### T7.3: Confirm Reset
**Steps**:
1. Click "Reset to Defaults" again
2. Click OK/Confirm

**Expected**:
- [ ] All statuses return to template defaults
- [ ] All comments cleared
- [ ] Preview updates to show default state
- [ ] Prompt updates accordingly

---

## Test Suite 8: Edit Categories Modal

### T8.1: Open Modal
**Steps**:
1. Click "Edit Categories" button

**Expected**:
- [ ] Modal overlay appears
- [ ] Modal shows current category structure
- [ ] Each item has rename input, up/down buttons, delete button
- [ ] Warning text visible: "Saving will reset all selections and comments"
- [ ] Cancel and Save Changes buttons visible

### T8.2: Cancel Without Changes
**Steps**:
1. Click Cancel (or X button, or click outside modal)

**Expected**:
- [ ] Modal closes
- [ ] No changes to categories
- [ ] Original state preserved

### T8.3: Rename Category
**Steps**:
1. Open modal
2. Change "UNDERSTANDING" text to "LEARNING SUPPORT"
3. Click outside the input (blur)

**Expected**:
- [ ] Input shows new text
- [ ] Change is held in modal (not yet saved)

### T8.4: Add New Category
**Steps**:
1. Click "+ Add Category" at bottom

**Expected**:
- [ ] New category appears with "New Category" label
- [ ] New category has no children
- [ ] "+ Add Item" button appears under it

### T8.5: Add New Item
**Steps**:
1. Click "+ Add Item" under the new category

**Expected**:
- [ ] New item appears with "New Item" label
- [ ] Item has rename/delete/reorder controls

### T8.6: Delete Item
**Steps**:
1. Click delete (🗑) on the new item

**Expected**:
- [ ] Item is removed from modal
- [ ] No confirmation needed for items without children

### T8.7: Delete Category with Children
**Steps**:
1. Click delete on a category that has children

**Expected**:
- [ ] Confirmation dialog appears
- [ ] Asks to confirm deletion of category AND all sub-items
- [ ] If confirmed, category and children removed

### T8.8: Reorder Items
**Steps**:
1. Click ↓ (down arrow) on first item in a category

**Expected**:
- [ ] Item moves down one position
- [ ] Second item moves up

### T8.9: Save Changes
**Steps**:
1. Make a change (rename an item)
2. Click "Save Changes"

**Expected**:
- [ ] Confirmation dialog: "This will reset all selections and comments. Continue?"
- [ ] If confirmed: Modal closes
- [ ] Category structure updated
- [ ] ALL statuses reset to red (conservative default)
- [ ] ALL comments cleared
- [ ] Preview and prompt update

### T8.10: Escape Key Closes Modal
**Steps**:
1. Open modal
2. Press Escape key

**Expected**:
- [ ] Modal closes
- [ ] No changes saved

---

## Test Suite 9: Accessibility

### T9.1: Keyboard Navigation
**Steps**:
1. Starting from page load, use only Tab key to navigate

**Expected**:
- [ ] Can reach all department buttons
- [ ] Can reach all traffic lights
- [ ] Can reach all comment fields
- [ ] Can reach Copy button
- [ ] Can reach Edit/Reset buttons
- [ ] Focus indicator visible on all elements

### T9.2: Screen Reader Labels
**Steps**:
1. Inspect traffic light fieldsets

**Expected**:
- [ ] Each fieldset has a `<legend>` describing the item
- [ ] Labels are descriptive ("AI policy for [item name]")

### T9.3: ARIA States
**Steps**:
1. Inspect department buttons

**Expected**:
- [ ] Selected button has `aria-pressed="true"`
- [ ] Unselected buttons have `aria-pressed="false"`

---

## Test Suite 10: Edge Cases

### T10.1: Rapid Clicking
**Steps**:
1. Rapidly click between departments

**Expected**:
- [ ] App remains stable
- [ ] Final selected department is displayed correctly
- [ ] No console errors

### T10.2: Empty Comment Submit
**Steps**:
1. Focus a comment field
2. Press Enter without typing

**Expected**:
- [ ] No error
- [ ] Comment remains empty

### T10.3: Long Comment
**Steps**:
1. Enter a very long comment (100+ characters)

**Expected**:
- [ ] Comment accepted and saved
- [ ] Preview handles long text gracefully (may wrap)
- [ ] Prompt includes full comment

### T10.4: Browser Back Button
**Steps**:
1. Click browser back button

**Expected**:
- [ ] Normal browser behavior (may leave page)
- [ ] No JavaScript errors
- [ ] State preserved in localStorage for return

---

## Test Results Summary

| Suite | Tests | Passed | Failed | Notes |
|-------|-------|--------|--------|-------|
| 1. Department Selection | 3 | | | |
| 2. Traffic Light Controls | 4 | | | |
| 3. Comments | 4 | | | |
| 4. Preview Panel | 3 | | | |
| 5. Copy to Clipboard | 2 | | | |
| 6. Persistence | 3 | | | |
| 7. Reset to Defaults | 3 | | | |
| 8. Edit Categories Modal | 10 | | | |
| 9. Accessibility | 3 | | | |
| 10. Edge Cases | 4 | | | |
| **TOTAL** | **39** | | | |

---

## Issues Found

| ID | Suite | Test | Severity | Description | Steps to Reproduce |
|----|-------|------|----------|-------------|-------------------|
| | | | | | |

**Severity Levels**: Critical (blocks usage), High (major feature broken), Medium (feature partially works), Low (cosmetic/minor)
