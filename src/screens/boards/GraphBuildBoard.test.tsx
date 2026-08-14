import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import GraphBuildBoard from './GraphBuildBoard';
import type { Level } from '../../engine/types';
import level04Config from '../../content/cicd-level-04.json';

const mockLevel = level04Config as unknown as Level;

describe('GraphBuildBoard', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('allows building the pipeline and evaluates success', () => {
    vi.useFakeTimers();
    const handleOutcome = vi.fn();
    render(<GraphBuildBoard level={mockLevel} onOutcome={handleOutcome} />);
    
    // SOURCE is placed by default.
    // Place BUILD
    fireEvent.click(screen.getByLabelText('Place BUILD'));
    // Connect SOURCE -> BUILD
    fireEvent.click(screen.getByLabelText('Select SOURCE'));
    fireEvent.click(screen.getByLabelText('Connect SOURCE to another machine'));
    fireEvent.click(screen.getByLabelText('Select BUILD'));

    // Place TEST
    fireEvent.click(screen.getByLabelText('Place TEST'));
    // Connect BUILD -> TEST
    fireEvent.click(screen.getByLabelText('Select BUILD'));
    fireEvent.click(screen.getByLabelText('Connect BUILD to another machine'));
    fireEvent.click(screen.getByLabelText('Select TEST'));

    // Place ARTIFACT
    fireEvent.click(screen.getByLabelText('Place ARTIFACT'));
    // Connect TEST -> ARTIFACT
    fireEvent.click(screen.getByLabelText('Select TEST'));
    fireEvent.click(screen.getByLabelText('Connect TEST to another machine'));
    fireEvent.click(screen.getByLabelText('Select ARTIFACT'));

    // Place DEPLOY
    fireEvent.click(screen.getByLabelText('Place DEPLOY'));
    // Connect ARTIFACT -> DEPLOY
    fireEvent.click(screen.getByLabelText('Select ARTIFACT'));
    fireEvent.click(screen.getByLabelText('Connect ARTIFACT to another machine'));
    fireEvent.click(screen.getByLabelText('Select DEPLOY'));

    // Run Pipeline
    const runBtn = screen.getByText('ACTIVATE PIPELINE');
    fireEvent.click(runBtn);
    act(() => { vi.runAllTimers(); });

    // Verify Success
    expect(handleOutcome).toHaveBeenCalledWith('success', undefined);
  });

  it('fails when an invalid dependency is created', () => {
    vi.useFakeTimers();
    const handleOutcome = vi.fn();
    render(<GraphBuildBoard level={mockLevel} onOutcome={handleOutcome} />);
    
    // Place DEPLOY
    fireEvent.click(screen.getByLabelText('Place DEPLOY'));
    // Connect SOURCE -> DEPLOY (Forbidden path)
    fireEvent.click(screen.getByLabelText('Select SOURCE'));
    fireEvent.click(screen.getByLabelText('Connect SOURCE to another machine'));
    fireEvent.click(screen.getByLabelText('Select DEPLOY'));

    // Run Pipeline
    const runBtn = screen.getByText('ACTIVATE PIPELINE');
    fireEvent.click(runBtn);
    act(() => { vi.runAllTimers(); });

    // Verify Failure
    expect(handleOutcome).toHaveBeenCalledWith('failure', expect.stringContaining('WHAT HAPPENED'));
  });

  it('fails when required pipeline nodes are missing', () => {
    vi.useFakeTimers();
    const handleOutcome = vi.fn();
    render(<GraphBuildBoard level={mockLevel} onOutcome={handleOutcome} />);

    // Just activate immediately without connecting SOURCE -> BUILD
    const activateBtn = screen.getByText('ACTIVATE PIPELINE');
    fireEvent.click(activateBtn);
    act(() => { vi.runAllTimers(); });

    // Verify Failure (SOURCE to BUILD is missing)
    expect(handleOutcome).toHaveBeenCalledWith('failure', expect.stringContaining('WHAT HAPPENED'));
  });
});
