import floorPressImg from './assets/floor-press.png'
import rowImg from './assets/row.png'
import shoulderPressImg from './assets/shoulder-press.png'
import curlImg from './assets/curl.png'
import plankImg from './assets/plank.png'
import ropeImg from './assets/rope.png'

export const EXERCISE_CATALOG = [
  { id: 'floor_press', name: 'Dumbbell Floor Press', image: floorPressImg, defaultTimed: false },
  { id: 'row', name: 'One-Arm Dumbbell Row', image: rowImg, defaultTimed: false },
  { id: 'shoulder_press', name: 'Shoulder Press', image: shoulderPressImg, defaultTimed: false },
  { id: 'curls', name: 'Bicep Curls', image: curlImg, defaultTimed: false },
  { id: 'plank', name: 'Plank', image: plankImg, defaultTimed: true },
  { id: 'rope', name: 'Jump Rope', image: ropeImg, defaultTimed: true },
]

export const DEFAULT_PLAN = [
  { id: 1, catalogId: 'floor_press', reps: '8-12', sets: 3, weight: 20, rest: 90, isTimed: false, notes: 'Heaviest stable weight' },
  { id: 2, catalogId: 'row', reps: '8-12', sets: 3, weight: 15, rest: 90, isTimed: false, notes: 'Use couch for support' },
  { id: 3, catalogId: 'shoulder_press', reps: '8-12', sets: 3, weight: 12, rest: 90, isTimed: false, notes: 'Seated or standing' },
  { id: 4, catalogId: 'curls', reps: '8-12', sets: 3, weight: 10, rest: 90, isTimed: false, notes: 'Slow descent' },
  { id: 5, catalogId: 'rope', reps: '30s', sets: 5, weight: 0, rest: 30, isTimed: true, notes: 'High intensity' },
  { id: 6, catalogId: 'plank', reps: '60s', sets: 3, weight: 0, rest: 60, isTimed: true, notes: 'Core tight' },
]

export const DEFAULT_PLANS_REGISTRY = {
    'Full Body Default': DEFAULT_PLAN
}
