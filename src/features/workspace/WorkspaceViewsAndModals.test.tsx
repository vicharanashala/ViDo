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
      expect(screen.getByText(/one small thing/i)).toBeInTheDocument();
      expect(screen.getAllByText(focusTask.title).length).toBeGreaterThan(0);

      expect(screen.getByRole('heading', { name: /^today$/i })).toBeInTheDocument();
      expect(screen.getByText(/review q4 budget/i)).toBeInTheDocument();
      expect(screen.getByText(/a little progress today/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/7-day momentum/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /^begin$/i }));
      expect(handleFocus).toHaveBeenCalledWith(focusTask);

      fireEvent.click(screen.getByLabelText(/task: review q4 budget/i));
      expect(handleClick).toHaveBeenCalled();
    });

    it('can put the list away for today', () => {
      const dashboard = getHomeDashboardTasks(tasks, reference);
      const focusTask = pickFocusTask(tasks, reference)!;

      render(
        <MemoryRouter>
          <HomeView
            todayTasks={dashboard.today}
            todayLabel={todayLabel}
            todayMomentum={{ completed: 2, total: 8 }}
            focusTask={focusTask}
            allTasks={tasks}
            onTaskClick={vi.fn()}
            onFocusTask={vi.fn()}
          />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByRole('button', { name: /that's enough for today/i }));
      expect(screen.getByText(/you can stop here/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /show the list/i }));
      expect(screen.getByLabelText(/task: review q4 budget/i)).toBeInTheDocument();
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
      expect(screen.getByText(/submit vehicle registration renewal/i)).toBeInTheDocument();
    });
  });

  describe('TaskDetailModal', () => {
    it('displays task metadata, progress, and closes on Escape', () => {
      const handleClose = vi.fn();
      const task = tasks[0];

      render(<TaskDetailModal task={task} isOpen={true} onClose={handleClose} />);

      expect(screen.getByText(task.title)).toBeInTheDocument();
      expect(screen.getByText(task.description!)).toBeInTheDocument();
      expect(screen.getByText(/notes and updates/i)).toBeInTheDocument();
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

    it('opens the check-in tray from the checkbox and defers a task', async () => {
      render(
        <MemoryRouter initialEntries={['/app/today']}>
          <Routes>
            <Route path="/app/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.click(screen.getByLabelText(/check in review q4 budget/i));
      expect(screen.getByText(/what happened with this one/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /not today/i }));
      await waitFor(() => {
        expect(screen.getAllByText(/set aside/i).length).toBeGreaterThan(0);
      });
    });

    it('adds progress from a partial check-in', async () => {
      render(
        <MemoryRouter initialEntries={['/app/today']}>
          <Routes>
            <Route path="/app/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.click(screen.getByLabelText(/check in review q4 budget/i));
      fireEvent.click(screen.getByRole('button', { name: /worked on it/i }));
      fireEvent.click(screen.getByRole('button', { name: '75%' }));

      await waitFor(() => {
        expect(screen.getAllByText(/now at 75%/i).length).toBeGreaterThan(0);
      });
      expect(screen.getAllByText('75%').length).toBeGreaterThan(0);
    });

    it('opens the check-in tray when a task image is dragged', () => {
      render(
        <MemoryRouter initialEntries={['/app/today']}>
          <Routes>
            <Route path="/app/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      const draggable = screen.getAllByTitle(/drag to check in/i)[0];
      fireEvent.dragStart(draggable, {
        dataTransfer: { setData: vi.fn(), effectAllowed: 'move' },
      });
      expect(screen.getByText(/what happened with this one/i)).toBeInTheDocument();

      const zone = screen.getByRole('button', { name: /not important/i });
      fireEvent.dragOver(zone);
      fireEvent.drop(zone);
      expect(screen.getAllByText(/set aside/i).length).toBeGreaterThan(0);
    });
  });
});
