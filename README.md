# React Flux AI 绘图应用

基于React和Flux AI API构建的AI绘图应用，支持多种模型和参数配置。

## 功能特性

- 支持多种Flux AI模型选择
- 可配置提示词、参考图片、随机种子等参数
- 多种宽高比选择
- 生成结果展示与历史记录
- 图片下载功能

## 项目结构

```
react-flux-ai/
├── public/            # 静态资源
├── src/
│   ├── App.jsx        # 主应用组件
│   ├── Sidebar.jsx    # 参数配置侧边栏
│   ├── Gallery.jsx    # 图片展示区域
│   ├── assets/        # 本地资源
│   └── utils/         # 工具函数
├── package.json       # 项目依赖
└── 接口文档.md        # API接口说明
```

## 快速开始

1. 安装依赖
```bash
npm install
```

2. 配置API密钥
在`.env`文件中添加:
```
VITE_API_KEY=your_api_key_here
```

3. 启动开发服务器
```bash
npm run dev
```

## API接口

详细接口说明请参考[接口文档.md](./接口文档.md)

## 构建

```bash
npm run build
```

## 技术栈

- React
- Vite
- Tailwind CSS
- Flux AI API

## 许可证

MIT
