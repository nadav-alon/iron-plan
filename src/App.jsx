import { useState, useEffect, useRef } from 'react'
import floorPressImg from './assets/floor-press.png'
import rowImg from './assets/row.png'
import shoulderPressImg from './assets/shoulder-press.png'
import curlImg from './assets/curl.png'
import plankImg from './assets/plank.png'
import ropeImg from './assets/rope.png'

/* --- Data & Constants --- */

const EXERCISE_CATALOG = [
  { id: 'floor_press', name: 'Dumbbell Floor Press', image: floorPressImg, defaultTimed: false },
  { id: 'row', name: 'One-Arm Dumbbell Row', image: rowImg, defaultTimed: false },
  { id: 'shoulder_press', name: 'Shoulder Press', image: shoulderPressImg, defaultTimed: false },
  { id: 'curls', name: 'Bicep Curls', image: curlImg, defaultTimed: false },
  { id: 'plank', name: 'Plank', image: plankImg, defaultTimed: true },
  { id: 'rope', name: 'Jump Rope', image: ropeImg, defaultTimed: true },
]

const DEFAULT_PLAN = [
  { id: 1, catalogId: 'floor_press', reps: '8-12', sets: 3, weight: 20, rest: 90, isTimed: false, notes: 'Heaviest stable weight' },
  { id: 2, catalogId: 'row', reps: '8-12', sets: 3, weight: 15, rest: 90, isTimed: false, notes: 'Use couch for support' },
  { id: 3, catalogId: 'shoulder_press', reps: '8-12', sets: 3, weight: 12, rest: 90, isTimed: false, notes: 'Seated or standing' },
  { id: 4, catalogId: 'curls', reps: '8-12', sets: 3, weight: 10, rest: 90, isTimed: false, notes: 'Slow descent' },
  { id: 5, catalogId: 'rope', reps: '30s', sets: 5, weight: 0, rest: 30, isTimed: true, notes: 'High intensity' },
  { id: 6, catalogId: 'plank', reps: '60s', sets: 3, weight: 0, rest: 60, isTimed: true, notes: 'Core tight' },
]

const DEFAULT_PLANS_REGISTRY = {
  'Full Body Default': DEFAULT_PLAN
}

/* --- Helpers --- */

const getExerciseDetails = (catalogId) => {
  return EXERCISE_CATALOG.find(e => e.id === catalogId) || EXERCISE_CATALOG[0]
}

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const parseReps = (reps) => {
  if (!reps) return ''
  // If it's a number, return it
  if (typeof reps === 'number') return reps
  // If "8-12", return 12. If "30s", return 30.
  const matches = reps.toString().match(/(\d+)/g)
  if (matches && matches.length > 0) {
    return matches[matches.length - 1]
  }
  return ''
}

const generateExport = (logs, exercises) => {
  const date = new Date().toLocaleDateString()
  let text = `Iron Plan Workout - ${date}\n\n`

  // Group logs by exercise Name
  const grouped = {}
  logs.forEach(log => {
    if (!grouped[log.name]) grouped[log.name] = []
    grouped[log.name].push(log)
  })

  for (const [name, sets] of Object.entries(grouped)) {
    text += `${name}:\n`
    sets.forEach((set, i) => {
      const unit = set.isTimed ? 's' : ' reps'
      text += `  Set ${i + 1}: ${set.weight > 0 ? set.weight + 'kg x ' : ''}${set.reps}${unit}\n`
    })
    text += '\n'
  }
  return text
}

/* --- Components --- */

