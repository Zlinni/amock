import React from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Progress } from './ui/progress';
import { Loader2 } from 'lucide-react';

interface MockEndpointProgress {
  method: string;
  type: string;
  status: 'pending' | 'completed' | 'error';
  error?: string;
}

interface MockProgressDialogProps {
  open: boolean;
  progress: MockEndpointProgress[];
  totalEndpoints: number;
}

export function MockProgressDialog({ open, progress, totalEndpoints }: MockProgressDialogProps) {
  const completedCount = progress.filter(p => p.status === 'completed').length;
  const progressPercentage = (completedCount / totalEndpoints) * 100;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">生成进度</h2>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground">
            已完成 {completedCount}/{totalEndpoints} 个接口
          </p>
          <div className="space-y-2">
            {progress.map((endpoint, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {endpoint.method} - {endpoint.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {endpoint.status === 'pending' && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {endpoint.status === 'completed' && (
                    <span className="text-green-500">✓</span>
                  )}
                  {endpoint.status === 'error' && (
                    <span className="text-red-500" title={endpoint.error}>✗</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 