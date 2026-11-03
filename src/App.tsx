import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { LoginPage } from './components/LoginPage';
import { TopAppBar } from './components/TopAppBar';
import { WorkItemsTable } from './components/WorkItemsTable';
import { SkeletonLoader } from './components/SkeletonLoader';
import { ErrorState } from './components/ErrorState';
import { EditItemView } from './components/EditItemView';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Data_checkinService } from './generated/services/Data_checkinService';
import type { Data_checkinRead, Data_checkinWrite } from './generated/models/Data_checkinModel';

// Realistic sample records for instant preview / local development fallback
const SAMPLE_RECORDS: Data_checkinRead[] = [
  {
    ID: 1,
    field_0: 101,
    Title: 'Quarterly Audit Inspection',
    Phone: '+84 901 234 567',
    field_2: '2026-11-03T08:30:00Z',
    field_3: 'Hanoi Logistics Hub',
    field_4: 'Passed preliminary safety and compliance standards',
  },
  {
    ID: 2,
    field_0: 102,
    Title: 'Assembly Line #3 Calibration',
    Phone: '+84 912 345 678',
    field_2: '2026-11-03T09:15:00Z',
    field_3: 'Chu Lai Manufacturing Plant',
    field_4: 'Torque sensors recalibrated to 0.05Nm tolerance',
  },
  {
    ID: 3,
    field_0: 103,
    Title: 'Inbound Material Quality Review',
    Phone: '+84 983 456 789',
    field_2: '2026-11-03T10:00:00Z',
    field_3: 'Da Nang Warehouse C',
    field_4: 'Steel sheet batch #ST-449 verified against metallurgy specs',
  },
  {
    ID: 4,
    field_0: 104,
    Title: 'Paint Shop Airflow Verification',
    Phone: '+84 908 765 432',
    field_2: '2026-11-03T11:45:00Z',
    field_3: 'Chu Lai Main Complex',
    field_4: 'HEPA filters inspected; next scheduled replacement in 45 days',
  },
  {
    ID: 5,
    field_0: 105,
    Title: 'Final Vehicle Road Test',
    Phone: '+84 918 876 543',
    field_2: '2026-11-03T13:20:00Z',
    field_3: 'Test Track Alpha',
    field_4: 'Braking distance and NVH performance within target thresholds',
  },
  {
    ID: 6,
    field_0: 106,
    Title: 'Chassis Welding Ultrasonic Check',
    Phone: '+84 934 567 890',
    field_2: '2026-11-03T14:10:00Z',
    field_3: 'Chu Lai Body Shop',
    field_4: 'Robotic seam welds ultrasonic testing completed with zero defects',
  },
];

interface ToastState {
  type: 'success' | 'error';
  text: string;
}

interface UserSession {
  username: string;
  displayName: string;
}

