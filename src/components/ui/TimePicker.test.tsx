import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimePicker } from './TimePicker';

const Harness = ({ initial = '', minTime }: { initial?: string; minTime?: string }) => {
  const [value, setValue] = useState(initial);
  return (
    <>
      <TimePicker label="Due Time (Optional)" value={value} onChange={setValue} minTime={minTime} />
      <output data-testid="value">{value}</output>
    </>
  );
};

const openPicker = () => fireEvent.click(screen.getByRole('button', { name: /due time/i }));
const btn = (name: string | RegExp) => screen.getByRole('button', { name });

describe('TimePicker', () => {
  it('starts empty and treats the time as optional', () => {
    render(<Harness />);
    expect(screen.getByLabelText(/due time/i)).toHaveTextContent('No time set');
    expect(screen.getByTestId('value')).toHaveTextContent('');
  });

  it('picks an hour, then a minute, and closes', () => {
    render(<Harness />);
    openPicker();

    fireEvent.click(btn('PM'));
    fireEvent.click(btn("6 o'clock"));
    expect(screen.getByTestId('value')).toHaveTextContent('18:00');
    expect(screen.getByRole('group', { name: /select minute/i })).toBeInTheDocument();

    fireEvent.click(btn('30 minutes'));
    expect(screen.getByTestId('value')).toHaveTextContent('18:30');
    fireEvent.click(btn('Done'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/due time/i)).toHaveTextContent('6:30 PM');
  });

  it('handles 12 AM and 12 PM correctly', () => {
    render(<Harness />);
    openPicker();
    fireEvent.click(btn("12 o'clock"));
    expect(screen.getByTestId('value')).toHaveTextContent('00:00');

    fireEvent.click(btn('PM'));
    expect(screen.getByTestId('value')).toHaveTextContent('12:00');
  });

  it('selects exact minutes such as 11:58, 09:37 and 14:52', () => {
    render(<Harness />);
    openPicker();
    fireEvent.click(btn('PM'));
    fireEvent.click(btn("11 o'clock"));
    fireEvent.click(btn('Minute'));
    fireEvent.click(btn('55 minutes'));
    const minuteDial = screen.getByRole('group', { name: /select minute/i });
    fireEvent.keyDown(minuteDial, { key: 'ArrowRight' });
    fireEvent.keyDown(minuteDial, { key: 'ArrowRight' });
    fireEvent.keyDown(minuteDial, { key: 'ArrowRight' });
    expect(screen.getByTestId('value')).toHaveTextContent('23:58');

    fireEvent.click(btn('Hour'));
    fireEvent.click(btn('AM'));
    fireEvent.click(btn("9 o'clock"));
    fireEvent.click(btn('Minute'));
    fireEvent.click(btn('35 minutes'));
    fireEvent.keyDown(minuteDial, { key: 'ArrowRight' });
    fireEvent.keyDown(minuteDial, { key: 'ArrowRight' });
    expect(screen.getByTestId('value')).toHaveTextContent('09:37');

    fireEvent.click(btn('Hour'));
    fireEvent.click(btn('PM'));
    fireEvent.click(btn("2 o'clock"));
    fireEvent.click(btn('Minute'));
    fireEvent.click(btn('50 minutes'));
    fireEvent.keyDown(minuteDial, { key: 'ArrowRight' });
    fireEvent.keyDown(minuteDial, { key: 'ArrowRight' });
    expect(screen.getByTestId('value')).toHaveTextContent('14:52');
  });

  it('clears the time again', () => {
    render(<Harness initial="09:10" />);
    openPicker();
    fireEvent.click(btn('Clear'));
    expect(screen.getByTestId('value')).toHaveTextContent('');
    expect(screen.getByLabelText(/due time/i)).toHaveTextContent('No time set');
  });

  describe('with a minimum time (same-day deadline)', () => {
    it('disables earlier hours, the earlier period, and earlier minutes', () => {
      render(<Harness minTime="18:01" />);
      openPicker();

      // AM is entirely in the past, so the picker opens on PM.
      expect(btn('AM')).toBeDisabled();
      expect(btn('PM')).toHaveAttribute('aria-pressed', 'true');

      expect(btn("4 o'clock")).toBeDisabled();
      expect(btn("5 o'clock")).toBeDisabled();
      expect(btn("6 o'clock")).toBeEnabled();

      fireEvent.click(btn("6 o'clock"));
      // Picking the boundary hour lands on the earliest valid minute.
      expect(screen.getByTestId('value')).toHaveTextContent('18:01');
      expect(btn('0 minutes')).toBeDisabled();
      expect(btn('5 minutes')).toBeEnabled();
    });

    it('allows any hour after the boundary hour', () => {
      render(<Harness minTime="18:01" />);
      openPicker();
      fireEvent.click(btn("9 o'clock"));
      expect(screen.getByTestId('value')).toHaveTextContent('21:00');
    });
  });

  it('supports arrow-key navigation around the dial, skipping disabled values', () => {
    render(<Harness minTime="18:01" />);
    openPicker();

    const first = btn("6 o'clock");
    expect(first).toHaveFocus();

    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(btn("7 o'clock")).toHaveFocus();

    fireEvent.keyDown(btn("7 o'clock"), { key: 'ArrowLeft' });
    expect(btn("6 o'clock")).toHaveFocus();

    // Wraps past the disabled 12 PM and 1–5 PM straight to 11.
    fireEvent.keyDown(btn("6 o'clock"), { key: 'ArrowLeft' });
    expect(btn("11 o'clock")).toHaveFocus();
  });

  it('closes on Escape without letting the event reach outer listeners', () => {
    const outer = vi.fn();
    window.addEventListener('keydown', outer);
    render(<Harness />);
    openPicker();

    fireEvent.keyDown(btn("1 o'clock"), { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/due time/i)).toHaveFocus();
    expect(outer).not.toHaveBeenCalled();
    window.removeEventListener('keydown', outer);
  });

  it('renders a calm error message and flags the trigger as invalid', () => {
    render(
      <TimePicker
        label="Due Time (Optional)"
        value="16:00"
        onChange={vi.fn()}
        error="Deadline must be later than start time"
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('Deadline must be later than start time');
    expect(screen.getByLabelText(/due time/i)).toHaveAttribute('aria-invalid', 'true');
  });
});
