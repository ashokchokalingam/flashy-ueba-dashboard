import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle: string;
  subtitleIcon: LucideIcon;
  gradient?: string;
}

const StatsCard = ({ title, value, icon: Icon, subtitle, subtitleIcon: SubtitleIcon, gradient = "from-[#9b87f5] to-[#7E69AB]" }: StatsCardProps) => {
  return (
    <Card className="bg-black/40 border-[#9b87f5]/10 hover:bg-black/50 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#E5DEFF]/90">{title}</CardTitle>
        <Icon className={`h-5 w-5 bg-gradient-to-r ${gradient} bg-clip-text`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {value}
        </div>
        <div className="flex items-center mt-1">
          <SubtitleIcon className="h-4 w-4 text-[#9b87f5]/70 mr-1" />
          <p className="text-xs text-[#E5DEFF]/70">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;