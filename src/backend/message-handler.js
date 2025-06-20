import { getGPTResponse } from 'backend/gpt-api.js';
import wixChatBackend from 'wix-chat-backend';
import wixData from 'wix-data';
 
// 消息列表
const messageLists = {};

// 消息延时，在这段时间内收到的消息会一起被发送给 GPT
const messageDelay = 0;

// 机器人的人设
const persona = ["你的背景是一位精通心理学各个领域的专家，现在的工作是MoreThanHugs北美心理服务商的销售客服，你的最终目的永远是说服客户购买MoreThanHugs的“One Hour Counselling”订阅心理服务。","Morethanhugs只有两种咨询方案，分别为 1小时深度咨询 和 30分钟轻度咨询，价格分别为 $129/周/次 和 $65/周/次，其中 1小时深度咨询 是我们的主推方案 ","在面对客户时，你需要在回复用户的同时，和善的引导对方说出需要咨询的心理问题。","对于客户说明的心理问题或负面情绪，您需要了解到客户这种情绪持续了多久，同时询问客户年龄和性别。","在客户给出回复后，请你结合客户给出的回复和心理问题，利用你的心理专业知识给出简洁，通俗易懂的分析；但你只是客服，所以不要直接给出指导意见或建议，而应当引导客户购买心理咨询服务 ","你需要对你的回复内容进行分段，因为用户不会喜欢阅读大段的文字，当文本字数超过50字时，用换行符'","'进行分段标记。","如果客户表明对方有自杀倾向，请告知客户如果对方处于紧急且危险的情绪当中，一定要通过自杀预防的机构帮助到自己，这里是信息汇总的网址https://www.morethanhugs.com/gethelp。"].join('\n\n');

/**
 * 处理消息
 * @param {String} channelId 会话ID
 * @param {String} senderId 发送者ID
 * @param {String} message 消息内容
 * @returns {Promise<void>} 无返回值
 */
export async function handleMessage(channelId, senderId, message) {
    // 如果该会话的最后一条消息是管理员发送的，则不处理
    let result = await wixData.query('gpt_chat').eq('channelId', channelId).find();
    if (result.items.length > 0 && result.items[0].messages.length > 0 && result.items[0].messages[result.items[0].messages.length - 1].role === "admin") {
        console.log("JZ: Customer service manual intervention has started.");
        return;
    }
    console.log(result)
    // 如果该会话还没有消息列表，则创建一个新的列表
    if (!messageLists[channelId]) {
        messageLists[channelId] = [];
    }
     // 启动该会话的计时器
    setTimeout(() => {
        // 处理消息列表
        processMessageList(channelId, senderId, messageLists[channelId]);
        // 移除消息列表
        // messageLists[channelId] = null;
    }, messageDelay);
    // 将消息添加到该会话的消息列表末尾
    messageLists[channelId].push({
        role:'user',
        content:message
    });
}

/**
 * 处理消息列表
 * @param {String} channelId 会话ID
 * @param {String} senderId 发送者ID
 * @param {Array} messageList 消息列表
 * @returns {Promise<void>} 无返回值
 */
async function processMessageList(channelId, senderId, messageList) {
    // 将消息列表中的消息合并为一个字符串
    let message = messageList.join('\n\n');
    // 尝试获取该会话的消息记录，如果没有则创建一个新的消息记录
    var channel;
    let result = await wixData.query('gpt_chat').eq('channelId', channelId).find();
    if (result.items.length > 0) {
        channel = result.items[0];
        // 如果该会话的最后一条消息是管理员发送的，则放弃继续执行方法
        if (channel.messages.length > 0 && channel.messages[channel.messages.length - 1].role === "admin") {
            console.log("JZ: Customer service manual intervention has started before querying.");
            return;
        }
    } else {
        channel = {
            channelId: channelId,
            userId: senderId,
            messages: Array.of({
                role: "system",
                content: persona,
            })
        }
    }
    let resParams = null
    console.log(messageList,'messageList',channelId,'channelId')
    if(messageList.length == 0){
        resParams = channel.messages
    }else{
        resParams = messageList
    }
    // 调用GPT-3查询器查询GPT-3的回复
    let response = await getGPTResponse(resParams);
    // 再次尝试获取该会话的消息记录，如果此时会话的最后一条消息是管理员发送的，则放弃继续执行方法
    let currentResult = await wixData.query('gpt_chat').eq('channelId', channelId).find();
    if (currentResult.items.length > 0 && currentResult.items[0].messages.length > 0 && currentResult.items[0].messages[currentResult.items[0].messages.length - 1].role === "admin") {
        console.log("JZ: Customer service manual intervention has started while quering response.");
        return;
    }
    console.log(response)
    messageLists[channelId].push({
        role:'assistant',
        content:response.message.content
    });
    console.log(messageLists[channelId])
    if (response != undefined && response != null) {
        // 如果GPT-3的回复不为空，则将用户提出的问题和GPT-3的回复添加到该会话的消息列表末尾，并将该会话的消息记录保存到数据库中
        channel.messages = channel.messages.concat([
            {
                "role": "user",
                "content": message,
            },
            {
                "role": "assistant",
                "content": response,
            }
        ]);
        await wixData.save('gpt_chat', channel);
        await sendMessageWithDelay(response.message.content, channelId, 100);
        // for (const text of formatResponse(response.message.content)) {
        //     // 设置100毫秒间隔逐条发送消息
            
        // }
    } else {
        // 如果GPT-3的回复为空，提示用户稍后再试
        await sendMessageWithDelay("非常抱歉，聊天系统出现了一些问题，请稍后再试。", channelId, 0);
    }
}

/**
 * 格式化反馈文本
 * @param {String} text 反馈文本
 * @returns {Array<String>} 格式化后的文本数组
 */
function formatResponse(text) {
    // 尝试分割长度超过120的文本
    if (text.length > 120) {
        let result = [];
        var start = 0;
        var end = 0;
        // 遍历文本中的每个字符
        for (let i = 0; i < text.length; i++) {
            // 如果当前字符是句号
            if (text[i] === '。') {
                // 如果当前位置距离当前起始位置超过120个字符
                if (i - start > 120) {
                    // 如果当前起始位置小于当前暂存的结束位置，则将该部分文本加入结果，否则将当前起始位置与当前位置之间的文本加入结果，然后将当前加入文本的结束位置作为新的起始位置
                    if (start < end) {
                        result.push(text.substring(start, end));
                        start = end;
                    } else {
                        result.push(text.substring(start, i + 1));
                        start = i + 1;
                    }
                    // 如果当前起始位置是换行符，跳过该换行符
                    while(start + 1 <= text.length && text.substring(start, start + 1) === '\n') {
                        start = start + 1;
                    }
                }
                // 更新当前暂存的结束位置
                end = i + 1;
            }
        }
        // 同样如果当前起始位置是换行符，跳过该换行符
        while(start + 1 <= text.length && text.substring(start, start + 1) === '\n') {
            start = start + 1;
        }
        // 将剩余的文本加入结果并返回
        if (start < text.length) {
            result.push(text.substring(start, text.length));
        }
        return result;
    } else {
        // 如果文本长度不超过120，则直接返回仅包含该文本的数组
        return Array.of(text);
    }
}

function sendMessageWithDelay(message, channelId, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
        await wixChatBackend.sendMessage({
            "messageText": message,
            "channelId": channelId,
            "sendAsVisitor": false
        });
      resolve();
    }, delay);
  });
}
