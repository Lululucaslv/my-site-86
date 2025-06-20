class HuggyFullscreenChat {
    constructor() {
        this.apiUrl = '/api/chat';
        this.userInfoUrl = '/api/user-info';
        this.messages = [];
        this.isTyping = false;
        this.userInfo = null;
        
        this.initializeElements();
        this.bindEvents();
        this.autoResizeTextarea();
        this.loadUserInfo();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.quickReplies = document.getElementById('quickReplies');
        this.charCount = document.getElementById('charCount');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.imageUploadBtn = document.getElementById('imageUploadBtn');
        this.imageInput = document.getElementById('imageInput');
        this.imagePreviewContainer = document.getElementById('imagePreviewContainer');
        this.previewImage = document.getElementById('previewImage');
        this.removeImageBtn = document.getElementById('removeImageBtn');
        this.selectedImage = null;
    }

    async loadUserInfo() {
        try {
            const response = await fetch(this.userInfoUrl);
            this.userInfo = await response.json();
            this.updateWelcomeMessage();
        } catch (error) {
            console.error('加载用户信息失败:', error);
            this.updateWelcomeMessage();
        }
    }

    updateWelcomeMessage() {
        const messageContent = this.welcomeMessage.querySelector('.message-content');
        
        if (this.userInfo && this.userInfo.hasHistory) {
            messageContent.innerHTML = `
                <h2>欢迎回来！</h2>
                <p>我是Huggy AI，您的专属AI心理咨询伙伴。我还记得我们之前的${this.userInfo.messageCount}次对话。</p>
                <div class="memory-info">
                    <p><strong>🧠 我的记忆能力：</strong></p>
                    <ul>
                        <li>✅ 我会记住我们所有的对话内容</li>
                        <li>✅ 我会根据您的交流方式逐渐成长和适应</li>
                        <li>✅ 我了解您的关注点：${this.userInfo.profile.preferences.join(', ') || '正在学习中'}</li>
                        <li>✅ 我们的关系：${this.userInfo.profile.personality}</li>
                    </ul>
                </div>
                <p>让我们继续我们的对话吧！有什么想分享的吗？</p>
            `;
        } else {
            messageContent.innerHTML = `
                <h2>欢迎来到 Huggy AI</h2>
                <p>我是您的AI心理咨询伙伴，一个能够成长和记忆的AI朋友。</p>
                <div class="memory-info">
                    <p><strong>🧠 我的特殊能力：</strong></p>
                    <ul>
                        <li>✅ <strong>完整记忆</strong>：我会记住我们的每一次对话</li>
                        <li>✅ <strong>成长适应</strong>：我会根据您的交流方式逐渐调整自己</li>
                        <li>✅ <strong>个性化服务</strong>：随着了解加深，我会提供更贴心的支持</li>
                        <li>✅ <strong>永久陪伴</strong>：无论何时回来，我都记得您</li>
                    </ul>
                </div>
                <p>在这里，您可以自由地表达情感，分享想法，无需担心被评判。让我们开始建立我们的友谊吧！</p>
            `;
        }
    }

    bindEvents() {
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        this.messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.updateSendButton();
            this.autoResizeTextarea();
        });

        this.quickReplies.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-reply-btn')) {
                const message = e.target.dataset.message;
                this.messageInput.value = message;
                this.updateCharCount();
                this.updateSendButton();
                this.messageInput.focus();
            }
        });

        this.imageUploadBtn.addEventListener('click', () => {
            this.imageInput.click();
        });

        this.imageInput.addEventListener('change', (e) => {
            this.handleImageSelection(e);
        });

        this.removeImageBtn.addEventListener('click', () => {
            this.clearImagePreview();
        });
    }

    updateCharCount() {
        const length = this.messageInput.value.length;
        this.charCount.textContent = `${length}/2000`;
        
        if (length > 1800) {
            this.charCount.style.color = '#ff6b6b';
        } else if (length > 1500) {
            this.charCount.style.color = '#ffd93d';
        } else {
            this.charCount.style.color = 'rgba(255, 255, 255, 0.5)';
        }
    }

    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        const hasImage = this.selectedImage !== null;
        this.sendButton.disabled = (!hasText && !hasImage) || this.isTyping;
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        const hasImage = this.selectedImage !== null;
        
        if ((!message && !hasImage) || this.isTyping) return;

        if (hasImage) {
            this.addImageMessage(message, this.selectedImage, 'user');
            await this.sendImageMessageToAPI(message, this.selectedImage);
        } else {
            this.addMessage(message, 'user');
            await this.sendMessageToAPI(message);
        }
        
        this.messageInput.value = '';
        this.clearImagePreview();
        this.updateCharCount();
        this.updateSendButton();
        this.autoResizeTextarea();

        this.quickReplies.style.display = 'none';
    }

    addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${role}`;
        
        const avatar = document.createElement('div');
        if (role === 'user') {
            avatar.className = 'user-avatar';
            avatar.textContent = '👤';
        } else {
            avatar.className = 'huggy-avatar responding';
            const img = document.createElement('img');
            img.src = 'huggy-logo-transparent.png';
            img.alt = 'Huggy AI';
            avatar.appendChild(img);
        }
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = content;
        
        if (role === 'user') {
            messageDiv.appendChild(messageText);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageText);
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.messages.push({ role, content });
    }

    addStreamingMessage(content, role) {
        let streamingMessage = this.chatMessages.querySelector('.streaming-message');
        
        if (!streamingMessage) {
            streamingMessage = document.createElement('div');
            streamingMessage.className = `message-bubble ${role} streaming-message`;
            
            const avatar = document.createElement('div');
            avatar.className = 'huggy-avatar responding';
            const img = document.createElement('img');
            img.src = 'huggy-logo-transparent.png';
            img.alt = 'Huggy AI';
            avatar.appendChild(img);
            
            const messageText = document.createElement('div');
            messageText.className = 'message-text streaming-text';
            messageText.textContent = '';
            
            streamingMessage.appendChild(avatar);
            streamingMessage.appendChild(messageText);
            this.chatMessages.appendChild(streamingMessage);
        }
        
        const messageText = streamingMessage.querySelector('.streaming-text');
        messageText.textContent += content;
        this.scrollToBottom();
    }

    finalizeStreamingMessage() {
        const streamingMessage = this.chatMessages.querySelector('.streaming-message');
        if (streamingMessage) {
            streamingMessage.classList.remove('streaming-message');
            const messageText = streamingMessage.querySelector('.streaming-text');
            messageText.classList.remove('streaming-text');
            
            const avatar = streamingMessage.querySelector('.huggy-avatar');
            if (avatar) {
                avatar.className = 'huggy-avatar listening';
            }
            
            this.messages.push({ 
                role: 'assistant', 
                content: messageText.textContent 
            });
        }
    }

    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.updateSendButton();
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
        this.updateSendButton();
    }

    async sendMessageToAPI(message) {
        const requestMessages = [
            {
                role: 'system',
                content: '你是Huggy AI，一个专业的心理咨询AI助手。你的任务是提供温暖、理解和专业的心理支持。请用温和、共情的语调回应用户，并提供有用的建议和支持。'
            },
            ...this.messages,
            { role: 'user', content: message }
        ];

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: requestMessages,
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        this.hideTypingIndicator();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            this.finalizeStreamingMessage();
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) {
                                this.addStreamingMessage(content, 'assistant');
                            }
                        } catch (e) {
                            console.warn('解析流式数据失败:', e);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
            this.finalizeStreamingMessage();
        }
    }

    handleImageSelection(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.selectedImage = {
                file: file,
                dataUrl: e.target.result,
                name: file.name
            };
            this.showImagePreview();
            this.updateSendButton();
        };
        reader.readAsDataURL(file);
    }

    showImagePreview() {
        if (this.selectedImage) {
            this.previewImage.src = this.selectedImage.dataUrl;
            this.imagePreviewContainer.style.display = 'block';
        }
    }

    clearImagePreview() {
        this.selectedImage = null;
        this.imagePreviewContainer.style.display = 'none';
        this.previewImage.src = '';
        this.imageInput.value = '';
        this.updateSendButton();
    }

    addImageMessage(text, imageData, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${role}`;
        
        const avatar = document.createElement('div');
        if (role === 'user') {
            avatar.className = 'user-avatar';
            avatar.textContent = '👤';
        } else {
            avatar.className = 'huggy-avatar responding';
            const img = document.createElement('img');
            img.src = 'huggy-logo-transparent.png';
            img.alt = 'Huggy AI';
            avatar.appendChild(img);
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-text';
        
        if (imageData) {
            const imageElement = document.createElement('img');
            imageElement.src = imageData.dataUrl;
            imageElement.alt = imageData.name;
            imageElement.style.maxWidth = '100%';
            imageElement.style.maxHeight = '300px';
            imageElement.style.borderRadius = '8px';
            imageElement.style.marginBottom = text ? '10px' : '0';
            messageContent.appendChild(imageElement);
        }
        
        if (text) {
            const textElement = document.createElement('div');
            textElement.textContent = text;
            messageContent.appendChild(textElement);
        }
        
        if (role === 'user') {
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.messages.push({ 
            role, 
            content: text || '发送了一张图片',
            image: imageData ? imageData.dataUrl : null
        });
    }

    async sendImageMessageToAPI(text, imageData) {
        this.showTypingIndicator();

        try {
            console.log('发送图片消息到API:', { text, imageData: imageData.dataUrl.substring(0, 100) + '...' });
            
            const [mimeInfo, base64Data] = imageData.dataUrl.split(',');
            const mimeType = mimeInfo.split(':')[1].split(';')[0];
            console.log('提取的MIME类型:', mimeType);
            console.log('提取的base64数据长度:', base64Data.length);
            
            const requestMessages = [
                {
                    role: 'system',
                    content: '你是Huggy AI，一个专业的心理咨询AI助手。你现在可以看到和分析用户发送的图片。请根据图片内容和用户的文字描述，提供温暖、理解和专业的心理支持。'
                },
                ...this.messages.filter(msg => !msg.image),
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: text || '请帮我分析这张图片，从心理咨询的角度给我一些建议。'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${base64Data}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ];
            
            console.log('请求消息构建完成，包含', requestMessages.length, '条消息');

            const requestBody = {
                messages: requestMessages,
                stream: true,
                isVision: true
            };
            
            console.log('发送请求到:', this.apiUrl);
            
            let response;
            try {
                console.log('开始JSON序列化请求体...');
                const requestBodyString = JSON.stringify(requestBody);
                console.log('JSON序列化成功，请求体大小:', requestBodyString.length, '字符');
                console.log('开始发送fetch请求...');
                response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });
                
                console.log('fetch请求成功，响应状态:', response.status, response.statusText);
            } catch (fetchError) {
                console.error('fetch请求失败:', fetchError);
                throw fetchError;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.hideTypingIndicator();

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') {
                                this.finalizeStreamingMessage();
                                return;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                const content = parsed.choices?.[0]?.delta?.content;
                                if (content) {
                                    this.addStreamingMessage(content, 'assistant');
                                }
                            } catch (e) {
                                console.warn('解析流式数据失败:', e);
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
                this.finalizeStreamingMessage();
            }
        } catch (error) {
            console.error('发送图片消息失败:', error);
            this.hideTypingIndicator();
            this.addMessage('抱歉，我在处理您的图片时遇到了问题。请稍后再试。', 'assistant');
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HuggyFullscreenChat();
});
