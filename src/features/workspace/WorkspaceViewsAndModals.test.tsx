import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TASK_FIXTURES } from '../../data/testTaskFixtures';
import { getHomeDashboardTasks } from '../../data/taskFilters';
import { HomeView } from './views/HomeView';
import { ListView } from './views/ListView';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskCreateModal } from './TaskCreateModal';
import { WorkspaceLayout, isKnownWorkspacePath } from './WorkspaceLayout';

describe('Workspace Views and Modals', () => {
  afterEach(() => { vi.useRealTimers(); });

  describe('HomeView Daily Timeline Dashboard and Task Switching', () => {
    it('renders the daily timeline dashboard with 24-hour markers and task labels', () => {
      const dashboard = getHomeDashboardTasks(TASK_FIXTURES);
      const handleClick = vi.fn();

      render(
        <MemoryRouter>
          <HomeView dashboard={dashboard} onTaskClick={handleClick} />
        </MemoryRouter>
      );

      expect(screen.getByText(/24-Hour Interactive Timeline/i)).toBeInTheDocument();
      expect(screen.getByText(/Horizontal 24-hour timeline with live current-time indicator/i)).toBeInTheDocument();
      expect(screen.getAllByText(/12 AM/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/12 PM/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/previous day/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/next day/i)).toBeInTheDocument();

      const taskMarkers = screen.getAllByRole('button', { name: /fixture planning block/i });
      fireEvent.click(taskMarkers[0]);
      expect(handleClick).toHaveBeenCalled();
    });

    it('supports dynamic filter addition, pill removal, and clear all filters in Tasks tab', () => {
      render(
        <MemoryRouter>
          <HomeView isPreview tasks={TASK_FIXTURES} onTaskClick={vi.fn()} initialTab="tasks" />
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

    it('renders Dashboard by default and Tasks view when initialTab is tasks', () => {
      const { rerender } = render(
        <MemoryRouter>
          <HomeView isPreview tasks={TASK_FIXTURES} onTaskClick={vi.fn()} />
        </MemoryRouter>
      );

      // Initially on Dashboard
      expect(screen.getByText(/24-Hour Interactive Timeline/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add filter/i })).not.toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();

      // Render with initialTab="tasks"
      rerender(
        <MemoryRouter>
          <HomeView isPreview tasks={TASK_FIXTURES} onTaskClick={vi.fn()} initialTab="tasks" />
        </MemoryRouter>
      );

      // Now on Tasks view
      expect(screen.getByRole('button', { name: /add filter/i })).toBeInTheDocument();
      expect(screen.queryByText(/24-Hour Interactive Timeline/i)).not.toBeInTheDocument();

      // Click Dashboard tab
      const dashboardTab = screen.getByRole('tab', { name: /dashboard/i });
      fireEvent.click(dashboardTab);

      // Back to Dashboard
      expect(screen.getByText(/24-Hour Interactive Timeline/i)).toBeInTheDocument();
    });

    it('does not show completed tasks in the tasks section', () => {
      render(
        <MemoryRouter>
          <HomeView isPreview tasks={TASK_FIXTURES} onTaskClick={vi.fn()} initialTab="tasks" />
        </MemoryRouter>
      );

      // Verify active task is shown
      expect(screen.getByText(/fixture planning block/i)).toBeInTheDocument();

      // Verify completed tasks are strictly excluded from the tasks section
      const completedTasks = TASK_FIXTURES.filter((t) => t.state === 'completed');
      expect(completedTasks.length).toBeGreaterThan(0);
      completedTasks.forEach((task) => {
        expect(screen.queryByText(task.title)).not.toBeInTheDocument();
      });
    });
  });

  describe('ListView Rendering and Category Filtering', () => {
    it('renders full list of tasks and filters by category', () => {
      const handleClick = vi.fn();
      const todayTasks = TASK_FIXTURES.filter((t) => t.dueDate === '2026-11-17');

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
      const personalBtn = screen.getByRole('button', { name: /^personal/i });
      fireEvent.click(personalBtn);

      // Verify personal tasks are rendered
      expect(screen.getByText(/fixture personal renewal/i)).toBeInTheDocument();
    });
  });

  describe('TaskDetailModal', () => {
    it('displays task metadata and closes on Escape', () => {
      const handleClose = vi.fn();
      const task = TASK_FIXTURES[0]; // Task with checkpoints

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
    it('creates a task with the original form defaults and closes the modal', () => {
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
      expect(screen.getByLabelText(/target due date \*/i)).toHaveValue('2026-11-17');
      expect(screen.getByLabelText(/due time \(optional\)/i)).toHaveValue('17:00');

      fireEvent.change(screen.getByLabelText(/task title \*/i), {
        target: { value: 'New Test Task' },
      });
      fireEvent.change(screen.getByPlaceholderText(/add key context/i), {
        target: { value: 'Created from the restored early form.' },
      });

      fireEvent.click(screen.getByRole('button', { name: /save task/i }));

      expect(handleCreate).toHaveBeenCalledTimes(1);
      expect(handleCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Task',
          description: 'Created from the restored early form.',
          dueDate: '2026-11-17',
          dueTime: '17:00',
          priority: 'medium',
          category: 'personal',
          state: 'active',
          createdAt: '2026-11-17T12:00:00Z',
        })
      );
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not create a task or close when the title is blank', () => {
      const handleClose = vi.fn();
      const handleCreate = vi.fn();

      render(
        <TaskCreateModal
          isOpen={true}
          onClose={handleClose}
          onCreateTask={handleCreate}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /save task/i }));

      expect(handleCreate).not.toHaveBeenCalled();
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('closes the modal on Escape', () => {
      const handleClose = vi.fn();

      render(<TaskCreateModal isOpen={true} onClose={handleClose} />);

      fireEvent.keyDown(window, { key: 'Escape' });
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

      // Top bar provides persistent workspace context while the view supplies its heading
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

    it('navigates between Dashboard and Tasks via sidebar', () => {
      render(
        <MemoryRouter initialEntries={['/preview']}>
          <Routes>
            <Route path="/preview/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      // On Dashboard: timeline is visible
      expect(screen.getByText(/24-Hour Interactive Timeline/i)).toBeInTheDocument();

      // Click Tasks in sidebar
      const tasksLink = screen.getByRole('link', { name: /^tasks/i });
      fireEvent.click(tasksLink);

      // Now on Tasks view: Filter builder is visible
      expect(screen.getByRole('button', { name: /add filter/i })).toBeInTheDocument();

      // Click Dashboard in sidebar
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      fireEvent.click(dashboardLink);

      // Back to Dashboard
      expect(screen.getByText(/24-Hour Interactive Timeline/i)).toBeInTheDocument();
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
      const saveBtn = screen.getByRole('button', { name: /save task/i });
      fireEvent.click(saveBtn);

      // Modal is closed
      expect(screen.queryByRole('heading', { name: /create new task/i })).not.toBeInTheDocument();

      // New task appears in view and toast is shown
      expect(screen.getByText('Buy Groceries for Dinner')).toBeInTheDocument();
      expect(screen.getByText(/task "buy groceries for dinner" added/i)).toBeInTheDocument();
    });

    it('creates a task with default date and displays it on the Dashboard timeline', () => {
      // The preview dashboard uses the fixed benchmark date, so freeze the clock to it.
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 10, 17, 12, 0, 0));

      render(
        <MemoryRouter initialEntries={['/preview']}>
          <Routes>
            <Route path="/preview/*" element={<WorkspaceLayout />} />
          </Routes>
        </MemoryRouter>
      );

      // Verify on dashboard
      expect(screen.getByText(/24-Hour Interactive Timeline/i)).toBeInTheDocument();

      // Open modal via New Task button
      const newTaskBtn = screen.getAllByRole('button', { name: /new task/i })[0];
      fireEvent.click(newTaskBtn);

      // Enter task title
      const titleInput = screen.getByLabelText(/task title \*/i);
      fireEvent.change(titleInput, { target: { value: 'Launch Critical Project Today' } });

      // The restored early form defaults to the preview dashboard date.
      expect(screen.getByLabelText(/^target due date \*$/i)).toHaveValue('2026-11-17');

      // Save task
      const saveBtn = screen.getByRole('button', { name: /save task/i });
      fireEvent.click(saveBtn);

      // Ensure modal is closed
      expect(screen.queryByRole('heading', { name: /create new task/i })).not.toBeInTheDocument();

      // Verify task appears on dashboard
      expect(screen.getAllByText('Launch Critical Project Today').length).toBeGreaterThan(0);

      vi.useRealTimers();
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
  });
});
