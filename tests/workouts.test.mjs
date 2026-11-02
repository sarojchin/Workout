import test from 'node:test';
import assert from 'node:assert/strict';
import { routines, totalSets, formatTime } from '../src/workouts.ts';
test('routines contain complete, usable exercise prescriptions', () => {
  assert.equal(routines.length, 3);
  for (const routine of routines) {
    assert.ok(routine.exercises.length > 0);
    for (const exercise of routine.exercises) {
      assert.ok(exercise.name.length > 0);
      assert.ok(Number.isInteger(exercise.sets) && exercise.sets > 0);
      assert.ok(Number.isInteger(exercise.reps) && exercise.reps > 0);
    }
  }
  assert.equal(totalSets(routines[0]), 12);
  assert.equal(totalSets(routines[1]), 9);
  assert.equal(totalSets(routines[2]), 13);
});
test('timer displays minute boundaries and long workouts', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(59), '0:59');
  assert.equal(formatTime(60), '1:00');
  assert.equal(formatTime(3661), '61:01');
});
