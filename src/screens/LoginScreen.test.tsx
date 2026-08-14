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
    expect(screen.getByText(/LOGIN/i)).toBeDefined();
    expect(screen.getByText(/REGISTER \(FREE\)/i)).toBeDefined();
    expect(screen.getByText(/DATABASE: SUPABASE POSTGRESQL/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Enter your password.../i)).toBeDefined();
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

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passInput = screen.getByPlaceholderText(/Enter your password.../i);
    const submitBtn = screen.getByText(/SIGN IN ══▶/i);

    fireEvent.change(emailInput, { target: { value: 'i.jain.akshat@gmail.com' } });
    fireEvent.change(passInput, { target: { value: 'Akshat@2026' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/VERIFYING CREDENTIALS|VIP ACCESS VERIFIED|AUTHENTICATING/i)).toBeDefined();
  });

  it('switches to register mode and accepts registration', async () => {
    const handleBack = vi.fn();
    const handleSuccess = vi.fn();

    render(<LoginScreen onBack={handleBack} onSuccess={handleSuccess} />);

    const registerTab = screen.getByText(/REGISTER \(FREE\)/i);
    fireEvent.click(registerTab);

    expect(screen.getByPlaceholderText(/Alex or Matrix/i)).toBeDefined();
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passInput = screen.getByPlaceholderText(/Create a password/i);
    const registerBtn = screen.getByText(/CREATE FREE ACCOUNT ══▶/i);

    fireEvent.change(emailInput, { target: { value: 'new_operator@deployland.game' } });
    fireEvent.change(passInput, { target: { value: 'pass1234' } });
    fireEvent.click(registerBtn);

    expect(screen.getByText(/REGISTERING NEW OPERATOR|OPERATOR REGISTERED/i)).toBeDefined();
  });
});
