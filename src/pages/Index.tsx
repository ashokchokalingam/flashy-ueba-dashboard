import { Activity, Download, AlertTriangle, Shield, Users } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import TacticsChart from "@/components/dashboard/TacticsChart";
import SeverityChart from "@/components/dashboard/SeverityChart";
import AnomaliesTable from "@/components/dashboard/AnomaliesTable";
import RiskyEntities from "@/components/dashboard/RiskyEntities";
import TimelineView from "@/components/dashboard/TimelineView";
import { calculateStats } from "@/components/dashboard/alertUtils";
import { Alert } from "@/components/dashboard/types";
import StatsSection from "@/components/dashboard/StatsSection";

const fetchAlerts = async (): Promise<Alert[]> => {
  console.log('Fetching all alerts');
  let allAlerts: Alert[] = [];
  let currentPage = 1;
  
  try {
    while (true) {
      const response = await fetch(`/api/alerts?page=${currentPage}&per_page=1000`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`Fetching page ${currentPage}, Response status:`, response.status);
      
      if (!response.ok) {
        console.error('Server response error:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      allAlerts = [...allAlerts, ...data.alerts];
      
      // Check if we've reached the last page
      if (currentPage >= data.pagination.total_pages) {
        console.log(`Total records in database: ${data.pagination.total_records}`);
        return { alerts: allAlerts, totalRecords: data.pagination.total_records };
      }
      
      currentPage++;
    }
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

const Index = () => {
  const [selectedEntity, setSelectedEntity] = useState<{ type: "user" | "computer"; id: string } | null>(null);
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    meta: {
      onError: (error: Error) => {
        console.error("Failed to fetch alerts:", error);
        toast({
          title: "Error",
          description: "Failed to fetch alerts. Please check your connection and try again.",
          variant: "destructive",
        });
      }
    }
  });

  const alerts = data?.alerts || [];
  const totalRecords = data?.totalRecords || 0;
  const stats = calculateStats(alerts);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p>Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  if (selectedEntity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#121212]">
        <TimelineView
          alerts={alerts}
          entityType={selectedEntity.type}
          entityId={selectedEntity.id}
          onClose={() => setSelectedEntity(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#121212] p-6">
      <div className="flex flex-col gap-6 lg:flex-row items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#3B82F6]">
          Exabeam Anomaly Hunter Dashboard
        </h1>
        <button className="flex items-center gap-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-all duration-300 rounded-lg px-4 py-2 border border-blue-500/10">
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      <StatsSection stats={stats} totalAlerts={totalRecords} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TacticsChart 
          alerts={alerts} 
          onTacticSelect={setSelectedTactic}
        />
        <SeverityChart 
          alerts={alerts} 
          onSeveritySelect={setSelectedSeverity}
        />
      </div>

      {/* Risky Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-black/40 border border-blue-500/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-100 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Risky Users
          </h2>
          <RiskyEntities 
            alerts={alerts} 
            type="users"
            onEntitySelect={(id) => setSelectedEntity({ type: "user", id })}
          />
        </div>
        <div className="bg-black/40 border border-blue-500/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-100 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Top Risky Computers
          </h2>
          <RiskyEntities 
            alerts={alerts} 
            type="computers"
            onEntitySelect={(id) => setSelectedEntity({ type: "computer", id })}
          />
        </div>
      </div>

      {/* Latest Anomalies */}
      <div className="w-full">
        <AnomaliesTable alerts={alerts} />
      </div>
    </div>
  );
};

export default Index;