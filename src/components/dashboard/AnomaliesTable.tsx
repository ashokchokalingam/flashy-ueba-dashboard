import { Table, TableBody } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { Alert } from "./types";
import AlertTableRow from "./AlertTableRow";
import AnomaliesTableHeader from "./AnomaliesTableHeader";
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
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // Filter alerts for last 7 days and dbscan_cluster = -1
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const sortedAlerts = [...alerts]
    .filter(alert => {
      const alertDate = new Date(alert.system_time);
      return alertDate >= sevenDaysAgo && alert.dbscan_cluster === -1;
    })
    .sort((a, b) => 
      new Date(b.system_time).getTime() - new Date(a.system_time).getTime()
    );

  const filteredAlerts = sortedAlerts.filter(alert => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === "tags") {
        return alert[key].toLowerCase().includes(value.toLowerCase());
      }
      return String(alert[key as keyof Alert]).toLowerCase() === value.toLowerCase();
    });
  });

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

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  return (
    <div className="relative flex gap-4">
      <Card className={`bg-black/40 border-blue-500/10 hover:bg-black/50 transition-all duration-300 ${selectedAlert || timelineView ? 'flex-[0.6]' : 'flex-1'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-100">
            <AlertTriangle className="h-5 w-5 text-blue-500" />
            Latest Anomalies (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-blue-500/10">
            <Table>
              <AnomaliesTableHeader 
                alerts={alerts}
                onFilterChange={handleFilterChange}
                filters={filters}
              />
              <TableBody>
                {filteredAlerts.map((alert) => (
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