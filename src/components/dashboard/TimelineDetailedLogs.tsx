import { useState, useRef } from "react";
import { Alert } from "./types";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { ScrollArea } from "../ui/scroll-area";
import DetailsPanel from "./TimelineDetailedLogs/DetailsPanel";
import { format } from "date-fns";
import { ChevronRight, AlertCircle, Info, Shield, Globe, Hash, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineDetailedLogsProps {
  logs: Alert[];
  isLoading?: boolean;
  totalRecords?: number;
  entityType?: "user" | "computer";
}

const TimelineDetailedLogs = ({ logs, isLoading, totalRecords, entityType = "user" }: TimelineDetailedLogsProps) => {
  const [selectedLog, setSelectedLog] = useState<Alert | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const detailsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleLogClick = (log: Alert) => {
    setSelectedLog(log);
  };

  const toggleExpand = (logId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getSeverityIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-400">
        No logs available
      </div>
    );
  }

  return (
    <div className="mt-4">
      <ResizablePanelGroup 
        direction="horizontal" 
        className="min-h-[800px] rounded-lg border border-purple-400/20"
      >
        <ResizablePanel 
          defaultSize={60}
          minSize={30}
        >
          <ScrollArea className="h-[800px]">
            <div ref={tableRef} className="h-full">
              <div className="w-full border-r border-purple-400/20 bg-[#1A1F2C]">
                <div className="sticky top-0 z-20 p-4 flex justify-between items-center text-sm text-purple-200/80 border-b border-purple-400/20 bg-purple-400/5 backdrop-blur-sm">
                  <div>
                    <span className="font-semibold">Total Records:</span> {totalRecords?.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-1 p-2">
                  {logs.map((log, index) => (
                    <div key={log.id}>
                      <div
                        onClick={() => handleLogClick(log)}
                        className={cn(
                          "group flex items-start space-x-2 px-3 py-2 cursor-pointer rounded transition-colors",
                          "hover:bg-purple-400/10",
                          selectedLog?.id === log.id ? "bg-purple-400/20" : index % 2 === 0 ? "bg-purple-400/5" : "bg-transparent",
                          "font-mono text-sm"
                        )}
                      >
                        <button
                          onClick={(e) => toggleExpand(log.id, e)}
                          className="flex items-center space-x-2 min-w-[140px] text-purple-300/60"
                        >
                          <ChevronRight 
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedLogs.has(log.id) ? "rotate-90" : ""
                            )}
                          />
                          <span>
                            {format(new Date(log.system_time), "HH:mm:ss.SSS")}
                          </span>
                        </button>
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="flex items-center space-x-2">
                            {getSeverityIcon(log.rule_level)}
                            <span className="text-purple-100">
                              {log.title}
                            </span>
                          </span>
                        </div>
                      </div>
                      
                      {expandedLogs.has(log.id) && (
                        <div className="ml-8 mt-2 mb-4 space-y-3 text-sm text-purple-200/70 bg-purple-400/5 p-4 rounded-md">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-purple-400" />
                              <span>Rule ID: {log.ruleid || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-purple-400" />
                              <span>Domain: {log.target_domain_name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Hash className="h-4 w-4 text-purple-400" />
                              <span>Event ID: {log.event_id || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Database className="h-4 w-4 text-purple-400" />
                              <span>ML Cluster: {log.ml_cluster === -1 ? 'Noise' : log.ml_cluster || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-purple-200/90">{log.description}</p>
                          </div>
                          {log.tags && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {log.tags.split(',').map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-purple-400/10 rounded-full text-xs text-purple-200"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </ResizablePanel>

        {selectedLog && (
          <>
            <ResizableHandle 
              withHandle 
              className="bg-purple-400/20 hover:bg-purple-400/30 transition-colors"
            />
            <ResizablePanel 
              defaultSize={40}
              minSize={30}
            >
              <div 
                ref={detailsRef}
                className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400/20 scrollbar-track-transparent"
              >
                <DetailsPanel 
                  alert={selectedLog}
                  onClose={() => setSelectedLog(null)}
                  formatTime={(timeString) => format(new Date(timeString), "PPpp")}
                />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default TimelineDetailedLogs;