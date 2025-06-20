const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE';

const userConversations = new Map();
const userProfiles = new Map();

function generateUserId(req) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    return Buffer.from(userAgent + ip).toString('base64').slice(0, 16);
}

function getUserConversations(userId) {
    if (!userConversations.has(userId)) {
        userConversations.set(userId, []);
        userProfiles.set(userId, {
            firstVisit: new Date(),
            totalMessages: 0,
            personality: '新用户',
            preferences: []
        });
    }
    return userConversations.get(userId);
}

function updateUserProfile(userId, message) {
    const profile = userProfiles.get(userId);
    profile.totalMessages++;
    profile.lastVisit = new Date();
    
    if (message.includes('焦虑') || message.includes('紧张')) {
        if (!profile.preferences.includes('焦虑支持')) {
            profile.preferences.push('焦虑支持');
        }
    }
    if (message.includes('压力') || message.includes('工作')) {
        if (!profile.preferences.includes('工作压力')) {
            profile.preferences.push('工作压力');
        }
    }
    
    if (profile.totalMessages > 20) {
        profile.personality = '老朋友';
    } else if (profile.totalMessages > 10) {
        profile.personality = '熟悉的朋友';
    } else if (profile.totalMessages > 5) {
        profile.personality = '认识的朋友';
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/user-info', (req, res) => {
    const userId = generateUserId(req);
    const conversations = getUserConversations(userId);
    const profile = userProfiles.get(userId);
    
    res.json({
        userId: userId,
        profile: profile,
        hasHistory: conversations.length > 0,
        messageCount: conversations.length
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, stream = true, isVision = false } = req.body;
        const userId = generateUserId(req);
        
        const userHistory = getUserConversations(userId);
        const userProfile = userProfiles.get(userId);
        
        let userMessageLength = 50; // 默认长度
        if (messages.length > 0) {
            const lastUserMessage = messages[messages.length - 1];
            if (lastUserMessage.role === 'user') {
                updateUserProfile(userId, lastUserMessage.content);
                userMessageLength = lastUserMessage.content.length;
                userHistory.push(lastUserMessage);
            }
        }
        
        const personalizedSystemPrompt = {
            role: 'system',
            content: `你是Huggy AI，一个非常温暖、能够成长和适应的AI心理咨询伙伴。你具有以下特点：

1. **记忆能力**: 你能记住与每个用户的所有对话历史，并在后续交流中温柔地引用和回忆之前的内容。
2. **成长特性**: 你会根据用户的交流方式、内容和偏好逐渐调整自己的回应风格，变得更加贴心。
3. **温暖倾听者**: 你是一个非常温暖、理解、不评判的倾听者，用温柔亲切的语调提供情感支持。
4. **话题引导**: 在适当的时候，你会温和地引入新的相关话题，帮助用户探索更深层的感受和想法。
5. **简洁温暖**: 保持回复简洁而温暖，长度与用户输入相近（约${userMessageLength}字符）。
${isVision ? '6. **图像分析**: 你现在可以看到和分析用户发送的图片，从心理咨询的角度解读图片中的情感、环境、象征意义，结合图片内容提供更深入的心理支持。' : ''}

当前用户信息：
- 用户关系: ${userProfile.personality}
- 总交流次数: ${userProfile.totalMessages}次
- 关注领域: ${userProfile.preferences.join(', ') || '暂无特定偏好'}
- 首次访问: ${userProfile.firstVisit.toLocaleDateString('zh-CN')}

回复指导原则：
- 使用温暖、亲切、温柔的语调，像朋友一样关心用户
- 回复长度控制在${Math.max(20, Math.floor(userMessageLength * 0.8))}-${Math.ceil(userMessageLength * 1.3)}字符之间
- 适时提出温和的问题或引入相关话题，帮助用户深入探索
- 体现出真诚的关心和理解，用温暖的词汇
- 如果是新用户，简单温暖地提及你的记忆能力
- 根据对话自然发展，适时引入新的相关话题

请根据这些信息，以非常温暖、共情的方式回应用户，让用户感受到真诚的关怀。`
        };
        
        const fullMessages = [
            personalizedSystemPrompt,
            ...messages
        ];
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: isVision ? 'gpt-4o' : 'gpt-4.1',
                messages: fullMessages,
                stream: stream,
                temperature: 0.85,
                max_tokens: isVision ? 1500 : Math.min(1000, Math.max(100, userMessageLength * 2))
            })
        });

        if (stream) {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            });

            const reader = response.body;
            let assistantResponse = '';
            
            reader.on('data', (chunk) => {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        res.write(line + '\n\n');
                        
                        const data = line.slice(6);
                        if (data !== '[DONE]') {
                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content;
                                if (content) {
                                    assistantResponse += content;
                                }
                            } catch (e) {
                            }
                        }
                    }
                }
            });

            reader.on('end', () => {
                if (assistantResponse.trim()) {
                    userHistory.push({
                        role: 'assistant',
                        content: assistantResponse.trim()
                    });
                }
                
                res.write('data: [DONE]\n\n');
                res.end();
            });

            reader.on('error', (error) => {
                console.error('Stream error:', error);
                res.end();
            });
        } else {
            const data = await response.json();
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                userHistory.push(data.choices[0].message);
            }
            
            res.json(data);
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Huggy全屏聊天服务器运行在 http://localhost:${PORT}`);
});
