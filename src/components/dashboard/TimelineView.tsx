import { useInfiniteQuery } from "@tanstack/react-query";
import { Alert } from "./types";
import { useInView } from "react-intersection-observer";
import TimelineSummaryStats from "./TimelineComponents/TimelineSummaryStats";
import TimelineHeader from "../timeline/TimelineHeader";
import TimelineContent from "../timeline/TimelineContent";
import { formatTimelineData, getTimelineEndpoint } from "@/utils/timelineHelpers";

const EVENTS_PER_PAGE = 500;

interface TimelineViewProps {
  entityType: "userorigin" | "userimpacted" | "computersimpacted";
  entityId: string;
  onClose: () => void;
  inSidebar?: boolean;
}

const TimelineView = ({ entityType, entityId, onClose, inSidebar = false }: TimelineViewProps) => {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["timeline", entityType, entityId],
    queryFn: async ({ pageParam = 1 }) => {
      const endpoint = getTimelineEndpoint(entityType);
      const queryParam = `${entityType.includes('user') ? 
        (entityType === 'userorigin' ? 'user_origin' : 'user_impacted') : 
        'computer_name'}=${entityId}`;
      
      const response = await fetch(`${endpoint}?${queryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch timeline data');
      }

      const data = await response.json();
      return formatTimelineData(data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_more) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    enabled: Boolean(entityType && entityId),
  });

  const allEvents = data?.pages.flatMap(
    (page) => entityType === "computersimpacted" ? page.computer_impacted_timeline : 
              entityType === "userorigin" ? page.user_origin_timeline :
              page.user_impacted_timeline
  ) || [];

  if (inView && !isFetchingNextPage && hasNextPage) {
    fetchNextPage();
  }

  return (
    <div className="flex flex-col h-screen bg-[#1A1F2C]">
      <TimelineHeader entityId={entityId} onClose={onClose} />

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col space-y-4 p-6">
          <div className="flex-none">
            <TimelineSummaryStats alerts={allEvents} />
          </div>

          <div className="flex-1 min-h-0 bg-black/40 rounded-xl border border-blue-500/10">
            <TimelineContent
              allEvents={allEvents}
              entityType={entityType}
              isLoading={isLoading}
              hasNextPage={!!hasNextPage}
              loaderRef={ref}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;