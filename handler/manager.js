const db = require('../service/chat/postgres')
const token = require('../middleware/auth')
const socket = require('./chat_socket.js')
const messaging = require('../service/firebase/messaging.js')
const chat = require('./chat.js')
const { ThreadType, ThreadEventType } = require('../consts/enums.js');
const { notify, revokeNotify } = require('./notification.js');

const system = ThreadType.system;

async function send(req, event, effect, group) {
    let data = {}
    data.type = event;
    data.effect = effect;
    data.owner = req.user.id;
    let payload = {
        sender: req.user.id,
        group: group,

        type: system,
        updated_at: chat.now(),
        data: {
            type: event,
            event: data
        }
    }

    

    if (group) {
        payload.box = `g-${group}`
    } else {
        let box = getConversationId(req.user.id, effect);
        payload.box = box;
        payload.receiver = effect;
    }

    console.log('manger send', payload);
    let receivers = await chat.getReceivers({
        group: group,
        receiver: effect
    });
    receivers.push(req.user.id);
    receivers.push(effect);
    payload.receivers = receivers;
    payload.updated_at = chat.now();
    payload.created_at = chat.now();
    let res = await db.insert('thread', payload, 'id');
    payload.id = res[0].id;
    
    
    socket.send(receivers, 'message', payload);
    let index = receivers.indexOf(req.user.id);
    if (index > -1) {
        receivers.splice(index, 1);
    }

    var ef;
    var title = req.user.dname, body = '';
    if (group) {
        let e = await db.select('account', {
            fields: ['*'],
            conditions: [
                ['id', '=', effect]
            ]
        });
        ef = e[0];
    } else {
        if (event === ThreadEventType.missedCall) {
            title = await chat.getName(req.user.id, effect);
        }
    }

    var sen = false;

    switch (event) {
        case ThreadEventType.missedCall:
            sen = true;
            body = 'Missed Call';
            break;
        case ThreadEventType.addAdmin:
            body = `Added ${ef.dname} as admin in`;
            break;
        case ThreadEventType.removeAdmin:
            body = `Removed ${ef.dname} as admin in`;
            break;
        case ThreadEventType.addMember:
            body = `Added ${ef.dname} from`;
            break;
        case ThreadEventType.removeMember:
            body = `Removed ${ef.dname} from`;
            break;
        case ThreadEventType.leaveGroup:
            body = `Left from`;
            break;
        case ThreadEventType.createGroup:
            sen = true;
            body = `Created group`;
            break;
        case ThreadEventType.changeWallpaper:
            body = `${ef.dname} changed wallpaper`;
            break;
    }
    // remove all undefined from receivers
    receivers = receivers.filter(function (el) {
        return el != null && el != undefined && el != '';
    });
    let tokens = await chat.getTokens(receivers)
    // remove all empty tokens, undefined and null from tokens
    tokens = tokens.filter(function (el) {
        return el != null && el != undefined && el != '';
    })

    if (group) {
        let ggg = await db.select('group', {
            conditions: [
                ['id', '=', group]
            ]
        })
        if (ggg.length > 0) {
            body = `${body} ${ggg[0].name}`;
        }
    } else {
        body = `${body}`;
    }
    let d = {
        type: 'events',
        payload: JSON.stringify(payload)
    }
    if (sen) {
        messaging.message(tokens, d, {
            title: title,
            body: body,
        });
    }
    return payload;
}
exports.send = send;

function getConversationId(id1, id2) {

    const u1 = id1.toString();
    const u2 = id2.toString();
    let b;

    if (u1.localeCompare(u2) < 0) {
        return `${u1}-${u2}`;
    } else {
        return `${u2}-${u1}`;
    }
}

exports.getConversationId = getConversationId;