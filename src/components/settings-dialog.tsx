"use client";

import React from 'react';
import { Button } from './ui/button';
import { useTheme } from '@/lib/theme-context';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODEL_OPTIONS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4-1106-preview', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
];

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { theme, toggleTheme } = useTheme();
  const [model, setModel] = React.useState(process.env.OPENAI_MODEL || 'gpt-4o-mini');
  const [apiKey, setApiKey] = React.useState(process.env.OPENAI_API_KEY || '');
  const [baseUrl, setBaseUrl] = React.useState(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1');

  React.useEffect(() => {
    // 从本地存储加载设置
    const savedModel = localStorage.getItem('OPENAI_MODEL');
    const savedApiKey = localStorage.getItem('OPENAI_API_KEY');
    const savedBaseUrl = localStorage.getItem('OPENAI_BASE_URL');

    if (savedModel) setModel(savedModel);
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedBaseUrl) setBaseUrl(savedBaseUrl);
  }, []);

  const handleSave = () => {
    // 保存到本地存储
    localStorage.setItem('OPENAI_MODEL', model);
    localStorage.setItem('OPENAI_API_KEY', apiKey);
    localStorage.setItem('OPENAI_BASE_URL', baseUrl);
    
    // 刷新页面以应用新设置
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>
            配置 AI Mock 的基本设置
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="theme" className="text-right">
              主题设置
            </Label>
            <Button
              id="theme"
              onClick={toggleTheme}
              variant="outline"
              className="col-span-3"
            >
              {theme === 'dark' ? '深色主题' : '浅色主题'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {theme === 'dark' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                )}
              </svg>
            </Button>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              OpenAI 模型
            </Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model" className="col-span-3">
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
              placeholder="sk-..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="baseUrl" className="text-right">
              API 地址
            </Label>
            <Input
              id="baseUrl"
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://api.openai.com/v1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 