function App() {
  /* --- State --- */

  // 1. Saved Plans Registry (All your named plans)
  const [savedPlans, setSavedPlans] = useState(() => {
    const saved = localStorage.getItem('iron-plans-registry')
    return saved ? JSON.parse(saved) : DEFAULT_PLANS_REGISTRY
  })

  // 2. Current Active Working Plan
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('workout-plan-v3') // Reuse active active session key
    return saved ? JSON.parse(saved) : DEFAULT_PLAN
  })

  const [planName, setPlanName] = useState(() => {
    return localStorage.getItem('iron-active-plan-name') || 'Full Body Default'
  })

  const [mode, setMode] = useState('overview')

  // Workout State
  const [activeIndex, setActiveIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [sessionLogs, setSessionLogs] = useState([])
  const [globalRest, setGlobalRest] = useState(90)

  // Inputs
  const [inputWeight, setInputWeight] = useState('')
  const [inputReps, setInputReps] = useState('')

  // Edit / Timer State
  const [editMode, setEditMode] = useState(false)
  const [timer, setTimer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [manageMode, setManageMode] = useState(false) // Toggle for Load/Save menu

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
      // Swap
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


  const startWorkout = () => {
    setMode('workout')
    setActiveIndex(0)
    setCurrentSet(1)
    setSessionLogs([])
    loadExerciseInputs(0)
  }

  const loadExerciseInputs = (index) => {
    if (!exercises[index]) return
    const ex = exercises[index]
    setInputWeight(ex.weight || '')
    setInputReps(parseReps(ex.reps))
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
    const details = getExerciseDetails(currentEx.catalogId)

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

    if (currentSet < currentEx.sets) {
      setCurrentSet(prev => prev + 1)
      setTimer({ endTime: Date.now() + duration * 1000, duration, type: 'rest' })
    } else {
      if (activeIndex < exercises.length - 1) {
        const nextIndex = activeIndex + 1
        setActiveIndex(nextIndex)
        setCurrentSet(1)
        setTimer({ endTime: Date.now() + duration * 1000, duration, type: 'rest' })
        loadExerciseInputs(nextIndex)
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
      <div className="app-container">
        <header className="flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', textAlign: 'left' }}>Iron Plan</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-icon" onClick={() => setManageMode(!manageMode)} title="Manage Plans">
              📁
            </button>
            <button className="btn-icon" onClick={() => setEditMode(!editMode)} title="Edit Plan">
              {editMode ? '💾' : '✏️'}
            </button>
          </div>
        </header>

        {/* Plan Manager Drawer */}
        {manageMode && (
          <div className="card" style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-primary)' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>My Plans</h3>
              <button onClick={createNewPlan} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: 'var(--color-primary)', borderRadius: '4px', color: 'white' }}>+ New</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="text-dim" style={{ fontSize: '0.8rem' }}>Current Plan Name</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                <input className="input" value={planName} onChange={e => setPlanName(e.target.value)} />
                <button onClick={savePlan} className="btn-primary" style={{ width: 'auto' }}>Save</button>
              </div>
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {Object.keys(savedPlans).map(name => (
                <div key={name} className="flex-between" style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontWeight: name === planName ? 'bold' : 'normal', color: name === planName ? 'var(--color-primary)' : 'inherit' }}>
                    {name} {name === planName && '(Active)'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {name !== planName && (
                      <button onClick={() => loadPlan(name)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '4px', padding: '0.2rem 0.5rem' }}>Load</button>
                    )}
                    <button onClick={() => deletePlan(name)} style={{ color: '#ef4444', background: 'transparent' }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-dim)' }}>{planName}</h2>
        </div>

        <div className="exercises">
          {exercises.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'gray' }}>No exercises. Click Edit to add some.</div>
          )}
          {exercises.map((ex, index) => {
            const details = getExerciseDetails(ex.catalogId)
            return (
              <div key={ex.id} className="card">
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {editMode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
                      <button onClick={() => moveExercise(index, -1)} disabled={index === 0} style={{ padding: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', border: 'none', color: 'white', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}>▲</button>
                      <button onClick={() => moveExercise(index, 1)} disabled={index === exercises.length - 1} style={{ padding: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', border: 'none', color: 'white', cursor: index === exercises.length - 1 ? 'default' : 'pointer', opacity: index === exercises.length - 1 ? 0.3 : 1 }}>▼</button>
                    </div>
                  )}
                  <img src={details.image} alt={details.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                      {editMode ? (
                        <div style={{ flex: 1, marginRight: '1rem' }}>
                          {/* Catalog Selection */}
                          <select
                            className="input"
                            value={ex.catalogId}
                            onChange={e => handleUpdateExercise(ex.id, 'catalogId', e.target.value)}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                          >
                            {EXERCISE_CATALOG.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <input
                            className="input"
                            value={ex.notes}
                            onChange={e => handleUpdateExercise(ex.id, 'notes', e.target.value)}
                            placeholder="Notes..."
                            style={{ fontSize: '0.9rem', padding: '0.4rem' }}
                          />
                        </div>
                      ) : (
                        <div>
                          <h3>{details.name}</h3>
                          <p className="text-dim" style={{ fontSize: '0.9rem' }}>{ex.notes}</p>
                        </div>
                      )}
                      {editMode && (
                        <button onClick={() => removeExercise(ex.id)} style={{ color: '#ef4444', background: 'transparent', fontSize: '1.2rem' }}>×</button>
                      )}
                    </div>

                    <div className="text-dim" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      {editMode ? (
                        <div className="grid-cols-2" style={{ gap: '0.5rem', marginTop: '0.5rem', gridTemplateColumns: '1fr 1fr' }}>
                          <div>
                            <label style={{ fontSize: '0.7em' }}>Sets × {ex.isTimed ? 'Time' : 'Reps'}</label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <input type="number" className="input" value={ex.sets} onChange={e => handleUpdateExercise(ex.id, 'sets', parseInt(e.target.value))} style={{ padding: '0.3rem', width: '40px' }} />
                              <input className="input" value={ex.reps} onChange={e => handleUpdateExercise(ex.id, 'reps', e.target.value)} style={{ padding: '0.3rem', flex: 1 }} />
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.7em' }}>Rest(s) {ex.isTimed ? '' : '& Kg'}</label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <input type="number" className="input" value={ex.rest || 90} onChange={e => handleUpdateExercise(ex.id, 'rest', parseInt(e.target.value))} style={{ padding: '0.3rem', flex: 1 }} />
                              {!ex.isTimed && <input type="number" className="input" value={ex.weight} onChange={e => handleUpdateExercise(ex.id, 'weight', parseFloat(e.target.value))} style={{ padding: '0.3rem', flex: 1 }} />}
                            </div>
                          </div>
                          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={ex.isTimed} onChange={e => handleUpdateExercise(ex.id, 'isTimed', e.target.checked)} />
                            <label style={{ fontSize: '0.9em' }}>Timed Exercise</label>
                          </div>
                        </div>
                      ) : (
                        <span>
                          {ex.sets} Sets × {ex.reps} {ex.isTimed ? 'Duration' : 'Reps'}
                          {' • '}{ex.rest ? ex.rest : globalRest}s Rest
                          {!ex.isTimed && ex.weight > 0 && ` • ${ex.weight}kg`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {editMode && (
          <button className="btn-primary" onClick={addExercise} style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.1)' }}>
            + Add Exercise
          </button>
        )}

        {!editMode && exercises.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
              <label className="text-dim">Global Rest Timer:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => setGlobalRest(Math.max(10, globalRest - 10))} style={{ padding: '0.2rem 0.8rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>-</button>
                <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 'bold' }}>{globalRest}s</span>
                <button onClick={() => setGlobalRest(globalRest + 10)} style={{ padding: '0.2rem 0.8rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>+</button>
              </div>
            </div>
            <button className="btn-primary" onClick={startWorkout} style={{ fontSize: '1.2rem', padding: '1rem' }}>
              Start Workout
            </button>
          </div>
        )}
      </div>
    )
  }

  // 2. Active Mode
  if (mode === 'workout') {
    const currentEx = exercises[activeIndex]
    const details = getExerciseDetails(currentEx.catalogId)
    const progressPercent = ((activeIndex) / exercises.length) * 100

    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Progress Bar */}
        <div style={{ height: '4px', background: '#333', marginBottom: '1rem', borderRadius: '2px' }}>
          <div style={{ width: `${progressPercent}%`, background: 'var(--color-primary)', height: '100%', borderRadius: '2px', transition: 'width 0.3s' }}></div>
        </div>

        <header className="flex-between" style={{ marginBottom: '1rem' }}>
          <button onClick={() => setMode('overview')} style={{ background: 'transparent', color: 'white' }}>✕ Exit</button>
          <span className="badge">Ex {activeIndex + 1} / {exercises.length}</span>
        </header>

        <div className="workout-layout">
          {/* Large Preview */}
          <div className="workout-image-container">
            <img src={details.image} alt={details.name} />
          </div>

          <div className="workout-details">
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{details.name}</h2>
              <p className="text-dim" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{currentEx.notes}</p>
            </div>

            <div className="card" style={{ padding: '2rem 1.5rem', border: '1px solid var(--color-primary)' }}>
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Set {currentSet} <span className="text-dim">of {currentEx.sets}</span></span>
                <span className="badge">{currentEx.isTimed ? `${currentEx.reps} Target` : `${currentEx.reps} Reps`}</span>
              </div>

              <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
                {!currentEx.isTimed && (
                  <div>
                    <label className="text-dim" style={{ display: 'block', marginBottom: '8px' }}>WEIGHT (KG)</label>
                    <input
                      className="input"
                      type="number"
                      value={inputWeight}
                      onChange={(e) => setInputWeight(e.target.value)}
                      placeholder={currentEx.weight || "--"}
                      style={{ fontSize: '1.5rem', padding: '1rem', textAlign: 'center' }}
                      autoFocus
                    />
                  </div>
                )}
                <div style={{ gridColumn: currentEx.isTimed ? 'span 2' : 'auto' }}>
                  <label className="text-dim" style={{ display: 'block', marginBottom: '8px' }}>
                    {currentEx.isTimed ? 'DURATION (SECONDS)' : 'REPS'}
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      className="input"
                      type="number"
                      value={inputReps}
                      onChange={(e) => setInputReps(e.target.value)}
                      placeholder="--"
                      style={{ fontSize: '1.5rem', padding: '1rem', textAlign: 'center' }}
                    />
                    {currentEx.isTimed && (
                      <button onClick={startWorkTimer} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '12px', padding: '0 1.5rem', fontSize: '1.5rem' }}>
                        ⏱
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={finishSet}
                style={{ height: '64px', fontSize: '1.2rem' }}
              >
                {currentEx.isTimed ? 'Finish Interval' : 'Complete Set'}
              </button>
              <p className="text-dim" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                Next Rest: {currentEx.rest || globalRest}s
              </p>
            </div>
          </div>
        </div>

        {/* Timer Overlay */}
        {timer && (
          <div style={{
            position: 'fixed', inset: 0,
            background: timer.type === 'work' ? 'rgba(0,50,0,0.95)' : 'rgba(0,0,0,0.95)',
            zIndex: 2000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <h2 style={{ marginBottom: '2rem', color: timer.type === 'work' ? '#4ade80' : 'var(--color-primary)' }}>
              {timer.type === 'work' ? 'GO!' : 'Resting'}
            </h2>
            <h1 style={{ fontSize: '6rem', fontVariantNumeric: 'tabular-nums', marginBottom: '1rem' }}>
              {formatTime(timeLeft)}
            </h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
              <button onClick={() => adjustTimer(-10)} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem 1rem', color: 'white' }}>-10s</button>
              <button onClick={() => adjustTimer(10)} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem 1rem', color: 'white' }}>+10s</button>
            </div>

            <button
              className="btn-primary"
              onClick={cancelTimer}
              style={{ width: 'auto', padding: '1rem 3rem', background: '#333' }}
            >
              Skip
            </button>

            {timer.type === 'rest' && (
              <>
                <p className="text-dim" style={{ marginTop: '2rem' }}>Next: Set {currentSet} of {currentEx.sets}</p>
                {currentSet === currentEx.sets && activeIndex < exercises.length - 1 && (
                  <p style={{ color: 'var(--color-accent)', marginTop: '1rem' }}>
                    UP NEXT: {getExerciseDetails(exercises[activeIndex + 1].catalogId).name}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  // 3. Summary Mode
  if (mode === 'summary') {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Workout Complete!</h1>
        <p className="text-dim" style={{ marginBottom: '3rem' }}>Great job smashing your goals today.</p>

        <div className="card" style={{ textAlign: 'left', maxHeight: '400px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
          {generateExport(sessionLogs, exercises)}
        </div>

        <button className="btn-primary" onClick={copyToClipboard} style={{ marginBottom: '1rem' }}>
          Copy to Clipboard
        </button>

        <button onClick={() => setMode('overview')} style={{ background: 'transparent', color: 'var(--color-text-dim)', border: 'none', marginTop: '1rem', cursor: 'pointer' }}>
          Back to Home
        </button>
      </div>
    )
  }

  return null
}

export default App
