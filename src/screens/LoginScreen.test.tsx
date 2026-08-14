import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LoginScreen from './LoginScreen';

vi.mock('../components/CityCanvas', () => ({
  CityCanvas: () => <div data-testid="mock-city-canvas" />
}));

describe('16-Bit LoginScreen Terminal', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders login terminal with secure password inputs and tabs', () => {
    const handleBack = vi.fn();
    const handleSuccess = vi.fn();

    render(<LoginScreen onBack={handleBack} onSuccess={handleSuccess} />);

    expect(screen.getByText(/OPERATOR AUTHENTICATION/i)).toBeDefined();
    expect(screen.getByText(/OPERATOR LOGIN/i)).toBeDefined();
    expect(screen.getByText(/REGISTER NEW CALLSIGN/i)).toBeDefined();
    expect(screen.getByText(/DATABASE: SUPABASE POSTGRESQL/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/engineer@deployland.game/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Enter secret passcode.../i)).toBeDefined();
    expect(screen.getByText(/CONTINUE AS LOCAL GUEST OPERATOR/i)).toBeDefined();

    // Click back
    const backBtn = screen.getByText(/RETURN TO PREVIOUS SCREEN/i);
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalled();
  });

  it('allows logging in with email and password', async () => {
    const handleBack = vi.fn();
    const handleSuccess = vi.fn();

    render(<LoginScreen onBack={handleBack} onSuccess={handleSuccess} />);

    const emailInput = screen.getByPlaceholderText(/engineer@deployland.game/i);
    const passInput = screen.getByPlaceholderText(/Enter secret passcode.../i);
    const submitBtn = screen.getByText(/AUTHENTICATE & ENTER/i);

    fireEvent.change(emailInput, { target: { value: 'i.jain.akshat@gmail.com' } });
    fireEvent.change(passInput, { target: { value: 'mySuperSecretPassword123' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/VERIFYING CREDENTIALS|VIP ACCESS VERIFIED/i)).toBeDefined();
  });

  it('switches to register mode and accepts registration', async () => {
    const handleBack = vi.fn();
    const handleSuccess = vi.fn();

    render(<LoginScreen onBack={handleBack} onSuccess={handleSuccess} />);

    const registerTab = screen.getByText(/REGISTER NEW CALLSIGN/i);
    fireEvent.click(registerTab);

    expect(screen.getByPlaceholderText(/ARCHITECT_AKSHAT/i)).toBeDefined();
    const emailInput = screen.getByPlaceholderText(/engineer@deployland.game/i);
    const passInput = screen.getByPlaceholderText(/Enter secret passcode.../i);
    const registerBtn = screen.getByText(/REGISTER & ACTIVATE CALLSIGN/i);

    fireEvent.change(emailInput, { target: { value: 'new_operator@deployland.game' } });
    fireEvent.change(passInput, { target: { value: 'pass1234' } });
    fireEvent.click(registerBtn);

    expect(screen.getByText(/REGISTERING NEW OPERATOR|OPERATOR REGISTERED/i)).toBeDefined();
  });
});
