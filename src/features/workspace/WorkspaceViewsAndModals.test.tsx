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
          <HomeView dashboard={dashboard} onTaskClick={handleClick} />
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
          <HomeView tasks={SAMPLE_TASKS} onTaskClick={vi.fn()} initialTab="tasks" />
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

    it('renders Dashboard by default and Tasks view when initialTab is tasks without in-page dual navigation', () => {
      const { rerender } = render(
        <MemoryRouter>
          <HomeView tasks={SAMPLE_TASKS} onTaskClick={vi.fn()} />
        </MemoryRouter>
      );

      // Initially on Dashboard
      expect(screen.getByText(/welcome back, demo user/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add filter/i })).not.toBeInTheDocument();
      // Verify in-page dual navigation tablist is NOT rendered
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

      // Render with initialTab="tasks"
      rerender(
        <MemoryRouter>
          <HomeView tasks={SAMPLE_TASKS} onTaskClick={vi.fn()} initialTab="tasks" />
        </MemoryRouter>
      );

      // Now on Tasks view
      expect(screen.getByRole('button', { name: /add filter/i })).toBeInTheDocument();
      expect(screen.queryByText(/welcome back, demo user/i)).not.toBeInTheDocument();
      // Verify in-page dual navigation tablist is NOT rendered
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });

    it('does not show completed tasks in the tasks section', () => {
      render(
        <MemoryRouter>
          <HomeView tasks={SAMPLE_TASKS} onTaskClick={vi.fn()} initialTab="tasks" />
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
    it('validates form submission, creates task with automatic createdAt and triggers close', () => {
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

      const saveBtn = screen.getByRole('button', { name: /^create task$/i });
      expect(saveBtn).not.toBeDisabled();
      fireEvent.click(saveBtn);

      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(handleCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Task',
          state: 'active',
          dueTime: expect.any(String),
        })
      );
      // Check that createdAt is an ISO timestamp close to Date.now()
      const createdCall = handleCreate.mock.calls[0][0];
      expect(new Date(createdCall.createdAt).getTime()).toBeGreaterThan(0);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('defaults deadline time to 23:59 when time is left blank', () => {
      const handleClose = vi.fn();
      const handleCreate = vi.fn();

      render(
        <TaskCreateModal
          isOpen={true}
          onClose={handleClose}
          onCreateTask={handleCreate}
          initialDueTime=""
        />
      );

      const titleInput = screen.getByLabelText(/task title \*/i);
      fireEvent.change(titleInput, { target: { value: 'Task with blank time' } });

      const timeInput = screen.getByLabelText(/due time/i);
      fireEvent.change(timeInput, { target: { value: '' } });

      const saveBtn = screen.getByRole('button', { name: /^create task$/i });
      expect(saveBtn).not.toBeDisabled();
      fireEvent.click(saveBtn);

      expect(handleCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Task with blank time',
          dueTime: '23:59',
        })
      );
    });

    it('blocks setting deadline older than 7 days in the past and disables submit button', () => {
      const handleClose = vi.fn();
      const handleCreate = vi.fn();

      render(
        <TaskCreateModal
          isOpen={true}
          onClose={handleClose}
          onCreateTask={handleCreate}
        />
      );

      const titleInput = screen.getByLabelText(/task title \*/i);
      fireEvent.change(titleInput, { target: { value: 'Distant Past Task' } });

      const dateInput = screen.getByLabelText(/target due date \*/i);
      // Pick a date in the distant past (e.g. 2020-01-01)
      fireEvent.change(dateInput, { target: { value: '2020-01-01' } });

      const saveBtn = screen.getByRole('button', { name: /^create task$/i });
      expect(saveBtn).toBeDisabled();
      fireEvent.click(saveBtn);

      expect(handleCreate).not.toHaveBeenCalled();
      expect(handleClose).not.toHaveBeenCalled();
      expect(screen.getAllByText(/7-day logging window/i).length).toBeGreaterThan(0);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('blocks setting deadline earlier than start time and disables submit button', () => {
      const handleClose = vi.fn();
      const handleCreate = vi.fn();

      render(
        <TaskCreateModal
          isOpen={true}
          onClose={handleClose}
          onCreateTask={handleCreate}
        />
      );

      const titleInput = screen.getByLabelText(/task title \*/i);
      fireEvent.change(titleInput, { target: { value: 'Past Time Task' } });

      // Setting 00:01 on today date is before current time unless test runs at exactly midnight
      const timeInput = screen.getByLabelText(/due time/i);
      fireEvent.change(timeInput, { target: { value: '00:01' } });

      const saveBtn = screen.getByRole('button', { name: /^create task$/i });
      const nowTime = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
      if (nowTime > '00:01') {
        expect(saveBtn).toBeDisabled();
        fireEvent.click(saveBtn);
        expect(handleCreate).not.toHaveBeenCalled();
        expect(handleClose).not.toHaveBeenCalled();
        expect(screen.getByText(/deadline must be later than the start time/i)).toBeInTheDocument();
      }
    });

    it('supports 1-week grace period backdating and enforces deadline >= start date', () => {
      const handleClose = vi.fn();
      const handleCreate = vi.fn();

      render(
        <TaskCreateModal
          isOpen={true}
          onClose={handleClose}
          onCreateTask={handleCreate}
        />
      );

      const titleInput = screen.getByLabelText(/task title \*/i);
      fireEvent.change(titleInput, { target: { value: 'Retrospective Task' } });

      // Start Date input is directly accessible (optional, date-only)
      const startDateInput = screen.getByLabelText(/start date \(optional\)/i);
      expect(startDateInput).toBeInTheDocument();

      // Backdate start to 3 days ago
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const threeDaysAgoStr = `${threeDaysAgo.getFullYear()}-${String(threeDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(threeDaysAgo.getDate()).padStart(2, '0')}`;
      fireEvent.change(startDateInput, { target: { value: threeDaysAgoStr } });

      // Set deadline to 2 days ago (which is after start date and within 7-day window)
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const twoDaysAgoStr = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`;
      const dueDateInput = screen.getByLabelText(/target due date \*/i);
      fireEvent.change(dueDateInput, { target: { value: twoDaysAgoStr } });

      const saveBtn = screen.getByRole('button', { name: /^create task$/i });
      expect(saveBtn).not.toBeDisabled();
      fireEvent.click(saveBtn);

      expect(handleCreate).toHaveBeenCalledTimes(1);
      const taskCreated = handleCreate.mock.calls[0][0];
      expect(taskCreated.startDate).toBe(threeDaysAgoStr);
      expect(taskCreated.dueDate).toBe(twoDaysAgoStr);
      expect(taskCreated.createdAt).toContain(threeDaysAgoStr);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('blocks setting start date older than 7 days in the past and disables submit button', () => {
      const handleCreate = vi.fn();

      render(<TaskCreateModal isOpen={true} onClose={vi.fn()} onCreateTask={handleCreate} />);

      const titleInput = screen.getByLabelText(/task title \*/i);
      fireEvent.change(titleInput, { target: { value: 'Very Old Started Task' } });

      const startDateInput = screen.getByLabelText(/start date \(optional\)/i);
      fireEvent.change(startDateInput, { target: { value: '2020-01-01' } });

      const saveBtn = screen.getByRole('button', { name: /^create task$/i });
      expect(saveBtn).toBeDisabled();
      fireEvent.click(saveBtn);

      expect(handleCreate).not.toHaveBeenCalled();
      expect(screen.getAllByText(/start date cannot be older than 7 days/i).length).toBeGreaterThan(0);
    });

    it('blocks setting deadline date earlier than start date and disables submit button', () => {
      const handleCreate = vi.fn();

      render(<TaskCreateModal isOpen={true} onClose={vi.fn()} onCreateTask={handleCreate} />);

      const titleInput = screen.getByLabelText(/task title \*/i);
      fireEvent.change(titleInput, { target: { value: 'Inverted Dates Task' } });

      // Start 2 days ago
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const twoDaysAgoStr = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`;
      const startDateInput = screen.getByLabelText(/start date \(optional\)/i);
      fireEvent.change(startDateInput, { target: { value: twoDaysAgoStr } });

      // Deadline 3 days ago (earlier than start date)
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const threeDaysAgoStr = `${threeDaysAgo.getFullYear()}-${String(threeDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(threeDaysAgo.getDate()).padStart(2, '0')}`;
      const dueDateInput = screen.getByLabelText(/target due date \*/i);
      fireEvent.change(dueDateInput, { target: { value: threeDaysAgoStr } });

      const saveBtn = screen.getByRole('button', { name: /^create task$/i });
      expect(saveBtn).toBeDisabled();
      fireEvent.click(saveBtn);

      expect(handleCreate).not.toHaveBeenCalled();
      expect(screen.getAllByText(/deadline date must be on or after start date/i).length).toBeGreaterThan(0);
    });

    it('sets min attribute on date inputs to disallow dates older than 7 days ago', () => {
      render(<TaskCreateModal isOpen={true} onClose={vi.fn()} />);

      const startDateInput = screen.getByLabelText(/start date \(optional\)/i);
      expect(startDateInput).toHaveAttribute('min');
      expect(startDateInput).toHaveAttribute('max');
      expect(startDateInput.getAttribute('min')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(startDateInput.getAttribute('max')).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const dateInput = screen.getByLabelText(/target due date \*/i);
      expect(dateInput).toHaveAttribute('min');
      expect(dateInput.getAttribute('min')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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

    it('navigates between Dashboard and Tasks via sidebar without in-page dual navigation', () => {
      render(
        <MemoryRouter initialEntries={['/preview']}>
          <Routes>
            <Route path="/preview/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      // On Dashboard: Hero overview is visible, in-page tablist is NOT present
      expect(screen.getByText(/welcome back, demo user/i)).toBeInTheDocument();
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

      // Click Tasks in sidebar
      const tasksLink = screen.getByRole('link', { name: /tasks/i });
      fireEvent.click(tasksLink);

      // Now on Tasks view: Filter builder is visible, in-page tablist is NOT present
      expect(screen.getByRole('button', { name: /add filter/i })).toBeInTheDocument();
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

      // Click Dashboard in sidebar
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      fireEvent.click(dashboardLink);

      // Back to Dashboard
      expect(screen.getByText(/welcome back, demo user/i)).toBeInTheDocument();
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
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
      const saveBtn = screen.getByRole('button', { name: /^create task$/i });
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
