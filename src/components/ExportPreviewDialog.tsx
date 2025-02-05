import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WorkflowExport } from "@/types/types";
import { exportToYAML } from "@/utils/workflowExporter";

interface ExportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: WorkflowExport;
  onExport: (format: 'json' | 'yaml') => void;
}

export default function ExportPreviewDialog({
  isOpen,
  onClose,
  workflow,
  onExport,
}: ExportPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Export Workflow Preview</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="json" className="flex-1 overflow-hidden">
          <TabsList>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="yaml">YAML</TabsTrigger>
            <TabsTrigger value="graph">Graph</TabsTrigger>
          </TabsList>
          
          <TabsContent value="json" className="h-full">
            <pre className="overflow-auto h-full p-4 bg-gray-50 rounded">
              {JSON.stringify(workflow, null, 2)}
            </pre>
          </TabsContent>
          
          <TabsContent value="yaml" className="h-full">
            <pre className="overflow-auto h-full p-4 bg-gray-50 rounded">
              {exportToYAML(workflow)}
            </pre>
          </TabsContent>
          
          <TabsContent value="graph" className="h-full">
            <div className="p-4 bg-gray-50 rounded h-full">
              <h3 className="font-bold mb-4">Task Dependencies</h3>
              {workflow.tasks.map(task => (
                <div key={task.id} className="mb-4 p-2 border rounded">
                  <div className="font-medium">{task.name}</div>
                  <div className="text-sm text-gray-500">
                    Type: {task.type}
                  </div>
                  <div className="text-sm">
                    Next Tasks:{' '}
                    {task.next.length > 0 
                      ? task.next.join(', ')
                      : 'None'}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onExport('json')}>
            Export as JSON
          </Button>
          <Button variant="outline" onClick={() => onExport('yaml')}>
            Export as YAML
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
