import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";

interface TacticsChartProps {
  onTacticSelect: (tactic: string | null) => void;
}

interface TagCount {
  tag: string;
  count: number;
}

const TacticsChart = ({ onTacticSelect }: TacticsChartProps) => {
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      const data = await response.json();
      return data;
    }
  });

  const calculateTacticsData = () => {
    if (!tagsData) return [];

    // Filter for tactics (tags starting with 'attack.' but not 'attack.T1')
    const tacticsCount: { [key: string]: number } = {};
    
    tagsData.forEach((tagData: TagCount) => {
      const tag = tagData.tag;
      if (tag.startsWith('attack.') && !tag.includes('T1')) {
        const tacticName = tag.replace('attack.', '');
        tacticsCount[tacticName] = (tacticsCount[tacticName] || 0) + tagData.count;
      }
    });

    // Deep, rich colors inspired by the reference images
    const colors = [
      '#7B61FF',  // Deep Purple
      '#4C6EF5',  // Rich Blue
      '#22C55E',  // Rich Green
      '#F97316',  // Vibrant Orange
      '#6366F1',  // Indigo
      '#3B82F6',  // Bright Blue
      '#2563EB',  // Royal Blue
      '#7C3AED',  // Deep Violet
      '#0EA5E9',  // Ocean Blue
      '#0D9488',  // Teal
      '#15803D',  // Forest Green
      '#B45309'   // Bronze
    ];

    return Object.entries(tacticsCount)
      .map(([name, value], index) => ({ 
        name: name.replace(/_/g, ' '),
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4 shadow-xl">
          <p className="text-[#94A3B8] font-bold text-xl capitalize">{label}</p>
          <p className="text-[#CBD5E1] font-mono text-lg">{payload[0].value} alerts</p>
        </div>
      );
    }
    return null;
  };

  const chartData = calculateTacticsData();

  return (
    <Card className="bg-[#0F172A] border-[#334155] hover:bg-[#1E293B] transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-3xl font-bold text-[#E2E8F0]">
          <Activity className="h-8 w-8 text-[#7B61FF]" />
          MITRE ATT&CK Tactics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 140, bottom: 20 }}
              barSize={36}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#334155" 
                horizontal={true}
                vertical={false}
              />
              <XAxis 
                type="number"
                stroke="#64748B"
                tick={{ fill: '#94A3B8', fontSize: 16 }}
                domain={[0, 'auto']}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="#64748B"
                tick={{ fill: '#94A3B8', fontSize: 16 }}
                width={140}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ 
                  fill: 'rgba(123, 97, 255, 0.15)',
                  strokeWidth: 1,
                  stroke: 'rgba(123, 97, 255, 0.3)'
                }}
              />
              <Bar 
                dataKey="value"
                radius={[0, 4, 4, 0]}
                onClick={(data) => onTacticSelect(data.name)}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TacticsChart;