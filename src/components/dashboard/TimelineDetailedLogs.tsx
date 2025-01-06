import { useState } from "react";
import { Alert } from "./types";
import TimelineLogCard from "./TimelineLogCard";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";
import TimelineMetadataGrid from "./TimelineMetadataGrid";
import TimelineMitreSection from "./TimelineMitreSection";

interface TimelineDetailedLogsProps {
  logs: Alert[];
  isLoading?: boolean;
  totalRecords?: number;
}

const TimelineDetailedLogs = ({ logs, isLoading, totalRecords }: TimelineDetailedLogsProps) => {
  const [selectedLog, setSelectedLog] = useState<Alert | null>(null);

  const handleLogClick = (log: Alert) => {
    setSelectedLog(selectedLog?.id === log.id ? null : log);
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 mt-8">
      <div className="flex-1 overflow-hidden">
        <div className="w-full h-full border border-purple-400/20 rounded-lg bg-gradient-to-b from-[#1E1E2F] to-[#1A1F2C] shadow-xl">
          {totalRecords !== undefined && (
            <div className="p-4 text-sm text-purple-200/80 border-b border-purple-400/20 bg-purple-400/5 backdrop-blur-sm">
              <span className="font-semibold">Total Records:</span> {totalRecords.toLocaleString()}
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-purple-400/5 backdrop-blur-sm sticky top-0 z-10">
                <TableRow className="hover:bg-transparent border-b border-purple-400/20">
                  <TableHead className="w-[200px] text-purple-100 font-semibold">Time</TableHead>
                  <TableHead className="w-[250px] text-purple-100 font-semibold">User Origin</TableHead>
                  <TableHead className="w-[200px] text-purple-100 font-semibold">User Impacted</TableHead>
                  <TableHead className="w-[200px] text-purple-100 font-semibold">Computer</TableHead>
                  <TableHead className="min-w-[300px] text-purple-100 font-semibold">Event</TableHead>
                  <TableHead className="min-w-[250px] text-purple-100 font-semibold">Tactics & Techniques</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TimelineLogCard
                    key={log.id}
                    log={log}
                    isExpanded={selectedLog?.id === log.id}
                    onToggleExpand={handleLogClick}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {selectedLog && (
        <div className="w-[600px] border-l border-purple-400/20 pl-6 overflow-y-auto max-h-screen">
          <div className="space-y-6 bg-gradient-to-b from-[#1E1E2F] to-[#1A1F2C] rounded-lg p-6 shadow-xl border border-purple-400/20">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-purple-100 bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-blue-200">
                {selectedLog.title}
              </h2>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLog(null);
                }}
                className="text-purple-300 hover:text-purple-100 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-purple-400/10"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-purple-400/5 rounded-lg p-4 border border-purple-400/20">
                <h3 className="text-sm font-medium text-purple-200 mb-2">Description</h3>
                <p className="text-sm text-purple-100/90 leading-relaxed">{selectedLog.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-400/5 rounded-lg p-4 border border-purple-400/20">
                  <h3 className="text-sm font-medium text-purple-200 mb-2">User Origin</h3>
                  <p className="text-sm text-purple-100/90 font-mono">{selectedLog.user_id || 'N/A'}</p>
                </div>
                <div className="bg-purple-400/5 rounded-lg p-4 border border-purple-400/20">
                  <h3 className="text-sm font-medium text-purple-200 mb-2">User Impacted</h3>
                  <p className="text-sm text-purple-100/90 font-mono">{selectedLog.target_user_name || 'N/A'}</p>
                </div>
                <div className="bg-purple-400/5 rounded-lg p-4 border border-purple-400/20">
                  <h3 className="text-sm font-medium text-purple-200 mb-2">Domain</h3>
                  <p className="text-sm text-purple-100/90 font-mono">{selectedLog.target_domain_name || 'N/A'}</p>
                </div>
                <div className="bg-purple-400/5 rounded-lg p-4 border border-purple-400/20">
                  <h3 className="text-sm font-medium text-purple-200 mb-2">Severity</h3>
                  <p className="text-sm text-purple-100/90 font-mono capitalize">{selectedLog.rule_level || 'N/A'}</p>
                </div>
              </div>

              <TimelineMetadataGrid alert={selectedLog} />
              
              <TimelineMitreSection alert={selectedLog} />

              <div className="bg-purple-400/5 rounded-lg p-4 border border-purple-400/20">
                <h3 className="text-sm font-medium text-purple-200 mb-2">System Time</h3>
                <div className="text-sm text-purple-100/90 font-mono">
                  {selectedLog.system_time}
                </div>
              </div>

              <div className="bg-purple-400/5 rounded-lg p-4 border border-purple-400/20">
                <h3 className="text-sm font-medium text-purple-200 mb-2">Raw Data</h3>
                <pre className="text-sm text-purple-100/90 bg-[#1A1F2C] p-4 rounded-md overflow-x-auto font-mono">
                  {typeof selectedLog.raw === 'string' 
                    ? JSON.stringify(JSON.parse(selectedLog.raw), null, 2)
                    : JSON.stringify(selectedLog.raw, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineDetailedLogs;