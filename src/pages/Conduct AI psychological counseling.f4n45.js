// Huggy AI 全屏聊天系统 - 页面集成代码
// 导入 Huggy 聊天组件
import { HuggyWixChat } from 'public/huggy-chat.js';

let huggyChat = null;

$w.onReady(function () {
    // 初始化 Huggy AI 聊天系统
    huggyChat = new HuggyWixChat();
    
    // 替换现有的 "Let's Chat!" 按钮功能
    // 注意：需要根据实际按钮ID调整
    const chatButton = $w('#button109'); // 或者其他实际的按钮ID
    
    if (chatButton) {
        chatButton.onClick(() => {
            huggyChat.show();
        });
    }
    
    // 如果有其他聊天相关按钮，也可以绑定
    // 例如页面上的其他触发按钮
    try {
        const additionalButtons = $w('#chatTrigger, #startChat, #openChat');
        additionalButtons.onClick(() => {
            huggyChat.show();
        });
    } catch (e) {
        // 忽略不存在的按钮
        console.log('某些聊天按钮不存在，这是正常的');
    }
    
    console.log('Huggy AI 聊天系统已初始化');
});