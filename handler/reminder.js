require('dotenv').config();
const router = require('express').Router();
const db = require('../service/chat/postgres');
const auth = require('../middleware/auth.js');

// Fetch all reminders with associated banner data
let getReminders = async (req, res) => {
    try {
        // Step 1: Fetch reminders
        let reminders = await db.select('reminder', {
            fields: ['*'],
            conditions: [['owner', '=', req.user.id]],
        });

        if (!reminders.length) {
            return res.send({
                status: '200',
                message: 'No reminders found.',
                data: [],
            });
        }

        // Step 2: Extract unique banner IDs
        const bannerIds = [...new Set(reminders.map(r => r.banner))];

        // Step 3: Fetch all banner data based on extracted IDs
        let banners = await db.select('banner', {
            fields: ['*'],
            conditions: [['id', 'in', bannerIds]],
        });

        // Map banners by their IDs for quick access
        const bannerMap = Object.fromEntries(banners.map(b => [b.id, b]));

        // Step 4: Attach banner details to reminders
        reminders = reminders.map(r => ({
            ...r,
            banner: bannerMap[r.banner] || null,
        }));

        return res.send({
            status: '200',
            message: 'Success',
            data: reminders,
        });
    } catch (e) {
        console.error(e);
        return res.send({
            status: '500',
            message: 'Internal Server Error',
        });
    }
};



// Add a new reminder
let addReminder = async (req, res) => {
    var { banner, interval, happen_at, update } = req.body;  // include 'update' field

    banner = banner.id || banner

    try {
        const payload = {
            owner: req.user.id,
            banner,
            interval,
            happen_at,
            update,  // Add the update field in the payload
        };

        // Step 1: Check if the reminder already exists for the given owner and banner
        let existingReminder = await db.select('reminder', {
            fields: ['*'],
            conditions: [['owner', '=', req.user.id], ['banner', '=', banner]],
        });

        if (existingReminder.length) {
            // Step 2: If reminder exists, update the existing row
            const updateFields = {
                interval,
                happen_at,
                update,  // Update the update field
            };

            const result = await db.update('reminder', {
                fields: updateFields,
                conditions: [['owner', '=', req.user.id], ['banner', '=', banner]],
            });

            return res.send({
                status: '200',
                message: 'Reminder updated successfully.',
                data: result,
            });
        } else {
            // Step 3: If reminder doesn't exist, insert the new reminder
            const result = await db.insert('reminder', payload, 'id');

            return res.send({
                status: '200',
                message: 'Reminder added successfully.',
                data: result,
            });
        }
    } catch (e) {
        console.error(e);
        return res.send({
            status: '500',
            message: 'Internal Server Error',
        });
    }
};

// Update an existing reminder
let updateReminder = async (req, res) => {
    var { id, interval, happen_at, update, seen } = req.body;

    banner = banner.id || banner

    try {
        // Ensure the reminder exists
        let reminder = await db.select('reminder', {
            fields: ['*'],
            conditions: [['id', '=', id], ['owner', '=', req.user.id]],
        });

        if (!reminder.length) {
            return res.send({
                status: '404',
                message: 'Reminder not found.',
                data: [],
            });
        }

        // Prepare the updated data
        const updatedFields = {};

        if (interval) updatedFields.interval = interval;
        if (happen_at) updatedFields.happen_at = happen_at;
        if (update) updatedFields.update = update;
        if (seen !== undefined) updatedFields.seen = seen; // seen is a boolean, so check explicitly

        // Update the reminder in the database
        const result = await db.update('reminder', {
            fields: updatedFields,
            conditions: [['id', '=', id], ['owner', '=', req.user.id]],
        });

        return res.send({
            status: '200',
            message: 'Reminder updated successfully.',
            data: result,
        });
    } catch (e) {
        console.error(e);
        return res.send({
            status: '500',
            message: 'Internal Server Error',
        });
    }
};



// Mark reminder as seen
let markAsSeen = async (req, res) => {
    const { id } = req.body;

    try {
        const result = await db.update('reminder', {
            fields: { seen: true },
            conditions: [['id', '=', id], ['owner', '=', req.user.id]],
        });

        return res.send({
            status: '200',
            message: 'Reminder marked as seen.',
            data: result,
        });
    } catch (e) {
        console.error(e);
        return res.send({
            status: '500',
            message: 'Internal Server Error',
        });
    }
};

// Routes
let remove = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await db.delete2('reminder', {
            conditions: [['id', '=', id], ['owner', '=', req.user.id]],
        });

        return res.send({
            status: '200',
            message: 'Reminder removed successfully.',
            data: result,
        });
    } catch (e) {
        console.error(e);
        return res.send({
            status: '500',
            message: 'Internal Server Error',
        });
    }
};

router.get('/get', auth.validate, getReminders);
router.post('/add', auth.validate, addReminder);
router.post('/seen', auth.validate, markAsSeen);
router.post('/update', auth.validate, updateReminder);
router.post('/remove', auth.validate, remove);

exports.router = router;