function App() {
  // Authentication State: Default to null so the app presents the Login page first
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = sessionStorage.getItem('powerapp1_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return null;
  });

  const [items, setItems] = useState<Data_checkinRead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Edit & Delete View States
  const [editingItem, setEditingItem] = useState<Data_checkinRead | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deletingItem, setDeletingItem] = useState<Data_checkinRead | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toast Notification
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Asynchronous data fetcher
  const fetchRecords = useCallback(async () => {
    try {
      const result = await Data_checkinService.getAll();

      if (result && result.success && Array.isArray(result.data)) {
        setItems(result.data);
        setErrorMessage(null);
      } else if (result && result.error) {
        throw new Error(result.error.message || 'SharePoint service returned an error.');
      } else if (result && Array.isArray(result.data)) {
        setItems(result.data);
        setErrorMessage(null);
      } else {
        throw new Error('No records returned from SharePoint list.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsDemoMode(false);
    setEditingItem(null);
    void fetchRecords();
  }, [fetchRecords]);

  // Load records once authenticated
  useEffect(() => {
    if (!currentUser) return;

    let ignore = false;

    async function initialize() {
      try {
        const result = await Data_checkinService.getAll();
        if (ignore) return;

        if (result && result.success && Array.isArray(result.data)) {
          setItems(result.data);
          setErrorMessage(null);
        } else if (result && result.error) {
          throw new Error(result.error.message || 'SharePoint service returned an error.');
        } else if (result && Array.isArray(result.data)) {
          setItems(result.data);
          setErrorMessage(null);
        } else {
          throw new Error('No records returned from SharePoint list.');
        }
      } catch (err: unknown) {
        if (ignore) return;
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(msg);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      ignore = true;
    };
  }, [currentUser]);

  // Auth Handlers
  const handleLoginSuccess = (user: UserSession) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentUser(user);
    try {
      sessionStorage.setItem('powerapp1_session', JSON.stringify(user));
    } catch {
      // Ignore
    }
    showToast('success', `Welcome back, ${user.displayName}! Access granted.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEditingItem(null);
    setDeletingItem(null);
    try {
      sessionStorage.removeItem('powerapp1_session');
    } catch {
      // Ignore
    }
    showToast('success', 'You have been signed out.');
  };

  const handleUseDemoData = () => {
    setItems(SAMPLE_RECORDS);
    setIsDemoMode(true);
    setErrorMessage(null);
  };

  // =========================================================================
  // Edit Handlers
  // =========================================================================
  const handleOpenEdit = (item: Data_checkinRead) => {
    setEditingItem(item);
    setSaveError(null);
  };

  const handleCloseEdit = () => {
    setEditingItem(null);
    setSaveError(null);
  };

  const handleSaveEdit = async (changedFields: Partial<Omit<Data_checkinWrite, 'ID'>>) => {
    if (!editingItem || editingItem.ID === undefined) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      if (isDemoMode) {
        // Update local mock state directly in demo preview mode
        setItems((prev) =>
          prev.map((it) => (it.ID === editingItem.ID ? { ...it, ...changedFields } : it))
        );
        showToast('success', `Item #${editingItem.field_0 ?? editingItem.ID} updated successfully!`);
        setEditingItem(null);
      } else {
        // Send updates to SharePoint list
        const res = await Data_checkinService.update(String(editingItem.ID), changedFields);

        if (res.success && res.data) {
          const updatedRecord = res.data;
          setItems((prev) =>
            prev.map((it) => (it.ID === editingItem.ID ? updatedRecord : it))
          );
          showToast('success', `Item #${updatedRecord.field_0 ?? updatedRecord.ID} updated in SharePoint!`);
          setEditingItem(null);
        } else if (res.error) {
          throw new Error(res.error.message || 'SharePoint update failed.');
        } else {
          // Fallback optimistic update
          setItems((prev) =>
            prev.map((it) => (it.ID === editingItem.ID ? { ...it, ...changedFields } : it))
          );
          showToast('success', `Item #${editingItem.field_0 ?? editingItem.ID} updated successfully!`);
          setEditingItem(null);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================================
  // Delete Handlers
  // =========================================================================
  const handleOpenDelete = (item: Data_checkinRead) => {
    setDeletingItem(item);
  };

  const handleCancelDelete = () => {
    setDeletingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem || deletingItem.ID === undefined) return;

    setIsDeleting(true);

    try {
      if (isDemoMode) {
        // Delete from local mock state
        setItems((prev) => prev.filter((it) => it.ID !== deletingItem.ID));
        showToast('success', `Item #${deletingItem.field_0 ?? deletingItem.ID} removed from list.`);
        setDeletingItem(null);
      } else {
        // Call SharePoint Service delete operation
        const res = await Data_checkinService.delete(String(deletingItem.ID));

        if (res.success || !res.error) {
          setItems((prev) => prev.filter((it) => it.ID !== deletingItem.ID));
          showToast('success', `Item #${deletingItem.field_0 ?? deletingItem.ID} deleted from SharePoint!`);
          setDeletingItem(null);
        } else {
          throw new Error(res.error?.message || 'Failed to delete record from SharePoint.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast('error', `Delete failed: ${msg}`);
      setDeletingItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // If not authenticated, render Login Page by default
  if (!currentUser) {
    return (
      <>
        {toast && (
          <aside
            className={`toast-notification toast-${toast.type}`}
            style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100 }}
            role="status"
            aria-live="polite"
          >
            <div className="toast-content">
              <span>{toast.text}</span>
            </div>
          </aside>
        )}
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  // Once authenticated, render Check-in Management
  return (
    <div className="app-layout">
      {/* Top App Bar titled "PowerApp1" with active user & logout */}
      <TopAppBar
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={!isLoading && !errorMessage ? items.length : undefined}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Toast Alert Notification */}
        {toast && (
          <aside
            className={`toast-notification toast-${toast.type}`}
            role="status"
            aria-live="polite"
          >
            <div className="toast-content">
              {toast.type === 'success' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              <span>{toast.text}</span>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setToast(null)}
              aria-label="Dismiss notice"
            >
              ×
            </button>
          </aside>
        )}

        {/* View Switching: Edit Page View vs. List/Table View */}
        {editingItem ? (
          <EditItemView
            key={editingItem.ID}
            item={editingItem}
            onSave={handleSaveEdit}
            onBack={handleCloseEdit}
            isSaving={isSaving}
            saveError={saveError}
          />
        ) : (
          <>
            <section className="page-intro">
              <h2 className="page-title">Check-in Management</h2>
              <p className="page-description">
                Monitor real-time site check-ins, team locations, and operational notes.
              </p>
            </section>

            {/* Content States: Loading Skeleton | Error State | Data Table */}
            {isLoading ? (
              <div className="card-container">
                <div className="table-toolbar">
                  <div className="toolbar-info">
                    <div className="toolbar-title-row">
                      <h2 className="toolbar-title">Work Items</h2>
                      <span className="count-badge">Loading...</span>
                    </div>
                    <p className="toolbar-subtitle">Connecting to SharePoint data source...</p>
                  </div>
                </div>
                <SkeletonLoader rowCount={5} />
              </div>
            ) : errorMessage ? (
              <ErrorState
                message={errorMessage}
                onRetry={handleRefresh}
                onUseDemoData={handleUseDemoData}
              />
            ) : (
              <WorkItemsTable
                items={items}
                isDemoData={isDemoMode}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            )}
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        item={deletingItem}
        isOpen={Boolean(deletingItem)}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default App;
