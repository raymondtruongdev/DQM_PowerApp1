import React from 'react';

interface TopAppBarProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  itemCount?: number;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onRefresh, isLoading, itemCount }) => {
  return (
    <header className="app-bar">
      <div className="app-bar-container">
        {/* Left: Brand Identity */}
        <div className="brand-group">
          <div className="brand-logo" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="brand-meta">
            <h1 className="brand-title">PowerApp1</h1>
            <span className="brand-badge">SharePoint Portal</span>
          </div>
        </div>

        {/* Right: Actions & User Meta */}
        <div className="app-bar-actions">
          {itemCount !== undefined && (
            <div className="stat-pill" title="Total active work items in list">
              <span className="stat-dot" />
              <span className="stat-label">{itemCount} items</span>
            </div>
          )}

          <button
            type="button"
            className={`btn-action ${isLoading ? 'is-loading' : ''}`}
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh list data"
            aria-label="Refresh list"
          >
            <svg
              className={`action-icon ${isLoading ? 'spin' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span className="btn-label">{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <div className="user-profile" title="Signed in user">
            <div className="user-avatar">AD</div>
          </div>
        </div>
      </div>
    </header>
  );
};

