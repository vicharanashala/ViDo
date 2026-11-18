import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TaskPathView } from './TaskPathView';
import { createSeedTasks } from '../../data/sampleTasks';

const task = createSeedTasks(new Date(2026, 10, 17, 12, 0, 0))[0];

describe('TaskPathView', () => {
  it('adds and toggles path steps for a task', () => {
    const onAddSubtask = vi.fn();
    const onToggleSubtask = vi.fn();

    render(
      <MemoryRouter initialEntries={[`/app/tasks/${task.id}/path`]}>
        <Routes>
          <Route
            path="/app/tasks/:taskId/path"
            element={
              <TaskPathView
                tasks={[{ ...task, subtasks: [{ id: 'step-1', title: 'First step', done: false, createdAt: '' }] }]}
                onAddSubtask={onAddSubtask}
                onToggleSubtask={onToggleSubtask}
                onDeleteSubtask={vi.fn()}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/quest path/i)).toBeInTheDocument();
    expect(screen.getByText(/first step/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/new path step/i), {
      target: { value: 'Second step' },
    });
    fireEvent.click(screen.getByRole('button', { name: /add step/i }));
    expect(onAddSubtask).toHaveBeenCalledWith(task.id, 'Second step');

    fireEvent.click(screen.getByRole('button', { name: /complete first step/i }));
    expect(onToggleSubtask).toHaveBeenCalledWith(task.id, 'step-1');

    fireEvent.click(screen.getByRole('button', { name: /not sure\? break it down/i }));
    expect(screen.getByRole('heading', { name: /path assistant/i })).toBeInTheDocument();
  });
});
