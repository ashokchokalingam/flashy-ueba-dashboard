import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertOctagon, TrendingUp, Users, Server, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { format } from "date-fns";

interface MLOutlier {
  event_count: number;
  event_title: string;
  first_seen: string;
  impacted_user: string;
  last_seen: string;
  ml_cluster: number;
  risk_level: "high" | "medium" | "low";
  tactics: string;
  techniques: string;
  unique_computers: number;
  unique_users: number;
}

interface ChartDataPoint {
  count: number;
  severity: "high" | "medium" | "low";
  type: string;
  timestamp: string;
  tactic: string;
  technique: string;
  risk_score: number;
  users_impacted: number;
  trend_percentage: number;
  first_seen: string;
  last_seen: string;
  impacted_user: string;
  unique_computers: number;  // Added this missing property
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/90 p-4 rounded-lg border border-purple-500/20 backdrop-blur-sm">
        <p className="text-purple-300 font-medium mb-2">{data.type}</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-purple-400">Anomalies:</span>
            <span className="text-white font-bold">{data.count}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">Users Impacted:</span>
            <span className="text-white">{data.users_impacted}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">First Seen:</span>
            <span className="text-white">{format(new Date(data.first_seen), 'PPp')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">Last Seen:</span>
            <span className="text-white">{format(new Date(data.last_seen), 'PPp')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">Tactics:</span>
            <span className="text-white">{data.tactic}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">Risk Level:</span>
            <span className={`font-bold ${getSeverityColor(data.severity)}`}>
              {data.severity.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case "high":
      return "text-red-400";
    case "medium":
      return "text-yellow-400";
    case "low":
      return "text-green-400";
    default:
      return "text-purple-400";
  }
};

const CustomizedDot = (props: any) => {
  const { cx, cy, payload } = props;
  const severity = payload.severity || "medium";
  
  const severityColors = {
    high: "#EF4444",
    medium: "#F59E0B",
    low: "#10B981"
  };
  
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={4} 
      fill={severityColors[severity]} 
      className="cursor-pointer hover:r-6 transition-all duration-300"
    />
  );
};

const OutliersWidget = () => {
  const { data: apiResponse } = useQuery({
    queryKey: ['ml-outliers'],
    queryFn: async () => {
      const response = await fetch('/api/ml_outliers_title');
      if (!response.ok) {
        throw new Error('Failed to fetch outliers data');
      }
      const data = await response.json();
      return data.ml_outliers_title as MLOutlier[];
    }
  });

  // Transform API data for the chart
  const chartData: ChartDataPoint[] = apiResponse?.map((outlier) => ({
    count: outlier.event_count,
    severity: outlier.risk_level,
    type: outlier.event_title,
    timestamp: outlier.first_seen,
    tactic: outlier.tactics.split(',')[0], // Take first tactic if multiple
    technique: outlier.techniques.split(',')[0], // Take first technique if multiple
    risk_score: outlier.ml_cluster,
    users_impacted: outlier.unique_users,
    trend_percentage: 0, // Calculate if needed
    first_seen: outlier.first_seen,
    last_seen: outlier.last_seen,
    impacted_user: outlier.impacted_user,
    unique_computers: outlier.unique_computers  // Added this mapping
  })) || [];

  const totalHighRiskEvents = chartData.filter(o => o.severity === "high").length;
  const totalUsersImpacted = chartData.reduce((acc, curr) => acc + curr.users_impacted, 0);
  const criticalSystems = [...new Set(chartData.map(d => d.impacted_user))].slice(0, 3);

  return (
    <Card className="bg-black/40 border-purple-900/20 hover:bg-black/50 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-100">
          <AlertOctagon className="h-5 w-5 text-purple-500" />
          ML Outliers - Last 7 Days
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-2 bg-purple-900/20 p-3 rounded-lg">
            <AlertOctagon className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-sm text-purple-200">High Risk Events</p>
              <p className="text-lg font-bold text-purple-100">{totalHighRiskEvents}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-purple-900/20 p-3 rounded-lg">
            <Users className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm text-purple-200">Users Impacted</p>
              <p className="text-lg font-bold text-purple-100">{totalUsersImpacted}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-purple-900/20 p-3 rounded-lg">
            <Server className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm text-purple-200">Critical Systems</p>
              <p className="text-lg font-bold text-purple-100">{chartData[0]?.unique_computers || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-purple-900/20 p-3 rounded-lg">
            <Shield className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm text-purple-200">Risk Score</p>
              <p className="text-lg font-bold text-purple-100">
                {Math.abs(chartData[0]?.risk_score || 0)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData}
              margin={{ top: 60, right: 30, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9333EA" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="tactic" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="count"
                name="Anomaly Count"
                stroke="#9333EA"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
                dot={<CustomizedDot />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Critical Systems Section */}
        <div className="mt-6 space-y-4">
          <h3 className="text-purple-200 font-medium">Critical Systems Impacted</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {criticalSystems.map((system, index) => (
              <div key={index} className="bg-purple-900/20 p-3 rounded-lg">
                <p className="text-purple-100">{system}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Section */}
        {chartData && chartData.length > 0 && (
          <div className="mt-6 p-4 bg-purple-900/20 rounded-lg space-y-4">
            <h3 className="text-purple-200 font-medium">Key Insights</h3>
            <p className="text-purple-200 text-sm">
              {chartData[0].type} shows the highest risk with {chartData[0].count} anomalies. 
              Primary concern: {chartData[0].tactic} activity.
              Last seen: {format(new Date(chartData[0].last_seen), 'PPp')}
            </p>
            <div className="mt-2">
              <h4 className="text-purple-200 font-medium mb-2">Recommended Actions:</h4>
              <ul className="list-disc list-inside text-purple-200 text-sm space-y-1">
                <li>Review PowerShell execution policies</li>
                <li>Monitor {chartData[0].impacted_user} for suspicious activity</li>
                <li>Implement additional logging for {chartData[0].tactic} events</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OutliersWidget;
