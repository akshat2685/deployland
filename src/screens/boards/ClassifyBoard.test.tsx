import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import ClassifyBoard from './ClassifyBoard';
import type { Level } from '../../engine/types';
import level09Config from '../../content/cicd-level-09.json';

const mockLevel = level09Config as unknown as Level;

describe('ClassifyBoard', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders correctly and allows categorizing assets with least privilege', () => {
    vi.useFakeTimers();
    const handleOutcome = vi.fn();
    render(<ClassifyBoard level={mockLevel} onOutcome={handleOutcome} />);
    
    // Select DATABASE_PASSWORD
    fireEvent.click(screen.getAllByText('DATABASE_PASSWORD')[0]);
    act(() => { vi.runAllTimers(); });
    
    // Check inspector populated
    expect(screen.getByText('Master password for the production database.')).toBeDefined();

    // Set classification to SECRET
    fireEvent.click(screen.getByLabelText('Set classification SECRET'));
    // Set roles to OPS and ADMIN
    fireEvent.click(screen.getByLabelText('Toggle role OPS'));
    fireEvent.click(screen.getByLabelText('Toggle role ADMIN'));

    // Select DATABASE_HOST
    fireEvent.click(screen.getAllByText('DATABASE_HOST')[0]);
    act(() => { vi.runAllTimers(); });
    fireEvent.click(screen.getByLabelText('Set classification INTERNAL'));
    fireEvent.click(screen.getByLabelText('Toggle role DEV'));
    fireEvent.click(screen.getByLabelText('Toggle role CI'));
    fireEvent.click(screen.getByLabelText('Toggle role OPS'));
    fireEvent.click(screen.getByLabelText('Toggle role ADMIN'));

    // Select DOCKER_IMAGE
    fireEvent.click(screen.getAllByText('DOCKER_IMAGE')[0]);
    act(() => { vi.runAllTimers(); });
    fireEvent.click(screen.getByLabelText('Set classification INTERNAL'));
    fireEvent.click(screen.getByLabelText('Toggle role DEV'));
    fireEvent.click(screen.getByLabelText('Toggle role CI'));
    fireEvent.click(screen.getByLabelText('Toggle role OPS'));

    // Select DEPLOY_TOKEN
    fireEvent.click(screen.getAllByText('DEPLOY_TOKEN')[0]);
    act(() => { vi.runAllTimers(); });
    fireEvent.click(screen.getByLabelText('Set classification SECRET'));
    fireEvent.click(screen.getByLabelText('Toggle role CI'));
    fireEvent.click(screen.getByLabelText('Toggle role OPS'));

    // Apply policy
    const submit = screen.getByText('EXECUTE MANIFEST');
    fireEvent.click(submit);
    
    // Verify success
    expect(handleOutcome).toHaveBeenCalledWith('success', undefined);
  });
  
  it('shows failure when secret is classified too broadly', () => {
    vi.useFakeTimers();
    const handleOutcome = vi.fn();
    render(<ClassifyBoard level={mockLevel} onOutcome={handleOutcome} />);
    
    // DATABASE_PASSWORD classified as PUBLIC (violation)
    fireEvent.click(screen.getAllByText('DATABASE_PASSWORD')[0]);
    act(() => { vi.runAllTimers(); });
    fireEvent.click(screen.getByLabelText('Set classification PUBLIC'));
    fireEvent.click(screen.getByLabelText('Toggle role OPS'));
    fireEvent.click(screen.getByLabelText('Toggle role ADMIN'));

    fireEvent.click(screen.getAllByText('DATABASE_HOST')[0]);
    act(() => { vi.runAllTimers(); });
    fireEvent.click(screen.getByLabelText('Set classification INTERNAL'));
    fireEvent.click(screen.getByLabelText('Toggle role DEV'));
    fireEvent.click(screen.getByLabelText('Toggle role CI'));
    fireEvent.click(screen.getByLabelText('Toggle role OPS'));
    fireEvent.click(screen.getByLabelText('Toggle role ADMIN'));

    fireEvent.click(screen.getAllByText('DOCKER_IMAGE')[0]);
    act(() => { vi.runAllTimers(); });
    fireEvent.click(screen.getByLabelText('Set classification INTERNAL'));
    fireEvent.click(screen.getByLabelText('Toggle role DEV'));
    fireEvent.click(screen.getByLabelText('Toggle role CI'));
    fireEvent.click(screen.getByLabelText('Toggle role OPS'));

    fireEvent.click(screen.getAllByText('DEPLOY_TOKEN')[0]);
    act(() => { vi.runAllTimers(); });
    fireEvent.click(screen.getByLabelText('Set classification SECRET'));
    fireEvent.click(screen.getByLabelText('Toggle role CI'));
    fireEvent.click(screen.getByLabelText('Toggle role OPS'));
    
    const submit = screen.getByText('EXECUTE MANIFEST');
    fireEvent.click(submit);
    
    // Verify breach
    expect(handleOutcome).toHaveBeenCalledWith('failure', expect.stringContaining('WHAT HAPPENED'));
  });
});
