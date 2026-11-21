import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SAMPLE_TASKS } from '../../data/sampleTasks';
import { getHomeDashboardTasks } from '../../data/taskFilters';
import { HomeView } from './views/HomeView';
import { ListView } from './views/ListView';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskCreateModal } from './TaskCreateModal';
import { WorkspaceLayout } from './WorkspaceLayout';

describe('Workspace Views and Modals', () => {
  describe('HomeView Command Center and Interactive Switching', () => {
    it('renders hero overview and switches active task feed on tile click', () => {
      const dashboard = getHomeDashboardTasks(SAMPLE_TASKS);
      const handleClick = vi.fn();

      render(
        <MemoryRouter>
          <HomeView dashboard={dashboard} now={new Date(2026, 10, 17, 12, 0)} onTaskClick={handleClick} />
        </MemoryRouter>
      );

      // Verify Hero greeting and date
      expect(screen.getByText(/welcome back, demo user/i)).toBeInTheDocument();
      expect(screen.getByText('Tuesday, 17 November 2026')).toBeInTheDocument();

      // Verify all 4 tiles exist
      expect(screen.getByRole('button', { name: /view today tasks/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view needs attention tasks/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view upcoming tasks/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view completed tasks/i })).toBeInTheDocument();

      // Default active tab is Today
      expect(screen.getByRole('heading', { name: /today's agenda/i })).toBeInTheDocument();
      expect(screen.getByText(/review q4 budget/i)).toBeInTheDocument();

      // Click Attention tile
      const attentionTile = screen.getByRole('button', { name: /view needs attention tasks/i });
      fireEvent.click(attentionTile);

      // Active list switches to Needs Attention
      expect(screen.getByRole('heading', { name: /needs attention/i })).toBeInTheDocument();
      expect(screen.getByText(/submit annual property insurance declaration/i)).toBeInTheDocument();

      // Click a task row to verify callback
      const taskRow = screen.getByLabelText(/task: submit annual property insurance declaration/i);
      fireEvent.click(taskRow);
      expect(handleClick).toHaveBeenCalled();
    });

    it('supports dynamic filter addition, pill removal, and clear all filters in Tasks tab', () => {
      render(
        <MemoryRouter>
          <HomeView tasks={SAMPLE_TASKS} now={new Date(2026, 10, 17, 12, 0)} onTaskClick={vi.fn()} initialTab="tasks" />
        </MemoryRouter>
      );

      // Default state has Today filter pill
      expect(screen.getByText(/status: today's agenda/i)).toBeInTheDocument();

      // Open Add Filter menu
      const addFilterBtn = screen.getByRole('button', { name: /add filter/i });
      fireEvent.click(addFilterBtn);

      // Select Personal category
      const personalOption = screen.getByRole('button', { name: /^personal$/i });
      fireEvent.click(personalOption);

      // Verify Personal category filter pill is added
      expect(screen.getByText(/category: personal/i)).toBeInTheDocument();

      // Open Add Filter menu again
      fireEvent.click(addFilterBtn);

      // Select High Priority
      const highPriorityOption = screen.getByRole('button', { name: /high priority/i });
      fireEvent.click(highPriorityOption);

      // Verify Priority filter pill is added
      expect(screen.getByText(/priority: high/i)).toBeInTheDocument();

      // Click Clear all
      const clearAllBtn = screen.getByRole('button', { name: /clear all/i });
      fireEvent.click(clearAllBtn);

      // Verify all filter pills are cleared
      expect(screen.queryByText(/category: personal/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/priority: high/i)).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /tasks/i })).toBeInTheDocument();
    });

    it('uses an injected runtime date for authenticated dashboard sections', () => {
      const now = new Date(2026, 10, 19, 12, 0);
      render(
        <MemoryRouter>
          <HomeView tasks={SAMPLE_TASKS} now={now} onTaskClick={vi.fn()} />
        </MemoryRouter>
      );

      expect(screen.getByText(/Thursday, 19 November 2026/i)).toBeInTheDocument();
      expect(screen.getByText(/As of 19\/11\/2026/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /next best task/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /workload insight/i })).toBeInTheDocument();
    });

    it('switches between Dashboard and Tasks tabs seamlessly', () => {
      render(
        <MemoryRouter>
          <HomeView tasks={SAMPLE_TASKS} now={new Date(2026, 10, 17, 12, 0)} onTaskClick={vi.fn()} />
        </MemoryRouter>
      );

      // Initially on Dashboard
      expect(screen.getByText(/welcome back, demo user/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add filter/i })).not.toBeInTheDocument();

      // Click Tasks tab
      const tasksTab = screen.getByRole('tab', { name: /tasks/i });
      fireEvent.click(tasksTab);

      // Now on Tasks view
      expect(screen.getByRole('button', { name: /add filter/i })).toBeInTheDocument();
      expect(screen.queryByText(/welcome back, demo user/i)).not.toBeInTheDocument();

      // Click Dashboard tab
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      fireEvent.click(dashboardTab);

      // Back to Dashboard
      expect(screen.getByText(/welcome back, demo user/i)).toBeInTheDocument();
    });

    it('does not show completed tasks in the tasks section', () => {
      render(
        <MemoryRouter>
          <HomeView tasks={SAMPLE_TASKS} now={new Date(2026, 10, 17, 12, 0)} onTaskClick={vi.fn()} initialTab="tasks" />
        </MemoryRouter>
      );

      // Verify active task is shown
      expect(screen.getByText(/review q4 budget/i)).toBeInTheDocument();

      // Verify completed tasks are strictly excluded from the tasks section
      const completedTasks = SAMPLE_TASKS.filter((t) => t.state === 'completed');
      expect(completedTasks.length).toBeGreaterThan(0);
      completedTasks.forEach((task) => {
        expect(screen.queryByText(task.title)).not.toBeInTheDocument();
      });
    });
  });

  describe('ListView Rendering and Category Filtering', () => {
    it('renders full list of tasks and filters by category', () => {
      const handleClick = vi.fn();
      const todayTasks = SAMPLE_TASKS.filter((t) => t.dueDate === '2026-11-17');

      render(
        <MemoryRouter>
          <ListView
            title="Today Tasks"
            description="All tasks due today"
            tasks={todayTasks}
            onTaskClick={handleClick}
          />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /today tasks/i })).toBeInTheDocument();

      // Filter by Personal
      const personalBtn = screen.getByRole('button', { name: /personal/i });
      fireEvent.click(personalBtn);

      // Verify personal tasks are rendered
      expect(screen.getByText(/submit vehicle registration renewal/i)).toBeInTheDocument();
    });
  });

  describe('TaskDetailModal', () => {
    it('displays task metadata and closes on Escape', () => {
      const handleClose = vi.fn();
      const task = SAMPLE_TASKS[0]; // Task with checkpoints

      render(<TaskDetailModal task={task} isOpen={true} onClose={handleClose} />);

      expect(screen.getByText(task.title)).toBeInTheDocument();
      expect(screen.getByText(task.description!)).toBeInTheDocument();
      expect(screen.getByText(/progress checkpoints/i)).toBeInTheDocument();

      // Test escape key
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('TaskCreateModal', () => {
    it('validates form submission, creates task and triggers close', () => {
      const handleClose = vi.fn();
      const handleCreate = vi.fn();

      render(
        <TaskCreateModal
          isOpen={true}
          onClose={handleClose}
          onCreateTask={handleCreate}
        />
      );

      expect(screen.getByRole('heading', { name: /create new task/i })).toBeInTheDocument();

      const titleInput = screen.getByLabelText(/task title \*/i);
      fireEvent.change(titleInput, { target: { value: 'New Test Task' } });

      const saveBtn = screen.getByRole('button', { name: /save task/i });
      fireEvent.click(saveBtn);

      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(handleCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Task',
          state: 'active',
        })
      );
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('WorkspaceLayout Integration', () => {
    it('renders workspace shell and navigates to subviews', () => {
      render(
        <MemoryRouter initialEntries={['/preview/today']}>
          <Routes>
            <Route path="/preview/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      // Header indicates Today view
      expect(screen.getByRole('heading', { name: /^today$/i })).toBeInTheDocument();

      // Verify persistent demo preview banner and single unmissable back button
      expect(screen.getByText('DEMO PREVIEW')).toBeInTheDocument();
      expect(screen.getByText(/interactive demo:/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to landing page/i })).toHaveAttribute('href', '/');

      // Sidebar two primary tabs exist: Dashboard and Tasks
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /tasks/i })).toBeInTheDocument();
    });

    it('creates a task and displays it in the view when New Task form is submitted', () => {
      render(
        <MemoryRouter initialEntries={['/preview/today']}>
          <Routes>
            <Route path="/preview/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      // Open modal via sidebar New Task button
      const newTaskBtn = screen.getByRole('button', { name: /new task/i });
      fireEvent.click(newTaskBtn);

      expect(screen.getByRole('heading', { name: /create new task/i })).toBeInTheDocument();

      // Enter task title
      const titleInput = screen.getByLabelText(/task title \*/i);
      fireEvent.change(titleInput, { target: { value: 'Buy Groceries for Dinner' } });

      // Submit form
      const saveBtn = screen.getByRole('button', { name: /save task/i });
      fireEvent.click(saveBtn);

      // Modal is closed
      expect(screen.queryByRole('heading', { name: /create new task/i })).not.toBeInTheDocument();

      // New task appears in view and toast is shown
      expect(screen.getByText('Buy Groceries for Dinner')).toBeInTheDocument();
      expect(screen.getByText(/task "buy groceries for dinner" added/i)).toBeInTheDocument();
    });

    it('renders team space view when navigating to /preview/team/:teamId', async () => {
      render(
        <MemoryRouter initialEntries={['/preview/team/team-alpha-launch']}>
          <Routes>
            <Route path="/preview/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify team header and roadmap are rendered
      await screen.findByRole('heading', { level: 2, name: /alpha launch/i });
      expect(screen.getByText(/phased milestone roadmap/i)).toBeInTheDocument();
      expect(screen.getByText(/team tasks & deliverables/i)).toBeInTheDocument();
    });
  });
});
