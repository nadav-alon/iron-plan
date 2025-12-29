# Iron Plan - Application Outline

## 1. Project Overview
**Iron Plan** is a premium, responsive web-based workout tracking application designed for progressive overload and focused training sessions. It features a dark, modern aesthetic and supports both desktop (ultrawide) and mobile layouts.

## 2. Core Features

### A. Workout Planning (Overview Mode)
*   **Exercise Management**: Add, remove, and reorder exercises.
*   **Exercise Configuration**:
    *   Select from a visual **Exercise Catalog** (Predefined + Custom).
    *   Set Target Sets and Reps (or Duration for timed exercises).
    *   Set Weight (Kg) targets.
    *   **Per-Exercise Rest**: Customize rest time for each specific movement.
    *   **Timed Exercises**: Toggle `isTimed` for static holds (Plank) or cardio (Jump Rope).
    *   **Notes**: Add custom notes for form cues.
*   **Global Settings**: Adjust a default global rest timer.

### B. Plan Management
*   **Persistence**: All data saved locally via `localStorage`.
*   **Named Plans**: Create, Save, Load, and Delete multiple workout plans (e.g., "Push Day", "Leg Day").
*   **Active Session Memory**: App remembers the last active plan and state on reload.
*   **JSON Import/Export**:
    *   **Import**: Load plans from JSON text.
    *   **Custom Exercises**: Automatically registers new exercises found in imported JSON that aren't in the default catalog.
    *   **AI Integration**: "Copy AI Prompt" button provides a template for generating plans via LLMs.

### C. Active Workout Mode
*   **Focus View**: Large exercise imagery and clear instruction.
*   **Responsive Layout**:
    *   **Mobile**: Vertical stack.
    *   **Ultrawide/Desktop**: Split-screen (Image Left | Controls Right).
*   **Session Tracking**:
    *   Input actual Reps/Seconds and Weight performed.
    *   **Smart Defaults**: Inputs pre-fill from the plan targets.
*   **Timers**:
    *   **Work Timer** (Green): For timed exercises.
    *   **Rest Timer** (Black/Overlay): Auto-starts after a set.
    *   **Adjustments**: +/- 10s buttons, Skip button.
    *   **Background Notification**: Haptic feedback (vibration) on completion.
*   **Navigation**: "Up Next" preview during rest.

### D. Post-Workout Summary
*   **Log View**: Detailed list of all sets completed.
*   **Clipboard Export**: One-click copy of a formatted text summary for sharing or personal logging.

## 3. Tech Stack & Architecture
*   **Framework**: React (Vite)
*   **Styling**: Vanilla CSS (Variables, Responsive Grid/Flexbox, Dark Mode theme).
*   **State Management**: React `useState` + `useEffect` for LocalStorage persistence.

### File Structure
*   `src/App.jsx`: Main Controller (State, Routing, Orchestration).
*   `src/components/Overview.jsx`: Editor & Dashboard.
*   `src/components/Workout.jsx`: Active Session UI.
*   `src/components/PlanManager.jsx`: Save/Load/Import Drawer.
*   `src/components/Summary.jsx`: Export Screen.
*   `src/data.js`: Static Assets & Default Catalog.
*   `src/utils.js`: Helpers (`formatTime`, `validatePlanJson`, `generateExport`).

## 4. Data Models

### Exercise Object
```json
{
  "id": 1,
  "catalogId": "floor_press", // Links to static data or dynamic catalog
  "customName": "Optional Custom Name", // For imported exercises
  "sets": 3,
  "reps": "8-12",
  "weight": 20,
  "rest": 90,
  "isTimed": false,
  "notes": "Keep core tight"
}
```

### Catalog Item
```javascript
{
  id: 'floor_press',
  name: 'Dumbbell Floor Press',
  image: '/path/to/img.png',
  defaultTimed: false
}
```