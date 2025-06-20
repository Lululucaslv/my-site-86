import { HuggyWixChat } from 'public/huggy-chat.js';

let huggyChat = null;

$w.onReady(function () {
    huggyChat = new HuggyWixChat();
    
    $w('#button109').onClick(() => {
        huggyChat.show();
    });
});
