// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { TasksBoardView } from './TasksBoardView';
import { formatCompletedDate } from './TaskBoardCard';
import { SampleTask } from '../../../data/sampleTasks';

const sampleTasks: SampleTask[] = [
  {
    id: 't-1',
    title: 'Personal Laundry',
    category: 'personal',
    dueDate: '2026-11-17',
    dueTime: '12:00',
    priority: 'high',
    state: 'active',
    createdAt: '2026-11-16T10:00:00Z',
    subtasks: [
      { id: 'st-1', title: 'Fold clothes', completed: false },
    ],
  },
  {
    id: 't-2',
    title: 'Work Sprint Review',
    category: 'work',
    dueDate: '2026-11-17',
    dueTime: '16:00',
    priority: 'medium',
    state: 'active',
    createdAt: '2026-11-16T10:00:00Z',
  },
];

describe('TasksBoardView Component', () => {
  it('renders default category columns and task titles', () => {
    render(
      <TasksBoardView
        tasks={sampleTasks}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    expect(screen.getByText('Personal & Routine')).toBeInTheDocument();
    expect(screen.getByText('Work & Professional')).toBeInTheDocument();
    expect(screen.getByText('Household & Living')).toBeInTheDocument();
    expect(screen.getByText('Personal Laundry')).toBeInTheDocument();
    expect(screen.getByText('Work Sprint Review')).toBeInTheDocument();
  });

  it('allows expanding a card inline for editing', () => {
    render(
      <TasksBoardView
        tasks={sampleTasks}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    const card = screen.getByText('Personal Laundry');
    fireEvent.click(card);

    // Expanded inline card shows Done button, Details placeholder, Subtasks
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Details')).toBeInTheDocument();
    expect(screen.getByText('Fold clothes')).toBeInTheDocument();
  });

  it('automatically closes expanded card when clicking anywhere outside of it', () => {
    render(
      <TasksBoardView
        tasks={sampleTasks}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    const card = screen.getByText('Personal Laundry');
    fireEvent.click(card);

    expect(screen.getByText('Done')).toBeInTheDocument();

    // Click outside on the document body
    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('Done')).not.toBeInTheDocument();
  });

  it('triggers quick task add on form submission', () => {
    const handleAddTask = vi.fn();
    render(
      <TasksBoardView
        tasks={sampleTasks}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={handleAddTask}
      />
    );

    const addBtns = screen.getAllByText('Add a task');
    fireEvent.click(addBtns[0]);

    const titleInput = screen.getByPlaceholderText(/new task|title/i);
    fireEvent.change(titleInput, { target: { value: 'New Quick Task' } });
    fireEvent.submit(titleInput.closest('form')!);

    expect(handleAddTask).toHaveBeenCalledWith('personal', 'New Quick Task');
  });

  it('does not render "+ Add list" directly on the board (moved to Settings)', () => {
    render(
      <TasksBoardView
        tasks={sampleTasks}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    expect(screen.queryByText('Add list')).not.toBeInTheDocument();
  });

  it('supports renaming an existing list', () => {
    const handleRenameList = vi.fn();
    render(
      <TasksBoardView
        tasks={sampleTasks}
        onRenameList={handleRenameList}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    const heading = screen.getByText('Personal & Routine');
    fireEvent.doubleClick(heading);

    const input = screen.getByDisplayValue('Personal & Routine');
    fireEvent.change(input, { target: { value: 'Personal & Habits' } });
    fireEvent.submit(input.closest('form')!);

    expect(handleRenameList).toHaveBeenCalledWith('personal', 'Personal & Habits');
  });

  it('renders and expands completed tasks accordion and supports delete on hover', () => {
    const handleDeleteTask = vi.fn();
    const handleToggleTask = vi.fn();
    const tasksWithCompleted: SampleTask[] = [
      ...sampleTasks,
      {
        id: 't-completed',
        title: 'Finished Tax Filing',
        description: 'Filed all forms before midnight',
        category: 'personal',
        dueDate: '2026-11-17',
        priority: 'low',
        state: 'completed',
        createdAt: '2026-11-16T10:00:00Z',
        completedAt: '2026-11-17T14:30:00Z',
      },
    ];

    render(
      <TasksBoardView
        tasks={tasksWithCompleted}
        onToggleTask={handleToggleTask}
        onUpdateTask={vi.fn()}
        onDeleteTask={handleDeleteTask}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    // Completed task title is collapsed by default
    expect(screen.queryByText('Finished Tax Filing')).not.toBeInTheDocument();

    // Accordion button is rendered
    const completedAccordion = screen.getByText('Completed (1)');
    expect(completedAccordion).toBeInTheDocument();

    // Expand completed tasks
    fireEvent.click(completedAccordion);
    expect(screen.getByText('Finished Tax Filing')).toBeInTheDocument();

    // Verifies Google Tasks style completion timestamp is displayed
    expect(screen.getByText(/Completed:/i)).toBeInTheDocument();

    // Verifies description preview is displayed in card
    expect(screen.getByText('Filed all forms before midnight')).toBeInTheDocument();

    // Verifies delete button on hover is present and calls onDeleteTask
    const deleteBtn = screen.getByLabelText('Delete task');
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);
    expect(handleDeleteTask).toHaveBeenCalledWith('t-completed');

    // Verifies that completed tasks do not have a star button
    const completedCard = screen.getByText('Finished Tax Filing').closest('.group')!;
    expect(completedCard.querySelector('button[aria-label*="star"]')).toBeNull();

    // Verifies clicking checkmark toggles task back to active
    const checkBtn = screen.getByLabelText('Mark active');
    expect(checkBtn).toBeInTheDocument();
    fireEvent.click(checkBtn);
    expect(handleToggleTask).toHaveBeenCalledWith(tasksWithCompleted[tasksWithCompleted.length - 1]);
  });

  it('correctly formats completion dates according to Google Tasks specifications', () => {
    // Current benchmark year (2026): "Completed: <Weekday> <Day> <MonthShort>"
    const sameYear = formatCompletedDate('2026-11-24T10:00:00Z', undefined, '2026-11-17');
    expect(sameYear).toBe('Completed: Tue 24 Nov');

    // Previous year (2024): "Completed: <Day> <MonthLong> <Year>"
    const prevYear1 = formatCompletedDate('2024-11-17T10:00:00Z', undefined, '2026-11-17');
    expect(prevYear1).toBe('Completed: 17 November 2024');

    const prevYear2 = formatCompletedDate('2024-09-06T10:00:00Z', undefined, '2026-11-17');
    expect(prevYear2).toBe('Completed: 6 September 2024');

    // Fallback when missing
    expect(formatCompletedDate(undefined, undefined)).toBe('Completed');
  });

  it('supports rearranging task boards via drag and drop', () => {
    const handleReorder = vi.fn();
    render(
      <TasksBoardView
        tasks={sampleTasks}
        onReorderLists={handleReorder}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    const columns = screen.getAllByTitle('Drag to rearrange list');
    expect(columns.length).toBeGreaterThanOrEqual(2);

    const sourceColumn = columns[0].closest('[draggable="true"]')!;
    const targetColumn = columns[1].closest('[draggable="true"]')!;

    // Drag start on first column
    const dataTransfer = {
      data: {} as Record<string, string>,
      setData(format: string, val: string) {
        this.data[format] = val;
      },
      getData(format: string) {
        return this.data[format] || '';
      },
      effectAllowed: 'move',
      dropEffect: 'move',
    };

    fireEvent.dragStart(sourceColumn, { dataTransfer });
    fireEvent.dragOver(targetColumn, { dataTransfer });
    fireEvent.drop(targetColumn, { dataTransfer });

    expect(handleReorder).toHaveBeenCalled();
    const newOrder = handleReorder.mock.calls[0][0];
    expect(newOrder[0].id).toBe('home');
    expect(newOrder[1].id).toBe('personal');
  });

  it('adjusts column horizontal size classes dynamically based on column count', () => {
    // 1 column should take max-w-3xl flex-1
    const { rerender } = render(
      <TasksBoardView
        tasks={[]}
        customLists={[{ id: 'single', title: 'Single List' }]}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    const col1 = screen.getByTestId('task-board-column');
    expect(col1.className).toContain('max-w-3xl');

    // 2 columns should take max-w-[640px] flex-1
    rerender(
      <TasksBoardView
        tasks={[]}
        customLists={[
          { id: 'col1', title: 'List 1' },
          { id: 'col2', title: 'List 2' },
        ]}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    const cols = screen.getAllByTestId('task-board-column');
    expect(cols[0].className).toContain('max-w-[640px]');
    expect(cols[1].className).toContain('max-w-[640px]');
  });

  it('supports dragging and dropping task cards within and across boards', () => {
    const handleMoveTask = vi.fn();
    render(
      <TasksBoardView
        tasks={sampleTasks}
        onMoveTask={handleMoveTask}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    const task1 = screen.getByText('Personal Laundry').closest('[draggable="true"]')!;
    const task2 = screen.getByText('Work Sprint Review').closest('[draggable="true"]')!;

    const dataTransfer = {
      data: {} as Record<string, string>,
      setData(format: string, val: string) {
        this.data[format] = val;
      },
      getData(format: string) {
        return this.data[format] || '';
      },
      effectAllowed: 'move',
      dropEffect: 'move',
    };

    // Drag start on Task 1
    fireEvent.dragStart(task1, { dataTransfer });

    // Drag over and drop on Task 2 (across board from personal to work)
    fireEvent.dragOver(task2, { dataTransfer, clientY: 100 });
    fireEvent.drop(task2, { dataTransfer });

    expect(handleMoveTask).toHaveBeenCalledWith('t-1', 'work', 't-2', expect.any(String));
  });

  it('renders Google Tasks style 3-dots options menu with Sort by, delete guard, and list utilities', () => {
    const multiTasks: SampleTask[] = [
      {
        id: 't-b',
        title: 'Banana task',
        category: 'personal',
        dueDate: '2026-11-20',
        state: 'active',
        createdAt: '2026-11-16T10:00:00Z',
      },
      {
        id: 't-a',
        title: 'Apple task',
        category: 'personal',
        dueDate: '2026-11-18',
        state: 'active',
        createdAt: '2026-11-16T10:00:00Z',
      },
    ];

    render(
      <TasksBoardView
        tasks={multiTasks}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    // Open 3-dots menu on Personal column
    const menuButtons = screen.getAllByLabelText('List options');
    fireEvent.click(menuButtons[0]);

    // Check menu sections and options
    expect(screen.getByText('Sort by')).toBeInTheDocument();
    expect(screen.getByText('My order')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Deadline')).toBeInTheDocument();
    expect(screen.getByText('Starred recently')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Rename list')).toBeInTheDocument();
    expect(screen.getByText('Delete list')).toBeInTheDocument();
    expect(screen.queryByText("The default list can't be deleted")).not.toBeInTheDocument();
    expect(screen.getByText('Print list')).toBeInTheDocument();
    expect(screen.getByText('Delete all completed tasks')).toBeInTheDocument();
    expect(screen.getByText('Clean up old tasks')).toBeInTheDocument();

    // Select Title sort
    fireEvent.click(screen.getByText('Title'));

    // Cards should now be sorted: Apple before Banana
    const titles = screen.getAllByText(/task$/i).map((el) => el.textContent);
    expect(titles.indexOf('Apple task')).toBeLessThan(titles.indexOf('Banana task'));
  });

  it('filters columns based on selectedCategories so unselected columns disappear', () => {
    render(
      <TasksBoardView
        tasks={sampleTasks}
        selectedCategories={['personal']}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    // Only Personal & Routine should be rendered
    expect(screen.getByText('Personal & Routine')).toBeInTheDocument();
    // Household and Work should NOT be rendered
    expect(screen.queryByText('Household & Living')).not.toBeInTheDocument();
    expect(screen.queryByText('Work & Professional')).not.toBeInTheDocument();
  });

  it('dynamically resizes column width when 1 or 2 categories are selected', () => {
    const { rerender } = render(
      <TasksBoardView
        tasks={sampleTasks}
        selectedCategories={['personal']}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    // 1 category selected -> expands to max-w-3xl flex-1
    const col1 = screen.getByTestId('task-board-column');
    expect(col1.className).toContain('max-w-3xl');

    // 2 categories selected -> expands to max-w-[640px] flex-1
    rerender(
      <TasksBoardView
        tasks={sampleTasks}
        selectedCategories={['personal', 'work']}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    const cols = screen.getAllByTestId('task-board-column');
    expect(cols[0].className).toContain('max-w-[640px]');
    expect(cols[1].className).toContain('max-w-[640px]');
  });

  it('opens repeating tasks popover beside the card when repeat button is clicked', () => {
    const handleUpdate = vi.fn();
    render(
      <TasksBoardView
        tasks={sampleTasks}
        onToggleTask={vi.fn()}
        onUpdateTask={handleUpdate}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    // Expand the first task card
    const taskCard = screen.getByText('Personal Laundry');
    fireEvent.click(taskCard);

    // Find and click the Repeat button inside the expanded card
    const repeatBtn = screen.getByRole('button', { name: /repeat/i });
    fireEvent.click(repeatBtn);

    // Verify popover opens with header "Repeats every"
    expect(screen.getByRole('heading', { name: /repeats every/i })).toBeInTheDocument();
    expect(screen.getByText('Reminder time')).toBeInTheDocument();
    expect(screen.getByTestId('repeat-done-btn')).toBeInTheDocument();

    // Click Done to save
    fireEvent.click(screen.getByTestId('repeat-done-btn'));
    expect(handleUpdate).toHaveBeenCalledWith(
      't-1',
      expect.objectContaining({
        recurrence: expect.objectContaining({
          enabled: true,
        }),
      })
    );
  });

  it('clamps date popover strictly within the viewport window frame', () => {
    render(
      <TasksBoardView
        tasks={sampleTasks}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    // Expand the task card
    const taskCard = screen.getByText('Personal Laundry');
    fireEvent.click(taskCard);

    // Click Date/time button
    const dateBtn = screen.getByRole('button', { name: /today, 12:00/i });
    fireEvent.click(dateBtn);

    // Verify popover is rendered and contains max-height constraint
    const popover = screen.getByTestId('task-date-popover');
    expect(popover).toBeInTheDocument();
    expect(popover.style.maxHeight).toBe('calc(100vh - 32px)');
  });

  it('closes task options delete menu when clicking outside of it or pressing Escape', () => {
    const handleDelete = vi.fn();
    render(
      <TasksBoardView
        tasks={sampleTasks}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onDeleteTask={handleDelete}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    // Open options menu on the first task card
    const optionsButtons = screen.getAllByRole('button', { name: /more task options/i });
    fireEvent.click(optionsButtons[0]);

    // Delete Task option is visible
    expect(screen.getByText(/delete task/i)).toBeInTheDocument();

    // Click outside on the document body
    fireEvent.mouseDown(document.body);

    // Verify Delete Task menu closed
    expect(screen.queryByText(/delete task/i)).not.toBeInTheDocument();

    // Reopen and test Escape key
    fireEvent.click(optionsButtons[0]);
    expect(screen.getByText(/delete task/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText(/delete task/i)).not.toBeInTheDocument();
  });

  it('handles Delete all completed tasks and Clean up old tasks separately with distinct disabled states and handlers', () => {
    const onDeleteCompletedTasks = vi.fn();
    const onCleanUpOldTasks = vi.fn();

    const tasksForCleanup: SampleTask[] = [
      {
        id: 'completed-1',
        title: 'Completed Task',
        category: 'personal',
        dueDate: '2026-11-17',
        state: 'completed',
        createdAt: '2026-11-16T10:00:00Z',
      },
      {
        id: 'old-uncompleted-1',
        title: 'Old Overdue Task',
        category: 'personal',
        dueDate: '2026-11-10', // old/overdue relative to 2026-11-17
        state: 'active',
        createdAt: '2026-11-09T10:00:00Z',
      },
      {
        id: 'today-uncompleted-1',
        title: 'Today Active Task',
        category: 'personal',
        dueDate: '2026-11-17',
        state: 'active',
        createdAt: '2026-11-16T10:00:00Z',
      },
    ];

    render(
      <TasksBoardView
        tasks={tasksForCleanup}
        referenceDateStr="2026-11-17"
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
        onDeleteCompletedTasks={onDeleteCompletedTasks}
        onCleanUpOldTasks={onCleanUpOldTasks}
      />
    );

    // Open options on personal column
    const menuButtons = screen.getAllByLabelText('List options');
    fireEvent.click(menuButtons[0]);

    const deleteCompletedBtn = screen.getByRole('menuitem', { name: /delete all completed tasks/i });
    const cleanUpOldBtn = screen.getByRole('menuitem', { name: /clean up old tasks/i });

    expect(deleteCompletedBtn).not.toBeDisabled();
    expect(cleanUpOldBtn).not.toBeDisabled();

    // Click clean up old tasks
    fireEvent.click(cleanUpOldBtn);
    expect(onCleanUpOldTasks).toHaveBeenCalledWith('personal');
    expect(onDeleteCompletedTasks).not.toHaveBeenCalled();

    // Reopen menu and click delete completed tasks
    fireEvent.click(menuButtons[0]);
    fireEvent.click(screen.getByRole('menuitem', { name: /delete all completed tasks/i }));
    expect(onDeleteCompletedTasks).toHaveBeenCalledWith('personal');
  });

  it('enforces mutual exclusivity between deadline and repeat in task card edit', () => {
    const handleUpdateTask = vi.fn();

    const tasksForExclusivity: SampleTask[] = [
      {
        id: 'task-with-deadline',
        title: 'Project Submission',
        category: 'work',
        dueDate: '2026-11-26',
        dueTime: '23:59',
        deadline: '2026-11-26 23:59',
        state: 'active',
        createdAt: '2026-11-16T10:00:00Z',
      },
      {
        id: 'task-with-repeat',
        title: 'Daily Standup',
        category: 'work',
        dueDate: '2026-11-17',
        state: 'active',
        createdAt: '2026-11-16T10:00:00Z',
        recurrence: {
          enabled: true,
          rule: 'RRULE:FREQ=DAILY',
        },
      },
    ];

    render(
      <TasksBoardView
        tasks={tasksForExclusivity}
        onToggleTask={vi.fn()}
        onUpdateTask={handleUpdateTask}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    // 1. Expand task with deadline: Repeat button must be disabled
    fireEvent.click(screen.getByText('Project Submission'));
    const repeatBtnDisabled = screen.getByRole('button', { name: /repeat/i });
    expect(repeatBtnDisabled).toBeDisabled();
    expect(repeatBtnDisabled).toHaveClass('cursor-not-allowed');

    // Deadline button is active
    const deadlineBtnActive = screen.getByRole('button', { name: /deadline:/i });
    expect(deadlineBtnActive).not.toBeDisabled();

    // Click remove deadline button
    const removeDeadlineBtn = screen.getByTitle('Remove deadline');
    fireEvent.click(removeDeadlineBtn);
    expect(handleUpdateTask).toHaveBeenCalledWith('task-with-deadline', { deadline: undefined });

    // 2. Expand task with recurrence: Deadline button must be disabled
    fireEvent.click(screen.getByText('Daily Standup'));
    const deadlineBtnDisabled = screen.getByRole('button', { name: /^set deadline$/i });
    expect(deadlineBtnDisabled).toBeDisabled();
    expect(deadlineBtnDisabled).toHaveClass('cursor-not-allowed');

    // Repeat button is active
    const repeatBtnActive = screen.getByRole('button', { name: /daily/i });
    expect(repeatBtnActive).not.toBeDisabled();

    // Click remove repeat button
    const removeRepeatBtn = screen.getByTitle('Remove repeat');
    fireEvent.click(removeRepeatBtn);
    expect(handleUpdateTask).toHaveBeenCalledWith('task-with-repeat', {
      recurrence: { enabled: false, rule: null },
    });
  });

  it('sets deadline via TaskDeadlinePopover and clears any repeat recurrence', () => {
    const handleUpdateTask = vi.fn();

    const plainTask: SampleTask[] = [
      {
        id: 'plain-task-1',
        title: 'Write Documentation',
        category: 'personal',
        dueDate: '2026-11-17',
        state: 'active',
        createdAt: '2026-11-16T10:00:00Z',
      },
    ];

    render(
      <TasksBoardView
        tasks={plainTask}
        onToggleTask={vi.fn()}
        onUpdateTask={handleUpdateTask}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    // Expand card
    fireEvent.click(screen.getByText('Write Documentation'));

    // Click Deadline button to open TaskDeadlinePopover
    const deadlineBtn = screen.getByRole('button', { name: /^set deadline$/i });
    fireEvent.click(deadlineBtn);

    // Dialog appears
    const dialog = screen.getByRole('dialog', { name: /set deadline/i });
    expect(dialog).toBeInTheDocument();

    // Click quick preset: Tomorrow (23:59)
    const tomorrowBtn = within(dialog).getByRole('button', { name: /tomorrow \(23:59\)/i });
    fireEvent.click(tomorrowBtn);

    // Click Set Deadline action
    const setDeadlineBtn = within(dialog).getByRole('button', { name: /set deadline/i });
    fireEvent.click(setDeadlineBtn);

    expect(handleUpdateTask).toHaveBeenCalledWith(
      'plain-task-1',
      expect.objectContaining({
        deadline: expect.stringMatching(/^\d{4}-\d{2}-\d{2} 23:59$/),
        recurrence: { enabled: false, rule: null },
      })
    );
  });

  it('renders both scheduled date badge and deadline badge simultaneously when both are set', () => {
    const dualTask: SampleTask[] = [
      {
        id: 'dual-task-1',
        title: 'Project Milestone',
        category: 'work',
        dueDate: '2026-11-20',
        dueTime: '10:00',
        deadline: '2026-11-25 23:59',
        state: 'active',
        createdAt: '2026-11-16T10:00:00Z',
      },
    ];

    render(
      <TasksBoardView
        tasks={dualTask}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    // Collapsed card should show both the date button and the deadline button
    expect(screen.getByRole('button', { name: /deadline:/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nov 20, 10:00/i })).toBeInTheDocument();

    // Expand the card
    fireEvent.click(screen.getByText('Project Milestone'));

    // In expanded view, Date/time button shows the date label, and Deadline button shows the deadline
    expect(screen.getByText('Nov 20, 10:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deadline: nov 25, 23:59/i })).toBeInTheDocument();
    // Repeat button is disabled because deadline is present
    expect(screen.getByRole('button', { name: /repeat/i })).toBeDisabled();
  });

  it('opens 3-dots task context menu and supports category switching and setting deadline', () => {
    const handleUpdateTask = vi.fn();
    const handleToggleStar = vi.fn();
    const singleTask: SampleTask[] = [
      {
        id: 'menu-task-1',
        title: 'Review Quarterly Budget',
        category: 'work',
        dueDate: '2026-11-17',
        state: 'active',
        createdAt: '2026-11-16T10:00:00Z',
      },
    ];

    render(
      <TasksBoardView
        tasks={singleTask}
        onToggleTask={vi.fn()}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={vi.fn()}
        onToggleStar={handleToggleStar}
        onAddTask={vi.fn()}
      />
    );

    // Open 3-dots options menu on the card
    const moreBtn = screen.getByRole('button', { name: /more task options/i });
    fireEvent.click(moreBtn);

    // Context menu options should appear
    expect(screen.getByText('Add to starred')).toBeInTheDocument();
    expect(screen.getByText('Set deadline')).toBeInTheDocument();
    expect(screen.getByText('Delete task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /personal & routine/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /household & living/i })).toBeInTheDocument();

    // Click category button "Personal & Routine" to move task
    fireEvent.click(screen.getByRole('button', { name: /personal & routine/i }));

    expect(handleUpdateTask).toHaveBeenCalledWith('menu-task-1', {
      category: 'personal',
    });
  });

  it('allows setting deadline via 3-dots context menu option', () => {
    const singleTask: SampleTask[] = [
      {
        id: 'menu-task-2',
        title: 'Submit Tax Forms',
        category: 'home',
        dueDate: '2026-11-17',
        state: 'active',
        createdAt: '2026-11-16T10:00:00Z',
      },
    ];

    render(
      <TasksBoardView
        tasks={singleTask}
        onToggleTask={vi.fn()}
        onUpdateTask={vi.fn()}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    // Open 3-dots menu
    const moreBtn = screen.getByRole('button', { name: /more task options/i });
    fireEvent.click(moreBtn);

    // Click Set deadline in menu
    const setDeadlineOption = screen.getByText('Set deadline');
    fireEvent.click(setDeadlineOption);

    // Deadline dialog should appear
    expect(screen.getByRole('dialog', { name: /set deadline/i })).toBeInTheDocument();
  });

  it('supports expanded inline card editing with subtask addition, priority pill selection in toolbar, and done collapse', () => {
    const handleUpdateTask = vi.fn();
    const taskToEdit: SampleTask[] = [
      {
        id: 'edit-task-1',
        title: 'Clean Garage',
        category: 'home',
        dueDate: '2026-11-17',
        description: 'Sweep and organize boxes',
        priority: 'low',
        state: 'active',
        createdAt: '2026-11-16T10:00:00Z',
        subtasks: [
          { id: 'st-1', title: 'Buy storage boxes', completed: false },
        ],
      },
    ];

    render(
      <TasksBoardView
        tasks={taskToEdit}
        onToggleTask={vi.fn()}
        onUpdateTask={handleUpdateTask}
        onToggleStar={vi.fn()}
        onAddTask={vi.fn()}
      />
    );

    // Click title to expand the card
    fireEvent.click(screen.getByText('Clean Garage'));

    // Details textarea should be present
    const detailsInput = screen.getByPlaceholderText('Details');
    expect(detailsInput).toBeInTheDocument();
    expect(detailsInput).toHaveValue('Sweep and organize boxes');

    // Add subtask input should be present
    const addSubtaskInput = screen.getByPlaceholderText('Add subtask');
    expect(addSubtaskInput).toBeInTheDocument();
    fireEvent.change(addSubtaskInput, { target: { value: 'Label containers' } });
    fireEvent.submit(addSubtaskInput.closest('form')!);

    expect(handleUpdateTask).toHaveBeenCalledWith('edit-task-1', {
      subtasks: expect.arrayContaining([
        expect.objectContaining({ title: 'Buy storage boxes' }),
        expect.objectContaining({ title: 'Label containers' }),
      ]),
    });

    // Priority selector in bottom toolbar
    const highPriorityBtn = screen.getByRole('button', { name: /^high$/i });
    fireEvent.click(highPriorityBtn);

    expect(handleUpdateTask).toHaveBeenCalledWith('edit-task-1', {
      priority: 'high',
    });

    // Done button collapses the card
    const doneBtn = screen.getByRole('button', { name: /^done$/i });
    fireEvent.click(doneBtn);

    // Textarea should no longer be present
    expect(screen.queryByPlaceholderText('Details')).not.toBeInTheDocument();
  });
});
