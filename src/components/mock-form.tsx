"use client";

import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';

interface MockFormProps {
  onMockCreated?: () => void;
}

interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

export function MockForm({ onMockCreated }: MockFormProps) {
  const [description, setDescription] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      const result: ApiResponse<unknown> = await response.json();
      
      if (result.code !== 0) {
        throw new Error(result.msg || '创建Mock失败');
      }

      setDescription('');
      onMockCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-xl">快速创建</CardTitle>
          <CardDescription>
            输入实体描述，AI 将自动生成完整的 RESTful API，包含标准的 CRUD 操作和示例数据。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入实体名称或描述，例如：用户、商品、订单等。AI 将自动补充必要的字段和属性。"
              className="min-h-[120px] resize-none"
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            你可以直接输入实体名称（如"用户"），AI 将自动补充完整的描述。
          </p>
          <Button
            type="submit"
            disabled={isSubmitting || !description.trim()}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                处理中...
              </>
            ) : (
              '生成Mock'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 