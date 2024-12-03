import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import dedent from "dedent";

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  baseURL: process.env.OPENAI_BASE_URL,
});

export interface MockEndpoint {
  id: string;
  path: string;
  method: string;
  description: string;
  requestBody?: Record<string, unknown>;
  responseBody: {
    code: number;
    data: unknown;
    msg: string;
  };
}

// 优化提示词
async function optimizePrompt(input: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: dedent`
            你是一个API设计专家。请根据用户的输入，生成一个详细的实体描述。
            要求：
            1. 分析用户输入，理解用户意图
            2. 补充必要的字段和属性
            3. 使用专业的术语
            4. 保持简洁但完整
            5. 返回一句完整的中文描述
          `,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    const description = completion.choices[0]?.message?.content;
    if (!description) {
      throw new Error("优化提示词失败");
    }

    return description;
  } catch (error) {
    console.error("优化提示词失败:", error);
    return input;
  }
}

export async function generateMockEndpoints(description: string): Promise<MockEndpoint[]> {
  try {
    // 首先优化提示词
    const optimizedDescription = await optimizePrompt(description);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: dedent`
            你是一个 API 设计专家，负责生成 RESTful API 的 Mock 数据。
            请根据用户的描述，生成符合 RESTful 规范的 API 端点。
            你需要返回一个 JSON 格式的响应。

            要求：
            1. 生成标准的 CRUD 操作端点
            2. 路径必须以 /api/ 开头，后面跟着实体名称（英文小写）
            3. 对于 POST/PUT 请求，提供合理的请求体结构
            4. 所有响应必须符合统一格式：{ code: 0, data: any, msg: "success" }
            5. 为每个端点提供清晰的中文描述
            6. 响应必须是有效的 JSON 格式

            响应格式示例：
            {
              "mockEndpoints": [
                {
                  "path": "/api/users",
                  "method": "GET",
                  "description": "获取用户列表",
                  "responseBody": {
                    "code": 0,
                    "data": [
                      {
                        "id": 1,
                        "name": "示例用户"
                      }
                    ],
                    "msg": "success"
                  }
                },
                {
                  "path": "/api/users",
                  "method": "POST",
                  "description": "创建新用户",
                  "requestBody": {
                    "name": "用户名"
                  },
                  "responseBody": {
                    "code": 0,
                    "data": {
                      "id": 1,
                      "name": "示例用户"
                    },
                    "msg": "success"
                  }
                }
              ]
            }
          `,
        },
        {
          role: "user",
          content: optimizedDescription,
        },
      ],
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    if (!result.mockEndpoints || !Array.isArray(result.mockEndpoints)) {
      throw new Error('生成的数据格式不正确');
    }

    // 验证和规范化每个端点
    const validEndpoints = result.mockEndpoints.filter((endpoint: any) => {
      return endpoint && 
             typeof endpoint.path === 'string' && 
             endpoint.path.startsWith('/api/') &&
             typeof endpoint.method === 'string' &&
             typeof endpoint.description === 'string';
    });

    if (validEndpoints.length === 0) {
      throw new Error('没有生成有效的端点');
    }

    // 为每个端点添加 ID
    return validEndpoints.map((endpoint: Omit<MockEndpoint, 'id'>) => ({
      ...endpoint,
      id: uuidv4(),
    }));
  } catch (error) {
    console.error('生成Mock数据失败:', error);
    throw error;
  }
}
