import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker } from './DatePicker';

const day = (text: RegExp) => screen.getByRole('button', { name: text });

describe('DatePicker', () => {
  const baseProps = {
    label: 'Target Due Date *',
    value: '2026-11-19',
    today: '2026-11-19',
    min: '2026-11-12',
  };

  it('shows the selected date and opens a calendar on the right month', () => {
    render(<DatePicker {...baseProps} onChange={vi.fn()} />);

    const trigger = screen.getByLabelText(/target due date/i);
    expect(trigger).toHaveTextContent(/19 Nov 2026/);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toHaveAccessibleName('November 2026');
    expect(day(/19 November 2026/)).toHaveAttribute('aria-current', 'date');
  });

  it('selects a date, reports it, and closes', () => {
    const onChange = vi.fn();
    render(<DatePicker {...baseProps} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText(/target due date/i));
    fireEvent.click(day(/20 November 2026/));

    expect(onChange).toHaveBeenCalledWith('2026-11-20');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('disables dates before min and cannot select them', () => {
    const onChange = vi.fn();
    render(<DatePicker {...baseProps} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText(/target due date/i));

    const blocked = day(/11 November 2026/);
    expect(blocked).toBeDisabled();
    fireEvent.click(blocked);
    expect(onChange).not.toHaveBeenCalled();

    // The boundary day itself is selectable.
    expect(day(/12 November 2026/)).toBeEnabled();
  });

  it('navigates months and blocks going before the minimum month', () => {
    render(<DatePicker {...baseProps} onChange={vi.fn()} />);
    fireEvent.click(screen.getByLabelText(/target due date/i));

    expect(screen.getByRole('button', { name: /previous month/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(screen.getByRole('grid')).toHaveAccessibleName('December 2026');
    expect(screen.getByRole('button', { name: /previous month/i })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    expect(screen.getByRole('grid')).toHaveAccessibleName('November 2026');
  });

  it('supports arrow, page and boundary keys', () => {
    render(<DatePicker {...baseProps} onChange={vi.fn()} />);
    fireEvent.click(screen.getByLabelText(/target due date/i));

    const start = day(/19 November 2026/);
    expect(start).toHaveFocus();

    fireEvent.keyDown(start, { key: 'ArrowRight' });
    expect(day(/20 November 2026/)).toHaveFocus();

    fireEvent.keyDown(day(/20 November 2026/), { key: 'ArrowDown' });
    expect(day(/27 November 2026/)).toHaveFocus();

    fireEvent.keyDown(day(/27 November 2026/), { key: 'PageDown' });
    expect(screen.getByRole('grid')).toHaveAccessibleName('December 2026');
    expect(day(/27 December 2026/)).toHaveFocus();
  });

  it('does not move focus before the minimum date', () => {
    render(<DatePicker {...baseProps} value="2026-11-12" onChange={vi.fn()} />);
    fireEvent.click(screen.getByLabelText(/target due date/i));

    const first = day(/12 November 2026/);
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(day(/12 November 2026/)).toHaveFocus();
  });

  it('closes on Escape without letting the event reach outer listeners', () => {
    const outer = vi.fn();
    window.addEventListener('keydown', outer);
    render(<DatePicker {...baseProps} onChange={vi.fn()} />);

    const trigger = screen.getByLabelText(/target due date/i);
    fireEvent.click(trigger);
    fireEvent.keyDown(day(/19 November 2026/), { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(outer).not.toHaveBeenCalled();
    window.removeEventListener('keydown', outer);
  });

  it('closes when clicking outside', () => {
    render(
      <div>
        <DatePicker {...baseProps} onChange={vi.fn()} />
        <p>elsewhere</p>
      </div>
    );
    fireEvent.click(screen.getByLabelText(/target due date/i));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText('elsewhere'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a calm error message and flags the trigger as invalid', () => {
    render(<DatePicker {...baseProps} onChange={vi.fn()} error="Pick a date within the last 7 days or later" />);
    expect(screen.getByRole('status')).toHaveTextContent(/within the last 7 days/i);
    expect(screen.getByLabelText(/target due date/i)).toHaveAttribute('aria-invalid', 'true');
  });
});
