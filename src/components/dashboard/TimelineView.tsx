import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import TimelineHeader from "./TimelineComponents/TimelineHeader";
import TimelineLoader from "./TimelineComponents/TimelineLoader";
import TimelineContent from "./TimelineComponents/TimelineContent";

interface TimelineViewProps {
  entityType: "user" | "computer";
  entityId: string;
  onClose: () => void;
  inSidebar?: boolean;
}

const TimelineView = ({ entityType, entityId, onClose, inSidebar = false }: TimelineViewProps) => {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  // Query for user origin timeline
  const { data: originTimelineData, isLoading: isLoadingOrigin } = useQuery({
    queryKey: ['timeline-origin', entityId, page],
    queryFn: async () => {
      const response = await fetch(`/api/user_origin_timeline?user_id=${encodeURIComponent(entityId)}&page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch origin timeline data');
      }
      return response.json();
    },
    enabled: entityType === "user",
    meta: {
      onError: (error: Error) => {
        console.error('Origin timeline fetch error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch origin timeline data.",
          variant: "destructive",
        });
      }
    }
  });

  // Query for user impacted timeline
  const { data: impactedTimelineData, isLoading: isLoadingImpacted } = useQuery({
    queryKey: ['timeline-impacted', entityId, page],
    queryFn: async () => {
      const response = await fetch(`/api/user_impacted_timeline?target_user_name=${encodeURIComponent(entityId)}&page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch impacted timeline data');
      }
      return response.json();
    },
    enabled: entityType === "user",
    meta: {
      onError: (error: Error) => {
        console.error('Impacted timeline fetch error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch impacted timeline data.",
          variant: "destructive",
        });
      }
    }
  });

  // Query for computer timeline
  const { data: computerTimelineData, isLoading: isLoadingComputer } = useQuery({
    queryKey: ['timeline-computer', entityId, page],
    queryFn: async () => {
      const response = await fetch(`/api/computer_impacted_timeline?computer_name=${encodeURIComponent(entityId)}&page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch computer timeline data');
      }
      return response.json();
    },
    enabled: entityType === "computer",
    meta: {
      onError: (error: Error) => {
        console.error('Computer timeline fetch error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch computer timeline data.",
          variant: "destructive",
        });
      }
    }
  });

  const alerts = entityType === "user"
    ? [
        ...(originTimelineData?.user_origin_timeline_logs || []),
        ...(impactedTimelineData?.user_impacted_timeline_logs || [])
      ]
    : computerTimelineData?.computer_impacted_timeline_logs || [];

  const isLoading = entityType === "user" 
    ? (isLoadingOrigin || isLoadingImpacted)
    : isLoadingComputer;

  const toggleRawLog = (alertId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedAlert(expandedAlert === alertId ? null : alertId);
  };

  const content = (
    <>
      <TimelineHeader 
        entityType={entityType} 
        entityId={entityId} 
        onClose={onClose} 
        inSidebar={inSidebar} 
      />

      {isLoading ? (
        <TimelineLoader />
      ) : alerts.length === 0 ? (
        <div className="text-center text-purple-400/60 py-8">
          No events found for this {entityType}
        </div>
      ) : (
        <TimelineContent
          alerts={alerts}
          expandedAlert={expandedAlert}
          selectedEventType={selectedEventType}
          onEventTypeSelect={setSelectedEventType}
          onToggleRaw={toggleRawLog}
        />
      )}

      {/* Load More Button */}
      {alerts.length >= 5000 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );

  if (inSidebar) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-[#1A1F2C] overflow-auto">
      <div className="max-w-[1400px] mx-auto p-8">
        {content}
      </div>
    </div>
  );
};

export default TimelineView;