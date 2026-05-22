🧠 智能时间大脑 (AI Time Agent)

动态个人时间与习惯管理系统 —— 懂你疲惫、会帮你动态重组生活的专属智能体。

🎓 所属课程：《软件工程》团队项目
🧑‍💻 研发团队：源浪逐行 (Yuanlang Zhuxing)

📖 项目背景

当代大学生面临课业繁重、计划易受突发事件打乱的痛点，传统的静态日程表（如打卡表、番茄钟）缺乏柔性，容易让人产生挫败感。
本项目并非一个简单的“备忘录”，而是引入了 大语言模型 (LLM) 作为系统的中央调度控制器 (Controller)。当用户遭遇突发状况（如实验拖堂、生病发烧）时，Agent 能够解析用户的自然语言情绪，动态重组 JSON 数据并刷新视图，同时驱动环境光效（Status Halo）改变，提供极具同理心的时间管理体验。

✨ 核心特性 (Core Features)

🤖 Agent 动态调度：不仅是聊天框，大模型被严格约束以输出结构化 JSON，实现对系统 CRUD 数据的直接接管与重排。

❤️ 情绪感知与安抚：主动推迟高强度脑力任务，在用户疲惫时插入“听歌”、“洗澡”等恢复性建议。

🌈 虚拟硬件联动 (Status Halo)：首创无感式环境交互。前端根据 Agent 指令，自适应渲染三种呼吸光斑：

🔵 FOCUS (专注模式：紧迫蓝光)

🟡 RELAX (舒缓模式：呼吸黄光)

⚫ SLEEP (休眠模式：静谧暗光)

📝 完整的闭环管理：支持自定义新增、删除日程任务，动态列表与 AI 决策池无缝同步。

🛠️ 技术栈 (Tech Stack)

前端表现层 (Frontend)

框架: 微信小程序原生框架 (WXML / WXSS / JS)

视觉: 纯 CSS 动态滤镜模糊构建高质感 Status Halo 光晕

后端与业务层 (Backend)

框架: Python Flask / Flask-CORS

AI 驱动: OpenAI API 规范调用 (支持接入 DeepSeek, Moonshot, GLM 等模型)

数据层 (Data)

MVP 阶段: 轻量级本地 JSON 实时 I/O

生产环境 (规划): MySQL 8.0 (详见 docs/数据库设计说明书.pdf)

🚀 V2.0 迭代版更新亮点
1. 架构升级： 从初版的 Streamlit + 硬件模拟`升级为 原生微信小程序 + Flask API，实现前后端完全分离。
2. 闭环体验：*新增前端完整的 CRUD (增删改查) 逻辑，用户可手动配置日程，AI Agent 能实时读取最新全局状态。
3. 极强容错 (Fault Tolerance)：** 后端引入“双保险” JSON 解析器校验机制，即使大模型发生幻觉或格式崩溃，系统也能平滑降级，确保用户日程数据**零丢失**。

🛠️ 技术栈
前端表现层： 微信小程序原生语法 (WXML, WXSS, JS) + 自定义组件化 TabBar。
业务逻辑层：Python 3 + Flask 轻量级 Web 框架。
AI 智能体层：兼容 OpenAI 协议的大语言模型 API (DeepSeek / 智谱 GLM / Kimi)。
数据持久层： 本地 JSON 数据流转 (MVP 阶段敏捷数据库方案)。

🚀 极速部署指南 (Quick Start)

1. 后端服务启动

进入 backend 目录，安装依赖：

pip install flask flask-cors openai


在 server.py 中填入你的大模型 api_key。

启动 Flask 服务：

python server.py


服务将默认运行在 http://127.0.0.1:5000

2. 小程序前端运行

打开 微信开发者工具，导入 frontend 目录。

关键设置：点击开发者工具右上角 详情 -> 本地设置 -> 勾选「不校验合法域名、web-view（业务域名）、TLS版本以及HTTPS证书」。

编译运行即可在模拟器中体验动态调度功能。

📁 软工规范文档 (Documents)

本项目完全遵循 GB/T 8567-2006 计算机软件文档编制规范，相关设计图纸与字典已沉淀至 docs 目录：

《系统设计说明书》

《数据库设计说明书》

📄 许可证

MIT License