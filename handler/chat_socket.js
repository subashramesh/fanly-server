require('dotenv').config();
const auth = require('../middleware/auth.js');
// const kafka = require('../service/kafka.js');
const session = require('./session.js');
const {rooms} = require('./call.js');

global.sockets = {}; 

io.on('connection', (socket) => {
    let token = socket.handshake.query.token;
    let user = auth.checkTokenSocket(token);
    
    if (user) {
        socket.join(`u:${user.id}`)
        console.log('user connected: [', user.id, ']');
        session.update({ body: { data: { active: true } }, user }, {
            send: (res) => {}
        });

        // Check if the user's socket array exists, if not, create it
        if (!sockets[user.id]) {
            sockets[user.id] = [];
        }

        // Add the socket to the user's socket array
        sockets[user.id].push(socket);

        socket.on('disconnect', () => {
            console.log('user disconnected: [', user.id, ']');
            
            let s = sockets[user.id];
            var connected = false;
            for(let i in s){
                console.log(s[i].id, s[i].connected)
                if(s[i].connected){
                    connected = true;
                    break;
                }
            }
            if(!connected){
                session.update({ body: { data: { active: false } }, user }, {
                    send: (res) => {}
                });
            }
            rooms.disconnect(user.id);
            
            sockets[user.id] = sockets[user.id].filter(s => s !== socket);
            // Remove the disconnected socket from the user's socket array
            
        });
    } else {
        socket.disconnect();
    }
});
exports.send = async (address, event, data) => {
    try {
        // await kafka.producer.connect();
        if (typeof address == 'string' || typeof address == 'number') {
            io.to(`u:${address}`).emit(event, data);
            // if(sockets[address]){
            //     for(let e of sockets[address]){
            //         e.emit(event, data);
            //     }
            // }
            // kafka.producer.send({
            //     topic: process.env.KAFKA_TOPIC,
            //     messages: [
            //         { value: JSON.stringify({ address, event, data }) },
            //     ],
            // });
        }
        if (Array.isArray(address)) {
            for (let i in address) {
                let a = address[i];
                io.to(`u:${a}`).emit(event, data);
                // if (!a) {
                //     continue;
                // }
                // if(sockets[a]){
                //     for(let e of sockets[a]){
                //         e.emit(event, data);
                //     }
                // }
                // kafka.producer.send({
                //     topic: process.env.KAFKA_TOPIC,
                //     messages: [
                //         { value: JSON.stringify({ address: a, event, data }) },
                //     ],
                // });
            }
        }
    } catch (error) {
        
    }
}

exports.emit = (event, data) => {
    io.emit(event, data);
}

// Function to send data to all sockets of a specific user
exports.sendToUser = (userId, event, data) => {
    io.to(`u:${userId}`).emit(event, data);
    // if (sockets[userId]) {
    //     for (const socket of sockets[userId]) {
    //         socket.emit(event, data);
    //     }
    // }
}
