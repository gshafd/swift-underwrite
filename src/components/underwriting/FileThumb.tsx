import React from "react";
import { FileText, FileSpreadsheet, File } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface FileThumbProps {
  name: string;
  type?: string;
  size?: number;
}

export function FileThumb({ name, type, size }: FileThumbProps) {
  const ext = name.split(".").pop()?.toLowerCase();
  const isPdf = type === "application/pdf" || ext === "pdf";
  const isXlsx =
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    type === "application/vnd.ms-excel" ||
    ext === "xlsx" ||
    ext === "xls";
  const Icon = isPdf ? FileText : isXlsx ? FileSpreadsheet : File;

  return (
    <Card className="hover-scale cursor-default">
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium" title={name}>
            {name}
          </div>
          <div className="text-xs text-muted-foreground">
            {type || "Unknown"}
            {typeof size === "number" && size > 0 ? ` • ${(size / 1024).toFixed(1)} KB` : ""}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FileThumb;
