import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DoodleTitle } from './DoodleTitle';
import { saveCustomImageRule } from '../../../lib/customImages';

describe('DoodleTitle', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the image and the task title together for recognised tasks', () => {
    const { container } = render(<DoodleTitle title="Making laundry" />);

    expect(container.querySelector('img')).toBeInTheDocument();
    expect(screen.getByText('Making laundry')).toBeInTheDocument();
  });

  it('falls back to text for unrecognised tasks', () => {
    render(<DoodleTitle title="Buy milk" />);

    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(document.querySelector('img')).not.toBeInTheDocument();
  });

  it('uses a saved custom image for a matching task', () => {
    const image = 'data:image/webp;base64,custom';
    saveCustomImageRule('milk', image);

    const { container } = render(<DoodleTitle title="Buy milk" />);

    expect(container.querySelector('img')).toHaveAttribute('src', image);
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });

  it('uses the desk image for work tasks without a specific image', () => {
    const { container } = render(<DoodleTitle title="Buy milk" category="work" />);

    expect(container.querySelector('img')).toBeInTheDocument();
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });
});
