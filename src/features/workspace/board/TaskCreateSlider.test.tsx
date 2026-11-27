// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCreateSlider } from './TaskCreateSlider';

const sampleCategories = [
  { id: 'personal', title: 'Personal & Routine' },
  { id: 'home', title: 'Household & Living' },
  { id: 'work', title: 'Work & Professional' },
];

describe('TaskCreateSlider Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <TaskCreateSlider
        isOpen={false}
        onClose={vi.fn()}
        onCreateTask={vi.fn()}
        categories={sampleCategories}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders slider when open with default no-date and no-time', () => {
    render(
      <TaskCreateSlider
        isOpen={true}
        onClose={vi.fn()}
        onCreateTask={vi.fn()}
        categories={sampleCategories}
        defaultCategory="personal"
      />
    );

    // Dialog and title input
    expect(screen.getByRole('dialog', { name: /add a task/i })).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/new task/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');

    // Save button disabled initially
    const saveBtn = screen.getByRole('button', { name: /save/i });
    expect(saveBtn).toBeDisabled();

    // No date badges by default
    expect(screen.queryByTitle(/clear date/i)).not.toBeInTheDocument();
  });

  it('creates a task with title only (no date, no time) on save', () => {
    const handleCreateTask = vi.fn();
    const handleClose = vi.fn();

    render(
      <TaskCreateSlider
        isOpen={true}
        onClose={handleClose}
        onCreateTask={handleCreateTask}
        categories={sampleCategories}
        defaultCategory="work"
      />
    );

    const input = screen.getByPlaceholderText(/new task/i);
    fireEvent.change(input, { target: { value: 'Complete quarterly report' } });

    const saveBtn = screen.getByRole('button', { name: /save/i });
    expect(saveBtn).not.toBeDisabled();
    fireEvent.click(saveBtn);

    expect(handleCreateTask).toHaveBeenCalledWith(
      'work',
      'Complete quarterly report',
      undefined
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('allows adding details, star, priority and date/time', () => {
    const handleCreateTask = vi.fn();
    const handleClose = vi.fn();

    render(
      <TaskCreateSlider
        isOpen={true}
        onClose={handleClose}
        onCreateTask={handleCreateTask}
        categories={sampleCategories}
        defaultCategory="home"
      />
    );

    // 1. Title
    const input = screen.getByPlaceholderText(/new task/i);
    fireEvent.change(input, { target: { value: 'Fix kitchen sink' } });

    // 2. Details toggle
    const detailsBtn = screen.getByTitle(/add details/i);
    fireEvent.click(detailsBtn);
    const detailsInput = screen.getByPlaceholderText(/add details/i);
    fireEvent.change(detailsInput, { target: { value: 'Check for pipe leakage under the counter' } });

    // 3. Star toggle
    const starBtn = screen.getByTitle(/star task/i);
    fireEvent.click(starBtn);

    // 4. Priority picker
    const priorityBtn = screen.getByTitle(/set priority/i);
    fireEvent.click(priorityBtn);
    const highBtn = screen.getByRole('button', { name: /high/i });
    fireEvent.click(highBtn);

    // 5. Date picker - select Tomorrow
    const dateBtn = screen.getByTitle(/set date and time/i);
    fireEvent.click(dateBtn);
    const tomorrowBtn = screen.getByRole('button', { name: /tomorrow/i });
    fireEvent.click(tomorrowBtn);

    // Save
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    expect(handleCreateTask).toHaveBeenCalledWith(
      'home',
      'Fix kitchen sink',
      expect.objectContaining({
        description: 'Check for pipe leakage under the counter',
        starred: true,
        priority: 'high',
        dueDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      })
    );
  });

  it('allows clearing selected date/time via badge cross button', () => {
    render(
      <TaskCreateSlider
        isOpen={true}
        onClose={vi.fn()}
        onCreateTask={vi.fn()}
        categories={sampleCategories}
      />
    );

    // Open date picker and select Today
    const dateBtn = screen.getByTitle(/set date and time/i);
    fireEvent.click(dateBtn);
    const todayBtn = screen.getByRole('button', { name: /today/i });
    fireEvent.click(todayBtn);

    // Clear date badge appears
    const clearDateBtn = screen.getByTitle(/clear date/i);
    expect(clearDateBtn).toBeInTheDocument();

    // Click clear date
    fireEvent.click(clearDateBtn);
    expect(screen.queryByTitle(/clear date/i)).not.toBeInTheDocument();
  });

  it('allows switching categories via category menu', () => {
    const handleCreateTask = vi.fn();

    render(
      <TaskCreateSlider
        isOpen={true}
        onClose={vi.fn()}
        onCreateTask={handleCreateTask}
        categories={sampleCategories}
        defaultCategory="personal"
      />
    );

    // Open category dropdown
    const categorySelector = screen.getByTitle(/select list/i);
    fireEvent.click(categorySelector);

    // Select Work & Professional
    const workOption = screen.getByRole('button', { name: /work & professional/i });
    fireEvent.click(workOption);

    // Title & Save
    const input = screen.getByPlaceholderText(/new task/i);
    fireEvent.change(input, { target: { value: 'Work Item' } });
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    expect(handleCreateTask).toHaveBeenCalledWith(
      'work',
      'Work Item',
      undefined
    );
  });

  it('closes on Escape key press', () => {
    const handleClose = vi.fn();

    render(
      <TaskCreateSlider
        isOpen={true}
        onClose={handleClose}
        onCreateTask={vi.fn()}
        categories={sampleCategories}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  it('sets deadline using the 5th deadline icon and quick preset buttons', () => {
    const handleCreateTask = vi.fn();

    render(
      <TaskCreateSlider
        isOpen={true}
        onClose={vi.fn()}
        onCreateTask={handleCreateTask}
        categories={sampleCategories}
        defaultCategory="work"
      />
    );

    // 5th icon: Set deadline
    const deadlineBtn = screen.getByTitle(/set deadline/i);
    expect(deadlineBtn).toBeInTheDocument();
    fireEvent.click(deadlineBtn);

    // Deadline panel appears with presets
    expect(screen.getAllByText('Set Deadline').length).toBeGreaterThan(0);
    const todayPreset = screen.getByRole('button', { name: /today \(23:59\)/i });
    fireEvent.click(todayPreset);

    // Deadline badge appears
    expect(screen.getByText(/deadline:/i)).toBeInTheDocument();

    // Enter title & save
    const input = screen.getByPlaceholderText(/new task/i);
    fireEvent.change(input, { target: { value: 'Urgent Client Deliverable' } });

    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    expect(handleCreateTask).toHaveBeenCalledWith(
      'work',
      'Urgent Client Deliverable',
      expect.objectContaining({
        deadline: expect.stringMatching(/^\d{4}-\d{2}-\d{2} 23:59$/),
      })
    );
  });

  it('allows setting both scheduled date/time and deadline simultaneously', () => {
    const handleCreateTask = vi.fn();

    render(
      <TaskCreateSlider
        isOpen={true}
        onClose={vi.fn()}
        onCreateTask={handleCreateTask}
        categories={sampleCategories}
        defaultCategory="work"
      />
    );

    // 1. Set scheduled date via Date & Time picker
    const dateBtn = screen.getByTitle(/set date and time/i);
    fireEvent.click(dateBtn);
    const tomorrowBtn = screen.getByRole('button', { name: /tomorrow/i });
    fireEvent.click(tomorrowBtn);

    // 2. Set deadline via Deadline picker
    const deadlineBtn = screen.getByTitle(/set deadline/i);
    fireEvent.click(deadlineBtn);
    const nextWeekPreset = screen.getByRole('button', { name: /next week \(23:59\)/i });
    fireEvent.click(nextWeekPreset);

    // Both badges must be visible simultaneously
    expect(screen.getByTitle('Clear date')).toBeInTheDocument();
    expect(screen.getByTitle('Clear deadline')).toBeInTheDocument();

    // 3. Title & Save
    const input = screen.getByPlaceholderText(/new task/i);
    fireEvent.change(input, { target: { value: 'Task with Date and Deadline' } });

    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    expect(handleCreateTask).toHaveBeenCalledWith(
      'work',
      'Task with Date and Deadline',
      expect.objectContaining({
        dueDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        deadline: expect.stringMatching(/^\d{4}-\d{2}-\d{2} 23:59$/),
      })
    );
  });

  it('allows clearing deadline via badge clear button', () => {
    render(
      <TaskCreateSlider
        isOpen={true}
        onClose={vi.fn()}
        onCreateTask={vi.fn()}
        categories={sampleCategories}
      />
    );

    // Open deadline picker and select Today
    const deadlineBtn = screen.getByTitle(/set deadline/i);
    fireEvent.click(deadlineBtn);
    const todayPreset = screen.getByRole('button', { name: /today \(23:59\)/i });
    fireEvent.click(todayPreset);

    // Deadline badge exists
    expect(screen.getByText(/deadline:/i)).toBeInTheDocument();
    const clearDeadlineBtn = screen.getByTitle(/clear deadline/i);
    expect(clearDeadlineBtn).toBeInTheDocument();

    // Click clear deadline
    fireEvent.click(clearDeadlineBtn);
    expect(screen.queryByText(/deadline:/i)).not.toBeInTheDocument();
  });

  it('closes category dropdown when clicking outside', () => {
    render(
      <TaskCreateSlider
        isOpen={true}
        onClose={vi.fn()}
        onCreateTask={vi.fn()}
        categories={sampleCategories}
      />
    );

    // Open category dropdown
    const categorySelector = screen.getByTitle(/select list/i);
    fireEvent.click(categorySelector);
    expect(screen.getByText('Add to list')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Add to list')).not.toBeInTheDocument();
  });
});
