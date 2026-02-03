import floorPressImg from './assets/floor-press.png'
import rowImg from './assets/row.png'
import shoulderPressImg from './assets/shoulder-press.png'
import curlImg from './assets/curl.png'
import plankImg from './assets/plank.png'
import ropeImg from './assets/rope.png'

// Physiotherapy Exercises
import squatLungesImg from '/public/assets/exercises/squat_lunges.gif'
import calfRaisesImg from '/public/assets/exercises/calf_raises.gif'
import plusImg from '/public/assets/exercises/plus.gif'
import hipRaisesImg from '/public/assets/exercises/hip_raises.gif'
import pelvicRaiseImg from '/public/assets/exercises/pelvic_raise.gif'
import balanceImg from '/public/assets/exercises/balance.gif'

export const EXERCISE_CATALOG = [
  { id: 'floor_press', name: 'Dumbbell Floor Press', image: floorPressImg, defaultTimed: false },
  { id: 'row', name: 'One-Arm Dumbbell Row', image: rowImg, defaultTimed: false },
  { id: 'shoulder_press', name: 'Shoulder Press', image: shoulderPressImg, defaultTimed: false },
  { id: 'curls', name: 'Bicep Curls', image: curlImg, defaultTimed: false },
  { id: 'plank', name: 'Plank', image: plankImg, defaultTimed: true },
  { id: 'rope', name: 'Jump Rope', image: ropeImg, defaultTimed: true },
  { id: 'squat_lunge_combo', name: 'Squat + Lunges', image: squatLungesImg, defaultTimed: false },
  { id: 'calf_raise_single', name: 'Calf Raises', image: calfRaisesImg, defaultTimed: false },
  { id: 'plus_exercise', name: 'Plus', image: plusImg, defaultTimed: false },
  { id: 'sideway_hip_raise', name: 'Sideways Hip Raises', image: hipRaisesImg, defaultTimed: false },
  { id: 'pelvic_raise', name: 'Pelvic Raise', image: pelvicRaiseImg, defaultTimed: false },
  { id: 'pita_balance', name: 'Balance', image: balanceImg, defaultTimed: true },
]


export const DEFAULT_PLAN = [
  { id: 1, catalogId: 'floor_press', reps: '8-12', sets: 3, weight: 20, rest: 90, isTimed: false, notes: 'Heaviest stable weight' },
  { id: 2, catalogId: 'row', reps: '8-12', sets: 3, weight: 15, rest: 90, isTimed: false, notes: 'Use couch for support' },
  { id: 3, catalogId: 'shoulder_press', reps: '8-12', sets: 3, weight: 12, rest: 90, isTimed: false, notes: 'Seated or standing' },
  { id: 4, catalogId: 'curls', reps: '8-12', sets: 3, weight: 10, rest: 90, isTimed: false, notes: 'Slow descent' },
  { id: 5, catalogId: 'rope', reps: '30s', sets: 5, weight: 0, rest: 30, isTimed: true, notes: 'High intensity' },
  { id: 6, catalogId: 'plank', reps: '60s', sets: 3, weight: 0, rest: 60, isTimed: true, notes: 'Core tight' },
]

export const PHYSIO_PLAN = [
  { id: 1, catalogId: 'squat_lunge_combo', customName: 'Squat (10) + Lunge (5 each leg)', sets: 3, reps: 20, rest: 60 },
  { id: 2, catalogId: 'calf_raise_single', customName: 'Calf Raise (10 each leg)', sets: 3, reps: 20, rest: 60 },
  { id: 3, catalogId: 'plus_exercise', customName: 'Plus Exercise', sets: 10, reps: '4', rest: 60 },
  { id: 4, catalogId: 'sideway_hip_raise', customName: 'Sideway Hips Raise', sets: 3, reps: 6, rest: 60 },
  { id: 5, catalogId: 'pelvic_raise', customName: 'Pelvic Raises', sets: 3, reps: 10, rest: 60 },
  { id: 6, catalogId: 'pita_balance', customName: 'Pita Balance (12s both legs)', sets: 3, reps: '15', rest: 60, isTimed: true }
]

export const DEFAULT_PLANS_REGISTRY = {
    'Full Body Default': DEFAULT_PLAN,
    'Physiotherapy Exercises': PHYSIO_PLAN
}

