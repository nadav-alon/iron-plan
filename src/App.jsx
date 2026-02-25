import { useState, useEffect } from 'react'
import { EXERCISE_CATALOG, DEFAULT_PLAN, DEFAULT_PLANS_REGISTRY } from './data'
import { getExerciseDetails, parseReps, generateExport, validatePlanJson } from './utils'
import Overview from './components/Overview'
import Workout from './components/Workout'
import Summary from './components/Summary'

function App() {
  /* --- State --- */

  // 0. Catalog State (Dynamic to allow imports)
  const [catalog, setCatalog] = useState(() => {
    const saved = localStorage.getItem('iron-catalog')
    return saved ? JSON.parse(saved) : EXERCISE_CATALOG
  })

  useEffect(() => {
    localStorage.setItem('iron-catalog', JSON.stringify(catalog))
  }, [catalog])

  // 1. Saved Plans Registry (All your named plans)
  const [savedPlans, setSavedPlans] = useState(() => {
    const saved = localStorage.getItem('iron-plans-registry')
    return saved ? JSON.parse(saved) : DEFAULT_PLANS_REGISTRY
  })

  // 2. Current Active Working Plan
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('workout-plan-v3')
    return saved ? JSON.parse(saved) : DEFAULT_PLAN
  })

  const [planName, setPlanName] = useState(() => {
    return localStorage.getItem('iron-active-plan-name') || 'Full Body Default'
  })

  const [mode, setMode] = useState('overview')

  // Workout State
  const [activeIndex, setActiveIndex] = useState(0)
  const [exerciseProgress, setExerciseProgress] = useState(() => {
    // Initialize with 0 for each exercise
    return Array(exercises.length).fill(0)
  })
  const [sessionLogs, setSessionLogs] = useState([])
  const [globalRest, setGlobalRest] = useState(90)

  // Calculated current set for UI
  const currentSet = (exerciseProgress[activeIndex] || 0) + 1

  // Inputs
  const [inputWeight, setInputWeight] = useState('')
  const [inputReps, setInputReps] = useState('')

  // Edit / Timer State
  const [editMode, setEditMode] = useState(false)
  const [timer, setTimer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [manageMode, setManageMode] = useState(false)

  /* --- Effects --- */
  useEffect(() => {
    localStorage.setItem('workout-plan-v3', JSON.stringify(exercises))
    localStorage.setItem('iron-active-plan-name', planName)
  }, [exercises, planName])

  useEffect(() => {
    localStorage.setItem('iron-plans-registry', JSON.stringify(savedPlans))
  }, [savedPlans])

  // Timer Logic
  useEffect(() => {
    if (!timer) return
    const interval = setInterval(() => {
      const remaining = Math.ceil((timer.endTime - Date.now()) / 1000)
      if (remaining <= 0) {
        setTimer(null)
        setTimeLeft(0)
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200])
      } else {
        setTimeLeft(remaining)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [timer])

  /* --- Actions --- */
  const handleUpdateExercise = (id, field, value) => {
    setExercises(exercises.map(ex => {
      if (ex.id === id && field === 'catalogId') {
        const cat = EXERCISE_CATALOG.find(c => c.id === value)
        return { ...ex, [field]: value, isTimed: cat ? cat.defaultTimed : false }
      }
      return ex.id === id ? { ...ex, [field]: value } : ex
    }))
  }

  const addExercise = () => {
    const newId = Math.max(...exercises.map(e => e.id), 0) + 1
    setExercises([...exercises, {
      id: newId,
      catalogId: 'floor_press',
      reps: '8-12',
      sets: 3,
      weight: 0,
      rest: 90,
      isTimed: false,
      notes: ''
    }])
  }

  const removeExercise = (id) => {
    setExercises(exercises.filter(e => e.id !== id))
  }

  const moveExercise = (index, direction) => {
    const newExercises = [...exercises]
    const targetIndex = index + direction

    if (targetIndex >= 0 && targetIndex < newExercises.length) {
      const temp = newExercises[index]
      newExercises[index] = newExercises[targetIndex]
      newExercises[targetIndex] = temp
      setExercises(newExercises)
    }
  }

  // Plan Management
  const savePlan = () => {
    if (!planName.trim()) {
      alert('Please name your plan')
      return
    }
    setSavedPlans({
      ...savedPlans,
      [planName]: exercises
    })
    alert(`Saved "${planName}"!`)
  }

  const loadPlan = (name) => {
    if (confirm(`Load "${name}"? Unsaved changes to current plan will be lost.`)) {
      setExercises(savedPlans[name])
      setPlanName(name)
      setManageMode(false)
    }
  }

  const deletePlan = (name) => {
    if (confirm(`Delete "${name}" permanently?`)) {
      const newPlans = { ...savedPlans }
      delete newPlans[name]
      setSavedPlans(newPlans)
    }
  }

  const createNewPlan = () => {
    if (confirm("Create new empty plan?")) {
      setExercises([])
      setPlanName("New Plan")
      setManageMode(false)
      setEditMode(true)
    }
  }

  const importPlan = (jsonString) => {
    const validPlan = validatePlanJson(jsonString)
    if (validPlan) {
      if (confirm(`Import valid plan with ${validPlan.length} exercises? Current unsaved changes will be lost.`)) {

        // 1. Check for new custom exercises
        let newCatalogEntries = []
        const currentCatalogIds = catalog.map(c => c.id)

        validPlan.forEach(ex => {
          if (!currentCatalogIds.includes(ex.catalogId) && ex.customName) {
            newCatalogEntries.push({
              id: ex.catalogId,
              name: ex.customName,
              image: 'https://placehold.co/400x300/18181b/FFF?text=' + encodeURIComponent(ex.customName), // Quick placeholder
              defaultTimed: !!ex.isTimed
            })
          }
        })

        // 2. Add them to catalog if any
        if (newCatalogEntries.length > 0) {
          setCatalog(prev => [...prev, ...newCatalogEntries])
        }

        // 3. Set Plan
        setExercises(validPlan)
        setPlanName("Imported Plan")
        setManageMode(false)
        alert("Plan Imported Successfully!")
      }
    } else {
      alert("Invalid Plan JSON format. Please ensure it follows the correct structure.")
    }
  }


  const startWorkout = () => {
    setMode('workout')
    setActiveIndex(0)
    setExerciseProgress(exercises.map(() => 0))
    setSessionLogs([])
    loadExerciseInputs(0)
  }

  const loadExerciseInputs = (index) => {
    if (!exercises[index]) return
    const ex = exercises[index]
    setInputWeight(ex.weight || '')
    setInputReps(parseReps(ex.reps))
  }

  const jumpToExercise = (index) => {
    setActiveIndex(index)
    loadExerciseInputs(index)
  }

  const startWorkTimer = () => {
    const duration = parseInt(inputReps) || 30
    setTimer({
      endTime: Date.now() + duration * 1000,
      duration: duration,
      type: 'work'
    })
  }

  const finishSet = () => {
    const currentEx = exercises[activeIndex]
    const details = getExerciseDetails(currentEx.catalogId, catalog)

    // Log data
    const newLog = {
      name: details.name,
      weight: inputWeight || 0,
      reps: inputReps || 0,
      isTimed: currentEx.isTimed,
      timestamp: Date.now()
    }
    setSessionLogs(prev => [...prev, newLog])

    const duration = currentEx.rest || globalRest

    // Update progress
    const newProgress = [...exerciseProgress]
    newProgress[activeIndex] += 1
    setExerciseProgress(newProgress)

    if (newProgress[activeIndex] < currentEx.sets) {
      setTimer({ endTime: Date.now() + duration * 1000, duration, type: 'rest' })
    } else {
      // Current exercise finished all sets. Find next one.
      const unfinishedIndex = newProgress.findIndex((p, idx) => p < exercises[idx].sets)
      if (unfinishedIndex !== -1) {
        setActiveIndex(unfinishedIndex)
        setTimer({ endTime: Date.now() + duration * 1000, duration, type: 'rest' })
        loadExerciseInputs(unfinishedIndex)
      } else {
        finishWorkout()
      }
    }
  }

  const finishWorkout = () => {
    setMode('summary')
    setTimer(null)
  }

  const copyToClipboard = () => {
    const text = generateExport(sessionLogs, exercises)
    navigator.clipboard.writeText(text)
    alert("Workout copied to clipboard!")
  }

  const cancelTimer = () => {
    setTimer(null)
    setTimeLeft(0)
  }

  const adjustTimer = (seconds) => {
    if (timer) {
      setTimer({
        ...timer,
        endTime: timer.endTime + (seconds * 1000)
      })
    }
  }

  /* --- Renders --- */

  // 1. Overview Mode
  if (mode === 'overview') {
    return (
      <Overview
        exercises={exercises}
        catalog={catalog}
        handleUpdateExercise={handleUpdateExercise}
        removeExercise={removeExercise}
        moveExercise={moveExercise}
        addExercise={addExercise}
        startWorkout={startWorkout}
        globalRest={globalRest}
        setGlobalRest={setGlobalRest}
        editMode={editMode}
        setEditMode={setEditMode}
        // Plan Manager props
        manageMode={manageMode}
        setManageMode={setManageMode}
        planName={planName}
        setPlanName={setPlanName}
        savedPlans={savedPlans}
        savePlan={savePlan}
        createNewPlan={createNewPlan}
        loadPlan={loadPlan}
        deletePlan={deletePlan}
        importPlan={importPlan}
      />
    )
  }

  // 2. Active Mode
  if (mode === 'workout') {
    return (
      <Workout
        exercises={exercises}
        catalog={catalog}
        activeIndex={activeIndex}
        setMode={setMode}
        currentSet={currentSet}
        exerciseProgress={exerciseProgress}
        jumpToExercise={jumpToExercise}
        inputWeight={inputWeight}
        setInputWeight={setInputWeight}
        inputReps={inputReps}
        setInputReps={setInputReps}
        startWorkTimer={startWorkTimer}
        finishSet={finishSet}
        timer={timer}
        timeLeft={timeLeft}
        adjustTimer={adjustTimer}
        cancelTimer={cancelTimer}
        globalRest={globalRest}
      />
    )
  }

  // 3. Summary Mode
  if (mode === 'summary') {
    return (
      <Summary
        sessionLogs={sessionLogs}
        exercises={exercises}
        copyToClipboard={copyToClipboard}
        setMode={setMode}
      />
    )
  }

  return null
}

export default App
