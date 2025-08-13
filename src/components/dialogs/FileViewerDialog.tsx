import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";

interface FileViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileType?: string;
  fileSize?: number;
}

const FileViewerDialog = ({ open, onOpenChange, fileName, fileType, fileSize }: FileViewerDialogProps) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const isPdf = fileType === "application/pdf" || ext === "pdf";
  const isXlsx = fileType?.includes("spreadsheet") || ext === "xlsx" || ext === "xls";
  const Icon = isPdf ? FileText : isXlsx ? FileSpreadsheet : File;

  // Mock file content - in a real app, this would load actual file content
  const getMockContent = () => {
    if (isPdf) {
      return "PDF Document Preview:\n\nCommercial Auto Insurance Application\n\nInsured Information:\n- Company Name: Fleet Solutions LLC\n- Business Type: Local Delivery Service\n- Years in Business: 8\n- Annual Revenue: $2.5M\n\nVehicle Information:\n- Fleet Size: 6 vehicles\n- Primary Use: Delivery operations\n- Garaging Territory: Urban metro area\n\nDriver Information:\n- 4 full-time drivers\n- Average age: 32 years\n- Average experience: 8 years\n\nLoss History:\n- 2 minor property damage claims in past 3 years\n- Total incurred: $3,000\n\n[Additional pages would follow with detailed schedules, driver records, and supporting documentation]";
    }
    
    if (isXlsx) {
      return "Spreadsheet Content Preview:\n\nVehicle Schedule:\nVehicle # | VIN | Year | Make | Model | Value\n1 | 1FTDS3EL5DDA12345 | 2020 | Ford | Transit 250 | $35,000\n2 | 1GCCS146X8Z123456 | 2019 | Chevrolet | Express 2500 | $32,000\n3 | 3C6TRVAG7JE123789 | 2021 | Ram | ProMaster 1500 | $38,000\n\nDriver Schedule:\nDriver Name | License # | DOB | Hire Date | Violations\nJohn Smith | D12345678 | 01/15/1985 | 03/01/2020 | None\nMaria Garcia | D87654321 | 08/22/1990 | 05/15/2021 | 1 Speeding (2022)\n\nLoss History:\nDate | Description | Amount | Status\n05/15/2023 | Backing collision | $2,400 | Closed\n11/02/2022 | Windshield damage | $600 | Closed";
    }
    
    return `Document Content Preview:\n\nFilename: ${fileName}\nType: ${fileType || "Unknown"}\nSize: ${fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : "Unknown"}\n\nThis is a sample document for the commercial auto insurance submission. In a real application, this would display the actual file content or provide appropriate viewing options based on the file type.\n\nContent includes:\n- Submission forms\n- Supporting documentation\n- Vehicle schedules\n- Driver information\n- Loss history records`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {fileName}
          </DialogTitle>
          <DialogDescription>
            {fileType || "Document"} • {fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : "Unknown size"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <div className="bg-muted/30 p-4 rounded-md border">
            <pre className="text-sm whitespace-pre-wrap text-foreground/80">
              {getMockContent()}
            </pre>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerDialog;