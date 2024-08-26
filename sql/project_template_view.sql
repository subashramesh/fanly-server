select 
t.id, t.name, t.data, t.updated_at, t.category as category_id, t.owner,
json_build_object('id', c.id, 'name', c.name) as category,
COALESCE((
       SELECT json_agg(json_build_object(
		   'id', s.id, 
		   'name', s.name,
		   'data', s.data
	   )
	)
       FROM template_status s join project_template_status r on s.id = r.status where r.template = t.id
    ), '[]'::json) statues,
COALESCE((
       SELECT json_agg(json_build_object(
		   'id', s.id, 
		   'name', s.name,
		   'data', s.data
	   )
	)
       FROM template_task_type s join project_template_task_type r on s.id = r.task_type where r.template = t.id
    ), '[]'::json) types 
from project_template t left join project_category c on t.category = c.id;