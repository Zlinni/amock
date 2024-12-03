<h1 align="center"> AMock </h1>
<p align="center">AMock 是一个基于 AI 的 Mock API 生成工具，它能够根据简单的描述自动生成完整的 RESTful API 接口和相应的 Mock 数据。</p>

![](/static/example1.png)

## 特性

- 🤖 基于 AI 的智能生成
- 🚀 支持标准的 RESTful API
- 📊 自动生成合理的 Mock 数据
- 🔄 实时进度显示
- 🎯 统一的实体命名
- 📝 支持分页查询
- 🛠️ 完整的 CRUD 操作

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/amock.git

# 进入项目目录
cd amock

# 安装依赖
npm install
# 或
yarn install
```

### 配置

1. 复制环境变量示例文件：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入必要的配置：

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini  # 可选，默认使用 gpt-4o-mini
```

### 运行

```bash
# 开发模式
npm run dev
# 或
yarn dev
```

## 使用说明

1. 访问应用（默认地址：http://localhost:3000）
2. 在输入框中描述你需要的 API（例如：用户管理、订单系统等）
3. 点击"生成 Mock"按钮
4. 等待生成完成，查看生成的接口列表
5. 使用测试按钮验证接口

## API 响应格式

### 列表查询接口

```json
{
  "code": 0,
  "data": {
    "entity_list": [],
    "total": 0
  },
  "msg": "success"
}
```

### 详情查询接口

```json
{
  "code": 0,
  "data": {
    "entity": {}
  },
  "msg": "success"
}
```

## 开发说明

### 项目结构

```
amock/
├── src/
│   ├── app/              # Next.js 应用路由
│   ├── components/       # React 组件
│   ├── lib/             # 工具函数和服务
│   └── styles/          # 样式文件
├── public/              # 静态资源
├── .env.example         # 环境变量示例
├── next.config.ts       # Next.js 配置
└── package.json         # 项目配置
```

### 技术栈

- Next.js 14
- React 19
- TypeScript
- Tailwind CSS
- OpenAI API
- Shadcn/ui

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE.md](LICENSE.md) 了解详情
