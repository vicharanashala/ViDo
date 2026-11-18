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
    expect(detectDoodle('Wash the utensils')).toBe('dishes');
    expect(detectDoodle('Study for the exam')).toBe('project');
    expect(detectDoodle('Finalize the architecture spec')).toBe('project');
  });

  it('recognises reading and writing tasks', () => {
    expect(detectDoodle('Read a book')).toBe('reading');
    expect(detectDoodle('Write the quarterly report')).toBe('writing');
    expect(detectDoodle('Draft the essay')).toBe('writing');
    expect(detectDoodle('Write in the journal')).toBe('writing');
  });

  it('recognises different sports', () => {
    expect(detectDoodle('Play cricket')).toBe('cricket');
    expect(detectDoodle('Football practice')).toBe('football');
    expect(detectDoodle('Basketball game')).toBe('basketball');
    expect(detectDoodle('Tennis match')).toBe('tennis');
    expect(detectDoodle('Badminton practice')).toBe('badminton');
    expect(detectDoodle('Swimming class')).toBe('swimming');
    expect(detectDoodle('Cycle to the park')).toBe('cycling');
    expect(detectDoodle('Table tennis tournament')).toBe('tabletennis');
    expect(detectDoodle('Sports day')).toBe('sport');
    expect(detectDoodle('Walk for 15 minutes')).toBe('walking');
    expect(detectDoodle('Evening 5km jog')).toBe('run');
    expect(detectDoodle('Gym workout')).toBe('exercise');
  });

  it('recognises work, health, and bill tasks', () => {
    expect(detectDoodle('Call the dentist')).toBe('dentist');
    expect(detectDoodle('Call mom')).toBe('call');
    expect(detectDoodle('Sprint planning')).toBe('meeting');
    expect(detectDoodle('Dentist checkup')).toBe('dentist');
    expect(detectDoodle('Doctor appointment')).toBe('doctor');
    expect(detectDoodle('Buy medicine')).toBe('medicine');
    expect(detectDoodle('Pay the internet bill')).toBe('bill');
    expect(detectDoodle('Submit Vehicle Registration Renewal')).toBe('car');
    expect(detectDoodle('Schedule Annual HVAC Inspection')).toBe('heatpump');
    expect(detectDoodle('Fix Leaking Garden Hose Connector')).toBe('washer');
  });

  it('returns null for tasks without a doodle', () => {
    expect(detectDoodle('Buy milk')).toBeNull();
  });
});
