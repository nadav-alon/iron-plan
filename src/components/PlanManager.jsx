import React, { useState } from 'react'

function PlanManager({ savedPlans, planName, setPlanName, savePlan, createNewPlan, loadPlan, deletePlan, importPlan }) {
    const [importText, setImportText] = useState('')

    return (
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

            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <label className="text-dim" style={{ fontSize: '0.8rem' }}>Import Plan (JSON)</label>
                <textarea
                    className="input"
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    placeholder='[ { "catalogId": "rope", "sets": 3 ... } ]'
                    style={{ width: '100%', height: '80px', fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '0.5rem' }}
                />
                <button onClick={() => importPlan(importText)} className="btn-primary" style={{ padding: '0.5rem' }}>Import JSON</button>
            </div>
        </div>
    )
}

export default PlanManager
