import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import LevelScreen from './LevelScreen';
import LandingScreen from './LandingScreen';

vi.mock('../components/CityCanvas', () => ({
  CityCanvas: () => <div data-testid="mock-city-canvas" />
}));

describe('Level Progression & Navigation', () => {
  afterEach(() => {
    cleanup();
  });

  it('allows advancing to the next level directly upon victory', () => {
    const handleExit = vi.fn();
    const handleSelectLevel = vi.fn();

    render(
      <LevelScreen 
        levelId="cicd-01-broken-factory" 
        onExit={handleExit} 
        onSelectLevel={handleSelectLevel} 
      />
    );

    // Start mission
    const startBtn = screen.getByText(/START MISSION/i);
    fireEvent.click(startBtn);

    // The factory floor should be visible
    expect(screen.getByText(/ACTIVATE PIPELINE/i)).toBeDefined();
  });

  it('renders landing page with Buy Pass and Lifetime Unlock options', () => {
    const handlePlay = vi.fn();
    const handleBuy = vi.fn();

    render(
      <LandingScreen onPlay={handlePlay} onBuy={handleBuy} />
    );

    expect(screen.getByText(/LEARN DEVOPS/i)).toBeDefined();
    
    // Header Buy Pass button
    const buyPassBtn = screen.getByText(/BUY PASS 👑/i);
    expect(buyPassBtn).toBeDefined();
    fireEvent.click(buyPassBtn);
    expect(handleBuy).toHaveBeenCalled();

    // Hero Unlock button
    const heroUnlockBtn = screen.getByText(/UNLOCK FULL CAMPAIGN 👑/i);
    expect(heroUnlockBtn).toBeDefined();
    fireEvent.click(heroUnlockBtn);
    expect(handleBuy).toHaveBeenCalledTimes(2);

    // Acquisition Protocol section
    expect(screen.getByText(/ACQUISITION PROTOCOL/i)).toBeDefined();
  });
});
