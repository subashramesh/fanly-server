const db = require('../service/postgres.js');

exports.project = async (req, res) => {
    let project = req.body;
    let template = project.template;
    var category;
    if(project.category) {
        category = project.category.id || project.category;
    }
    if(template.category) {
        category = template.category.id || template.category;
    }
    try {
        let payload = {
            id: project.id,
            name: project.name,
            code: project.code,
            data: project.data,
            template: template.id || template,
            category: category,
            updated_at: new Date()
        }
        if(req.update) {
            const result = await db.update('project', {
                fields: payload,
                conditions: [
                    ['id', '=', project.id]
                ]
            });
            res.status(200).json({
                status: '200',
                message: 'Success',
                data: project
            });
            return;
        }
        delete payload['id']
        const result = await db.insert('project', payload, 'id');

        if(result.length == 0) {
            res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
            });
            return;
        } else {
            
            project.id = result[0].id;
            let types = project.types;
            let statuses = project.statuses;

            

            for(let i = 0; i < types.length; i++) {
                let type = types[i];
                if(type.id && req.update) {
                    type.updated_at = new Date();
                    await db.update('task_type', {
                        fields: type,
                        conditions: [
                            ['id', '=', type.id]
                        ]
                    });
                } else {
                    delete type['id']
                    delete type['created_at']
                    // type.project = project.id;s
                    const result = await db.insert('task_type', type, 'id');
                    type.id = result[0].id;
                }
                try {
                    await db.insert('project_task_type', {
                        project: project.id,
                        task_type: type.id,
                        order: i
                    }, 'id');
                } catch (error) {
                    console.log(error); 
                    await db.update('project_task_type',{
                        fields: {
                            order: i
                        },
                        conditions: [
                            ['project', '=', project.id],
                            ['task_type', '=', type.id]
                        ]
                    });
                }
            }

            for(let i = 0; i < statuses.length; i++) {
                let status = statuses[i];
                if(status.id && req.update) {
                    status.updated_at = new Date();
                    await db.update('status', {
                        fields: status,
                        conditions: [
                            ['id', '=', status.id]
                        ]
                    });
                } else {
                    delete status['id']
                    delete status['created_at']
                    // status.project = project.id;
                    const result = await db.insert('status', status, 'id');
                    status.id = result[0].id;
                }
                try {
                    await db.insert('project_status', {
                        project: project.id,
                        status: status.id,
                        order: i
                    }, 'id');
                } catch (error) {
                    console.log(error);
                    await db.update('project_status',{
                        fields: {
                            order: i
                        },
                        conditions: [
                            ['project', '=', project.id],
                            ['status', '=', status.id]
                        ]
                    });
                }
            }
            
            res.status(200).json({
                status: '200',
                message: 'Success',
                data: project
            });
        }

        
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getProjects = async (req, res) => {
    try {
        let result = await db.select('project_view', {
            fields: ['*'],
            conditions: []
        });
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: result
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });

    }
}

exports.getMembers = async (req, res) => {
    try {
        let result = await db.select('account', {
            fields: ['*'],
            conditions: []
        });
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: result
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });

    }
}

exports.comment = async (req, res) => {
    let comment = req.body;
    try {
        let payload = {
            id: comment.id,
            text: comment.text,
            data: comment.data,
            task: comment.task,
            owner: req.user.id,
            updated_at: new Date()
        }
        if(req.update) {
            const result = await db.update('comment', {
                fields: payload,
                conditions: [
                    ['id', '=', comment.id]
                ]
            });
            res.status(200).json({
                status: '200',
                message: 'Success',
                data: comment
            });
            return;
        }
        delete payload['id']
        const result = await db.insert('comment', payload, 'id');

        if(result.length == 0) {
            res.status(500).json({
                status: '500',
                message: 'Internal Server Error'
            });
            return;
        } else {
            comment.id = result[0].id;
            res.status(200).json({
                status: '200',
                message: 'Success',
                data: comment
            });
        }

        
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getComments = async (req, res) => {
    try {
        let result = await db.select('comment_view', {
            fields: ['*'],
            conditions: [
                ['task', '=', req.params.id]
            ]
        });
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: result
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.task = async (req, res) => {
    let task = req.body;

    try {
        let payload = {
            id: task.id,
            name: task.name,
            data: task.data,
            project: task.project,
            priority: task.priority,
            type: task.type.id || task.type,
            status: task.status.id || task.status,
            updated_at: new Date(),
            owner: task.owner,
            site: task.site,
        }
        if(req.update) {
            const result = await db.update('task', {
                fields: payload,
                conditions: [
                    ['id', '=', task.id]
                ]
            });
            res.status(200).json({
                status: '200',
                message: 'Success',
                data: task
            });
            return;
        } else {
            delete payload['id']
            const result = await db.insert('task', payload, 'id');
            if(result.length == 0) {
                res.status(500).json({
                    status: '500',
                    message: 'Internal Server Error'
                });
                return;
            } else {
                task.id = result[0].id;
                // res.status(200).json({
                //     status: '200',
                //     message: 'Success',
                //     data: task
                // });
            }
        }
        let reporters = task.reporters;
        let assignees = task.assignees;

        for(let i = 0; i < reporters.length; i++) {
            let reporter = reporters[i];
            let payload = {
                task: task.id,
                reporter: reporter.id,
            }
            if(reporter.id && req.update) {
                await db.update('task_reporter', {
                    fields: payload,
                    conditions: [
                        ['task', '=', payload.task],
                        ['reporter', '=', payload.reporter]
                    ]
                });
            } else {
                reporter.task = task.id;
                const result = await db.insert('task_reporter', payload, 'id');
                reporter.id = result[0].id;
            }
        }
        for(let i = 0; i < assignees.length; i++) {
            let assignee = assignees[i];
            let payload = {
                task: task.id,
                assignee: assignee.id,
            }
            if(assignee.id && req.update) {
                await db.update('task_assignee', {
                    fields: payload,
                    conditions: [
                        ['task', '=', payload.task],
                        ['assignee', '=', payload.assignee]
                    ]
                });
            } else {
                assignee.task = task.id;
                const result = await db.insert('task_assignee', payload, 'id');
                assignee.id = result[0].id;
            }
        }
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: task
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error ' + e.message,
            error: e.message
        });
    }
}

exports.getTasks = async (req, res) => {
    try {
        let result = await db.select('task_view', {
            fields: ['*'],
            conditions: [
                ['project', '=', req.params.id]
            ]
        });
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: result
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error',
            error: e.message
        });

    }
}

