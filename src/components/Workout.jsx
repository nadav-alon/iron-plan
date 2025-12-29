import React from 'react'
import { getExerciseDetails, formatTime } from '../utils'

function Workout({
    exercises,
    catalog,
    activeIndex,
    setMode,
    currentSet,
    inputWeight,
    setInputWeight,
    inputReps,
    setInputReps,
    startWorkTimer,
    finishSet,
    timer,
    timeLeft,
    adjustTimer,
    cancelTimer,
    globalRest
}) {
    const currentEx = exercises[activeIndex]
    const details = getExerciseDetails(currentEx.catalogId, catalog)
    const progressPercent = ((activeIndex) / exercises.length) * 100

    return (
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Progress Bar */}
            <div style={{ height: '4px', background: '#333', marginBottom: '1rem', borderRadius: '2px' }}>
                <div style={{ width: `${progressPercent}% `, background: 'var(--color-primary)', height: '100%', borderRadius: '2px', transition: 'width 0.3s' }}></div>
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
                                    UP NEXT: {getExerciseDetails(exercises[activeIndex + 1].catalogId, catalog).name}
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Workout
