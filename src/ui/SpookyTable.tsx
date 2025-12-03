import React from 'react';

export interface SpookyTableProps {
  headers: string[];
  rows: React.ReactNode[][];
  className?: string;
}

/**
 * Spooky themed table with hover effects
 * 
 * @example
 * ```tsx
 * <SpookyTable 
 *   headers={['Feature', 'Support', 'Research']}
 *   rows={[
 *     ['Purpose', 'Customer support', 'Research workflow'],
 *     ['Agents', '4 agents', '4 agents']
 *   ]}
 * />
 * ```
 */
export const SpookyTable: React.FC<SpookyTableProps> = ({ 
  headers, 
  rows, 
  className = '' 
}) => {
  return (
    <table className={`spooky-table ${className}`}>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
