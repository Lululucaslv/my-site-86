import { getSecret } from 'wix-secrets-backend';
import { fetch } from 'wix-fetch';

// 获取用户信息和对话历史
async function getUserProfile(userId) {
    // 这里可以集成 Wix Data API 来存储和检索用户档案
    // 暂时返回默认档案
    return {
        hasHistory: false,
        messageCount: 0,
        profile: {
            personality: '正在了解中...',
            preferences: [],
            communicationStyle: 'friendly'
        }
    };
}

// 构建个性化系统提示
function buildSystemPrompt(userProfile) {
    const basePrompt = `你是Huggy AI，一个专业而温暖的AI心理咨询伙伴。你具有以下特殊能力：

🧠 **记忆与成长能力**：
- 你能完整记住与每个用户的所有对话历史
- 你会根据用户的交流方式和内容逐渐调整自己的回复风格
- 你是一个"养成系"AI，会随着互动变得更了解用户

💝 **个性化服务**：
- 你会识别用户的情感状态和需求
- 你会根据用户的字符数调整回复长度，保持相近的交流节奏
- 你会适时引导新话题，但不会过于主动

🎯 **专业心理支持**：
- 你提供专业的心理咨询建议，但以朋友的方式表达
- 你善于倾听，给予共情和理解
- 你会帮助用户探索内心感受，提供积极的心理支持

📝 **交流风格**：
- 温度设置为0.85，回复温暖而有人情味
- 回复长度与用户输入相匹配
- 使用温暖、支持性的语言
- 适时使用emoji增加亲和力`;

    if (userProfile.hasHistory) {
        return basePrompt + `

👤 **用户档案**：
- 我们已经进行了 ${userProfile.messageCount} 次对话
- 用户性格特点：${userProfile.profile.personality}
- 用户关注领域：${userProfile.profile.preferences.join(', ') || '正在了解中'}
- 交流风格：${userProfile.profile.communicationStyle}

请基于这些信息提供个性化的回复。`;
    }
    
    return basePrompt + `

这是我们的第一次对话。请温暖地介绍自己，说明你的记忆和成长能力，让用户感到安心和期待。`;
}

// 主要的聊天API函数
export async function post_chat(request) {
    try {
        const { messages, stream = true, isVision = false } = await request.body.json();
        
        // 获取API密钥
        const apiKey = await getSecret('OPENAI_API_KEY');
        if (!apiKey) {
            return {
                status: 500,
                body: { error: 'API密钥未配置' }
            };
        }

        // 获取用户档案（这里可以根据实际需求实现用户识别）
        const userId = request.headers['x-user-id'] || 'anonymous';
        const userProfile = await getUserProfile(userId);
        
        // 构建系统提示
        const systemPrompt = buildSystemPrompt(userProfile);
        
        // 准备消息数组
        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        // 选择模型
        const model = isVision ? 'gpt-4o' : 'gpt-4-turbo';
        
        // 调用OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: apiMessages,
                temperature: 0.85,
                max_tokens: 2000,
                stream: stream
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API错误: ${response.status}`);
        }

        if (stream) {
            // 返回流式响应
            return {
                status: 200,
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                },
                body: response.body
            };
        } else {
            // 返回普通响应
            const data = await response.json();
            return {
                status: 200,
                body: data
            };
        }
        
    } catch (error) {
        console.error('聊天API错误:', error);
        return {
            status: 500,
            body: { 
                error: '服务暂时不可用，请稍后再试',
                details: error.message 
            }
        };
    }
}