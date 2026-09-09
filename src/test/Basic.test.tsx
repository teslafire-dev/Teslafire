import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('Prueba Inicial de Vitest', () => {
  it('Debería poder hacer aserciones matemáticas básicas', () => {
    expect(1 + 1).toBe(2);
    expect(0.16 * 100).toBe(16);
  });

  it('Debería poder renderizar un componente de React y leer su contenido', () => {
    const ComponentePrueba = () => (
      <div data-testid="prueba-box">
        <h1>Punto de Venta</h1>
        <p>IVA: 16%</p>
      </div>
    );

    render(<ComponentePrueba />);
    
    expect(screen.getByTestId('prueba-box')).toBeInTheDocument();
    expect(screen.getByText('Punto de Venta')).toBeInTheDocument();
    expect(screen.getByText(/IVA: 16%/i)).toBeInTheDocument();
  });
});
