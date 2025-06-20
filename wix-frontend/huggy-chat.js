import { fetch } from 'wix-fetch';

class HuggyWixChat {
    constructor() {
        this.apiUrl = '/_functions/chat';
        this.userInfoUrl = '/_functions/userInfo';
        this.messages = [];
        this.isTyping = false;
        this.userInfo = null;
        this.selectedImage = null;
        this.isVisible = false;
        
        this.createChatInterface();
        this.bindEvents();
        this.loadUserInfo();
    }

    createChatInterface() {
        const chatOverlay = `
            <div id="huggy-chat-overlay" class="huggy-chat-overlay" style="display: none;">
                <div class="huggy-animated-background">
                    <div class="huggy-wave huggy-wave1"></div>
                    <div class="huggy-wave huggy-wave2"></div>
                    <div class="huggy-wave huggy-wave3"></div>
                </div>
                
                <div class="huggy-chat-container">
                    <header class="huggy-chat-header">
                        <div class="huggy-header-content">
                            <div class="huggy-logo-section">
                                <div class="huggy-icon">🤗</div>
                                <h1>Huggy AI</h1>
                            </div>
                            <div class="huggy-controls">
                                <div class="huggy-status-indicator">
                                    <span class="huggy-status-dot"></span>
                                    <span class="huggy-status-text">在线</span>
                                </div>
                                <button id="huggy-close-btn" class="huggy-close-btn">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </header>

                    <div class="huggy-chat-messages" id="huggy-chat-messages">
                        <div class="huggy-welcome-message" id="huggy-welcome-message">
                            <div class="huggy-avatar huggy-listening">
                                <img src="https://static.wixstatic.com/media/huggy-logo-transparent.png" alt="Huggy AI" />
                            </div>
                            <div class="huggy-message-content">
                                <h2>欢迎来到 Huggy AI</h2>
                                <p>正在加载您的个人档案...</p>
                            </div>
                        </div>
                    </div>

                    <div class="huggy-typing-indicator" id="huggy-typing-indicator" style="display: none;">
                        <div class="huggy-avatar huggy-thinking">
                            <img src="https://static.wixstatic.com/media/huggy-logo-transparent.png" alt="Huggy AI" />
                        </div>
                        <div class="huggy-typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>

                    <div class="huggy-quick-replies" id="huggy-quick-replies">
                        <button class="huggy-quick-reply-btn" data-message="我感到焦虑">我感到焦虑</button>
                        <button class="huggy-quick-reply-btn" data-message="我需要倾诉">我需要倾诉</button>
                        <button class="huggy-quick-reply-btn" data-message="我想聊聊我的情绪">我想聊聊我的情绪</button>
                        <button class="huggy-quick-reply-btn" data-message="我感到压力很大">我感到压力很大</button>
                    </div>

                    <div class="huggy-chat-input-container">
                        <div class="huggy-image-preview-container" id="huggy-image-preview-container" style="display: none;">
                            <div class="huggy-image-preview">
                                <img id="huggy-preview-image" src="" alt="预览图片" />
                                <button class="huggy-remove-image-btn" id="huggy-remove-image-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div class="huggy-input-wrapper">
                            <div class="huggy-input-actions">
                                <button id="huggy-image-upload-btn" class="huggy-image-upload-btn" title="上传图片">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                                    </svg>
                                </button>
                                <input type="file" id="huggy-image-input" accept="image/*" style="display: none;" />
                            </div>
                            <textarea 
                                id="huggy-message-input" 
                                placeholder="在这里输入您的想法和感受，或上传图片分享..."
                                rows="1"
                            ></textarea>
                            <button id="huggy-send-button" class="huggy-send-button" disabled>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                        <div class="huggy-input-footer">
                            <span class="huggy-char-count" id="huggy-char-count">0/2000</span>
                            <span class="huggy-privacy-note">🔒 您的对话是私密和安全的</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatOverlay);
        this.initializeElements();
    }

    initializeElements() {
        this.chatOverlay = document.getElementById('huggy-chat-overlay');
        this.chatMessages = document.getElementById('huggy-chat-messages');
        this.messageInput = document.getElementById('huggy-message-input');
        this.sendButton = document.getElementById('huggy-send-button');
        this.typingIndicator = document.getElementById('huggy-typing-indicator');
        this.quickReplies = document.getElementById('huggy-quick-replies');
        this.charCount = document.getElementById('huggy-char-count');
        this.welcomeMessage = document.getElementById('huggy-welcome-message');
        this.imageUploadBtn = document.getElementById('huggy-image-upload-btn');
        this.imageInput = document.getElementById('huggy-image-input');
        this.imagePreviewContainer = document.getElementById('huggy-image-preview-container');
        this.previewImage = document.getElementById('huggy-preview-image');
        this.removeImageBtn = document.getElementById('huggy-remove-image-btn');
        this.closeBtn = document.getElementById('huggy-close-btn');
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
        const messageContent = this.welcomeMessage.querySelector('.huggy-message-content');
        
        if (this.userInfo && this.userInfo.hasHistory) {
            messageContent.innerHTML = `
                <h2>欢迎回来！</h2>
                <p>我是Huggy AI，您的专属AI心理咨询伙伴。我还记得我们之前的${this.userInfo.messageCount}次对话。</p>
                <div class="huggy-memory-info">
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
                <div class="huggy-memory-info">
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
        this.closeBtn.addEventListener('click', () => this.hide());
        
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
            if (e.target.classList.contains('huggy-quick-reply-btn')) {
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

    show() {
        this.isVisible = true;
        this.chatOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.messageInput.focus();
    }

    hide() {
        this.isVisible = false;
        this.chatOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    updateCharCount() {
        const length = this.messageInput.value.length;
        this.charCount.textContent = `${length}/2000`;
        
        if (length > 1800) {
            this.charCount.style.color = '#ff6b6b';
        } else if (length > 1500) {
            this.charCount.style.color = '#ffa726';
        } else {
            this.charCount.style.color = '#888';
        }
    }

    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        const hasImage = this.selectedImage !== null;
        this.sendButton.disabled = !hasText && !hasImage;
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        const hasImage = this.selectedImage !== null;
        
        if (!message && !hasImage) return;
        if (this.isTyping) return;

        this.quickReplies.style.display = 'none';

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
    }

    addMessage(text, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `huggy-message-bubble ${role}`;
        
        const avatar = document.createElement('div');
        if (role === 'user') {
            avatar.className = 'huggy-user-avatar';
            avatar.textContent = '👤';
        } else {
            avatar.className = 'huggy-avatar huggy-responding';
            const img = document.createElement('img');
            img.src = 'https://static.wixstatic.com/media/huggy-logo-transparent.png';
            img.alt = 'Huggy AI';
            avatar.appendChild(img);
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'huggy-message-text';
        messageContent.textContent = text;
        
        if (role === 'user') {
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        this.messages.push({ role, content: text });
    }

    addStreamingMessage(content, role) {
        let messageDiv = this.chatMessages.querySelector('.huggy-streaming-message');
        
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.className = `huggy-message-bubble ${role} huggy-streaming-message`;
            
            const avatar = document.createElement('div');
            avatar.className = 'huggy-avatar huggy-responding';
            const img = document.createElement('img');
            img.src = 'https://static.wixstatic.com/media/huggy-logo-transparent.png';
            img.alt = 'Huggy AI';
            avatar.appendChild(img);
            
            const messageContent = document.createElement('div');
            messageContent.className = 'huggy-message-text huggy-streaming-text';
            
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
            this.chatMessages.appendChild(messageDiv);
        }
        
        const messageContent = messageDiv.querySelector('.huggy-message-text');
        messageContent.textContent += content;
        
        this.scrollToBottom();
    }

    finalizeStreamingMessage() {
        const streamingMessage = this.chatMessages.querySelector('.huggy-streaming-message');
        if (streamingMessage) {
            streamingMessage.classList.remove('huggy-streaming-message');
            const messageText = streamingMessage.querySelector('.huggy-message-text');
            messageText.classList.remove('huggy-streaming-text');
            
            this.messages.push({ 
                role: 'assistant', 
                content: messageText.textContent 
            });
        }
    }

    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
        this.updateSendButton();
    }

    async sendMessageToAPI(message) {
        this.showTypingIndicator();

        const requestMessages = [
            {
                role: 'system',
                content: '你是Huggy AI，一个专业的心理咨询AI助手。你的任务是提供温暖、理解和专业的心理支持。请用温和、共情的语调回应用户，并提供有用的建议和支持。'
            },
            ...this.messages,
            { role: 'user', content: message }
        ];

        try {
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
        } catch (error) {
            console.error('发送消息失败:', error);
            this.hideTypingIndicator();
            this.addMessage('抱歉，我现在无法回复。请稍后再试。', 'assistant');
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
        messageDiv.className = `huggy-message-bubble ${role}`;
        
        const avatar = document.createElement('div');
        if (role === 'user') {
            avatar.className = 'huggy-user-avatar';
            avatar.textContent = '👤';
        } else {
            avatar.className = 'huggy-avatar huggy-responding';
            const img = document.createElement('img');
            img.src = 'https://static.wixstatic.com/media/huggy-logo-transparent.png';
            img.alt = 'Huggy AI';
            avatar.appendChild(img);
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'huggy-message-text';
        
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
            const [mimeInfo, base64Data] = imageData.dataUrl.split(',');
            const mimeType = mimeInfo.split(':')[1].split(';')[0];
            
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

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: requestMessages,
                    stream: true,
                    isVision: true
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

export { HuggyWixChat };
