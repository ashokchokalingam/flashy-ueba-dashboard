import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "./types";
import AnomaliesMainView from "./AnomaliesMainView";
import AnomaliesSplitView from "./AnomaliesSplitView";
import AnomaliesTableHeaderSection from "./AnomaliesTableHeaderSection";
import { defaultColumns } from "./TableConfig";
import { useAlertsFilter } from "./hooks/useAlertsFilter";

interface AnomaliesTableProps {
  alerts: Alert[];
  onLoadMore: () => void;
  hasMore: boolean;
}

const AnomaliesTable = ({ alerts, onLoadMore, hasMore }: AnomaliesTableProps) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    defaultColumns.map((col) => col.key)
  );

  const { filters, filteredAlerts, handleFilterChange } = useAlertsFilter(alerts);

  const handleColumnToggle = (columns: string[]) => {
    setVisibleColumns(columns);
  };

  const handleSelectAll = () => {
    const allColumnKeys = defaultColumns.map(col => col.key);
    setVisibleColumns(allColumnKeys);
  };

  const handleDeselectAll = () => {
    setVisibleColumns(['system_time']);
  };

  const handleTimelineView = (type: "user" | "computer", id: string) => {
    console.log("Timeline view requested for:", type, id);
  };

  return (
    <Card className="relative border-[#2D2D44] bg-[#1A1A2E]">
      <div className="relative">
        <div className="flex items-center justify-between p-4 border-b border-[#2D2D44]">
          <h2 className="text-lg font-semibold text-purple-300">Chrono Analyzer</h2>
          <AnomaliesTableHeaderSection
            visibleColumns={visibleColumns}
            onColumnToggle={handleColumnToggle}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        </div>
        <CardContent className="p-0">
          {selectedAlert ? (
            <AnomaliesSplitView
              selectedAlert={selectedAlert}
              alerts={alerts}
              onFilterChange={handleFilterChange}
              filters={filters}
              visibleColumns={visibleColumns}
              onAlertSelect={setSelectedAlert}
              onTimelineView={handleTimelineView}
              filteredAlerts={filteredAlerts}
              onClose={() => setSelectedAlert(null)}
            />
          ) : (
            <AnomaliesMainView
              alerts={alerts}
              onFilterChange={handleFilterChange}
              filters={filters}
              visibleColumns={visibleColumns}
              selectedAlert={selectedAlert}
              onAlertSelect={setSelectedAlert}
              onTimelineView={handleTimelineView}
              filteredAlerts={filteredAlerts}
            />
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default AnomaliesTable;