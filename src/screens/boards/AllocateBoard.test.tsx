import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AllocateBoard from './AllocateBoard';
import type { Level } from '../../engine/types';
import level07Config from '../../content/cicd-level-07.json';

const mockLevel = level07Config as unknown as Level;

describe('AllocateBoard', () => {
  it('renders correctly and handles interactions', () => {
    const handleOutcome = vi.fn();
    
    // Fake timers to fast-forward the TICK simulation
    vi.useFakeTimers();

    render(<AllocateBoard level={mockLevel} onOutcome={handleOutcome} />);
    
    // Verify AllocateBoard renders
    expect(screen.getByText('ROUTER CONTROL')).toBeDefined();
    
    // Verify Blue deployment stats (initial 100 allocation)
    // Traffic display elements
    const trafficDisplays = screen.getAllByText('100%');
    expect(trafficDisplays.length).toBeGreaterThan(0);
    
    const trafficGreenInitial = screen.getAllByText('0%');
    expect(trafficGreenInitial.length).toBeGreaterThan(0);

    // Change traffic by decreasing Blue Traffic by 10%
    const decreaseBlue = screen.getByLabelText('Decrease Blue Traffic');
    fireEvent.click(decreaseBlue); // Blue: 90%, Green: 10%
    
    expect(screen.getAllByText('90%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10%').length).toBeGreaterThan(0);

    // Increase green capacity
    const increaseGreenCap = screen.getByLabelText('Increase Green Capacity');
    fireEvent.click(increaseGreenCap); // +10
    fireEvent.click(increaseGreenCap); // +10

    // Evaluate
    const submit = screen.getByText('EXECUTE ROLLOUT');
    fireEvent.click(submit);
    
    // Should fail because expected 100 to green, but we only have 10
    expect(handleOutcome).toHaveBeenCalledWith('failure', expect.any(String));
    
    // Fast forward timers
    act(() => {
      vi.runOnlyPendingTimers();
    });
    
    vi.useRealTimers();
  });
});
