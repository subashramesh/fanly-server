 SELECT t.id,
    t.name,
    t.code,
    t.data,
    t.updated_at,
    t.created_at,
    t.owner,
    t.site,
    COALESCE(( SELECT json_agg(json_build_object(
		'id', s.id,
		'fname', s.fname,
		'data', s.data,
		'lname', s.lname,
		'phone', s.phone,
		'code', s.code,
		'type', s.type,
		'mail', s.mail)) AS json_agg
           FROM account s
             JOIN team_account r ON s.id = r.account
          WHERE r.team = t.id), '[]'::json) AS members
   FROM team t;


BEGIN
    RETURN QUERY
        SELECT
            p.variant,
            p.group,
            p.id,
            im_interested(p1, p.id) as im_interested,
            get_interests_count(p.id) as interests,
            im_saved(p1, p.id) as im_saved,
            im_liking(p1, p.id) as im_liking,
            im_comment(p1, p.id) as im_comment,
            get_comments_count(p.id) as comments,
            get_likes_count(p.id) as likes,
            get_views_count(p.id) as views,
            get_user(p1, p.owner) as "user",
            p.owner,
            p.created_at,
            p.hashtags,
            p.metadata,
            (
                SELECT json_agg(row_to_json(m))
                FROM media m
                WHERE m.post = p.id
            ) as media,
            p.privacies as privacies,
            p.type,
            (
                SELECT json_agg(a)
                FROM account a
                WHERE a.id = ANY(p.collabs)
            ) as collabs,
            (
                SELECT json_agg(a)
                FROM account a
                WHERE a.id = ANY(p.tags)
            ) as tags
        FROM post p
        WHERE NOT EXISTS (
            SELECT *
            FROM view
            WHERE view.post = p.id AND view.owner = p1
        ) AND (p.state != 2) AND (p.owner = ANY(p4))
        ORDER BY created_at DESC
        LIMIT p2
        OFFSET p3;
END;
