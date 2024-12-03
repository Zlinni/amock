"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';
import { MockProgressDialog } from './mock-progress-dialog';

interface MockFormProps {
  onMockCreated: () => void;
}

const ENDPOINT_TYPES = [
  { method: 'GET', type: '列表查询' },
  { method: 'GET', type: '详情查询' },
  { method: 'POST', type: '创建' },
  { method: 'PUT', type: '更新' },
  { method: 'DELETE', type: '删除' }
];

export function MockForm({ onMockCreated }: MockFormProps) {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(
    ENDPOINT_TYPES.map(type => ({
      ...type,
      status: 'pending' as const
    }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShowProgress(true);
    setProgress(ENDPOINT_TYPES.map(type => ({
      ...type,
      status: 'pending'
    })));

    try {
      const response = await fetch('/api/mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error('创建失败');
      }

      const result = await response.json();
      
      // 更新每个端点的状态
      const newProgress = [...progress];
      result.data.forEach((endpoint: any) => {
        const index = newProgress.findIndex(
          p => p.method === endpoint.method && 
          (endpoint.path.includes('{id}') ? p.type.includes('详情') : p.type.includes('列表'))
        );
        if (index !== -1) {
          newProgress[index].status = 'completed';
        }
      });
      setProgress(newProgress);

      setDescription('');
      onMockCreated();
    } catch (err) {
      console.error('创建失败:', err);
      setError(err instanceof Error ? err.message : '创建失败');
      // 标记所有未完成的端点为错误状态
      setProgress(prev => 
        prev.map(p => ({
          ...p,
          status: p.status === 'pending' ? 'error' : p.status,
          error: '生成失败'
        }))
      );
    } finally {
      setIsLoading(false);
      // 不要立即关闭进度弹窗，让用户可以看到最终状态
      setTimeout(() => {
        setShowProgress(false);
        // 重置进度状态
        setProgress(ENDPOINT_TYPES.map(type => ({
          ...type,
          status: 'pending'
        })));
      }, 2000);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>创建 Mock API</CardTitle>
            <CardDescription>
              通过简单的描述，快速生成完整的 RESTful API。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Textarea
                placeholder="请描述你需要的 API，例如：用户管理、订单系统等"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-20"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t pt-6">
            <Button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                '生成 Mock'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <MockProgressDialog
        open={showProgress}
        progress={progress}
        totalEndpoints={ENDPOINT_TYPES.length}
      />
    </>
  );
} 