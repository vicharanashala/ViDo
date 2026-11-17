import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DoodleTitle } from './DoodleTitle';

describe('DoodleTitle', () => {
  it('renders the image and the task title together for recognised tasks', () => {
    const { container } = render(<DoodleTitle title="Making laundry" />);

    expect(container.querySelector('img')).toBeInTheDocument();
    expect(screen.getByText('Making laundry')).toBeInTheDocument();
  });

  it('falls back to text for unrecognised tasks', () => {
    render(<DoodleTitle title="Review Q4 budget" />);

    expect(screen.getByText('Review Q4 budget')).toBeInTheDocument();
    expect(document.querySelector('img')).not.toBeInTheDocument();
  });
});
