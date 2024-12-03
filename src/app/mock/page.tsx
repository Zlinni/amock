'use client';

import { MockForm } from '@/components/mock-form';
import { MockList } from '@/components/mock-list';
import { useState } from 'react';

export default function MockPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMockCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* 创建新的 Mock */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          创建 Mock API
        </h2>
        <p className="text-muted-foreground mb-8">
          通过简单的描述，快速生成完整的 RESTful API。
        </p>
        <MockForm onMockCreated={handleMockCreated} />
      </div>

      {/* Mock 列表 */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Mock API 列表
        </h2>
        <p className="text-muted-foreground mb-8">
          管理和测试已创建的 Mock API。
        </p>
        <MockList key={refreshKey} />
      </div>
    </div>
  );
} 