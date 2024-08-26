const fs = require('fs');
const readline = require('readline');
const path = require('path');
const db = require('../service/chat/postgres');

// Function to handle insert operation
async function insertOperation(line) {
    // Implement your insert logic here
    try{
        await db.insert('business', {
            'name': line,
        }, 'id')
    } catch(err) {
        // console.error(`Error inserting line: ${err}`);
    }
}

// Function to read file line by line and perform insert operation
async function processFile(filePath) {
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        insertOperation(line);
    }
}

// Provide the path to your text file here
const filePath = path.join(__dirname, 'business.txt');

processFile(filePath).then(() => {
    console.log('File processing completed.');
}).catch(err => {
    // console.error(`Error processing file: ${err}`);
});