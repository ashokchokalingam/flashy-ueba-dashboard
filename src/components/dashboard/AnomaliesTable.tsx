import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Alert } from "./types";
import AlertTableRow from "./AlertTableRow";
import AlertDetailsView from "./AlertDetailsView";
import TimelineView from "./TimelineView";
import { getRiskScore } from "./utils";

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
    // Initialize with first 100 items
    setDisplayedAlerts(sortedAlerts.slice(0, ITEMS_PER_PAGE));
  }, [alerts]);

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

  useEffect(() => {
    if (selectedAlert || timelineView) {
      setTimeout(() => {
        window.scrollTo({
          left: document.documentElement.scrollWidth,
          behavior: 'smooth'
        });
      }, 100);
    } else {
      window.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [selectedAlert, timelineView]);

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
              <TableHeader>
                <TableRow className="hover:bg-blue-950/30">
                  <TableHead className="text-blue-300">Time</TableHead>
                  <TableHead className="text-blue-300">User</TableHead>
                  <TableHead className="text-blue-300">Computer</TableHead>
                  <TableHead className="text-blue-300">IP Address</TableHead>
                  <TableHead className="text-blue-300">Title</TableHead>
                  <TableHead className="text-blue-300">Tactics</TableHead>
                  <TableHead className="text-blue-300">Techniques</TableHead>
                  <TableHead className="text-blue-300">Risk Score</TableHead>
                  <TableHead className="text-blue-300">Outlier</TableHead>
                  <TableHead className="text-blue-300 w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
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
            {/* Infinite scroll trigger element */}
            <div 
              ref={loaderRef}
              className="h-10 flex items-center justify-center text-blue-400/60 text-sm"
            >
              {page * ITEMS_PER_PAGE < sortedAlerts.length ? 
                "Loading more..." : "No more alerts to load"}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={`fixed top-0 right-0 h-screen w-[800px] bg-black/90 transform transition-all duration-300 ease-in-out overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent ${
        selectedAlert || timelineView ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {selectedAlert && (
          <Card className="h-full bg-transparent border-none">
            <CardContent className="p-6">
              <AlertDetailsView alert={selectedAlert} />
            </CardContent>
          </Card>
        )}
        {timelineView && (
          <Card className="h-full bg-transparent border-none">
            <CardContent className="p-6">
              <TimelineView
                alerts={alerts}
                entityType={timelineView.type}
                entityId={timelineView.id}
                onClose={() => setTimelineView(null)}
                inSidebar={true}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnomaliesTable;