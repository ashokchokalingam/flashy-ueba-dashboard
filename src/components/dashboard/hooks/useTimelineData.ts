import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "../types";
import { TIMELINE_LOAD_SIZE } from "@/constants/pagination";

interface TimelineResponse {
  user_impacted_timeline_logs: Alert[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}

export const useTimelineData = (
  entityType: "user" | "computer",
  entityId: string,
  page: number = 1,
  timeframe: string = "24h"
) => {
  const queryClient = useQueryClient();

  const fetchTimelineData = async (pageNum: number) => {
    console.log(`Fetching page ${pageNum} for ${entityType} ${entityId}`);
    const response = await fetch(`/api/user_impacted_timeline?target_user_name=${encodeURIComponent(entityId)}&page=${pageNum}&per_page=${TIMELINE_LOAD_SIZE}&timeframe=${timeframe}`);
    if (!response.ok) {
      throw new Error('Failed to fetch timeline data');
    }
    const data = await response.json();
    console.log(`Received ${data?.user_impacted_timeline_logs?.length || 0} alerts for page ${pageNum}`);
    return data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['timeline-impacted', entityId, page, timeframe],
    queryFn: () => fetchTimelineData(page),
    staleTime: 30000,
    retry: 2,
    meta: {
      onSuccess: (data: TimelineResponse) => {
        // Prefetch next page if there are more pages
        if (data.pagination.current_page < data.pagination.total_pages) {
          const nextPage = page + 1;
          console.log(`Prefetching next page ${nextPage}`);
          queryClient.prefetchQuery({
            queryKey: ['timeline-impacted', entityId, nextPage, timeframe],
            queryFn: () => fetchTimelineData(nextPage),
            staleTime: 30000,
          });
        }
      }
    }
  });

  const alerts: Alert[] = data?.user_impacted_timeline_logs || [];
  const pagination = data?.pagination || {};
  const hasMore = pagination.current_page < pagination.total_pages;

  return {
    alerts,
    isLoading,
    error,
    hasMore,
    totalPages: pagination.total_pages,
    currentPage: pagination.current_page,
  };
};