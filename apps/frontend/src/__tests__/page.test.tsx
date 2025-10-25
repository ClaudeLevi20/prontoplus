import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    expect(screen.getByText('Welcome to ProntoPlus')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<Home />);
    expect(screen.getByText('AI-powered receptionist solution for orthodontic practices')).toBeInTheDocument();
  });

  it('renders the feature cards', () => {
    render(<Home />);
    expect(screen.getByText('Smart Scheduling')).toBeInTheDocument();
    expect(screen.getByText('Patient Communication')).toBeInTheDocument();
  });
});
