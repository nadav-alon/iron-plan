import { EXERCISE_CATALOG } from './data'

export const getExerciseDetails = (catalogId, catalog = EXERCISE_CATALOG) => {
  return catalog.find(e => e.id === catalogId) || EXERCISE_CATALOG[0]
}

export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const parseReps = (reps) => {
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

export const generateExport = (logs, exercises) => {
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
          text += `  Set ${i+1}: ${set.weight > 0 ? set.weight + 'kg x ' : ''}${set.reps}${unit}\n`
      })
      text += '\n'
  }
  return text
}

export const validatePlanJson = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString)
    if (!Array.isArray(parsed)) return null
    
    // Basic structural check
    const valid = parsed.every(p => p.catalogId && typeof p.sets === 'number')
    if (!valid) return null
    
    return parsed
  } catch (e) {
    return null
  }
}
