import React from "react";
import { User, Monitor, Activity } from "lucide-react";
import { Alert } from "./types";
import { sanitizeEntityName } from "./utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";

interface UserData {
  user_id: string;
  event_count: number;
  unique_alerts: number;
}

interface RiskyEntitiesProps {
  alerts: Alert[];
  type: "users" | "computers";
  onEntitySelect: (entityId: string) => void;
}

const RiskyEntities = ({ alerts, type, onEntitySelect }: RiskyEntitiesProps) => {
  const { data: originUsers, isLoading: isLoadingOrigin } = useQuery({
    queryKey: ['userOrigin'],
    queryFn: async () => {
      const response = await fetch('/api/user_origin');
      if (!response.ok) {
        throw new Error('Failed to fetch origin users');
      }
      return response.json();
    },
    enabled: type === "users"
  });

  const { data: impactedUsers, isLoading: isLoadingImpacted } = useQuery({
    queryKey: ['userImpacted'],
    queryFn: async () => {
      const response = await fetch('/api/user_impacted');
      if (!response.ok) {
        throw new Error('Failed to fetch impacted users');
      }
      return response.json();
    },
    enabled: type === "users"
  });

  const getUniqueEntities = () => {
    if (type === "users") {
      const combinedUsers = new Map<string, { id: string; eventCount: number; uniqueTitles: number }>();
      
      // Process origin users if available
      if (originUsers?.length) {
        originUsers.forEach((user: UserData) => {
          if (!user.user_id || user.user_id.trim() === '') return;
          const entityId = sanitizeEntityName(user.user_id);
          
          combinedUsers.set(entityId, {
            id: entityId,
            eventCount: user.event_count,
            uniqueTitles: user.unique_alerts
          });
        });
      }

      // Process impacted users if available
      if (impactedUsers?.length) {
        impactedUsers.forEach((user: UserData) => {
          if (!user.user_id || user.user_id.trim() === '') return;
          const entityId = sanitizeEntityName(user.user_id);
          
          if (combinedUsers.has(entityId)) {
            const existing = combinedUsers.get(entityId)!;
            combinedUsers.set(entityId, {
              ...existing,
              eventCount: existing.eventCount + user.event_count,
              uniqueTitles: existing.uniqueTitles + user.unique_alerts
            });
          } else {
            combinedUsers.set(entityId, {
              id: entityId,
              eventCount: user.event_count,
              uniqueTitles: user.unique_alerts
            });
          }
        });
      }

      return Array.from(combinedUsers.values());
    } else {
      // Handle computers case
      const entities = new Map<string, { id: string; eventCount: number; uniqueTitles: Set<string> }>();

      alerts.forEach((alert) => {
        const rawEntityId = alert.computer_name;
        if (!rawEntityId || rawEntityId.trim() === '') return;
        
        const entityId = sanitizeEntityName(rawEntityId);
        
        if (!entities.has(entityId)) {
          entities.set(entityId, {
            id: entityId,
            eventCount: 1,
            uniqueTitles: new Set([alert.title])
          });
        } else {
          const entity = entities.get(entityId)!;
          if (!entity.uniqueTitles.has(alert.title)) {
            entity.uniqueTitles.add(alert.title);
          }
          entity.eventCount++;
        }
      });

      return Array.from(entities.values()).map(entity => ({
        ...entity,
        uniqueTitles: entity.uniqueTitles.size
      }));
    }
  };

  const entities = getUniqueEntities();
  const EntityIcon = type === "users" ? User : Monitor;

  // Show loading state while fetching data
  if (type === "users" && (isLoadingOrigin || isLoadingImpacted)) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-100 mb-4">
          {type === "users" ? "Active Users" : "Active Computers"}
        </h3>
        <div className="text-center text-blue-400/60 py-6 text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-blue-100 mb-4">
        {type === "users" ? "Active Users" : "Active Computers"}
      </h3>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {entities?.map((entity) => (
            <div 
              key={entity.id}
              className="flex flex-col rounded-lg bg-black/40 border border-blue-500/10 hover:bg-black/50 transition-all duration-300 cursor-pointer overflow-hidden"
              onClick={() => onEntitySelect(entity.id)}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <EntityIcon className={`h-8 w-8 ${type === "users" ? "text-blue-400" : "text-orange-400"}`} />
                  <div className="flex flex-col">
                    <span className="font-mono text-sm text-blue-100">{entity.id}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Activity className="h-3 w-3 text-blue-400" />
                      <span className="text-xs text-blue-300">{entity.uniqueTitles} unique alerts</span>
                      <span className="text-xs text-blue-300">•</span>
                      <span className="text-xs text-blue-300">{entity.eventCount} events</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!entities || entities.length === 0) && (
            <div className="text-center text-blue-400/60 py-6 text-sm">
              No {type} detected
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RiskyEntities;