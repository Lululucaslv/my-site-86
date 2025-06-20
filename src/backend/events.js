import { handleMessage } from 'backend/message-handler.js';
// import { onMessage } from 'wix-chat-backend';
import wixData from 'wix-data';

// 手动干预关键词
const manualInterventionKeywords = [
    "您好，我了解了",
    "Ok，我了解了"
];

/**
 * 处理消息事件
 * @param {Object} event 事件对象
 * @returns {void} 无返回值
 */
export function wixChat_onMessage(event) {
    console.log("JZ: Received an on-message event:", event);
    console.log(event.channelId,'channelId')
    // 如果是用户发来的消息，则交给消息处理器处理，否则判断是否是手动干预指令终止智能回复
    if (event.direction === "VisitorToBusiness") {
        handleMessage(event.channelId, event.sender.id, event.payload.text);
    } else if (event.direction === "BusinessToVisitor") {
        handleResponse(event.channelId, event.sender.id, event.payload.text);
    }
}

/**
 * 处理回复消息事件
 * @param {String} channelId 会话ID
 * @param {String} senderId 发送者ID
 * @param {String} message 消息内容
 * @returns {Promise<void>} 无返回值
 */
async function handleResponse(channelId, senderId, message) {
    // 如果是手动干预指令，则将消息存入数据库，并将角色设置为管理员，否则不做处理
    if (manualInterventionKeywords.includes(message)) {
        var channel;
        let result = await wixData.query('gpt_chat').eq('channelId', channelId).find();
        if (result.items.length > 0) {
            channel = result.items[0];
        } else {
            channel = {
                channelId: channelId,
                userId: senderId,
                messages: []
            }
        }
        channel.messages.push({
            role: "admin",
            content: message,
        });
        wixData.save('gpt_chat', channel);
        console.log("JZ: Customer service manual intervention started by:", senderId);
    }
}
