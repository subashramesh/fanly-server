 SELECT t.id,
    t.name,
    t.code,
    t.data,
    t.updated_at,
    t.category AS category_id,
    t.owner,
    t.site,
    json_build_object('id', c.id, 'name', c.name) AS category,
    COALESCE(( SELECT json_agg(json_build_object('id', s.id, 'name', s.name, 'data', s.data)) AS json_agg
           FROM status s
             JOIN project_status r ON s.id = r.status
          WHERE r.project = t.id), '[]'::json) AS statuses,
    COALESCE(( SELECT json_agg(json_build_object('id', s.id, 'name', s.name, 'data', s.data)) AS json_agg
           FROM task_type s
             JOIN project_task_type r ON s.id = r.task_type
          WHERE r.project = t.id), '[]'::json) AS types
   FROM project t
     LEFT JOIN project_category c ON t.category = c.id;