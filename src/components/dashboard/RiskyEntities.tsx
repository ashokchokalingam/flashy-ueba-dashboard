import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Monitor, Activity } from "lucide-react";
import { Alert } from "./types";
import { getRiskScore } from "./utils";

interface RiskyEntity {
  id: string;
  riskScore: number;
  eventCount: number;
  uniqueTitles: Set<string>;
  lastWeekRiskScore: number;
  hourlyData: { time: string; count: number }[];
}

interface RiskyEntitiesProps {
  alerts: Alert[];
  type: "users" | "computers";
  onEntitySelect: (entityId: string) => void;
}

const RiskyEntities = ({ alerts, type, onEntitySelect }: RiskyEntitiesProps) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const processHourlyData = (entityAlerts: Alert[]) => {
    const hourlyData: { [key: string]: { time: string; count: number } } = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      hourlyData[hour] = {
        time: `${hour}:00`,
        count: 0
      };
    }

    // Count alerts per hour
    entityAlerts.forEach(alert => {
      const date = new Date(alert.system_time);
      const hour = date.getHours().toString().padStart(2, '0');
      if (hourlyData[hour]) {
        hourlyData[hour].count++;
      }
    });

    return Object.values(hourlyData).sort((a, b) => a.time.localeCompare(b.time));
  };

  const calculateRiskyEntities = () => {
    const entities: { [key: string]: RiskyEntity } = {};

    alerts.forEach((alert) => {
      const entityId = type === "users" ? alert.user_id : alert.computer_name;
      if (!entityId || entityId.trim() === '') return;
      
      const alertDate = new Date(alert.system_time);
      const isWithinLastWeek = alertDate >= sevenDaysAgo;
      
      if (!entities[entityId]) {
        const entityAlerts = alerts.filter(a => 
          type === "users" ? a.user_id === entityId : a.computer_name === entityId
        );
        
        entities[entityId] = {
          id: entityId,
          riskScore: getRiskScore(alert),
          eventCount: 1,
          uniqueTitles: new Set([alert.title]),
          lastWeekRiskScore: isWithinLastWeek ? getRiskScore(alert) : 0,
          hourlyData: processHourlyData(entityAlerts)
        };
      } else {
        if (!entities[entityId].uniqueTitles.has(alert.title)) {
          entities[entityId].uniqueTitles.add(alert.title);
          if (isWithinLastWeek) {
            entities[entityId].lastWeekRiskScore += getRiskScore(alert);
          }
        }
        entities[entityId].eventCount++;
      }
    });

    return entities;
  };

  const getRiskColor = (score: number) => {
    if (score >= 500) return "text-red-500";
    if (score >= 100) return "text-orange-500";
    if (score >= 50) return "text-yellow-500";
    return "text-green-500";
  };

  const topRiskyEntities = Object.values(calculateRiskyEntities())
    .sort((a, b) => b.lastWeekRiskScore - a.lastWeekRiskScore)
    .slice(0, 5);

  const EntityIcon = type === "users" ? User : Monitor;

  return (
    <div className="space-y-4">
      {topRiskyEntities.map((entity) => (
        <div 
          key={entity.id}
          className="flex flex-col rounded-lg bg-black/40 border border-blue-500/10 hover:bg-black/50 transition-all duration-300 cursor-pointer overflow-hidden"
          onClick={() => onEntitySelect(entity.id)}
        >
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <EntityIcon className={`h-10 w-10 ${type === "users" ? "text-blue-400" : "text-orange-400"}`} />
              <div className="flex flex-col">
                <span className="font-mono text-lg text-blue-100 font-medium">{entity.id}</span>
                <div className="flex items-center gap-2 mt-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span className="text-base text-blue-300">{entity.uniqueTitles.size} unique alerts</span>
                  <span className="text-base text-blue-300">•</span>
                  <span className="text-base text-blue-300">{entity.eventCount} events</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className={`text-3xl font-bold ${getRiskColor(entity.lastWeekRiskScore)}`}>
                {entity.lastWeekRiskScore.toFixed(1)}
              </div>
              <span className="text-base text-blue-300 mt-1">Risk Score</span>
            </div>
          </div>
        </div>
      ))}
      {topRiskyEntities.length === 0 && (
        <div className="text-center text-blue-400/60 py-6 text-lg">
          No risky {type} detected
        </div>
      )}
    </div>
  );
};

export default RiskyEntities;