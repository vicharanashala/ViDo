import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PathAssistantModal } from './PathAssistantModal';

describe('PathAssistantModal', () => {
  it('shows a draft and lets the user approve it', () => {
    const onApprove = vi.fn();
    render(
      <PathAssistantModal
        isOpen={true}
        taskTitle="Project submission"
        onClose={vi.fn()}
        onApprove={onApprove}
      />
    );

    expect(screen.getByRole('heading', { name: /path assistant/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /approve and add/i }));

    expect(onApprove).toHaveBeenCalled();
    expect(onApprove.mock.calls[0][0].length).toBeGreaterThan(0);
  });
});
