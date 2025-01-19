import { TableHead } from "@/components/ui/table";
import { useState, useRef } from "react";
import ColumnFilter from "./ColumnFilter";
import { Alert } from "./types";

interface ResizableHeaderProps {
  title: string;
  columnKey: string;
  onFilterChange: (column: string, value: string) => void;
  selectedValue: string;
  alerts: Alert[];
  defaultSize?: number;
  minSize?: number;
}

const ResizableHeader = ({
  title,
  columnKey,
  onFilterChange,
  selectedValue,
  alerts,
  defaultSize = 200,
  minSize = 100
}: ResizableHeaderProps) => {
  const [width, setWidth] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const headerRef = useRef<HTMLTableCellElement>(null);

  const getUniqueValues = (key: keyof Alert) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const uniqueValues = Array.from(new Set(alerts.map(alert => {
      if (key === 'system_time') {
        return new Date(alert[key]).toLocaleTimeString();
      }
      const value = alert[key];
      return value === null || value === undefined ? 'N/A' : String(value);
    }))).filter(Boolean);
    
    return uniqueValues.sort((a, b) => a.localeCompare(b));
  };

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !headerRef.current) return;
    
    const headerRect = headerRef.current.getBoundingClientRect();
    const newWidth = Math.max(minSize, e.clientX - headerRect.left);
    setWidth(newWidth);
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  return (
    <TableHead 
      ref={headerRef}
      className="group relative select-none bg-[#1A1F2C] border-b border-blue-900/20"
      style={{ width: `${width}px`, minWidth: `${minSize}px` }}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <ColumnFilter
          title={title}
          options={getUniqueValues(columnKey as keyof Alert)}
          onSelect={(value) => onFilterChange(columnKey, value)}
          selectedValue={selectedValue}
        />
      </div>
      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={startResizing}
      />
    </TableHead>
  );
};

export default ResizableHeader;