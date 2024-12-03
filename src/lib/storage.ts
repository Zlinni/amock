import fs from 'fs';
import path from 'path';
import { MockEndpoint } from './openai';

interface EntityMockData {
  [entityName: string]: {
    [id: string]: MockEndpoint;
  };
}

class MockStorage {
  private storagePath: string;
  private mockData: EntityMockData;

  constructor() {
    this.storagePath = path.join(process.cwd(), 'data', 'mocks.json');
    this.mockData = {};
    this.initStorage();
  }

  private initStorage() {
    try {
      // 确保数据目录存在
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // 如果存储文件存在，则加载数据
      if (fs.existsSync(this.storagePath)) {
        const fileContent = fs.readFileSync(this.storagePath, 'utf-8').trim();
        
        // 如果文件为空，初始化为空对象
        if (!fileContent) {
          this.mockData = {};
          this.saveToFile();
          return;
        }

        try {
          const data = JSON.parse(fileContent);
          if (typeof data === 'object' && data !== null) {
            this.mockData = data;
          } else {
            throw new Error('存储文件格式不正确');
          }
        } catch (parseError) {
          console.error('解析存储文件失败:', parseError);
          // 如果文件损坏，备份并创建新文件
          const backupPath = `${this.storagePath}.backup.${Date.now()}`;
          fs.copyFileSync(this.storagePath, backupPath);
          this.mockData = {};
          this.saveToFile();
        }
      } else {
        // 如果文件不存在，创建空文件
        this.mockData = {};
        this.saveToFile();
      }
    } catch (error) {
      console.error('初始化存储失败:', error);
      this.mockData = {};
    }
  }

  private saveToFile() {
    try {
      const jsonString = JSON.stringify(this.mockData, null, 2);
      fs.writeFileSync(this.storagePath, jsonString);
    } catch (error) {
      console.error('保存数据失败:', error);
      throw error;
    }
  }

  private getEntityNameFromEndpoint(endpoint: MockEndpoint): string {
    if (!endpoint.path) {
      throw new Error('端点路径不能为空');
    }
    
    const parts = endpoint.path.split('/');
    if (parts.length < 3 || !parts[2]) {
      throw new Error('无效的端点路径格式');
    }
    
    return parts[2];
  }

  async set(id: string, mockEndpoint: MockEndpoint): Promise<void> {
    try {
      if (!mockEndpoint || !mockEndpoint.path) {
        throw new Error('无效的端点数据');
      }

      const entityName = this.getEntityNameFromEndpoint(mockEndpoint);
      
      if (!this.mockData[entityName]) {
        this.mockData[entityName] = {};
      }
      
      this.mockData[entityName][id] = mockEndpoint;
      this.saveToFile();
    } catch (error) {
      console.error('保存端点失败:', error);
      throw error;
    }
  }

  async setAll(entityName: string, mockEndpoints: Record<string, MockEndpoint>): Promise<void> {
    try {
      if (!entityName || typeof entityName !== 'string') {
        throw new Error('实体名称无效');
      }

      this.mockData[entityName] = mockEndpoints;
      this.saveToFile();
    } catch (error) {
      console.error('设置Mock数据失败:', error);
      throw error;
    }
  }

  async get(entityName: string, id: string): Promise<MockEndpoint | undefined> {
    return this.mockData[entityName]?.[id];
  }

  async getAll(): Promise<MockEndpoint[]> {
    return Object.values(this.mockData)
      .flatMap(entityEndpoints => Object.values(entityEndpoints));
  }

  async getAllByEntity(entityName: string): Promise<MockEndpoint[]> {
    return Object.values(this.mockData[entityName] || {});
  }

  async delete(id: string, mockEndpoint: MockEndpoint): Promise<boolean> {
    try {
      if (!mockEndpoint || !mockEndpoint.path) {
        throw new Error('无效的端点数据');
      }

      const entityName = this.getEntityNameFromEndpoint(mockEndpoint);
      
      if (this.mockData[entityName]?.[id]) {
        delete this.mockData[entityName][id];
        
        // 如果实体下没有更多端点，删除实体
        if (Object.keys(this.mockData[entityName]).length === 0) {
          delete this.mockData[entityName];
        }
        
        this.saveToFile();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('删除端点失败:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.mockData = {};
    this.saveToFile();
  }

  async getEntities(): Promise<string[]> {
    return Object.keys(this.mockData);
  }
}

// 创建单例实例
export const mockStorage = new MockStorage(); 