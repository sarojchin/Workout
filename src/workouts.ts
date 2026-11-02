export type Exercise = { name: string; sets: number; reps: number };
export type Routine = { name: string; focus: string; minutes: number; exercises: Exercise[] };
export type Session = { id: string; routine: string; date: string; sets: number; seconds: number };
export const routines: Routine[] = [
  { name: 'Full body', focus: 'BUILD YOUR FOUNDATION', minutes: 35, exercises: [{ name: 'Squats', sets: 3, reps: 12 }, { name: 'Push-ups', sets: 3, reps: 10 }, { name: 'Reverse lunges', sets: 3, reps: 12 }, { name: 'Glute bridges', sets: 3, reps: 15 }] },
  { name: 'Upper body', focus: 'STRENGTH & CONTROL', minutes: 25, exercises: [{ name: 'Push-ups', sets: 3, reps: 10 }, { name: 'Pike push-ups', sets: 3, reps: 8 }, { name: 'Supermans', sets: 3, reps: 12 }] },
  { name: 'Lower body', focus: 'A STRONGER BASE', minutes: 30, exercises: [{ name: 'Squats', sets: 4, reps: 12 }, { name: 'Reverse lunges', sets: 3, reps: 12 }, { name: 'Calf raises', sets: 3, reps: 20 }, { name: 'Glute bridges', sets: 3, reps: 15 }] },
];
export function totalSets(routine: Routine) { return routine.exercises.reduce((sum, e) => sum + e.sets, 0); }
export function formatTime(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }
