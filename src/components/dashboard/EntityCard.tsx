import React from "react";
import { Activity, Computer, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntityCardProps {
  id: string;
  eventCount: number;
  uniqueTitles: number;
  onClick: () => void;
}

const EntityCard = ({ id, eventCount = 0, uniqueTitles = 0, onClick }: EntityCardProps) => {
  // Safely check if id exists and if it ends with '$'
  const isComputer = id?.endsWith('$') || false;
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-between p-4 rounded-lg",
        "transition-all duration-300 cursor-pointer",
        "bg-[#1e2c3d]/40 hover:bg-[#1e2c3d]/60",
        "border border-blue-500/5 hover:border-blue-500/10"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative w-10 h-10 rounded-full bg-blue-950/30 flex items-center justify-center">
          {isComputer ? (
            <Computer className="w-5 h-5 text-blue-400/70" />
          ) : (
            <User className="w-5 h-5 text-blue-400/70" />
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="font-mono text-sm text-blue-200/90 font-medium group-hover:text-blue-100">
            {id || 'Unknown'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-blue-400/60" />
              <span className="text-xs font-medium text-blue-300/60">
                {uniqueTitles || 0} unique anomalies
              </span>
            </div>
            <span className="text-xs text-blue-400/30">•</span>
            <span className="text-xs text-blue-300/40">
              {(eventCount || 0).toLocaleString()} total events
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        {(uniqueTitles || 0) > 1 && (
          <div className={cn(
            "px-2.5 py-1 rounded text-xs font-medium",
            "bg-blue-500/5 backdrop-blur-sm",
            "text-blue-400/80",
            "border border-blue-400/10",
            "transition-all duration-500",
            "group-hover:bg-blue-500/10 group-hover:border-blue-400/20"
          )}>
            Risk Watch
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityCard;