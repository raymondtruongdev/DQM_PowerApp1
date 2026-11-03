import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { TopAppBar } from './components/TopAppBar';
import { WorkItemsTable } from './components/WorkItemsTable';
import { SkeletonLoader } from './components/SkeletonLoader';
import { ErrorState } from './components/ErrorState';
import { Data_checkinService } from './generated/services/Data_checkinService';
import type { Data_checkinRead } from './generated/models/Data_checkinModel';

// Realistic sample records for instant preview / local development fallback
const SAMPLE_RECORDS: Data_checkinRead[] = [
  {
    ID: 1,
    field_0: 101,
    Title: 'Quarterly Audit Inspection',
    field_2: '2026-11-03T08:30:00Z',
    field_3: 'Hanoi Logistics Hub',
    field_4: 'Passed preliminary safety and compliance standards',
  },
  {
    ID: 2,
    field_0: 102,
    Title: 'Assembly Line #3 Calibration',
    field_2: '2026-11-03T09:15:00Z',
    field_3: 'Chu Lai Manufacturing Plant',
    field_4: 'Torque sensors recalibrated to 0.05Nm tolerance',
  },
  {
    ID: 3,
    field_0: 103,
    Title: 'Inbound Material Quality Review',
    field_2: '2026-11-03T10:00:00Z',
    field_3: 'Da Nang Warehouse C',
    field_4: 'Steel sheet batch #ST-449 verified against metallurgy specs',
  },
  {
    ID: 4,
    field_0: 104,
    Title: 'Paint Shop Airflow Verification',
    field_2: '2026-11-03T11:45:00Z',
    field_3: 'Chu Lai Main Complex',
    field_4: 'HEPA filters inspected; next scheduled replacement in 45 days',
  },
  {
    ID: 5,
    field_0: 105,
    Title: 'Final Vehicle Road Test',
    field_2: '2026-11-03T13:20:00Z',
    field_3: 'Test Track Alpha',
    field_4: 'Braking distance and NVH performance within target thresholds',
  },
  {
    ID: 6,
    field_0: 106,
    Title: 'Chassis Welding Ultrasonic Check',
    field_2: '2026-11-03T14:10:00Z',
    field_3: 'Chu Lai Body Shop',
    field_4: 'Robotic seam welds ultrasonic testing completed with zero defects',
  },
];

function App() {
  const [items, setItems] = useState<Data_checkinRead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Asynchronous fetcher without synchronous state mutation before IO
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
    void fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
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
  }, []);

  const handleUseDemoData = () => {
    setItems(SAMPLE_RECORDS);
    setIsDemoMode(true);
    setErrorMessage(null);
  };

  return (
    <div className="app-layout">
      {/* Top App Bar titled "PowerApp1" */}
      <TopAppBar
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={!isLoading && !errorMessage ? items.length : undefined}
      />

      {/* Main Content Area */}
      <main className="main-content">
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
          <WorkItemsTable items={items} isDemoData={isDemoMode} />
        )}
      </main>
    </div>
  );
}

export default App;
