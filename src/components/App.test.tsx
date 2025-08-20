import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

describe('App component', () => {
    it('renders correctly', () => {
        const { container } = render(<App />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('has the correct title', () => {
        const { getByText } = render(<App />);
        expect(getByText('Investimate')).toBeInTheDocument();
    });
});