import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, Badge, Card, Input, ErrorBoundary } from './index';

describe('UI Primitives', () => {
  describe('Button', () => {
    it('renders with children and handles clicks', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('respects disabled state', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders variants correctly', () => {
      const { rerender } = render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('border-[var(--line-glass)]');

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-[var(--red)]');
    });
  });

  describe('Badge', () => {
    it('renders text with correct variant styles', () => {
      render(<Badge variant="success">Completed</Badge>);
      const badge = screen.getByText(/completed/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-[var(--green)]');
    });
  });

  describe('Card', () => {
    it('renders card contents', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText(/card content/i)).toBeInTheDocument();
    });
  });

  describe('Input', () => {
    it('renders input with label and helper text', () => {
      render(<Input label="Task Title" helperText="Be concise" placeholder="Enter title" />);
      expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
      expect(screen.getByText(/be concise/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter title/i)).toBeInTheDocument();
    });

    it('renders error message when error prop is provided', () => {
      render(<Input label="Task Title" error="Title is required" />);
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/task title/i)).toHaveClass('border-[var(--red)]');
    });
  });

  describe('ErrorBoundary', () => {
    it('catches render errors and renders fallback UI', () => {
      const Bomb = () => {
        throw new Error('Test explosion');
      };
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      );
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/test explosion/i)).toBeInTheDocument();
      spy.mockRestore();
    });
  });
});

