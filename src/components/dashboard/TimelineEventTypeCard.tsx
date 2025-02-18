import { Card } from "@/components/ui/card";
import { getTimelinePosition, getEventsInHour } from "./timelineUtils";

interface TimelineEventTypeCardProps {
  metric: {
    type: string;
    count: number;
    firstSeen: Date;
    lastSeen: Date;
    tags: string[];
    timelineEvents: { time: Date; count: number }[];
    weeklyActivity: number[];
  };
  isSelected: boolean;
  onSelect: (type: string) => void;
}

const TimelineEventTypeCard = ({ metric, isSelected, onSelect }: TimelineEventTypeCardProps) => {
  const formatDateTime = (date: Date) => {
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <Card
      className={`relative bg-[#1a2234] border-slate-700/50 hover:bg-[#1e2943] transition-all duration-300 overflow-hidden group cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onSelect(metric.type)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-medium text-white">
            {metric.type}
          </h4>
          <span className="px-4 py-2 bg-blue-900/50 text-blue-200 text-base rounded-full">
            {metric.count} events
          </span>
        </div>

        {/* Weekly Activity Indicator */}
        <div className="flex gap-1 mb-4 h-2">
          {metric.weeklyActivity.slice().reverse().map((count, index) => {
            const maxCount = Math.max(...metric.weeklyActivity);
            const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div
                key={index}
                className="flex-1 bg-blue-950 rounded-full overflow-hidden"
                title={`${count} events ${6 - index} days ago`}
              >
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${intensity}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Daily Timeline with Hour Markers */}
        <div className="relative h-10 bg-blue-950/30 rounded-lg mb-4 overflow-hidden">
          {/* Hour markers */}
          {Array.from({ length: 24 }).map((_, i) => {
            const eventsInHour = getEventsInHour(metric.timelineEvents, i);
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-blue-500/10 group/hour"
                style={{ left: `${(i / 24) * 100}%` }}
              >
                <span className="absolute -top-1 left-1 text-sm text-blue-400/50">
                  {i}
                </span>
                {eventsInHour > 0 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover/hour:opacity-100 transition-opacity duration-200">
                    <div className="bg-blue-900 text-blue-100 text-sm px-3 py-1.5 rounded whitespace-nowrap">
                      {eventsInHour} event{eventsInHour > 1 ? 's' : ''} at {i}:00
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {/* Event markers */}
          {metric.timelineEvents.map((event, index) => (
            <div
              key={index}
              className="absolute top-2 h-6 w-1.5 bg-blue-500 rounded-sm transform -translate-x-1/2 hover:h-7 hover:top-1.5 transition-all duration-200"
              style={{
                left: `${getTimelinePosition(event.time)}%`,
                opacity: 0.7
              }}
              title={`Event at ${event.time.toLocaleTimeString()}`}
            >
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-blue-900 text-blue-100 text-sm px-3 py-1.5 rounded whitespace-nowrap">
                  {event.time.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {metric.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1.5 bg-[#1d2b45] text-blue-300 text-base rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Updated First/Last seen layout with full dates */}
        <div className="flex items-center gap-4 text-sm text-blue-300/70">
          <div className="flex items-center gap-1.5 text-base">
            <span className="text-blue-300">First:</span>
            <span className="font-mono text-blue-200">{formatDateTime(metric.firstSeen)}</span>
          </div>
          <div className="w-px h-4 bg-blue-500/20" />
          <div className="flex items-center gap-1.5 text-base">
            <span className="text-blue-300">Last:</span>
            <span className="font-mono text-blue-200">{formatDateTime(metric.lastSeen)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TimelineEventTypeCard;