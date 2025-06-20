# Wix Secrets Manager 配置指南

## 设置 OpenAI API 密钥

1. 在 Wix 编辑器中，进入 **开发者工具** > **Secrets Manager**
2. 点击 **添加新密钥**
3. 设置密钥名称为: `OPENAI_API_KEY`
4. 设置密钥值为: `YOUR_OPENAI_API_KEY_HERE`
5. 点击 **保存**

## 验证配置

确保密钥已正确保存并可在后端函数中访问。

## 安全注意事项

- 密钥将安全存储在 Wix 的加密环境中
- 只有您的后端函数可以访问此密钥
- 前端代码无法直接访问密钥值
