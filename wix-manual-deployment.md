# Huggy AI 全屏聊天系统 - Wix 手动部署指南

## 快速部署步骤

### 1. 配置 API 密钥
在 Wix 编辑器 > 开发者工具 > Secrets Manager 中：
- 密钥名称: `OPENAI_API_KEY`
- 密钥值: `YOUR_OPENAI_API_KEY_HERE`

### 2. 创建后端函数
在 Wix 编辑器 > 开发者工具 > 后端代码 > http-functions.js 中添加完整的 ChatGPT API 集成代码。

### 3. 创建前端组件
在 Wix 编辑器 > 开发者工具 > 公共文件中：
- 创建 `huggy-chat.js` 文件
- 添加完整的 HuggyWixChat 类代码

### 4. 添加 CSS 样式
在页面设置 > 自定义 CSS 中添加完整的聊天界面样式。

### 5. 修改页面代码
在页面代码编辑器中添加聊天按钮集成代码。

### 6. 上传头像图片
将 huggy-logo-transparent.png 上传到 Wix 媒体库。

## 详细代码文件
所有完整的代码文件已准备在以下位置：
- 后端: /home/ubuntu/huggy-fullscreen-chat/wix-backend/
- 前端: /home/ubuntu/huggy-fullscreen-chat/wix-frontend/
- 集成: /home/ubuntu/huggy-fullscreen-chat/wix-integration/

## 功能特性
✅ ChatGPT-4.1 文本对话
✅ GPT-4o 图片分析
✅ 流式响应显示
✅ 用户记忆系统
✅ 全屏聊天界面
✅ 响应式设计
✅ 中文界面

## 测试验证
部署后测试：
- 点击 "Let's Chat!" 按钮
- 发送文本消息
- 上传图片测试
- 验证流式响应
- 确认记忆功能
