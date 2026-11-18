import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MomentumStrip } from './MomentumStrip';
import { createSeedTasks } from '../../data/sampleTasks';

const reference = new Date(2026, 10, 17, 12, 0, 0);
const tasks = createSeedTasks(reference);

describe('MomentumStrip', () => {
  it('renders seven days with completion labels', () => {
    render(<MomentumStrip tasks={tasks} reference={reference} />);
    expect(screen.getByLabelText(/7-day momentum/i)).toBeInTheDocument();
    expect(screen.getAllByTitle(/delivered on/i)).toHaveLength(7);
  });
});
