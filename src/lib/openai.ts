import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import dedent from "dedent";

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 获取要使用的模型
const getModel = () => {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
};

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
export async function optimizePrompt(description: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: "text" },
      messages: [
        {
          role: "system",
          content: dedent`
            你是一个 API 设计专家，负责优化用户的 API 描述。
            请根据用户的输入，生成一个更专业、更完整的描述。
            要求：
            1. 保持简洁但完整
            2. 使用专业的术语
            3. 返回一句完整的中文描述
          `,
        },
        {
          role: "user",
          content: description,
        },
      ],
    });

    return completion.choices[0].message.content || description;
  } catch (error) {
    console.error('优化描述失败:', error);
    return description;
  }
}

// 获取实体名称
async function getEntityName(description: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: dedent`
            你是一个 API 设计专家，负责确定 API 的实体名称。
            请根据用户的描述，生成一个合适的实体名称（英文小写）。
            
            要求：
            1. 使用英文小写
            2. 使用单数形式
            3. 使用简单且常见的单词
            4. 返回 JSON 格式
            
            示例输入：用户管理
            示例输出：
            {
              "entity": "user"
            }
          `,
        },
        {
          role: "user",
          content: description,
        },
      ],
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    if (!result.entity) {
      throw new Error('生成实体名称失败');
    }
    return result.entity;
  } catch (error) {
    console.error('获取实体名称失败:', error);
    throw error;
  }
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
      endpointTypes.map(async ({ method, isList, description }) => {
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
                    "method": "GET",
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
              content: description,
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
      })
    );

    return endpoints;
  } catch (error) {
    console.error('生成 Mock 端点失败:', error);
    throw error;
  }
}

// 新增一个函数用于生成特定类型的端点
export async function generateSingleEndpoint(
  description: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  isList: boolean = false
): Promise<MockEndpoint> {
  try {
    const optimizedDescription = await optimizePrompt(
      `为 ${description} 生成一个 ${method} ${isList ? '列表' : '详情'} 接口`
    );
    
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: dedent`
            生成一个 ${method} 类型的 API 端点。
            ${isList ? '这是一个列表查询接口，需要支持分页。' : '这是一个单个实体操作接口。'}
            请确保响应格式符合规范。
          `,
        },
        {
          role: "user",
          content: optimizedDescription,
        },
      ],
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return result.mockEndpoint;
  } catch (error) {
    console.error('生成单个端点失败:', error);
    throw error;
  }
}
