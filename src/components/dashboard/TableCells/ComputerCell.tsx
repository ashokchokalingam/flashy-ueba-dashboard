import { TableCell } from "@/components/ui/table";
import { Monitor } from "lucide-react";

interface ComputerCellProps {
  computerName: string;
  onTimelineView: (type: "user" | "computer", id: string) => void;
}

const ComputerCell = ({ computerName, onTimelineView }: ComputerCellProps) => {
  return (
    <TableCell 
      className="px-2 py-1.5 w-[120px] flex-shrink-0 cursor-pointer hover:text-blue-400 transition-colors"
      onClick={(e) => {
        e.stopPropagation();
        onTimelineView("computer", computerName);
      }}
    >
      <div className="flex items-center gap-1">
        <Monitor className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
        <span className="truncate text-[13px]">{computerName || '-'}</span>
      </div>
    </TableCell>
  );
};

export default ComputerCell;