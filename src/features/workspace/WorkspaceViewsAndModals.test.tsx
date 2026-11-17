import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createSeedTasks } from '../../data/sampleTasks';
import { getFilteredTasks, getHomeDashboardTasks, pickFocusTask } from '../../data/taskFilters';
import { formatDateLong } from '../../data/taskDates';
import { HomeView } from './views/HomeView';
import { ListView } from './views/ListView';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskCreateModal } from './TaskCreateModal';
import { WorkspaceLayout } from './WorkspaceLayout';

const reference = new Date(2026, 10, 17, 12, 0, 0);
const todayLabel = formatDateLong(reference);
const tasks = createSeedTasks(reference);

describe('Workspace views and modals', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('HomeView', () => {
    it('shows one focus task, momentum, and today’s list', () => {
      const dashboard = getHomeDashboardTasks(tasks, reference);
      const focusTask = pickFocusTask(tasks, reference)!;
      const handleClick = vi.fn();
      const handleFocus = vi.fn();

      render(
        <MemoryRouter>
          <HomeView
            todayTasks={dashboard.today}
            todayLabel={todayLabel}
            todayMomentum={{ completed: 2, total: 8 }}
            focusTask={focusTask}
            allTasks={tasks}
            onTaskClick={handleClick}
            onFocusTask={handleFocus}
          />
        </MemoryRouter>
      );

      expect(screen.getByText(/good (morning|afternoon|evening)/i)).toBeInTheDocument();
      expect(screen.getAllByText(todayLabel).length).toBeGreaterThan(0);
      expect(screen.getByText(/focus next/i)).toBeInTheDocument();
      expect(screen.getByRole('img', { name: focusTask.title })).toBeInTheDocument();

      expect(screen.getByRole('heading', { name: /^today$/i })).toBeInTheDocument();
      expect(screen.getByText(/review q4 budget/i)).toBeInTheDocument();
      expect(screen.getAllByText(/delivered/i).length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/7-day momentum/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /start focus/i }));
      expect(handleFocus).toHaveBeenCalledWith(focusTask);

      fireEvent.click(screen.getByLabelText(/task: review q4 budget/i));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('ListView', () => {
    it('renders tasks and filters by category', () => {
      const handleClick = vi.fn();
      const views = getFilteredTasks(tasks, reference);

      render(
        <MemoryRouter>
          <ListView
            title="Today Tasks"
            description="All tasks due today"
            tasks={views.today}
            onTaskClick={handleClick}
          />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /today tasks/i })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /personal/i }));
      expect(
        screen.getByRole('img', { name: /submit vehicle registration renewal/i })
      ).toBeInTheDocument();
    });
  });

  describe('TaskDetailModal', () => {
    it('displays task metadata, progress, and closes on Escape', () => {
      const handleClose = vi.fn();
      const task = tasks[0];

      render(<TaskDetailModal task={task} isOpen={true} onClose={handleClose} />);

      expect(screen.getByText(task.title)).toBeInTheDocument();
      expect(screen.getByText(task.description!)).toBeInTheDocument();
      expect(screen.getByText(/progress checkpoints/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/task progress/i)).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('TaskCreateModal', () => {
    it('submits a real task through onCreate', () => {
      const handleClose = vi.fn();
      const handleCreate = vi.fn();

      render(
        <TaskCreateModal isOpen={true} onClose={handleClose} onCreate={handleCreate} />
      );

      expect(screen.getByRole('heading', { name: /create new task/i })).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/task title \*/i), {
        target: { value: 'New Test Task' },
      });
      fireEvent.click(screen.getByRole('button', { name: /save task/i }));

      expect(handleCreate).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Test Task' })
      );
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('WorkspaceLayout integration', () => {
    it('renders the real workspace, adds a task, and persists it', async () => {
      render(
        <MemoryRouter initialEntries={['/app/today']}>
          <Routes>
            <Route path="/app/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /^today$/i })).toBeInTheDocument();
      expect(screen.queryByText('DEMO PREVIEW')).not.toBeInTheDocument();
      expect(screen.getAllByRole('link', { name: /^home$/i })[0]).toHaveAttribute('href', '/app');
      expect(screen.getByLabelText(/new task title/i)).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/new task title/i), {
        target: { value: 'Buy milk for the week' },
      });
      fireEvent.submit(screen.getByLabelText(/new task title/i).closest('form')!);

      await waitFor(() => {
        expect(screen.getAllByText(/buy milk for the week/i).length).toBeGreaterThan(0);
      });
    });
  });
});
