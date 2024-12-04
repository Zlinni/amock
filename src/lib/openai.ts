import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import dedent from "dedent";
import { logger } from "./logger";

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

// 获取模型名称
function getModel(): string {
  return process.env.OPENAI_MODEL || "gpt-3.5-turbo";
}

// 获取实体名称
async function getEntityName(description: string): Promise<string> {
  return await logger.logTask(`获取实体名称: ${description.slice(0, 50)}...`, async () => {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: dedent`
            你是一个API设计专家。请根据用户的描述，提取出合适的实体名称（英文小写）。
            要求：
            1. 分析用户输入，提取核心实体
            2. 使用英文小写
            3. 使用单数形式
            4. 只返回实体名称，不要其他内容
          `,
        },
        {
          role: "user",
          content: description,
        },
      ],
    });

    const entityName = completion.choices[0]?.message?.content?.trim().toLowerCase();
    if (!entityName) {
      throw new Error("获取实体名称失败");
    }

    return entityName;
  });
}

// 优化提示词
async function optimizePrompt(description: string): Promise<string> {
  return await logger.logTask(`优化提示词: ${description.slice(0, 50)}...`, async () => {
    const completion = await openai.chat.completions.create({
      model: getModel(),
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
          content: description,
        },
      ],
    });

    const optimizedDescription = completion.choices[0]?.message?.content;
    if (!optimizedDescription) {
      throw new Error("优化提示词失败");
    }

    return optimizedDescription;
  });
}

export async function generateMockEndpoints(description: string): Promise<MockEndpoint[]> {
  try {
    // 首先获取实体名称
    const entityName = await getEntityName(description);
    console.log('使用实体名称:', entityName);
    
    // 优化描述
    const optimizedDescription = await optimizePrompt(description);
    
    // 定义需要生成的接口类型
    const endpointTypes = [
      { method: 'GET', isList: true, description: `${optimizedDescription} 的列表查询接口` },
      { method: 'GET', isList: false, description: `${optimizedDescription} 的详情查询接口` },
      { method: 'POST', isList: false, description: `${optimizedDescription} 的创建接口` },
      { method: 'PUT', isList: false, description: `${optimizedDescription} 的更新接口` },
      { method: 'DELETE', isList: false, description: `${optimizedDescription} 的删除接口` }
    ];

    // 并发生成所有接口
    const endpoints = await Promise.all(
      endpointTypes.map(async ({ method, isList, description: endpointDesc }) => {
        return await logger.logTask(`生成 ${method} 端点`, async () => {
          const completion = await openai.chat.completions.create({
            model: getModel(),
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: dedent`
                  你是一个 API 设计专家，负责生成 RESTful API 的 Mock 数据。
                  请根据用户的描述，生成一个 ${method} 类型的 API 端点。
                  实体名称必须使用: ${entityName}
                  ${isList ? '这是一个列表查询接口，需要支持分页。' : '这是一个单个实体操作接口。'}
                  你需要返回一个 JSON 格式的响应。

                  要求：
                  1. 路径必须使用 /api/${entityName} 或 /api/${entityName}/{id}
                  2. 对于 POST/PUT 请求，提供合理的请求体结构
                  3. 所有响应必须符合统一格式：{ code: 0, data: any, msg: "success" }
                  4. 为端点提供清晰的中文描述
                  5. 响应必须是有效的 JSON 格式
                  6. 列表查询接口的 data 结构为：{ ${entityName}_list: 数组, total: 总数 }
                  7. 单个实体查询接口的 data 结构为：{ ${entityName}: 实体数据 }

                  响应格式示例：
                  {
                    "mockEndpoint": {
                      "path": "/api/${entityName}",
                      "method": "${method}",
                      "description": "获取${optimizedDescription}列表",
                      "responseBody": {
                        "code": 0,
                        "data": {
                          "${entityName}_list": [],
                          "total": 0
                        },
                        "msg": "success"
                      }
                    }
                  }
                `,
              },
              {
                role: "user",
                content: endpointDesc,
              },
            ],
          });

          const result = JSON.parse(completion.choices[0].message.content || "{}");
          if (!result.mockEndpoint) {
            throw new Error('生成的端点格式不正确');
          }

          // 验证生成的端点是否使用了正确的实体名称
          if (!result.mockEndpoint.path.includes(entityName)) {
            throw new Error('生成的端点使用了错误的实体名称');
          }

          return result.mockEndpoint;
        });
      })
    );

    // 为每个端点添加 ID
    return endpoints.map(endpoint => ({
      ...endpoint,
      id: uuidv4()
    }));
  } catch (error) {
    console.error('生成Mock数据失败:', error);
    throw error;
  }
}
