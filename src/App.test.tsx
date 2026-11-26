import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

let authStateCallback: ((user: any) => void) | null = null;
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();

vi.mock('firebase/auth', () => {
  return {
    getAuth: vi.fn(() => ({ currentUser: null })),
    connectAuthEmulator: vi.fn(),
    GoogleAuthProvider: class MockGoogleAuthProvider {},
    onAuthStateChanged: vi.fn((_auth, callback) => {
      authStateCallback = callback;
      callback(null);
      return vi.fn();
    }),
    signInWithPopup: (...args: any[]) => mockSignInWithPopup(...args),
    signOut: (...args: any[]) => mockSignOut(...args),
  };
});

describe('LandingPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
    if (authStateCallback) {
      authStateCallback(null);
    }
  });

  it('renders landing page with headline, preview, benefits, and footer', () => {
    render(<App />);

    // Header brand
    expect(screen.getAllByText('ViDo')[0]).toBeInTheDocument();

    // Hero title
    expect(
      screen.getByRole('heading', {
        name: /simple enough for anyone\. structured enough for serious work\./i,
      })
    ).toBeInTheDocument();

    // Use cases
    expect(screen.getByText('Personal Tasks')).toBeInTheDocument();
    expect(screen.getByText('Household & Living')).toBeInTheDocument();
    expect(screen.getByText('Work & Projects')).toBeInTheDocument();

    // Principles
    expect(screen.getByText('Clarity over complexity')).toBeInTheDocument();
    expect(screen.getByText('History over guesswork')).toBeInTheDocument();

    // Footer
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it('opens and closes sign in modal on Google sign in click', () => {
    render(<App />);

    const signInBtn = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(signInBtn);

    expect(
      screen.getByRole('heading', { name: /welcome to vido/i })
    ).toBeInTheDocument();

    // Close with Back
    const cancelBtn = screen.getByRole('button', { name: /back/i });
    fireEvent.click(cancelBtn);

    expect(
      screen.queryByRole('heading', { name: /welcome to vido/i })
    ).not.toBeInTheDocument();
  });

  it('navigates to live preview when Enter Live Preview is clicked in modal', () => {
    render(<App />);

    const signInBtn = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(signInBtn);

    const enterBtn = screen.getByRole('button', { name: /enter live preview/i });
    fireEvent.click(enterBtn);

    expect(screen.getByText('Interactive Preview')).toBeInTheDocument();
    expect(screen.getByText('Logged-in demo preview')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to landing page/i })).toBeInTheDocument();
  });

  it('navigates to the live user workspace dashboard after successful login and allows sign out', async () => {
    mockSignInWithPopup.mockImplementationOnce(async () => {
      const mockUser = {
        uid: 'user-alex',
        displayName: 'Alex Morgan',
        email: 'alex.morgan@gmail.com',
      };
      if (authStateCallback) {
        authStateCallback(mockUser);
      }
      return { user: mockUser };
    });

    render(<App />);

    const signInBtn = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(signInBtn);

    const dashboardBtn = screen.getByRole('button', { name: /sign in to dashboard/i });
    fireEvent.click(dashboardBtn);

    await waitFor(() => {
      // Live dashboard has no demo preview notice banner
      expect(screen.queryByText('DEMO PREVIEW')).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /back to landing page/i })).not.toBeInTheDocument();

      // Authenticated user profile is displayed
      expect(screen.getAllByText('Alex Morgan')[0]).toBeInTheDocument();
      expect(screen.getByText(/24-Hour Interactive Timeline/i)).toBeInTheDocument();
    });

    // Two tabs are present: Dashboard and Tasks
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tasks/i })).toBeInTheDocument();

    // Sign out button returns to the public landing page
    const signOutBtn = screen.getAllByRole('button', { name: /sign out/i })[0];
    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /simple enough for anyone\. structured enough for serious work\./i,
        })
      ).toBeInTheDocument();
    });
  });

  it('displays emulator offline error and stays on landing page when emulator is not running', async () => {
    mockSignInWithPopup.mockRejectedValueOnce({
      code: 'auth/network-request-failed',
      message: 'Failed to fetch',
    });

    render(<App />);

    const signInBtn = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(signInBtn);

    const dashboardBtn = screen.getByRole('button', { name: /sign in to dashboard/i });
    fireEvent.click(dashboardBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/firebase auth emulator is offline on localhost:9099/i)).toBeInTheDocument();
    });

    // Verify user is NOT navigated to workspace
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /simple enough for anyone/i })).toBeInTheDocument();
  });

  it('renders standalone not-found view when navigating to an unmapped root route', () => {
    window.history.pushState({}, '', '/non-existent-page');
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /you've wandered off the scheduled horizon/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('animated-character')).toBeInTheDocument();
    // Top bar and sidebar are not present
    expect(screen.queryByRole('navigation', { name: /workspace navigation/i })).not.toBeInTheDocument();
  });

  it('renders standalone not-found view when navigating to an unmapped workspace sub-endpoint', () => {
    window.history.pushState({}, '', '/preview/tasks/wrong-sub-endpoint');
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /you've wandered off the scheduled horizon/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('animated-character')).toBeInTheDocument();
    // Top bar and sidebar are not present
    expect(screen.queryByRole('navigation', { name: /workspace navigation/i })).not.toBeInTheDocument();
    expect(screen.queryByText('DEMO PREVIEW')).not.toBeInTheDocument();
  });
});
