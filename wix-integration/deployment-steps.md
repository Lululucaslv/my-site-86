# Huggy AI 全屏聊天系统 - Wix 部署步骤

## 第一步：上传文件到 Wix

### 1. 上传头像图片
1. 在 Wix 编辑器中，进入 **媒体库**
2. 上传 `huggy-logo-transparent.png` 文件
3. 记录上传后的 URL，格式类似：`https://static.wixstatic.com/media/huggy-logo-transparent.png`

### 2. 上传前端文件
1. 在 Wix 编辑器中，进入 **开发者工具** > **公共文件**
2. 创建新文件 `huggy-chat.js`，复制 `wix-frontend/huggy-chat.js` 的内容
3. 创建新文件 `huggy-chat.css`，复制 `wix-frontend/huggy-chat.css` 的内容

## 第二步：创建后端函数

### 1. 创建聊天 API 函数
1. 在 Wix 编辑器中，进入 **开发者工具** > **后端代码**
2. 在 `http-functions.js` 中添加 `wix-backend/chat.js` 的内容

### 2. 创建用户信息 API 函数
1. 在同一个 `http-functions.js` 文件中添加 `wix-backend/userInfo.js` 的内容

## 第三步：配置 API 密钥

1. 按照 `secrets-setup.md` 的指导设置 OpenAI API 密钥

## 第四步：修改页面代码

### 1. 添加 CSS 样式
1. 在页面设置中，进入 **自定义 CSS**
2. 添加 `huggy-chat.css` 的内容

### 2. 修改页面 JavaScript
1. 在页面代码编辑器中，添加 `page-code.js` 的内容
2. 确保导入路径正确

## 第五步：测试功能

### 1. 预览模式测试
1. 点击 **预览** 按钮
2. 点击 "Let's Chat!" 按钮测试聊天界面
3. 测试文本消息发送和接收
4. 测试图片上传功能
5. 验证流式响应效果

### 2. 功能验证清单
- [ ] 全屏聊天界面正常显示
- [ ] ChatGPT API 集成工作正常
- [ ] 流式响应实时显示
- [ ] 图片上传和 AI 分析功能
- [ ] 用户记忆系统工作
- [ ] 移动设备响应性
- [ ] 关闭按钮功能正常

## 第六步：发布网站

1. 确认所有测试通过后，点击 **发布** 按钮
2. 在生产环境中再次验证所有功能

## 故障排除

### 常见问题
1. **API 调用失败**: 检查 Secrets Manager 中的 API 密钥配置
2. **样式不显示**: 确认 CSS 文件正确导入
3. **聊天界面不显示**: 检查 JavaScript 导入和按钮 ID 配置
4. **图片上传失败**: 验证文件大小限制和格式支持

### 调试方法
1. 使用浏览器开发者工具查看控制台错误
2. 检查网络请求是否成功
3. 验证 Wix 后端函数日志

## 技术支持

如遇到技术问题，请检查：
1. Wix 开发者文档
2. OpenAI API 状态
3. 浏览器兼容性

## 更新和维护

定期检查：
1. OpenAI API 密钥有效性
2. Wix 平台更新兼容性
3. 用户反馈和功能改进需求
