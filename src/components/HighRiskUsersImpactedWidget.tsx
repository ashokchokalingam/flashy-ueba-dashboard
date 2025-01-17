import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface RiskyUser {
  id: string;
  name: string;
  riskScore: number;
  trend: "up" | "down" | "stable";
  avatar?: string;
}

const HighRiskUsersImpactedWidget = () => {
  const { data: riskyUsers } = useQuery({
    queryKey: ['riskyUsersImpacted'],
    queryFn: async () => {
      // Simulated data - replace with actual API endpoint when available
      return [
        { id: "1", name: "ashok.chokalingam", riskScore: 9.4, trend: "up" },
        { id: "2", name: "zavely", riskScore: 8.9, trend: "stable" },
        { id: "3", name: "zaynah", riskScore: 8.6, trend: "down" },
        { id: "4", name: "zaynes", riskScore: 9.1, trend: "up" }
      ] as RiskyUser[];
    }
  });

  const getTrendLine = (trend: string) => {
    switch (trend) {
      case "up": return "M1 9L5 5L9 9";
      case "down": return "M1 5L5 9L9 5";
      default: return "M1 7H9";
    }
  };

  const getTrendColor = (score: number) => {
    if (score >= 9) return "text-red-500";
    if (score >= 8) return "text-orange-500";
    return "text-yellow-500";
  };

  return (
    <Card className="h-full bg-[#1A1F2C]/80 border-purple-900/20 hover:bg-[#1A1F2C]/90 transition-all duration-300">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-purple-100 text-lg">
          <AlertTriangle className="h-5 w-5 text-purple-500" />
          High Risk Users Impacted
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 overflow-y-auto max-h-[320px] scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
        <div className="grid gap-3">
          {riskyUsers?.map((user) => (
            <div
              key={user.id}
              className="bg-purple-950/30 p-3 rounded-lg border border-purple-900/30 hover:bg-purple-950/40 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <span className="text-gray-200 group-hover:text-gray-100 transition-colors">
                    {user.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    width="40"
                    height="14"
                    viewBox="0 0 40 14"
                    className={`${getTrendColor(user.riskScore)} opacity-60`}
                  >
                    <path
                      d={getTrendLine(user.trend)}
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                  <span className={`font-mono font-bold ${getTrendColor(user.riskScore)}`}>
                    {user.riskScore}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HighRiskUsersImpactedWidget;