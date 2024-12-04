"use client";

import React from "react";
import { Button } from "./ui/button";
import { MockEndpoint } from "@/lib/openai";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ClipboardCopy, Play, Trash2 } from "lucide-react";

interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

interface TestResult {
  endpoint: MockEndpoint;
  response: ApiResponse<unknown>;
  status: number;
}

interface GroupedMockEndpoints {
  [entityName: string]: MockEndpoint[];
}

const METHOD_VARIANTS = {
  GET: "success",
  POST: "info",
  PUT: "warning",
  DELETE: "error",
} as const;

export function MockList() {
  const [mockEndpoints, setMockEndpoints] = React.useState<MockEndpoint[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [testResult, setTestResult] = React.useState<TestResult | null>(null);

  const fetchMockEndpoints = async () => {
    try {
      const response = await fetch("/api/mock");
      if (!response.ok) {
        throw new Error("获取Mock列表失败");
      }
      const result: ApiResponse<MockEndpoint[]> = await response.json();
      if (result.code === 0) {
        setMockEndpoints(result.data);
      } else {
        throw new Error(result.msg);
      }
    } catch (err) {
      console.error("获取Mock列表失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMockEndpoints();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${text}`);
      // TODO: 添加提示
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  const testEndpoint = async (endpoint: MockEndpoint) => {
    try {
      const path = endpoint.path.replace("{id}", "1");
      const response = await fetch(path, {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
        body:
          endpoint.method !== "GET" && endpoint.method !== "DELETE"
            ? JSON.stringify(endpoint.requestBody || {})
            : undefined,
      });
      const data: ApiResponse<unknown> = await response.json();
      setTestResult({
        endpoint,
        response: data,
        status: response.status,
      });
    } catch (error) {
      setTestResult({
        endpoint,
        response: {
          code: 1,
          data: null,
          msg: "测试失败",
        },
        status: 500,
      });
    }
  };

  const deleteEndpoint = async (id: string) => {
    try {
      const response = await fetch(`/api/mock/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      const result: ApiResponse<void> = await response.json();
      if (result.code === 0) {
        fetchMockEndpoints();
      } else {
        throw new Error(result.msg);
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const groupEndpoints = (endpoints: MockEndpoint[]): GroupedMockEndpoints => {
    const grouped: GroupedMockEndpoints = {};

    endpoints.forEach((endpoint) => {
      const entityName = endpoint.path.split("/")[2];
      if (!grouped[entityName]) {
        grouped[entityName] = [];
      }
      grouped[entityName].push(endpoint);
    });

    return grouped;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const groupedEndpoints = groupEndpoints(mockEndpoints);

  return (
    <div className="space-y-4">
      {Object.entries(groupedEndpoints).map(([entityName, endpoints]) => (
        <Card key={entityName}>
          <CardHeader>
            <CardTitle className="text-xl">{entityName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">方法</TableHead>
                    <TableHead className="w-[200px]">路径</TableHead>
                    <TableHead className="w-[300px] max-w-[300px]">
                      描述
                    </TableHead>
                    <TableHead className="w-[200px] text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints.map((endpoint) => (
                    <TableRow key={endpoint.id}>
                      <TableCell>
                        <Badge
                          variant={
                            METHOD_VARIANTS[
                              endpoint.method as keyof typeof METHOD_VARIANTS
                            ]
                          }
                        >
                          {endpoint.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm truncate max-w-[200px]">
                        {endpoint.path}
                      </TableCell>
                      <TableCell
                        className="truncate max-w-[300px]"
                        title={endpoint.description}
                      >
                        {endpoint.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => testEndpoint(endpoint)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            测试
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => copyToClipboard(endpoint.path)}
                          >
                            <ClipboardCopy className="h-4 w-4 mr-1" />
                            复制
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => deleteEndpoint(endpoint.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      {mockEndpoints.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-muted-foreground mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-muted-foreground">暂无Mock数据</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!testResult} onOpenChange={() => setTestResult(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>测试结果</DialogTitle>
          </DialogHeader>
          {testResult && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">请求信息</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        METHOD_VARIANTS[
                          testResult.endpoint
                            .method as keyof typeof METHOD_VARIANTS
                        ]
                      }
                    >
                      {testResult.endpoint.method}
                    </Badge>
                    <code className="text-sm">{testResult.endpoint.path}</code>
                  </div>
                  {testResult.endpoint.requestBody && (
                    <pre className="p-4 bg-muted rounded-lg overflow-auto">
                      <code className="text-sm">
                        {JSON.stringify(
                          testResult.endpoint.requestBody,
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">响应信息</h3>
                  <Badge
                    variant={testResult.status === 200 ? "success" : "error"}
                  >
                    {testResult.status}
                  </Badge>
                </div>
                <pre className="p-4 bg-muted rounded-lg overflow-auto">
                  <code className="text-sm">
                    {JSON.stringify(testResult.response, null, 2)}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
