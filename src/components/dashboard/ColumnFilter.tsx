import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useMemo } from "react";

interface ColumnFilterProps {
  title: string;
  options: string[];
  onSelect: (value: string) => void;
  selectedValue?: string;
}

const ColumnFilter = ({ title, options, onSelect, selectedValue }: ColumnFilterProps) => {
  const processOptions = useMemo(() => {
    // Convert all values to strings and replace null/undefined with '—'
    const processed = options.map(opt => {
      if (opt === null || opt === undefined || opt === '') return '—';
      return String(opt).trim();
    });
    
    // Remove duplicates and sort
    const uniqueOpts = Array.from(new Set(processed)).sort((a, b) => {
      if (a === '—') return 1;
      if (b === '—') return -1;
      return a.localeCompare(b);
    });
    
    return uniqueOpts;
  }, [options]);

  // Validate selected value against available options
  useEffect(() => {
    if (selectedValue && !processOptions.includes(selectedValue)) {
      console.warn(`Selected value "${selectedValue}" not found in options for column "${title}"`);
      onSelect(''); // Reset invalid filter
    }
  }, [selectedValue, processOptions, title, onSelect]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={`flex items-center gap-1 hover:text-blue-400 transition-colors ${
          selectedValue ? "text-blue-400" : ""
        }`}
      >
        <span>{title}</span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="bg-slate-900 border border-blue-500/20 w-[300px]"
        align="start"
      >
        <ScrollArea className="h-[300px]">
          <DropdownMenuItem 
            className="text-blue-300 hover:text-blue-400 hover:bg-blue-950/50 cursor-pointer"
            onClick={() => onSelect('')}
          >
            All
          </DropdownMenuItem>
          {processOptions.map((option) => (
            <DropdownMenuItem
              key={option}
              className={`${
                selectedValue === option ? 'bg-blue-950/50 text-blue-400' : 'text-blue-300'
              } hover:text-blue-400 hover:bg-blue-950/50 cursor-pointer truncate`}
              onClick={() => onSelect(option)}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnFilter;