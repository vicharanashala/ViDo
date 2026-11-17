import { describe, expect, it } from 'vitest';
import { detectDoodle } from './doodleMap';

describe('detectDoodle', () => {
  it('recognises laundry', () => {
    expect(detectDoodle('Making laundry')).toBe('laundry');
    expect(detectDoodle('Do the laundry')).toBe('laundry');
    expect(detectDoodle('Wash clothes')).toBe('laundry');
  });

  it('recognises common household tasks', () => {
    expect(detectDoodle('Buy groceries')).toBe('groceries');
    expect(detectDoodle('Wash the dishes')).toBe('dishes');
    expect(detectDoodle('Vacuum the living room')).toBe('cleaning');
    expect(detectDoodle('Cook dinner')).toBe('cooking');
    expect(detectDoodle('Water the plants')).toBe('plants');
  });

  it('recognises work, health, and bill tasks', () => {
    expect(detectDoodle('Call the dentist')).toBe('dentist');
    expect(detectDoodle('Call mom')).toBe('call');
    expect(detectDoodle('Sprint planning')).toBe('meeting');
    expect(detectDoodle('Evening 5km jog')).toBe('exercise');
    expect(detectDoodle('Dentist checkup')).toBe('dentist');
    expect(detectDoodle('Doctor appointment')).toBe('doctor');
    expect(detectDoodle('Buy medicine')).toBe('medicine');
    expect(detectDoodle('Pay the internet bill')).toBe('bill');
  });

  it('returns null for tasks without a doodle', () => {
    expect(detectDoodle('Review Q4 budget')).toBeNull();
    expect(detectDoodle('Finalize architecture spec')).toBeNull();
  });
});
