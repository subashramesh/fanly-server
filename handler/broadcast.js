global.rooms = {};
global.getRoom = (roomId) => {
    if (!rooms[roomId]) {
        rooms[roomId] = {
            users: {}
        };
    }
    return rooms[roomId];
}
global.addUserToRoom = (roomId, data, socket) => {
    let id = data.userId;
    let room = getRoom(roomId);
    room.users[id] = { id, socket };
    broadcast(roomId, id, {
        type: "user-joined",
        data: data
    })
    console.log(rooms);
    console.log(room);
}

io.on('broadcast-message', (json) => {
    let data = JSON.parse(json);
    let roomId = socket.handshake.query.id;
    let payload = data.data
    console.log(roomId, json)
    switch (data.type) {
        case 'join-room':
            addUserToRoom(roomId, payload, socket);
            socket.emit('message', JSON.stringify({
                type: "room-joined",
                data: {
                    roomId: roomId,
                    userId: payload.userId
                }
            }));
            break;
        case 'connection-request':
            sendTo(roomId, payload.otherUserId, {
                type: 'connection-request',
                data: payload
            })
            break;
        case 'offer-sdp':
            sendTo(roomId, payload.otherUserId, {
                type: 'offer-sdp',
                data: payload
            });
            break;
        case 'answer-sdp':
            sendTo(roomId, payload.otherUserId, {
                type: 'answer-sdp',
                data: payload
            });
            break;
        case 'icecandidate':
            sendTo(roomId, payload.otherUserId, {
                type: 'icecandidate',
                data: payload
            });
            break;
    }
})
socket.on('notify', (json) => {
    let data = JSON.parse(json);
    let roomId = socket.handshake.query.id;
    sendTo(roomId, data.otherUserId, data)
})
socket.on('broadcast', (json) => {
    let data = JSON.parse(json);
    let roomId = socket.handshake.query.id;
    broadcast(roomId, data.userId, data)
})
socket.on('disconnect', () => {
    let roomId = socket.handshake.query.id;
    let users = getRoom(roomId).users;
    var user;
    for (let i in users) {
        if (users[i].socket == socket) {
            user = users[i];
            delete users[i];
            break;
        }
    }
    if(user){
        broadcast(roomId, user.id, {
            type: "user-left",
            data: 
            {
                userId: user.id
            }
        })
        console.log('disconnect', roomId, user.id);
    }
    
});
function broadcast(roomId, senderId, data) {
    try {
        let room = getRoom(roomId);
    for (let i in room.users) {
        if (senderId != i) {
            let user = room.users[i];
            user.socket.emit('message', JSON.stringify(data));
        }
    }
    } catch (e) {
        console.log(e)
    }
    
}

function sendTo(roomId, userId, data) {
    try {
        console.log('sendTo', roomId, userId, data);
    let room = getRoom(roomId);
    let user = room.users[userId];
    user.socket.emit('message', JSON.stringify(data));
    } catch (e) {
        console.log(e)
    }
}