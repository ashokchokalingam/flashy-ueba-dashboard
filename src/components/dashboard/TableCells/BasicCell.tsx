import { TableCell } from "@/components/ui/table";
import { ReactNode } from "react";

interface BasicCellProps {
  value: string | number | ReactNode;
}

const BasicCell = ({ value }: BasicCellProps) => {
  return (
    <TableCell className="px-3 py-0">
      <span className="text-[13px]">{value}</span>
    </TableCell>
  );
};

export default BasicCell;