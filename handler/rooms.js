const { Redis } = require('ioredis');
const socket = require('./chat_socket.js');
require('dotenv').config();

const ROOM_PREFIX = 'fanly::room:';
const USER_PREFIX = 'fanly::user:';
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
// const serviceUri = 'rediss://default:AVNS_7FeXjGYYdecFfnayCAL@caching-2f13ceb3-rahuvaran88-d22e.h.aivencloud.com:10923';
// const pubClient = new Redis(redisPort, redisHost);
const redisClient = new Redis({
  port: redisPort,
  host: redisHost
});
const pub = redisClient;
const sub = redisClient.duplicate();

class Rooms {
  constructor() {
    this.redisClient = redisClient;
    this.redisClient.on('error', (err) => {
      console.warn('Redis Client IDLE');
    });
    sub.subscribe('room-updates');
    sub.on('message', (channel, message) => {
      if (channel === 'room-updates') {
        const room = JSON.parse(message);
        socket.send(room.listeners, 'room', room);
      }
    });
    sub.on('error', (err) => {
      console.warn('Redis Clent IDLE');
    })
    pub.on('error', (err) => {
      console.warn('Redis Pub IDLE');
    })
  }

  async create(id) {
    const roomKey = `${ROOM_PREFIX}${id}`;
    const room = await this.get(id);
    if (!room) {
      const newRoom = {
        users: [],
        invited: [],
        listeners: [],
        id: id,
        lastEvent: null
      };
      await this.redisClient.set(roomKey, JSON.stringify(newRoom));
      // console.log(`Room '${id}' created successfully.`);
    } else {
      // console.log(`Room '${id}' already exists.`);
    }
  }

  async disconnect(user) {
    const roomIds = await this.listRoomIds();
    const pipeline = this.redisClient.pipeline();
    roomIds.forEach(id => {
      pipeline.get(`${ROOM_PREFIX}${id}`);
    });
    const rooms = await pipeline.exec();
    const updatedRooms = rooms.map(([err, roomData]) => {
      if (err) {
        console.error('Error fetching room:', err);
        return null;
      }
      const room = JSON.parse(roomData);
      room.users = room.users.filter(u => u !== user);
      // room.invited = room.invited.filter(u => u !== user);
      return room;
    }).filter(room => room !== null);

    const multi = this.redisClient.pipeline();
    updatedRooms.forEach(room => {
      const roomKey = `${ROOM_PREFIX}${room.id}`;
      if (room.users.length === 0) {
        multi.del(roomKey);
      } else {
        multi.set(roomKey, JSON.stringify(room));
      }
    });
    await multi.exec();
  }

  async add(id, user) {
    await this.ensureRoomExists(id);
    await this.updateRoom(id, room => {
      if (!room.users.includes(user)) room.users.push(user);
      if (!room.listeners.includes(user)) room.listeners.push(user);
      room.lastEvent = { type: 'add', user: user };
    });
    // console.log(`User '${user}' added to room '${id}'.`);
  }

  async addListener(id, user) {
    await this.ensureRoomExists(id);
    await this.updateRoom(id, room => {
      if (!room.listeners.includes(user)) room.listeners.push(user);
      room.lastEvent = { type: 'addListener', user: user };
    });
    // console.log(`Listener '${user}' added to room '${id}'.`);
  }

  async remove(id, user) {
    const roomKey = `${ROOM_PREFIX}${id}`;
    const room = await this.get(id);
    if (room) {
      room.users = room.users.filter(u => u !== user);
      room.lastEvent = { type: 'remove', user: user };
      await this.redisClient.set(roomKey, JSON.stringify(room));
      // console.log(`User '${user}' removed from room '${id}'.`);

      if (room.users.length === 0) {
        this.emit(id);
        await this.redisClient.del(roomKey);
        // console.log(`Room '${id}' deleted.`);
      } else {
        this.emit(id);
      }
    } else {
      // console.log(`Room '${id}' does not exist.`);
    }
  }

  async invite(id, user) {
    await this.ensureRoomExists(id);
    await this.updateRoom(id, room => {
      if (!room.invited.includes(user)) room.invited.push(user);
      if (!room.listeners.includes(user)) room.listeners.push(user);
      room.lastEvent = { type: 'invite', user: user };
    });
    // console.log(`User '${user}' invited to room '${id}'.`);
  }

  async inviteAll(id, users) {
    await this.ensureRoomExists(id);
    await this.updateRoom(id, room => {
      users.forEach(user => {
        if (!room.invited.includes(user)) room.invited.push(user);
        if (!room.listeners.includes(user)) room.listeners.push(user);
      });
      room.lastEvent = { type: 'inviteAll', users: users };
    });
    // console.log(`Users '${users}' invited to room '${id}'.`);
  }

  async decline(id, user) {
    await this.updateRoom(id, room => {
      if(room){
        room.lastEvent = { type: 'decline', user: user };
      }
    });
    console
  }

  async users(id) {
    const room = await this.get(id);
    if (room) {
      return room.users;
    } else {
      // console.log(`Room '${id}' does not exist.`);
      return [];
    }
  }

  async invited(id) {
    const room = await this.get(id);
    if (room) {
      return room.invited;
    } else {
      // console.log(`Room '${id}' does not exist.`);
      return [];
    }
  }

  async listRoomIds() {
    const keys = await this.redisClient.keys(`${ROOM_PREFIX}*`);
    return keys.map(key => key.replace(ROOM_PREFIX, ''));
  }

  async list() {
    const roomIds = await this.listRoomIds();
    // console.log("List of rooms:");
    roomIds.forEach(id => {
      // console.log(id);
    });
  }

  async get(id) {
    const roomKey = `${ROOM_PREFIX}${id}`;
    const roomData = await this.redisClient.get(roomKey);
    if (roomData) {
      return JSON.parse(roomData);
    }
    return null;
  }

  async emit(id) {
    const room = await this.get(id);
    room.users = [...new Set(room.users)];
    room.invited = [...new Set(room.invited)];
    room.listeners = [...new Set(room.listeners)];
    await pub.publish('room-updates', JSON.stringify(room));
  }

  async activeRooms(user) {
    const rooms = [];
    const roomIds = await this.listRoomIds();
    // console.log(`Checking active rooms for user '${user}' with rooms: ${roomIds}`);
    for (const id of roomIds) {
      const room = await this.get(id);
      if (room.listeners.includes(user)) {
        rooms.push(room);
      }
    }
    // console.log(`Active rooms for user '${user}': ${rooms.length}`);
    return rooms;
  }

  async isActive(id) {
    const room = await this.get(id);
    return room && room.users.length > 0;
  }

  async ensureRoomExists(id) {
    const room = await this.get(id);
    if (!room) {
      await this.create(id);
    }
  }

  async updateRoom(id, updateFn) {
    const roomKey = `${ROOM_PREFIX}${id}`;
    const room = await this.get(id);
    if(room){
      updateFn(room);
      // remove duplicates users, invited and listeners
      room.users = [...new Set(room.users)];
      room.invited = [...new Set(room.invited)];
      room.listeners = [...new Set(room.listeners)];
      await this.redisClient.set(roomKey, JSON.stringify(room));
      await this.emit(id);
    }
  }
}

const CALL_TIMEOUT = 60;

class CallRooms {
  constructor() {
    this.redisClient = redisClient;
  }

  async setUserBusy(userId) {
    const userKey = `${USER_PREFIX}${userId}`;
    await this.redisClient.set(userKey, 'busy', 'EX', CALL_TIMEOUT);
  }

  async setUserAvailable(userId) {
    const userKey = `${USER_PREFIX}${userId}`;
    await this.redisClient.set(userKey, 'available');
  }

  async isUserBusy(userId) {
    const userKey = `${USER_PREFIX}${userId}`;
    const state = await this.redisClient.get(userKey);
    return state === 'busy';
  }

  async handleCallInitiation(callerId, receiverId) {
    const receiverBusy = await this.isUserBusy(receiverId);
    if (receiverBusy) {
      return false; // Line is busy
    }
    await this.setUserBusy(callerId);
    await this.setUserBusy(receiverId);
    return true; // Call initiated
  }

  async handleCallTermination(callerId, receiverId) {
    await this.setUserAvailable(callerId);
    await this.setUserAvailable(receiverId);
  }
}


exports.Rooms = Rooms;
exports.CallRooms = CallRooms;
