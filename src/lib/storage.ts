import fs from "fs";
import path from "path";
import { MockEndpoint } from "./openai";
import { logger } from "./logger";

interface EntityMockData {
  [entityName: string]: {
    [id: string]: MockEndpoint;
  };
}

class MockStorage {
  private filePath: string;
  private backupPath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), "data", "mocks.json");
    this.backupPath = path.join(process.cwd(), "data", "mocks.backup.json");
    this.ensureStorageFile();
  }

  private ensureStorageFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "{}", "utf-8");
    }
  }

  private async readData(): Promise<EntityMockData> {
    return await logger.logTask("读取存储文件", async () => {
      try {
        const content = fs.readFileSync(this.filePath, "utf-8");
        if (!content.trim()) {
          return {};
        }
        return JSON.parse(content);
      } catch (error) {
        console.error("读取存储文件失败，尝试使用备份:", error);
        if (fs.existsSync(this.backupPath)) {
          const backupContent = fs.readFileSync(this.backupPath, "utf-8");
          if (backupContent.trim()) {
            return JSON.parse(backupContent);
          }
        }
        return {};
      }
    });
  }

  private async writeData(data: EntityMockData): Promise<void> {
    await logger.logTask("写入存储文件", async () => {
      // 先备份当前文件
      if (fs.existsSync(this.filePath)) {
        fs.copyFileSync(this.filePath, this.backupPath);
      }
      // 写入新数据
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    });
  }

  async set(id: string, endpoint: MockEndpoint): Promise<void> {
    return await logger.logTask(`保存端点: ${endpoint.path}`, async () => {
      const data = await this.readData();
      const entityName = this.getEntityName(endpoint.path);

      if (!data[entityName]) {
        data[entityName] = {};
      }

      data[entityName][id] = endpoint;
      await this.writeData(data);
    });
  }

  async getAll(): Promise<MockEndpoint[]> {
    return await logger.logTask("获取所有端点", async () => {
      const data = await this.readData();
      return Object.values(data).flatMap((entityData) =>
        Object.values(entityData)
      );
    });
  }

  async delete(id: string, endpoint: MockEndpoint): Promise<boolean> {
    return await logger.logTask(`删除端点: ${endpoint.path}`, async () => {
      const data = await this.readData();
      const entityName = this.getEntityName(endpoint.path);

      if (!data[entityName] || !data[entityName][id]) {
        return false;
      }

      delete data[entityName][id];

      // 如果该实体下没有更多端点，删除实体
      if (Object.keys(data[entityName]).length === 0) {
        delete data[entityName];
      }

      await this.writeData(data);
      return true;
    });
  }

  private getEntityName(path: string): string {
    // 从路径中提取实体名称
    const match = path.match(/^\/api\/([^/{]+)/);
    if (!match) {
      throw new Error("无效的API路径");
    }
    return match[1];
  }
}

export const mockStorage = new MockStorage();
