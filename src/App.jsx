import { useState, useEffect, useRef } from 'react'
import floorPressImg from './assets/floor-press.png'
import rowImg from './assets/row.png'
import shoulderPressImg from './assets/shoulder-press.png'
import curlImg from './assets/curl.png'

/* --- Data & Constants --- */

const DEFAULT_PLAN = [
  { id: 1, name: 'Dumbbell Floor Press', reps: '8-12', sets: 3, weight: 20, notes: 'Heaviest stable weight', image: floorPressImg },
  { id: 2, name: 'One-Arm Dumbbell Row', reps: '8-12', sets: 3, weight: 15, notes: 'Use couch for support', image: rowImg },
  { id: 3, name: 'Shoulder Press', reps: '8-12', sets: 3, weight: 12, notes: 'Seated or standing', image: shoulderPressImg },
  { id: 4, name: 'Bicep Curls', reps: '8-12', sets: 3, weight: 10, notes: 'Slow descent', image: curlImg },
]

/* --- Helpers --- */

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const parseReps = (reps) => {
  if (!reps) return ''
  // If it's a number, return it
  if (typeof reps === 'number') return reps
  // If "8-12", return 12 (the goal). If "5", return 5.
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
      text += `  Set ${i + 1}: ${set.weight}kg x ${set.reps} reps\n`
    })
    text += '\n'
  }
  return text
}

/* --- Components --- */

