import React from 'react'
import { generateExport } from '../utils'

function Summary({ sessionLogs, exercises, copyToClipboard, setMode }) {
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

export default Summary
