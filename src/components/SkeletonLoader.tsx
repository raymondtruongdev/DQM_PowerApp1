import React from 'react';

interface SkeletonLoaderProps {
  rowCount?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ rowCount = 5 }) => {
  const rows = Array.from({ length: rowCount });

  return (
    <div className="skeleton-container" aria-busy="true" aria-label="Loading data">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '80px' }}>Id</th>
            <th style={{ width: '220px' }}>Name</th>
            <th style={{ width: '180px' }}>Check in</th>
            <th style={{ width: '180px' }}>Location</th>
            <th>note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, index) => (
            <tr key={`skeleton-${index}`} className="skeleton-row">
              {/* Id */}
              <td>
                <div className="skeleton-shimmer skeleton-badge" style={{ width: '48px' }} />
              </td>

              {/* Name */}
              <td>
                <div className="skeleton-cell-group">
                  <div className="skeleton-shimmer skeleton-avatar" />
                  <div
                    className="skeleton-shimmer skeleton-line"
                    style={{ width: `${100 + (index % 3) * 35}px` }}
                  />
                </div>
              </td>

              {/* Check in */}
              <td>
                <div
                  className="skeleton-shimmer skeleton-line"
                  style={{ width: `${120 + (index % 2) * 20}px` }}
                />
              </td>

              {/* Location */}
              <td>
                <div className="skeleton-cell-group">
                  <div className="skeleton-shimmer skeleton-icon" />
                  <div
                    className="skeleton-shimmer skeleton-line"
                    style={{ width: `${90 + (index % 3) * 25}px` }}
                  />
                </div>
              </td>

              {/* note */}
              <td>
                <div
                  className="skeleton-shimmer skeleton-line"
                  style={{ width: `${160 + (index % 4) * 40}px` }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

