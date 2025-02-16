import { Alert } from "./types";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { format } from "date-fns";
import { Shield, AlertTriangle, Terminal, User, Monitor } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

interface TimelineDetailedLogsProps {
  logs: Alert[];
  isLoading?: boolean;
  totalRecords?: number;
  entityType?: "user" | "computer";
}

const TimelineDetailedLogs = ({ 
  logs, 
  isLoading, 
  totalRecords,
  entityType = "user" 
}: TimelineDetailedLogsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-2">
        <AlertTriangle className="h-8 w-8 text-purple-400/70" />
        <p className="text-purple-300/70 text-lg">No timeline events found</p>
      </div>
    );
  }

  const getRiskBadgeColor = (risk: number | null) => {
    if (!risk) return "bg-purple-500/10 text-purple-400";
    if (risk >= 80) return "bg-red-500/10 text-red-400";
    if (risk >= 50) return "bg-amber-500/10 text-amber-400";
    return "bg-emerald-500/10 text-emerald-400";
  };

  return (
    <Card className="border border-purple-500/20 bg-purple-950/20">
      <div className="p-4 border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-purple-100">
              Timeline Events {totalRecords && `(${totalRecords})`}
            </h2>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[600px] overflow-y-auto">
        <div className="p-4">
          <Table>
            <TableHeader className="bg-purple-950/40 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent border-purple-500/20">
                <TableHead className="text-purple-100 font-medium">Time</TableHead>
                <TableHead className="text-purple-100 font-medium">Risk</TableHead>
                <TableHead className="text-purple-100 font-medium">Event</TableHead>
                <TableHead className="text-purple-100 font-medium">User</TableHead>
                <TableHead className="text-purple-100 font-medium">Computer</TableHead>
                <TableHead className="text-purple-100 font-medium">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow 
                  key={log.id} 
                  className="hover:bg-purple-500/5 border-purple-500/20"
                >
                  <TableCell className="font-mono text-purple-200/90">
                    {format(new Date(log.system_time), "MMM d, yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${getRiskBadgeColor(log.risk)} border-none`}
                    >
                      {log.risk || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-purple-100 font-medium">{log.title}</p>
                      <div className="flex flex-wrap gap-1">
                        {log.tactics?.split(',').map((tactic, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className="bg-purple-500/10 text-purple-300 border-purple-500/20"
                          >
                            {tactic.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-200 font-mono">
                        {log.user_id || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-200 font-mono">
                        {log.computer_name || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 max-w-md">
                      <p className="text-purple-200/70 text-sm line-clamp-2">
                        {log.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-purple-400" />
                        <span className="text-purple-200/70 text-sm">
                          {log.event_id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default TimelineDetailedLogs;
