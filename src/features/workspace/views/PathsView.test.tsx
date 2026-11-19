import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PathsView } from './PathsView';
import { createSeedTasks } from '../../../data/sampleTasks';

const reference = new Date(2026, 10, 17, 12, 0, 0);
const tasks = createSeedTasks(reference);

describe('PathsView', () => {
  it('lists today and upcoming tasks with links to their paths', () => {
    render(
      <MemoryRouter>
        <PathsView tasks={tasks} reference={reference} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /task paths/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^today$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^upcoming$/i })).toBeInTheDocument();
    expect(screen.getAllByText(/review q4 budget/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /open path/i }).length).toBeGreaterThan(0);
  });
});
