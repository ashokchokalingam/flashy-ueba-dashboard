import { Table, TableBody } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Alert } from "./types";
import AlertTableRow from "./AlertTableRow";
import AnomaliesTableHeader from "./AnomaliesTableHeader";
import InfiniteScrollLoader from "./InfiniteScrollLoader";
import DetailsSidebar from "./DetailsSidebar";

interface TimelineState {
  type: "user" | "computer";
  id: string;
}

interface AnomaliesTableProps {
  alerts: Alert[];
}

const AnomaliesTable = ({ alerts }: AnomaliesTableProps) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [timelineView, setTimelineView] = useState<TimelineState | null>(null);
  const [displayedAlerts, setDisplayedAlerts] = useState<Alert[]>([]);
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);
  const ITEMS_PER_PAGE = 100;
  
  const sortedAlerts = [...alerts].sort((a, b) => 
    new Date(b.system_time).getTime() - new Date(a.system_time).getTime()
  );

  useEffect(() => {
    setDisplayedAlerts(sortedAlerts.slice(0, ITEMS_PER_PAGE));
  }, [alerts]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedAlert(null);
        setTimelineView(null);
        window.scrollTo({ left: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  const loadMore = useCallback(() => {
    const nextItems = sortedAlerts.slice(
      page * ITEMS_PER_PAGE,
      (page + 1) * ITEMS_PER_PAGE
    );
    
    if (nextItems.length > 0) {
      setDisplayedAlerts(prev => [...prev, ...nextItems]);
      setPage(prev => prev + 1);
      console.log(`Loaded more items. Current page: ${page + 1}`);
    }
  }, [page, sortedAlerts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const toggleAlert = (alert: Alert) => {
    if (selectedAlert?.id === alert.id) {
      setSelectedAlert(null);
      setTimelineView(null);
      window.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      setSelectedAlert(alert);
      setTimelineView(null);
      setTimeout(() => {
        window.scrollTo({
          left: document.documentElement.scrollWidth,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  const handleTimelineView = (type: "user" | "computer", id: string) => {
    if (timelineView?.type === type && timelineView?.id === id) {
      setTimelineView(null);
    } else {
      setSelectedAlert(null);
      setTimelineView({ type, id });
    }
  };

  return (
    <div className="relative flex gap-4">
      <Card className={`bg-black/40 border-blue-500/10 hover:bg-black/50 transition-all duration-300 ${selectedAlert || timelineView ? 'flex-[0.6]' : 'flex-1'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-100">
            <AlertTriangle className="h-5 w-5 text-blue-500" />
            Latest Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-blue-500/10">
            <Table>
              <AnomaliesTableHeader />
              <TableBody>
                {displayedAlerts.map((alert) => (
                  <AlertTableRow
                    key={alert.id}
                    alert={alert}
                    isSelected={selectedAlert?.id === alert.id}
                    onToggle={() => toggleAlert(alert)}
                    onTimelineView={handleTimelineView}
                  />
                ))}
              </TableBody>
            </Table>
            <InfiniteScrollLoader 
              ref={loaderRef}
              hasMore={page * ITEMS_PER_PAGE < sortedAlerts.length}
            />
          </div>
        </CardContent>
      </Card>

      <DetailsSidebar
        selectedAlert={selectedAlert}
        timelineView={timelineView}
        alerts={alerts}
        onTimelineClose={() => setTimelineView(null)}
      />
    </div>
  );
};

export default AnomaliesTable;