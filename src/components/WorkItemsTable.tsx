import React, { useState, useMemo } from 'react';
import type { Data_checkinRead } from '../generated/models/Data_checkinModel';

interface WorkItemsTableProps {
  items: Data_checkinRead[];
  isDemoData?: boolean;
  onEdit: (item: Data_checkinRead) => void;
  onDelete: (item: Data_checkinRead) => void;
}

export const WorkItemsTable: React.FC<WorkItemsTableProps> = ({
  items,
  isDemoData,
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on user search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase().trim();

    return items.filter((item) => {
      const idStr = String(item.field_0 ?? item.ID ?? '').toLowerCase();
      const titleStr = (item.Title || '').toLowerCase();
      const locationStr = (item.field_3 || '').toLowerCase();
      const noteStr = (item.field_4 || '').toLowerCase();

      return (
        idStr.includes(query) ||
        titleStr.includes(query) ||
        locationStr.includes(query) ||
        noteStr.includes(query)
      );
    });
  }, [items, searchQuery]);

  // Helper to format ISO date string nicely
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;

      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return dateString;
    }
  };

  // Helper for generating consistent avatar letters
  const getAvatarLetter = (title?: string) => {
    if (!title || title.trim().length === 0) return 'W';
    return title.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="card-container">
      {/* Table Toolbar Header */}
      <div className="table-toolbar">
        <div className="toolbar-info">
          <div className="toolbar-title-row">
            <h2 className="toolbar-title">Work Items</h2>
            <span className="count-badge">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </span>
            {isDemoData && (
              <span className="demo-badge" title="Showing preview sample data">
                Demo Preview
              </span>
            )}
          </div>
          <p className="toolbar-subtitle">
            Records logged in SharePoint list: <code>data_checkin</code>
          </p>
        </div>

        {/* Search Input */}
        <div className="search-wrapper">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, ID, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col" style={{ width: '85px' }}>Id</th>
              <th scope="col" style={{ minWidth: '220px' }}>Name</th>
              <th scope="col" style={{ minWidth: '180px' }}>Check in</th>
              <th scope="col" style={{ minWidth: '180px' }}>Location</th>
              <th scope="col" style={{ minWidth: '220px' }}>note</th>
              <th scope="col" style={{ width: '130px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => {
              const displayId = item.field_0 !== undefined ? item.field_0 : item.ID;
              const formattedDate = formatDateTime(item.field_2);
              const avatarChar = getAvatarLetter(item.Title);

              return (
                <tr key={item.ID ?? `row-${index}`} className="table-row">
                  {/* Id */}
                  <td>
                    <span className="id-badge" title={`Item ID: ${displayId}`}>
                      #{displayId ?? '—'}
                    </span>
                  </td>

                  {/* Name */}
                  <td>
                    <div className="name-cell">
                      <div className="avatar-chip">{avatarChar}</div>
                      <div className="name-text-group">
                        <span className="item-title">{item.Title || '(Untitled)'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Check in */}
                  <td>
                    <div className="datetime-cell">
                      <svg
                        className="cell-icon"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{formattedDate}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td>
                    <div className="location-pill">
                      <svg
                        className="location-icon"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{item.field_3 || '—'}</span>
                    </div>
                  </td>

                  {/* note */}
                  <td>
                    <span className={`note-text ${!item.field_4 ? 'is-empty' : ''}`}>
                      {item.field_4 || 'No notes provided'}
                    </span>
                  </td>

                  {/* Actions: Edit & Delete */}
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn-row-action btn-edit"
                        onClick={() => onEdit(item)}
                        title={`Edit #${displayId}`}
                        aria-label={`Edit ${item.Title || 'item'}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        className="btn-row-action btn-delete"
                        onClick={() => onDelete(item)}
                        title={`Delete #${displayId}`}
                        aria-label={`Delete ${item.Title || 'item'}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State when Search has no matches */}
        {filteredItems.length === 0 && (
          <div className="table-empty-state">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <p className="empty-title">No matching work items</p>
            <p className="empty-subtitle">
              No records match <strong>"{searchQuery}"</strong>. Try checking for typos or searching by another keyword.
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSearchQuery('')}
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Table Footer info */}
      <div className="table-footer">
        <span className="footer-meta">
          Showing {filteredItems.length} of {items.length} total entries
        </span>
        <span className="footer-brand">SharePoint List Integration</span>
      </div>
    </div>
  );
};