exports.category = async (req, res) => {
    let category = req.body;
    try {
        if(req.update) {
            const result = await db.update('project_category', {
                fields: category,
                conditions: [
                    ['id', '=', category.id]
                ]
            });
            res.status(200).json({
                status: '200',
                message: 'Success',
                data: category
            });
            return;
        }
        const result = await db.insert('project_category', category, 'id');
        category.id = result[0].id;
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: category
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.template = async (req, res) => {
    let template = req.body;
    console.log(template);
    try {
        let templatePayload = {
            id: template.id,
            name: template.name,
            data: template.data,
            category: template.category.id,
            created_at: template.created_at,
            updated_at: new Date()
        }
        if(req.update) {
            await db.update('project_template',  {
                fields: templatePayload,
                conditions: [
                    ['id', '=', template.id]
                ]
            });
        } else {
            delete templatePayload['id']
            const result = await db.insert('project_template', templatePayload, 'id');
            template.id = result[0].id;
        }

        let statuses = req.body.statuses;
        let task_types = req.body.types;
        console.log(task_types);

        for(let i = 0; i < task_types.length; i++) {
            let task_type = task_types[i];
            if(task_type.id) {
                task_type.updated_at = new Date();
                delete task_type['reference']
                await db.update('template_task_type', {
                    fields: task_type,
                    conditions: [
                        ['id', '=', task_type.id]
                    ]
                });
            } else {
                delete task_type['id']
                delete task_type['created_at']
                delete task_type['reference']
                // task_type.template = template.id;
                const result = await db.insert('template_task_type', task_type, 'id');
                task_type.id = result[0].id;
            }
            try {
                await db.insert('project_template_task_type', {
                    template: template.id,
                    task_type: task_type.id,
                    order: i
                }, 'id');
            } catch (error) {
                console.log(error); 
                await db.update('project_template_task_type',{
                    fields: {
                        order: i
                    },
                    conditions: [
                        ['template', '=', template.id],
                        ['task_type', '=', task_type.id]
                    ]
                });
            }

        }

        for(let i = 0; i < statuses.length; i++) {
            let status = statuses[i];
            if(status.id) {
                status.updated_at = new Date();
                delete status['reference']
                await db.update('template_status', {
                    fields: status,
                    conditions: [
                        ['id', '=', status.id]
                    ]
                });
            } else {
                delete status['id']
                delete status['created_at']
                delete status['reference']
                // status.template = template.id;
                const result = await db.insert('template_status', status, 'id');
                status.id = result[0].id;
            }
            try {
                await db.insert('project_template_status', {
                    template: template.id,
                    status: status.id,
                    order: i
                }, 'id');
            } catch (error) {
                await db.update('project_template_status',{
                    fields: {
                        order: i
                    },
                    conditions: [
                        ['template', '=', template.id],
                        ['status', '=', status.id]
                    ]
                });
            }
        }

        res.status(200).json({
            status: '200',
            message: 'Success',
            data: template
        });
        
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getCategories = async (req, res) => {
    try {
        const result = await db.select('project_category');
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: result
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.getTemplates = async (req, res) => {
    let category = req.query.category;
    try {
        let query = [];
        if(category) {
            query.push(['category_id', '=', category])
        }
        const result = await db.select('project_template_view', {
            conditions: query
        });
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: result
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

exports.deleteTemplate = async (req, res) => {
    let template = {
        id: req.params.id
    };
    try {
        await db.delete2('project_template', {
            conditions: [
                ['id', '=', template.id]
            ]
        });
        res.status(200).json({
            status: '200',
            message: 'Success',
            data: template
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}