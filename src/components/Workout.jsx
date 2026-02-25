import React from 'react'
import { getExerciseDetails, formatTime } from '../utils'

function Workout({
    exercises,
    catalog,
    activeIndex,
    setMode,
    currentSet,
    exerciseProgress,
    jumpToExercise,
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

    const totalSetsAcrossAll = exercises.reduce((acc, ex) => acc + (ex.sets || 0), 0)
    const completedSetsAcrossAll = exerciseProgress.reduce((acc, p) => acc + p, 0)
    const progressPercent = (completedSetsAcrossAll / totalSetsAcrossAll) * 100

    const remainingExercises = exercises
        .map((ex, idx) => ({ ...ex, index: idx }))
        .filter((ex, idx) => exerciseProgress[idx] < ex.sets && idx !== activeIndex)

    return (
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Progress Bar */}
            <div style={{ height: '4px', background: '#333', marginBottom: '1rem', borderRadius: '2px' }}>
                <div style={{ width: `${progressPercent}% `, background: 'var(--color-primary)', height: '100%', borderRadius: '2px', transition: 'width 0.3s' }}></div>
            </div>

            <header className="flex-between" style={{ marginBottom: '1rem' }}>
                <button onClick={() => setMode('overview')} style={{ background: 'transparent', color: 'white' }}>✕ Exit</button>
                <span className="badge">Progress: {completedSetsAcrossAll} / {totalSetsAcrossAll} Sets</span>
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

                    {/* Quick Switch for rest-time swaps */}
                    {remainingExercises.length > 0 && (
                        <div style={{ marginTop: '2rem' }}>
                            <p className="text-dim" style={{ marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Swap Exercise (Cut Rest Time)</p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {remainingExercises.map((ex) => (
                                    <button
                                        key={ex.id}
                                        onClick={() => jumpToExercise(ex.index)}
                                        style={{
                                            background: '#222',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            padding: '0.5rem 0.8rem',
                                            fontSize: '0.85rem',
                                            color: '#ccc'
                                        }}
                                    >
                                        {getExerciseDetails(ex.catalogId, catalog).name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
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

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn-primary"
                            onClick={cancelTimer}
                            style={{ width: 'auto', padding: '1rem 3rem', background: '#333' }}
                        >
                            Skip
                        </button>
                    </div>

                    {timer.type === 'rest' && (
                        <div style={{ marginTop: '2rem', textAlign: 'center', width: '100%', maxWidth: '400px', padding: '0 20px' }}>
                            <p className="text-dim">Next: Set {currentSet} of {currentEx.sets}</p>

                            {remainingExercises.length > 0 && (
                                <div style={{ marginTop: '2rem' }}>
                                    <p style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>Or skip rest by swapping:</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {remainingExercises.map((ex) => (
                                            <button
                                                key={ex.id}
                                                onClick={() => {
                                                    jumpToExercise(ex.index)
                                                    cancelTimer()
                                                }}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    borderRadius: '8px',
                                                    padding: '0.8rem 1rem',
                                                    color: 'white',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {getExerciseDetails(ex.catalogId, catalog).name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Workout
