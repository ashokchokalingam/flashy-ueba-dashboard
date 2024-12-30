import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAlerts } from "@/hooks/useAlerts";
import { Alert } from "@/components/dashboard/types";
import { AlertTriangle } from "lucide-react";

const Index = () => {
  const [selectedEntity, setSelectedEntity] = useState<{ type: "user" | "computer"; id: string } | null>(null);
  const [currentAlerts, setCurrentAlerts] = useState<Alert[]>([]);
  const [currentTotalRecords, setCurrentTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const { isLoading, error, data } = useAlerts(currentPage, (alerts, totalRecords) => {
    if (currentPage === 1) {
      setCurrentAlerts(alerts);
    } else {
      setCurrentAlerts(prev => [...prev, ...alerts]);
    }
    setCurrentTotalRecords(totalRecords);
  });

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  if (isLoading && currentAlerts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch alerts. Please check your connection and try again.",
      variant: "destructive",
    });
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

  return (
    <DashboardLayout
      alerts={currentAlerts}
      totalRecords={currentTotalRecords}
      isLoading={isLoading}
      onEntitySelect={setSelectedEntity}
      selectedEntity={selectedEntity}
      onLoadMore={handleLoadMore}
      hasMore={data?.hasMore || false}
    />
  );
};

export default Index;