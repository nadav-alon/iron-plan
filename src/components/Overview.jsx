import React from 'react'
import { getExerciseDetails } from '../utils'
import PlanManager from './PlanManager'

function Overview({
    exercises,
    catalog,
    handleUpdateExercise,
    removeExercise,
    moveExercise,
    addExercise,
    startWorkout,
    globalRest,
    setGlobalRest,
    editMode,
    setEditMode,
    manageMode,
    setManageMode,
    planName,
    setPlanName,
    savedPlans,
    savePlan,
    loadPlan,
    deletePlan,
    createNewPlan,
    importPlan
}) {
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
                <PlanManager
                    savedPlans={savedPlans}
                    planName={planName}
                    setPlanName={setPlanName}
                    savePlan={savePlan}
                    createNewPlan={createNewPlan}
                    loadPlan={loadPlan}
                    deletePlan={deletePlan}
                    importPlan={importPlan}
                />
            )}

            <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-dim)' }}>{planName}</h2>
            </div>

            <div className="exercises">
                {exercises.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'gray' }}>No exercises. Click Edit to add some.</div>
                )}
                {exercises.map((ex, index) => {
                    const details = getExerciseDetails(ex.catalogId, catalog)
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
                                                    {catalog.map(cat => (
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

export default Overview
