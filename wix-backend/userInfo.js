const userProfiles = new Map();

function generateUserId(request) {
    const userAgent = request.headers['user-agent'] || '';
    const ip = request.ip || '';
    return Buffer.from(userAgent + ip).toString('base64').slice(0, 16);
}

export function get_userInfo(request) {
    const userId = generateUserId(request);
    
    if (!userProfiles.has(userId)) {
        userProfiles.set(userId, {
            firstVisit: new Date(),
            totalMessages: 0,
            personality: '新用户',
            preferences: []
        });
    }
    
    const profile = userProfiles.get(userId);
    const conversations = [];
    
    return {
        status: 200,
        body: {
            userId: userId,
            profile: profile,
            hasHistory: conversations.length > 0,
            messageCount: conversations.length
        }
    };
}
