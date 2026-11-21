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

const openPicker = () => fireEvent.click(screen.getByLabelText(/due time/i));
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

  it('fine-tunes by single minutes', () => {
    render(<Harness initial="09:10" />);
    openPicker();
    fireEvent.click(btn('Minute'));

    fireEvent.click(btn(/add one minute/i));
    expect(screen.getByTestId('value')).toHaveTextContent('09:11');
    fireEvent.click(btn(/subtract one minute/i));
    fireEvent.click(btn(/subtract one minute/i));
    expect(screen.getByTestId('value')).toHaveTextContent('09:09');
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
      expect(btn(/subtract one minute/i)).toBeDisabled();
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