function App() {
  /* --- State --- */
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('workout-plan')
    if (saved) {
      let parsed = JSON.parse(saved)
      if (parsed.length > 0 && !parsed[0].image) return DEFAULT_PLAN
      // Migration: Ensure sets and weight exist
      parsed = parsed.map(ex => ({
        ...ex,
        sets: ex.sets || 3,
        weight: ex.weight !== undefined ? ex.weight : 0
      }))
      return parsed
    }
    return DEFAULT_PLAN
  })

  // 'overview' | 'workout' | 'summary'
  const [mode, setMode] = useState('overview')

  // Workout State
  const [activeIndex, setActiveIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [sessionLogs, setSessionLogs] = useState([]) // [{ name, weight, reps }]

  // Inputs for the Active Set
  const [inputWeight, setInputWeight] = useState('')
  const [inputReps, setInputReps] = useState('')

  // Edit / Timer State
  const [editMode, setEditMode] = useState(false)
  const [timer, setTimer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)

  /* --- Effects --- */
  useEffect(() => {
    localStorage.setItem('workout-plan', JSON.stringify(exercises))
  }, [exercises])

  // Timer Logic
  useEffect(() => {
    if (!timer) return
    const interval = setInterval(() => {
      const remaining = Math.ceil((timer.endTime - Date.now()) / 1000)
      if (remaining <= 0) {
        setTimer(null)
        setTimeLeft(0)
        // Play audio or vibrate here if possible
        if (navigator.vibrate) navigator.vibrate([200, 100, 200])
        alert("Rest Finished!")
      } else {
        setTimeLeft(remaining)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [timer])

  /* --- Actions --- */
  const handleUpdateExercise = (id, field, value) => {
    setExercises(exercises.map(ex =>
      ex.id === id ? { ...ex, [field]: value } : ex
    ))
  }

  const startWorkout = () => {
    setMode('workout')
    setActiveIndex(0)
    setCurrentSet(1)
    setSessionLogs([])
    // Pre-fill weight and reps from plan
    const firstEx = exercises[0]
    setInputWeight(firstEx.weight || '')
    setInputReps(parseReps(firstEx.reps))
  }

  const finishSet = () => {
    const ex = exercises[activeIndex]

    // Log data
    const newLog = {
      name: ex.name,
      weight: inputWeight || 0,
      reps: inputReps || 0,
      timestamp: Date.now()
    }
    setSessionLogs(prev => [...prev, newLog])

    // Start Rest Timer
    setTimer({
      endTime: Date.now() + 90 * 1000,
      duration: 90
    })

    // Advance Logic
    if (currentSet < ex.sets) {
      setCurrentSet(prev => prev + 1)
      // Keep current inputWeight for next set, as it likely won't change drastically
    } else {
      // Exercise Complete
      if (activeIndex < exercises.length - 1) {
        const nextIndex = activeIndex + 1
        setActiveIndex(nextIndex)
        setCurrentSet(1)
        // Load default weight and reps for next exercise
        const nextEx = exercises[nextIndex]
        setInputWeight(nextEx.weight || '')
        setInputReps(parseReps(nextEx.reps))
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

  /* --- Renders --- */

  // 1. Overview Mode
  if (mode === 'overview') {
    return (
      <div className="app-container">
        <header className="flex-between">
          <h1>Iron Plan</h1>
          <button className="btn-icon" onClick={() => setEditMode(!editMode)}>
            {editMode ? '💾' : '✏️'}
          </button>
        </header>

        <div className="exercises">
          {exercises.map((ex) => (
            <div key={ex.id} className="card">
              <div style={{ display: 'flex', gap: '1rem' }}>
                <img src={ex.image} alt={ex.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div className="flex-between">
                    {editMode ? (
                      <input className="input" value={ex.name} onChange={e => handleUpdateExercise(ex.id, 'name', e.target.value)} />
                    ) : (
                      <h3>{ex.name}</h3>
                    )}
                  </div>
                  <div className="text-dim" style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    {editMode ? (
                      <div className="flex-between" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label style={{ fontSize: '0.7em' }}>Sets</label>
                          <input type="number" className="input" value={ex.sets} onChange={e => handleUpdateExercise(ex.id, 'sets', parseInt(e.target.value))} style={{ width: '50px', padding: '0.3rem' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <label style={{ fontSize: '0.7em' }}>Reps</label>
                          <input className="input" value={ex.reps} onChange={e => handleUpdateExercise(ex.id, 'reps', e.target.value)} style={{ padding: '0.3rem' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <label style={{ fontSize: '0.7em' }}>Kg</label>
                          <input type="number" className="input" value={ex.weight} onChange={e => handleUpdateExercise(ex.id, 'weight', parseFloat(e.target.value))} style={{ width: '60px', padding: '0.3rem' }} />
                        </div>
                      </div>
                    ) : (
                      <span>{ex.sets} Sets × {ex.reps} Reps {ex.weight > 0 && `@ ${ex.weight}kg`}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button className="btn-primary" onClick={startWorkout} style={{ fontSize: '1.2rem', padding: '1rem' }}>
            Start Workout
          </button>
        </div>
      </div>
    )
  }

  // 2. Active Mode
  if (mode === 'workout') {
    const ex = exercises[activeIndex]
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
            <img src={ex.image} alt={ex.name} />
          </div>

          <div className="workout-details">
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{ex.name}</h2>
              <p className="text-dim" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{ex.notes}</p>
            </div>

            <div className="card" style={{ padding: '2rem 1.5rem', border: '1px solid var(--color-primary)' }}>
              <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Set {currentSet} <span className="text-dim">of {ex.sets}</span></span>
                <span className="badge">{ex.reps} Target Reps</span>
              </div>

              <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
                <div>
                  <label className="text-dim" style={{ display: 'block', marginBottom: '8px' }}>WEIGHT (KG)</label>
                  <input
                    className="input"
                    type="number"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    placeholder={ex.weight || "--"}
                    style={{ fontSize: '1.5rem', padding: '1rem', textAlign: 'center' }}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-dim" style={{ display: 'block', marginBottom: '8px' }}>REPS</label>
                  <input
                    className="input"
                    type="number"
                    value={inputReps}
                    onChange={(e) => setInputReps(e.target.value)}
                    placeholder="--"
                    style={{ fontSize: '1.5rem', padding: '1rem', textAlign: 'center' }}
                  />
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={finishSet}
                style={{ height: '64px', fontSize: '1.2rem' }}
              >
                Complete Set
              </button>
            </div>
          </div>
        </div>


        {/* Timer Overlay */}
        {
          timer && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <h2 style={{ marginBottom: '2rem', color: 'var(--color-primary)' }}>Resting</h2>
              <h1 style={{ fontSize: '6rem', fontVariantNumeric: 'tabular-nums', marginBottom: '3rem' }}>
                {formatTime(timeLeft)}
              </h1>
              <button
                className="btn-primary"
                onClick={cancelTimer}
                style={{ width: 'auto', padding: '1rem 3rem', background: '#333' }}
              >
                Skip Rest
              </button>
              <p className="text-dim" style={{ marginTop: '2rem' }}>Next: Set {currentSet} of {ex.sets}</p>
              {currentSet > ex.sets && <p style={{ color: 'var(--color-accent)' }}>UP NEXT: {exercises[activeIndex + 1]?.name || 'Finish!'}</p>}
            </div>
          )
        }
      </div >
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
