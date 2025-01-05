import { Shield, AlertTriangle, Activity, Clock, Calendar, Info } from "lucide-react";
import { Alert } from "./types";
import TimelineMitreSection from "./TimelineMitreSection";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TimelineEventCardProps {
  event: Alert;
  isLast?: boolean;
}

const TimelineEventCard = ({ event }: TimelineEventCardProps) => {
  const getSeverityIcon = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-6 w-6 text-orange-400" />;
      case 'medium':
        return <Shield className="h-6 w-6 text-yellow-400" />;
      default:
        return <Info className="h-6 w-6 text-blue-400" />;
    }
  };

  const formatDateTime = (dateStr: string) => {
    return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <div className="group">
      <div className="p-8 rounded-xl bg-black/40 border border-blue-500/10 hover:bg-black/60 transition-all duration-300 backdrop-blur-sm">
        {/* Header Section with Severity and Event Count */}
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            {getSeverityIcon(event.rule_level)}
            <span className={cn(
              "text-lg font-medium px-6 py-2 rounded-full",
              event.rule_level?.toLowerCase() === 'high' && "bg-orange-500/10 text-orange-400 border border-orange-500/20",
              event.rule_level?.toLowerCase() === 'medium' && "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
              event.rule_level?.toLowerCase() === 'informational' && "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            )}>
              {event.rule_level?.toUpperCase() || 'INFO'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-lg text-green-400/70">
            <Activity className="h-5 w-5" />
            <span>{event.total_events || 0} events detected</span>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-8 text-center">
          <h3 className="text-3xl font-medium text-blue-100 mb-4 group-hover:text-blue-300 transition-colors">
            {event.title || "Unknown Event"}
          </h3>
          <p className="text-lg text-gray-400 leading-relaxed max-w-3xl mx-auto">
            {event.description || "No description available"}
          </p>
        </div>

        {/* Timestamps */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-3 text-lg text-blue-400/70">
            <Calendar className="h-5 w-5" />
            <span>First Detected: {formatDateTime(event.first_time_seen || '')}</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-blue-500/20" />
          <div className="flex items-center gap-3 text-lg text-purple-400/70">
            <Clock className="h-5 w-5" />
            <span>Last Seen: {formatDateTime(event.last_time_seen || '')}</span>
          </div>
        </div>

        {/* MITRE ATT&CK Section */}
        <TimelineMitreSection alert={event} />
      </div>
    </div>
  );
};

export default TimelineEventCard;