import { useQuery } from "@tanstack/react-query";
import { EventSummary, TimelineResponse } from "../types";

export const useEventSummary = (
  entityType: "target" | "origin" | "computer",
  entityId: string,
  timeframe: string = "24h"
) => {
  return useQuery({
    queryKey: ['event-summary', entityType, entityId, timeframe],
    queryFn: async () => {
      let endpoint = '';
      let queryParam = '';
      
      switch (entityType) {
        case 'target':
          endpoint = '/api/user_impacted_timeline';
          queryParam = `user_impacted=${entityId}`;
          break;
        case 'origin':
          endpoint = '/api/user_origin_timeline';
          queryParam = `user_id=${entityId}`;
          break;
        case 'computer':
          endpoint = '/api/computer_impacted_timeline';
          queryParam = `computer_name=${entityId}`;
          break;
      }

      console.log(`Fetching timeline data from: ${endpoint}?${queryParam}`);
      
      const response = await fetch(`${endpoint}?${queryParam}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event summary');
      }

      const data = await response.json();
      console.log('Timeline data received:', data);
      
      return {
        event_summary: data.user_origin_timeline || data.user_impacted_timeline || data.computer_impacted_timeline || [],
      };
    },
    enabled: Boolean(entityType && entityId),
  });
};