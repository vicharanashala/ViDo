import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SAMPLE_TASKS } from '../../data/sampleTasks';
import { getHomeDashboardTasks } from '../../data/taskFilters';
import { HomeView } from './views/HomeView';
import { ListView } from './views/ListView';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskCreateModal } from './TaskCreateModal';
import { WorkspaceLayout, isKnownWorkspacePath } from './WorkspaceLayout';

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

    it('supports controlled filters and renders clean Tasks board without in-page filter bar', () => {
      const { rerender } = render(
        <MemoryRouter>
          <HomeView tasks={SAMPLE_TASKS} onTaskClick={vi.fn()} initialTab="tasks" />
        </MemoryRouter>
      );

      // Verify old in-page filter toolbar is completely removed
      expect(screen.queryByRole('region', { name: /task filters/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add filter/i })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /tasks/i })).toBeInTheDocument();

      // Rerender with category filter
      rerender(
        <MemoryRouter>
          <HomeView
            tasks={SAMPLE_TASKS}
            onTaskClick={vi.fn()}
            initialTab="tasks"
            categoryFilter="personal"
          />
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { name: /personal & routine/i })).toBeInTheDocument();
    });

    it('does not apply any filter by default when opening Tasks view', () => {
      render(
        <MemoryRouter>
          <HomeView tasks={SAMPLE_TASKS} onTaskClick={vi.fn()} initialTab="tasks" />
        </MemoryRouter>
      );

      // Verify no filter pills exist
      expect(screen.queryByText(/status:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/category:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/priority:/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument();

      // Verify all default board columns are rendered without filters
      expect(screen.getByRole('heading', { name: /personal & routine/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /work & professional/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /household & living/i })).toBeInTheDocument();
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
      expect(screen.getByRole('heading', { name: /tasks/i })).toBeInTheDocument();
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
      expect(createdCall.dueTime).toBe('23:59');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('initializes default due time to 23:59 in the modal form', () => {
      render(
        <TaskCreateModal
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const dueTimeInput = screen.getByLabelText(/due time \(optional\)/i);
      expect(dueTimeInput).toHaveValue('23:59');
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

    it('sets min attribute on date inputs to disallow dates older than 7 days ago and allows future start dates', () => {
      render(<TaskCreateModal isOpen={true} onClose={vi.fn()} />);

      const startDateInput = screen.getByLabelText(/start date \(optional\)/i);
      expect(startDateInput).toHaveAttribute('min');
      expect(startDateInput.getAttribute('min')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(startDateInput).not.toHaveAttribute('max');

      const dateInput = screen.getByLabelText(/target due date \*/i);
      expect(dateInput).toHaveAttribute('min');
      expect(dateInput.getAttribute('min')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('allows planning future tasks with start date beyond current date', () => {
      const handleCreate = vi.fn();
      render(<TaskCreateModal isOpen={true} onClose={vi.fn()} onCreateTask={handleCreate} />);

      const titleInput = screen.getByLabelText(/task title \*/i);
      fireEvent.change(titleInput, { target: { value: 'Future Planned Task' } });

      const startDateInput = screen.getByLabelText(/start date \(optional\)/i);
      fireEvent.change(startDateInput, { target: { value: '2026-12-01' } });

      const dueDateInput = screen.getByLabelText(/target due date \*/i);
      fireEvent.change(dueDateInput, { target: { value: '2026-12-05' } });

      const saveBtn = screen.getByRole('button', { name: /^create task$/i });
      expect(saveBtn).not.toBeDisabled();
      fireEvent.click(saveBtn);

      expect(handleCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Future Planned Task',
          startDate: '2026-12-01',
          dueDate: '2026-12-05',
        })
      );
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

      // TopBar provides persistent workspace context while view provides its heading
      expect(screen.getByRole('banner')).toHaveTextContent('Workspace');
      expect(screen.getByRole('heading', { name: /today's work/i })).toBeInTheDocument();

      // Verify persistent demo preview banner and single unmissable back button
      expect(screen.getByText('DEMO PREVIEW')).toBeInTheDocument();
      expect(screen.getByText(/interactive demo:/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to landing page/i })).toHaveAttribute('href', '/');

      // Sidebar two primary tabs exist: Dashboard and Tasks
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /^tasks/i })).toBeInTheDocument();
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
      const tasksLink = screen.getByRole('link', { name: /^tasks/i });
      fireEvent.click(tasksLink);

      // Now on Tasks view: Google Tasks layout is rendered, in-page tablist is NOT present
      expect(screen.getAllByRole('heading', { name: /tasks/i })[0]).toBeInTheDocument();
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

      // Open modal via New Task button
      const newTaskBtn = screen.getAllByRole('button', { name: /new task/i })[0];
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

    it('creates a task with default date and displays it under Today Agenda on Dashboard, not Upcoming', () => {
      render(
        <MemoryRouter initialEntries={['/preview']}>
          <Routes>
            <Route path="/preview/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify on dashboard
      expect(screen.getByRole('heading', { name: /today's agenda/i })).toBeInTheDocument();

      // Open modal via New Task button
      const newTaskBtn = screen.getAllByRole('button', { name: /new task/i })[0];
      fireEvent.click(newTaskBtn);

      // Enter task title
      const titleInput = screen.getByLabelText(/task title \*/i);
      fireEvent.change(titleInput, { target: { value: 'Launch Critical Project Today' } });

      // Save task
      const saveBtn = screen.getByRole('button', { name: /^create task$/i });
      fireEvent.click(saveBtn);

      // Ensure modal is closed
      expect(screen.queryByRole('heading', { name: /create new task/i })).not.toBeInTheDocument();

      // Verify task is in Today's Agenda on the Dashboard
      expect(screen.getByText('Launch Critical Project Today')).toBeInTheDocument();

      // Switch to Upcoming tile
      const upcomingTile = screen.getByRole('button', { name: /view upcoming tasks/i });
      fireEvent.click(upcomingTile);

      // Verify task is NOT in Upcoming Schedule
      expect(screen.queryByText('Launch Critical Project Today')).not.toBeInTheDocument();
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

    it('renders standalone not-found view without sidebar or topbar on unmapped workspace subroutes', () => {
      render(
        <MemoryRouter initialEntries={['/preview/unmapped-subroute-path']}>
          <Routes>
            <Route path="/preview/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify not found view elements
      expect(
        screen.getByRole('heading', { name: /you've wandered off the scheduled horizon/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId('animated-character')).toBeInTheDocument();

      // Verify workspace chrome (sidebar and top bar) is NOT rendered
      expect(screen.queryByRole('navigation', { name: /workspace navigation/i })).not.toBeInTheDocument();
      expect(screen.queryByText('DEMO PREVIEW')).not.toBeInTheDocument();
    });

    it('renders standalone not-found view on nested sub-endpoints under tasks or other sections', () => {
      render(
        <MemoryRouter initialEntries={['/preview/tasks/invalid-sub-endpoint']}>
          <Routes>
            <Route path="/preview/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      expect(
        screen.getByRole('heading', { name: /you've wandered off the scheduled horizon/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId('animated-character')).toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: /workspace navigation/i })).not.toBeInTheDocument();
      expect(screen.queryByText('DEMO PREVIEW')).not.toBeInTheDocument();
    });

    it('isKnownWorkspacePath helper correctly classifies valid and invalid paths regardless of sub-endpoints', () => {
      // Valid known paths
      expect(isKnownWorkspacePath('/workspace', '/workspace')).toBe(true);
      expect(isKnownWorkspacePath('/workspace/', '/workspace')).toBe(true);
      expect(isKnownWorkspacePath('/workspace/dashboard', '/workspace')).toBe(true);
      expect(isKnownWorkspacePath('/workspace/tasks', '/workspace')).toBe(true);
      expect(isKnownWorkspacePath('/workspace/today', '/workspace')).toBe(true);
      expect(isKnownWorkspacePath('/workspace/upcoming', '/workspace')).toBe(true);
      expect(isKnownWorkspacePath('/workspace/needs-attention', '/workspace')).toBe(true);
      expect(isKnownWorkspacePath('/workspace/completed', '/workspace')).toBe(true);
      expect(isKnownWorkspacePath('/workspace/archived', '/workspace')).toBe(true);
      expect(isKnownWorkspacePath('/workspace/calendar', '/workspace')).toBe(true);
      expect(isKnownWorkspacePath('/workspace/analytics', '/workspace')).toBe(true);
      expect(isKnownWorkspacePath('/workspace/settings', '/workspace')).toBe(true);
      expect(isKnownWorkspacePath('/workspace/team/alpha-1', '/workspace')).toBe(true);

      // Invalid sub-endpoints (MUST be rejected and return false)
      expect(isKnownWorkspacePath('/workspace/tasks/today', '/workspace')).toBe(false);
      expect(isKnownWorkspacePath('/workspace/tasks/any-sub-path', '/workspace')).toBe(false);
      expect(isKnownWorkspacePath('/workspace/today/extra', '/workspace')).toBe(false);
      expect(isKnownWorkspacePath('/workspace/calendar/month', '/workspace')).toBe(false);
      expect(isKnownWorkspacePath('/workspace/team', '/workspace')).toBe(false);
      expect(isKnownWorkspacePath('/workspace/team/', '/workspace')).toBe(false);
      expect(isKnownWorkspacePath('/workspace/team/alpha-1/extra', '/workspace')).toBe(false);
      expect(isKnownWorkspacePath('/workspace/random-wrong-endpoint', '/workspace')).toBe(false);
    });

    it('distinguishes between deleting completed tasks and cleaning up old uncompleted tasks in WorkspaceLayout', async () => {
      render(
        <MemoryRouter initialEntries={['/preview/tasks']}>
          <Routes>
            <Route path="/preview/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      // Open the column 3-dots menu on Work column
      const menuButtons = screen.getAllByLabelText('List options');
      fireEvent.click(menuButtons[0]);

      // Click "Clean up old tasks"
      const cleanUpBtn = screen.getByRole('menuitem', { name: /clean up old tasks/i });
      fireEvent.click(cleanUpBtn);

      // Verify toast message for old uncompleted tasks
      expect(await screen.findByText('Old uncompleted tasks cleaned up.')).toBeInTheDocument();

      // Open menu again and click "Delete all completed tasks"
      fireEvent.click(menuButtons[0]);
      const deleteCompletedBtn = screen.getByRole('menuitem', { name: /delete all completed tasks/i });
      fireEvent.click(deleteCompletedBtn);

      // Verify toast message for completed tasks
      expect(await screen.findByText('Completed tasks deleted.')).toBeInTheDocument();
    });
  });
});
