import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Alert {
  rule_level: string;
  dbscan_cluster: number;
}

interface SeverityChartProps {
  alerts: Alert[];
  onSeveritySelect: (severity: string | null) => void;
}

const SeverityChart = ({ alerts, onSeveritySelect }: SeverityChartProps) => {
  const calculateSeverityData = () => {
    const severityCounts = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0
    };

    alerts.forEach(alert => {
      if (alert.rule_level === 'critical' || alert.dbscan_cluster === -1) {
        severityCounts.Critical++;
      } else if (alert.rule_level === 'high') {
        severityCounts.High++;
      } else if (alert.rule_level === 'medium') {
        severityCounts.Medium++;
      } else {
        severityCounts.Low++;
      }
    });

    return [
      { name: "Critical", value: severityCounts.Critical, color: "#DC2626" },
      { name: "High", value: severityCounts.High, color: "#EA580C" },
      { name: "Medium", value: severityCounts.Medium, color: "#D97706" },
      { name: "Low", value: severityCounts.Low, color: "#059669" },
    ];
  };

  const severityData = calculateSeverityData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1a1f2c] border border-gray-700 rounded-lg p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <p className="text-gray-200 font-medium">{data.name}</p>
          </div>
          <p className="text-gray-300 font-mono">
            {data.value.toLocaleString()} alerts
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-black/40 border-blue-500/10 hover:bg-black/50 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-100">
          <AlertTriangle className="h-5 w-5 text-blue-500" />
          Risk Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={160}
                paddingAngle={2}
                dataKey="value"
                onDoubleClick={(data) => {
                  if (data && data.name) {
                    onSeveritySelect(data.name);
                  }
                }}
                onClick={(data) => {
                  if (data && data.name) {
                    onSeveritySelect(null);
                  }
                }}
              >
                {severityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="transparent"
                    className="transition-opacity duration-300 hover:opacity-90"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-6 pt-4">
            {severityData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }} 
                />
                <span className="text-sm text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeverityChart;