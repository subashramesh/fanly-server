require('dotenv').config();
const { Kafka, Partitioners } = require('kafkajs')
const fs = require('fs');
const path = require('path');

const random = Math.floor(Math.random() * 10) + 1;

const topic = process.env.KAFKA_TOPIC

const ca = fs.readFileSync( path.join(__dirname, 'ca.pem'), 'utf-8');

const kafka = new Kafka({
  clientId: `${process.env.KAFKA_CLIENT_ID}-${random}`,
  brokers: [process.env.KAFKA_BROKER],
  sasl: {
    mechanism: 'PLAIN',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  ssl: {
    ca: ca,
  },
  dr_cb: true,

})

const admin = kafka.admin({
    createPartitioner: Partitioners.LegacyPartitioner,
})

const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
})

const consumer = kafka.consumer({
    groupId: `${process.env.KAFKA_GROUP_ID}-${random}`,
})

const run = async () => {
    try {
        await admin.connect()
    try {
        await admin.createTopics({
            topics: [
            { topic: topic , numPartitions: 1 },
            ],
        })

    } catch (error) {
        console.log(error)
    }
    await admin.disconnect()

    await producer.connect()
    
    await consumer.connect()
    
    await consumer.subscribe({ topic, fromBeginning: false })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            let data = JSON.parse(message.value.toString());
            if(sockets[data.address]){
                for(let e of sockets[data.address]){
                    e.emit(data.event, data.data);
                }
            }
        }
    })
    } catch (error) {
      return run();  
    }
    
}

run().catch(console.error)

module.exports = {
    producer,
    consumer
}