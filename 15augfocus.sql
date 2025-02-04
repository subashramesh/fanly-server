PGDMP                          {            focus    14.7    15.3 o    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    18193    focus    DATABASE     p   CREATE DATABASE focus WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF8';
    DROP DATABASE focus;
                postgres    false                        2615    2200    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                cloudsqlsuperuser    false            �           0    0    SCHEMA public    ACL     Q   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;
                   cloudsqlsuperuser    false    5            �           0    0 4   FUNCTION pg_replication_origin_advance(text, pg_lsn)    ACL     c   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_advance(text, pg_lsn) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    245            �           0    0 +   FUNCTION pg_replication_origin_create(text)    ACL     Z   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_create(text) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    233            �           0    0 )   FUNCTION pg_replication_origin_drop(text)    ACL     X   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_drop(text) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    234            �           0    0 (   FUNCTION pg_replication_origin_oid(text)    ACL     W   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_oid(text) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    235            �           0    0 6   FUNCTION pg_replication_origin_progress(text, boolean)    ACL     e   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_progress(text, boolean) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    236            �           0    0 1   FUNCTION pg_replication_origin_session_is_setup()    ACL     `   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_is_setup() TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    237            �           0    0 8   FUNCTION pg_replication_origin_session_progress(boolean)    ACL     g   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_progress(boolean) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    246            �           0    0 .   FUNCTION pg_replication_origin_session_reset()    ACL     ]   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_reset() TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    238            �           0    0 2   FUNCTION pg_replication_origin_session_setup(text)    ACL     a   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_setup(text) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    239            �           0    0 +   FUNCTION pg_replication_origin_xact_reset()    ACL     Z   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_xact_reset() TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    240            �           0    0 K   FUNCTION pg_replication_origin_xact_setup(pg_lsn, timestamp with time zone)    ACL     z   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_xact_setup(pg_lsn, timestamp with time zone) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    241            �           0    0    FUNCTION pg_show_replication_origin_status(OUT local_id oid, OUT external_id text, OUT remote_lsn pg_lsn, OUT local_lsn pg_lsn)    ACL     �   GRANT ALL ON FUNCTION pg_catalog.pg_show_replication_origin_status(OUT local_id oid, OUT external_id text, OUT remote_lsn pg_lsn, OUT local_lsn pg_lsn) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    247                        1255    18294    get_convo_list(text)    FUNCTION       CREATE FUNCTION public.get_convo_list(p1 text) RETURNS TABLE(id bigint, sender text, data jsonb, text text, updated_at timestamp with time zone, created_at timestamp with time zone, receiver text, type smallint, "group" bigint, parent bigint, box character varying, delivers json, reads json)
    LANGUAGE plpgsql
    AS $$
begin

	return query 
		SELECT DISTINCT ON (t.box)
       t.id, t.sender, t.data, t.text, t.updated_at, t.created_at, t.receiver, t.type, t."group", t.parent, t.box,
	   (SELECT json_agg(row_to_json(m)) FROM thread_deliver m WHERE m.thread = t.id) as delivers,
	  (SELECT json_agg(row_to_json(m)) FROM thread_read m WHERE m.thread = t.id) as "reads"
FROM public.thread t where t.sender = p1 or t.receiver = p1
ORDER BY box, created_at DESC;
end;
$$;
 .   DROP FUNCTION public.get_convo_list(p1 text);
       public          postgres    false    5                       1255    18351    get_groups(text)    FUNCTION     	  CREATE FUNCTION public.get_groups(p1 text) RETURNS TABLE(id bigint, name text, created_at timestamp with time zone, updated_at timestamp with time zone, data jsonb, owner character varying, room character varying, members json, admins json)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.id AS id,
        g.name AS name,
        g.created_at,
        g.updated_at,
        g.data AS data,
        g.owner AS owner,
        g.room AS room,
        (SELECT json_agg(row_to_json(m)) FROM group_member m WHERE m.group = g.id) AS members,
        (SELECT json_agg(row_to_json(a)) FROM group_admin a WHERE a.group = g.id) AS admins
    FROM
        group_member m
    LEFT JOIN
        "group" g ON g.id = m.group
    WHERE
        m.user = p1;
END;
$$;
 *   DROP FUNCTION public.get_groups(p1 text);
       public          postgres    false    5                       1255    18322 5   get_threads(text, timestamp with time zone, bigint[])    FUNCTION     �  CREATE FUNCTION public.get_threads(p1 text, p2 timestamp with time zone, p3 bigint[]) RETURNS TABLE(id bigint, sender text, data jsonb, text text, updated_at timestamp with time zone, created_at timestamp with time zone, receiver text, type smallint, "group" bigint, parent bigint, box character varying, delivers json, reads json, reactions json)
    LANGUAGE plpgsql
    AS $$
begin

	return query 
		SELECT
       t.id, t.sender, t.data, t.text, t.updated_at, t.created_at,
	   t.receiver, t.type, t."group", t.parent, t.box,
	  (SELECT json_agg(row_to_json(m)) FROM thread_deliver m WHERE m.thread = t.id) as delivers,
	  (SELECT json_agg(row_to_json(m)) FROM thread_read m WHERE m.thread = t.id) as "reads",
	  (SELECT json_agg(row_to_json(m)) FROM reaction m WHERE m.thread = t.id) as "reactions"
FROM public.thread t where (t.sender = p1 or t.receiver = p1 or t.group = ANY(p3)) and t.updated_at > p2
ORDER BY created_at ASC;
end;
$$;
 U   DROP FUNCTION public.get_threads(p1 text, p2 timestamp with time zone, p3 bigint[]);
       public          postgres    false    5            �            1259    18324    call    TABLE     �   CREATE TABLE public.call (
    id bigint NOT NULL,
    caller character varying,
    receiver character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    "group" bigint,
    type smallint
);
    DROP TABLE public.call;
       public         heap    postgres    false    5            �            1259    18335 
   call_event    TABLE     �   CREATE TABLE public.call_event (
    id bigint NOT NULL,
    type smallint,
    created_at timestamp with time zone DEFAULT now(),
    "user" character varying,
    call bigint,
    data jsonb
);
    DROP TABLE public.call_event;
       public         heap    postgres    false    5            �            1259    18334    call_event_id_seq    SEQUENCE     z   CREATE SEQUENCE public.call_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.call_event_id_seq;
       public          postgres    false    230    5            �           0    0    call_event_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.call_event_id_seq OWNED BY public.call_event.id;
          public          postgres    false    229            �            1259    18323    call_id_seq    SEQUENCE     t   CREATE SEQUENCE public.call_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.call_id_seq;
       public          postgres    false    5    228            �           0    0    call_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.call_id_seq OWNED BY public.call.id;
          public          postgres    false    227            �            1259    18306    fcm    TABLE     �   CREATE TABLE public.fcm (
    id bigint NOT NULL,
    token text,
    "user" character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);
    DROP TABLE public.fcm;
       public         heap    postgres    false    5            �            1259    18305 
   fcm_id_seq    SEQUENCE     s   CREATE SEQUENCE public.fcm_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 !   DROP SEQUENCE public.fcm_id_seq;
       public          postgres    false    5    226            �           0    0 
   fcm_id_seq    SEQUENCE OWNED BY     9   ALTER SEQUENCE public.fcm_id_seq OWNED BY public.fcm.id;
          public          postgres    false    225            �            1259    18215    group    TABLE     �   CREATE TABLE public."group" (
    id bigint NOT NULL,
    name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    data jsonb,
    owner character varying,
    room character varying
);
    DROP TABLE public."group";
       public         heap    postgres    false    5            �            1259    18235    group_admin    TABLE     �   CREATE TABLE public.group_admin (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    "group" bigint,
    "user" text
);
    DROP TABLE public.group_admin;
       public         heap    postgres    false    5            �            1259    18234    group_admin_id_seq    SEQUENCE     {   CREATE SEQUENCE public.group_admin_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.group_admin_id_seq;
       public          postgres    false    218    5            �           0    0    group_admin_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.group_admin_id_seq OWNED BY public.group_admin.id;
          public          postgres    false    217            �            1259    18255    group_event    TABLE     �   CREATE TABLE public.group_event (
    id bigint NOT NULL,
    data jsonb,
    "group" bigint,
    created_at timestamp with time zone DEFAULT now(),
    type smallint,
    "user" text
);
    DROP TABLE public.group_event;
       public         heap    postgres    false    5            �            1259    18254    group_event_id_seq    SEQUENCE     {   CREATE SEQUENCE public.group_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.group_event_id_seq;
       public          postgres    false    222    5            �           0    0    group_event_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.group_event_id_seq OWNED BY public.group_event.id;
          public          postgres    false    221            �            1259    18214    group_id_seq    SEQUENCE     u   CREATE SEQUENCE public.group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.group_id_seq;
       public          postgres    false    214    5            �           0    0    group_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.group_id_seq OWNED BY public."group".id;
          public          postgres    false    213            �            1259    18225    group_member    TABLE     �   CREATE TABLE public.group_member (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    "group" bigint,
    "user" text
);
     DROP TABLE public.group_member;
       public         heap    postgres    false    5            �            1259    18224    group_member_id_seq    SEQUENCE     |   CREATE SEQUENCE public.group_member_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.group_member_id_seq;
       public          postgres    false    216    5            �           0    0    group_member_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.group_member_id_seq OWNED BY public.group_member.id;
          public          postgres    false    215            �            1259    18354    group_request    TABLE     �   CREATE TABLE public.group_request (
    id bigint NOT NULL,
    "group" bigint,
    "user" character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    status smallint
);
 !   DROP TABLE public.group_request;
       public         heap    postgres    false    5            �            1259    18353    group_request_id_seq    SEQUENCE     }   CREATE SEQUENCE public.group_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.group_request_id_seq;
       public          postgres    false    232    5            �           0    0    group_request_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.group_request_id_seq OWNED BY public.group_request.id;
          public          postgres    false    231            �            1259    18205    reaction    TABLE     �   CREATE TABLE public.reaction (
    id bigint NOT NULL,
    thread bigint,
    text text,
    type smallint,
    created_at timestamp with time zone DEFAULT now(),
    sender text
);
    DROP TABLE public.reaction;
       public         heap    postgres    false    5            �            1259    18204    reaction_id_seq    SEQUENCE     x   CREATE SEQUENCE public.reaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.reaction_id_seq;
       public          postgres    false    5    212            �           0    0    reaction_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.reaction_id_seq OWNED BY public.reaction.id;
          public          postgres    false    211            �            1259    18195    thread    TABLE     /  CREATE TABLE public.thread (
    id bigint NOT NULL,
    sender text,
    data jsonb,
    text text,
    updated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    receiver text,
    type smallint,
    "group" bigint,
    parent bigint,
    box character varying
);
    DROP TABLE public.thread;
       public         heap    postgres    false    5            �            1259    18277    thread_deliver    TABLE     �   CREATE TABLE public.thread_deliver (
    id bigint NOT NULL,
    thread bigint,
    "user" text,
    created_at timestamp with time zone DEFAULT now()
);
 "   DROP TABLE public.thread_deliver;
       public         heap    postgres    false    5            �            1259    18276    thread_deliver_id_seq    SEQUENCE     ~   CREATE SEQUENCE public.thread_deliver_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.thread_deliver_id_seq;
       public          postgres    false    224    5            �           0    0    thread_deliver_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.thread_deliver_id_seq OWNED BY public.thread_deliver.id;
          public          postgres    false    223            �            1259    18194    thread_id_seq    SEQUENCE     v   CREATE SEQUENCE public.thread_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.thread_id_seq;
       public          postgres    false    210    5                        0    0    thread_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.thread_id_seq OWNED BY public.thread.id;
          public          postgres    false    209            �            1259    18245    thread_read    TABLE     �   CREATE TABLE public.thread_read (
    id bigint NOT NULL,
    thread bigint,
    "user" text,
    created_at timestamp with time zone DEFAULT now()
);
    DROP TABLE public.thread_read;
       public         heap    postgres    false    5            �            1259    18244    thread_read_id_seq    SEQUENCE     {   CREATE SEQUENCE public.thread_read_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.thread_read_id_seq;
       public          postgres    false    5    220                       0    0    thread_read_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.thread_read_id_seq OWNED BY public.thread_read.id;
          public          postgres    false    219                       2604    18327    call id    DEFAULT     b   ALTER TABLE ONLY public.call ALTER COLUMN id SET DEFAULT nextval('public.call_id_seq'::regclass);
 6   ALTER TABLE public.call ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    227    228    228                       2604    18338    call_event id    DEFAULT     n   ALTER TABLE ONLY public.call_event ALTER COLUMN id SET DEFAULT nextval('public.call_event_id_seq'::regclass);
 <   ALTER TABLE public.call_event ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    230    229    230                       2604    18309    fcm id    DEFAULT     `   ALTER TABLE ONLY public.fcm ALTER COLUMN id SET DEFAULT nextval('public.fcm_id_seq'::regclass);
 5   ALTER TABLE public.fcm ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    225    226    226            
           2604    18218    group id    DEFAULT     f   ALTER TABLE ONLY public."group" ALTER COLUMN id SET DEFAULT nextval('public.group_id_seq'::regclass);
 9   ALTER TABLE public."group" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    214    213    214                       2604    18238    group_admin id    DEFAULT     p   ALTER TABLE ONLY public.group_admin ALTER COLUMN id SET DEFAULT nextval('public.group_admin_id_seq'::regclass);
 =   ALTER TABLE public.group_admin ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    217    218    218                       2604    18258    group_event id    DEFAULT     p   ALTER TABLE ONLY public.group_event ALTER COLUMN id SET DEFAULT nextval('public.group_event_id_seq'::regclass);
 =   ALTER TABLE public.group_event ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    222    221    222                       2604    18228    group_member id    DEFAULT     r   ALTER TABLE ONLY public.group_member ALTER COLUMN id SET DEFAULT nextval('public.group_member_id_seq'::regclass);
 >   ALTER TABLE public.group_member ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    215    216                       2604    18357    group_request id    DEFAULT     t   ALTER TABLE ONLY public.group_request ALTER COLUMN id SET DEFAULT nextval('public.group_request_id_seq'::regclass);
 ?   ALTER TABLE public.group_request ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    231    232    232                       2604    18208    reaction id    DEFAULT     j   ALTER TABLE ONLY public.reaction ALTER COLUMN id SET DEFAULT nextval('public.reaction_id_seq'::regclass);
 :   ALTER TABLE public.reaction ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    211    212    212                       2604    18198 	   thread id    DEFAULT     f   ALTER TABLE ONLY public.thread ALTER COLUMN id SET DEFAULT nextval('public.thread_id_seq'::regclass);
 8   ALTER TABLE public.thread ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    209    210    210                       2604    18280    thread_deliver id    DEFAULT     v   ALTER TABLE ONLY public.thread_deliver ALTER COLUMN id SET DEFAULT nextval('public.thread_deliver_id_seq'::regclass);
 @   ALTER TABLE public.thread_deliver ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    224    223    224                       2604    18248    thread_read id    DEFAULT     p   ALTER TABLE ONLY public.thread_read ALTER COLUMN id SET DEFAULT nextval('public.thread_read_id_seq'::regclass);
 =   ALTER TABLE public.thread_read ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    219    220    220            �          0    18324    call 
   TABLE DATA           [   COPY public.call (id, caller, receiver, created_at, updated_at, "group", type) FROM stdin;
    public          postgres    false    228   9�       �          0    18335 
   call_event 
   TABLE DATA           N   COPY public.call_event (id, type, created_at, "user", call, data) FROM stdin;
    public          postgres    false    230   r�       �          0    18306    fcm 
   TABLE DATA           H   COPY public.fcm (id, token, "user", created_at, updated_at) FROM stdin;
    public          postgres    false    226   �       �          0    18215    group 
   TABLE DATA           V   COPY public."group" (id, name, created_at, updated_at, data, owner, room) FROM stdin;
    public          postgres    false    214   P�       �          0    18235    group_admin 
   TABLE DATA           F   COPY public.group_admin (id, created_at, "group", "user") FROM stdin;
    public          postgres    false    218   �       �          0    18255    group_event 
   TABLE DATA           R   COPY public.group_event (id, data, "group", created_at, type, "user") FROM stdin;
    public          postgres    false    222   5�       �          0    18225    group_member 
   TABLE DATA           G   COPY public.group_member (id, created_at, "group", "user") FROM stdin;
    public          postgres    false    216   R�       �          0    18354    group_request 
   TABLE DATA           \   COPY public.group_request (id, "group", "user", created_at, updated_at, status) FROM stdin;
    public          postgres    false    232   z�       �          0    18205    reaction 
   TABLE DATA           N   COPY public.reaction (id, thread, text, type, created_at, sender) FROM stdin;
    public          postgres    false    212   ��       �          0    18195    thread 
   TABLE DATA           v   COPY public.thread (id, sender, data, text, updated_at, created_at, receiver, type, "group", parent, box) FROM stdin;
    public          postgres    false    210   /�       �          0    18277    thread_deliver 
   TABLE DATA           H   COPY public.thread_deliver (id, thread, "user", created_at) FROM stdin;
    public          postgres    false    224   ��       �          0    18245    thread_read 
   TABLE DATA           E   COPY public.thread_read (id, thread, "user", created_at) FROM stdin;
    public          postgres    false    220   ��                  0    0    call_event_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.call_event_id_seq', 95, true);
          public          postgres    false    229                       0    0    call_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.call_id_seq', 198, true);
          public          postgres    false    227                       0    0 
   fcm_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.fcm_id_seq', 359, true);
          public          postgres    false    225                       0    0    group_admin_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.group_admin_id_seq', 115, true);
          public          postgres    false    217                       0    0    group_event_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.group_event_id_seq', 1, false);
          public          postgres    false    221                       0    0    group_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.group_id_seq', 112, true);
          public          postgres    false    213                       0    0    group_member_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.group_member_id_seq', 162, true);
          public          postgres    false    215            	           0    0    group_request_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.group_request_id_seq', 91, true);
          public          postgres    false    231            
           0    0    reaction_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.reaction_id_seq', 136, true);
          public          postgres    false    211                       0    0    thread_deliver_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.thread_deliver_id_seq', 312, true);
          public          postgres    false    223                       0    0    thread_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.thread_id_seq', 343, true);
          public          postgres    false    209                       0    0    thread_read_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.thread_read_id_seq', 250, true);
          public          postgres    false    219            ;           2606    18343    call_event call_event_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.call_event
    ADD CONSTRAINT call_event_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.call_event DROP CONSTRAINT call_event_pkey;
       public            postgres    false    230            9           2606    18332    call call_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.call
    ADD CONSTRAINT call_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.call DROP CONSTRAINT call_pkey;
       public            postgres    false    228            5           2606    18314    fcm fcm_pkey 
   CONSTRAINT     J   ALTER TABLE ONLY public.fcm
    ADD CONSTRAINT fcm_pkey PRIMARY KEY (id);
 6   ALTER TABLE ONLY public.fcm DROP CONSTRAINT fcm_pkey;
       public            postgres    false    226            7           2606    18316    fcm fcm_token_user_key 
   CONSTRAINT     Z   ALTER TABLE ONLY public.fcm
    ADD CONSTRAINT fcm_token_user_key UNIQUE (token, "user");
 @   ALTER TABLE ONLY public.fcm DROP CONSTRAINT fcm_token_user_key;
       public            postgres    false    226    226            )           2606    18243    group_admin group_admin_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.group_admin
    ADD CONSTRAINT group_admin_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.group_admin DROP CONSTRAINT group_admin_pkey;
       public            postgres    false    218            /           2606    18263    group_event group_event_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.group_event
    ADD CONSTRAINT group_event_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.group_event DROP CONSTRAINT group_event_pkey;
       public            postgres    false    222            '           2606    18233    group_member group_member_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.group_member
    ADD CONSTRAINT group_member_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.group_member DROP CONSTRAINT group_member_pkey;
       public            postgres    false    216            %           2606    18223    group group_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public."group"
    ADD CONSTRAINT group_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public."group" DROP CONSTRAINT group_pkey;
       public            postgres    false    214            =           2606    18362     group_request group_request_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.group_request
    ADD CONSTRAINT group_request_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.group_request DROP CONSTRAINT group_request_pkey;
       public            postgres    false    232            !           2606    18213    reaction reaction_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.reaction DROP CONSTRAINT reaction_pkey;
       public            postgres    false    212            #           2606    18318 #   reaction reaction_thread_sender_key 
   CONSTRAINT     h   ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_thread_sender_key UNIQUE (thread, sender);
 M   ALTER TABLE ONLY public.reaction DROP CONSTRAINT reaction_thread_sender_key;
       public            postgres    false    212    212            1           2606    18285 "   thread_deliver thread_deliver_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.thread_deliver
    ADD CONSTRAINT thread_deliver_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.thread_deliver DROP CONSTRAINT thread_deliver_pkey;
       public            postgres    false    224            3           2606    18299 -   thread_deliver thread_deliver_thread_user_key 
   CONSTRAINT     r   ALTER TABLE ONLY public.thread_deliver
    ADD CONSTRAINT thread_deliver_thread_user_key UNIQUE (thread, "user");
 W   ALTER TABLE ONLY public.thread_deliver DROP CONSTRAINT thread_deliver_thread_user_key;
       public            postgres    false    224    224                       2606    18203    thread thread_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.thread
    ADD CONSTRAINT thread_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.thread DROP CONSTRAINT thread_pkey;
       public            postgres    false    210            +           2606    18253    thread_read thread_read_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.thread_read
    ADD CONSTRAINT thread_read_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.thread_read DROP CONSTRAINT thread_read_pkey;
       public            postgres    false    220            -           2606    18297 '   thread_read thread_read_thread_user_key 
   CONSTRAINT     l   ALTER TABLE ONLY public.thread_read
    ADD CONSTRAINT thread_read_thread_user_key UNIQUE (thread, "user");
 Q   ALTER TABLE ONLY public.thread_read DROP CONSTRAINT thread_read_thread_user_key;
       public            postgres    false    220    220            ?           2606    18286 )   thread_deliver thread_deliver_thread_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.thread_deliver
    ADD CONSTRAINT thread_deliver_thread_fkey FOREIGN KEY (thread) REFERENCES public.thread(id);
 S   ALTER TABLE ONLY public.thread_deliver DROP CONSTRAINT thread_deliver_thread_fkey;
       public          postgres    false    210    224    3871            >           2606    18271 #   thread_read thread_read_thread_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.thread_read
    ADD CONSTRAINT thread_read_thread_fkey FOREIGN KEY (thread) REFERENCES public.thread(id) NOT VALID;
 M   ALTER TABLE ONLY public.thread_read DROP CONSTRAINT thread_read_thread_fkey;
       public          postgres    false    220    3871    210            �   )	  x���M�����)�1�%	bN0�?�KP��	�1^���B�(�%J��������?��j��h�#��=���Z�W��p�Z�/�1Ӈ�˝��fg�l�[O��[Y{_��>��v)�^�~Bد֩�-�8�O{�\�u��t���k_߇駣T�A=�wb~a�G���E#�#'F�eD-���������ؑ��5�&+�'�n�'�L;�nd�T:sy�~�"�5j��⇬ �/v�RG��!v�����.�7FhV�Ϝf<-��5.r��<�z�%��,��jA��Z�)6*�t����c$�C��������ㅯ�=T/!�ʝ�L�[�(�969&�ۗ7m�|�8>#8�6D�J�(9���>F_ۄ�Ob��􉝖L��E<Z�W�i�d�.��KN�NK�pj	w<����#��5���P��drJ�V���s�a~E05]���r���֤����� [3�Nj. `W���y��4x1|�:��4i;)��$��)������Ce���8��NJ29TM����̏�4����J�y�T�o �gM1�Y���n�zy�qdFVu�Ziv�p������񳊸��
e->n�#`ps�����
�:)k�l�Sy���dk,|� `�Y\pek��$!���k]�V��S^L�@�^�S�'㗒X�?9�ɹ_cA�{�	� zE�͢�$db얕��N�D�F(3�u�t�$#��}Rʌp��ɥDt�r�mJN��
/��v3�d�!l�KOFdrh��l�ڭo3Yz�	U&.�?g8tC����	����n���:mQ5�-8Fi�}'��t`�ZmA߉�d��{a��H*"��N��ɍl�����~ ���Es	{������_N��Ը��";}'���"�U��.9��L`䂍�D%n"�������a�׉�.3��v!�>��w���j_z1��.3��)�t�1���q��DK�(��j̸�
0i�5����;���X�#!MV�;���y�`A&�5'�Ζ�9��(1��O�ц`�[�5�M><X/�Qkk,b��D�q�^�+�>���NDd\�]ys�%�N��W��țC[�91���ܐNY/Ȧњ��eE��_�k�C��<��������Bl2��<�A��}Q�oG�jY�ĘX�w35Ɨ�~�0��m��J�}�վ7���\��Ƀ����C¤_�]�*�fѨ�(/�{4_fjT�{h6��DewE��,}䣉�OPY]�Q;FB�-���m!�3ز��95egp��{X�~l_�(�vEW,�P:ACj��� 9��w��83�t��BO��sd�	D�%&l?q�1O��}��L�Cz}�s� �-r�4w~�T�O��m ��J�Ϲ�gJzo�z�;Q⮤�C�g�yC=!�T�E���~U^�O>��7�sO٬�n�Z�~B#����@~H��T���i���o�y�R��im�Q��F�(���hR�,�,���b YNY2A�
�>����ޠ��Q���ȏn�Ӯ'ޛ��󆦅SU�����Bxp]V�~ڔ4�
�qٌ�~z����bEj�z!�\�V1�th�9X��j�h?Ab��`k���ݣ,�x�k��������d����p� �:_*V�Sl�#���W]�/������r��f?�i���U��z^��V���V�=�����V5Dӵp��h6� ��/�;����[�'�
+�E�H˦��Ɣ�~�� ��~���<�� OZ9���Y��4;�J��x���N(w~f�r�n�׋�f�:*�~4��������0IF��og�'��FA�b��]����g�W���$y��h\��UPdv��Z��6�F�ǌ9'�O����{��z^��nr� b�⋿:�'0��Q��f���A�7Q��͎���eR~��˒�F|�*��Lo�΄l^���G�n�k�o��J`�jhw���l^�:	�@�6�0�#�'-���RZ7{�'$y��?%�i^!ٝ6�2o�=_*x'<����uqD��~7��z�r�z�d�w�Kn���_����	[�Z��>�Tm�w��|��{^zק� Z�%D���x7�!<�@��/�x��OHӵb�HT!>Aۃ��U�nS��;.t�"1�6)^��|t�ڹ�mR� $E�Q��7��7�yk-���ǻ�#_|�w��4���B-Zt��N;��Q�L����K}s�#%Eb�/���qQni9�����Z����s�a����;Z��]z��}�\�L�:���`q� �0sBDT��96��LԳu���=Ax~��T.�9	��;�Q�^��~���Z+<      �   �  x�u�Kr,)E��Ux�aB_$�"zo��h!�ː����ݫO_�" ����&�/�F� ��A�^B�?�~�I��ܔݥ�8�O\/�a|��Kt���rA�¶�^�>��;�xw����ۉ�� �HW<��Sgij���SO���L�
�8���"hDXW�tB��t\
�c�ͼ��c�5M'�痰�O<[3��1B�{�K��_�����ߋ�k[�rs![���&I��Y���҅tI�'Lm�N����~C����r��-^��*o�eu�7y�'�_�S^���9�ʛ|�
�_�S^���L��Z���O��ɧ���d��S^�th�.W��ҋNy�������S���!���ҋN}��z�j��&���U&Y��>����H�w�<oo�d�1�����S\�Q������'�;x���^x㫶�߈��d�(n�h��O��Ƚ��������ƏT^��2�+_�a��}d������;쏼����V���'>�練vB/��p�Ι��C}}��yo|���7�����J]h��g��������w�O|�(�F��	�s����Ժ��:���}:�e�#�Û��]<G�y�=��\7g��_�乙t��u�����Wg3�/�)<���:����2��G���!k:�̦t�?�\�D%��*�mz�;��ܙ�N^yo��}5��?�M���tOC�|�9�����qBR[3�r���&��ĳZ6�����9�Ǫр��Ή��-<�F��j������� ~��bDι��������OX�ӍV�E�����7��ۀ[㾥�����	Ɯ�=@�a����e?�6z����y�����\���ͽ���x�vR['˛�'>�9� }8�yo� 7?�O�p�����G���m��^�=Ǟ��'?1* πj?�!x��������g���T���X�(|�7����D.>�J�8�pj�P-"M�i����ˡd��T���~бM�V��Ue�'o�$��mH�	qTU��\�����S�~a؂֮�\O�Mg�9v i���0?|����c���m~�:?��
޷��9t����m�R5#�[@Vr}�E�J�? 3��=�O������P��Uh���P����ֿ�k�a�f�G�أ��`��8ǫ�S@~�*�ߎ1�e���:���9acmٟ�j�ʱ�a���ǀ|C6y�*t��ী\0��p
8�T�S@��t|6��e����Y8�a��B�������]RBI      �   �  x�ՙǒ�����?��oP�7��[	o� p�#@��_�fT=�}�t�ZH�)3O��@o���Y�/v�KA;pp'��6h
J�g	M����@���[�5�R���s�����}��bL�k�����u�k��aReݼ;~y��y/���wO�L�%��8(d���l0��8]����9���|�ň7� $ ��B> �"�A$Q�@�������V0��8��!�@E�b����4[m�!b�0^t�y##\�������2Fyn�+ٲ�7�$l3-q��'�"ɓ=SQy[��x��ɘڞ�r��
$�	hd�!T��"ƹ��3�\��*Ō�3�~�@�	@�_�0�SB��<�[��8��y+�3vqw�Ƌ��q ��FM\U����)v� MrE�Z&�*� `�0��Ķw�&�W��R˚���Vd�lok����U1^��.����&�W�<���)�<$��ʃ��;B0��F�e��.�9u�1i�T��9�pp�[�y��j��<��;CWe�;�]�Nō�X�}p�Ζ_�=g�s$jg��1!ĦH�%�VCv�J�E�����H�'��o���;c���C	�
�p�!Z�vvӯ�8��n�H|`����$�?ڍ|�.nVw�n�ۥ����J(��Ǖ4n�bf����d�H��Xi�`��� 7�nyH�n��벸OoW1?(at���L�X��y�S#�S��q:���]M���*{
���lt��0�&�J�5� u�3�wy����$F��A�2{�JV%,� ���R�xD���Zi9�t�����a�8�oѰ�S,B��؝̭m�\�iU�ڟ����I��!	;���2�G�L�����I)����,
Й� �e��!�oc�=`9iu��:D�j7�_�~�>}G ���oy��,SNiw�N��Vi��3����-m,4�w����9�<��@�0�̖��p���.3&W��H��1�:��.+����0�����k�Cݫ�Vl@�WfXKU�Im����l�����`�������A�O9@1ÿq����N�B���g1sQ=���RMV���5�D��$[ṝ��H��|���*��CC�R�:Z�[��=���(�m���JṪ�� ^Y��^���<s=�\�D�*\�O}ť�#!tۓ��
T���z!����A�?��~/�'��� J�����b��ζ{��贤���n$�a � �L,�<sXGOV"d#�j4�����q��*k=.��(q�mcæ�`�7�MZ �MM��o>Y^���AW���D��J����|��H�ʋ̰������@���C��aG)�>�R�Y��@�w�����R�7v����eٛ��}���I4��S�&s���(ݻ{A�����<�sd�[���ӱJ���A�6��~)=B#���خ$�
������;��I)5�P��o2P�7�d*(i}iP�!���������~`��Q��5����Zh��%\�u'��2}l��M��5�M�A���>�m�cm�L�v.A ��I��m�:5���'���I��u��jL���*���3�����ٞ����6 �oJ�yT�m��N��ӡ�!����>0�<x0��!o���5I�$o�6��O9������(-E�$��"�B7v��$�ԩ�e�0�4�|m���@T��1?�cX�չZ���5�C>i,������i�6��V٫��yL=L%���	����<�+n>��"�EBD�~#�x�=��m
R�ヒ�D��������<�{��w�x����
�ajͱ�rW��_rp�nPm�G�&)���@w��e&bk�g��JO�i͍"�Ȝ-3�� �o �7/�V�b�x�A�jwA��S�zy4u搰&5���h~�����v�Y@>�kb�?���f�S�? ���#,�p �-w��~MS����̂�ګ<�En�y��6��I��y��NT�< �.gY@����Ҙ/=2a���~�Q3�,`?t"N�v>K1�RJ�FD�}\���;�d7��<���ͥ��)B�����M3�7I�� nS{�P�B��6�w`D��<���KK�^n���PaZ�m]��L]��ǘ0�O3�0A����	HY٪8J (x��f��xie��0�t5NAZ��y�"��ْ�����[^p�����qW�۬ޗ�2���K��6E>�$��La��!��v�w��l��Pk�B0�|����r>_�'���4�"��^�&��H~�]6	-Xe�
_�-nCp����ڥ���kX�[�F��{��P�n���K��+@=�"�h������XG���Xd^e��ʢ������}�C��]�|������/+J�
�/����t��ԏ� �)R����>� �N�$�f� ޲s�-����ب�s�_�Z�lR<k�E�;h��B��R�i��]M�-����" ���{̃!�3��u��8�z� $Oz��s�OS���|Ý��h'��r��&��S�IP*iyq�q�+)��I
�8�����A�/��Wy ��S��'�|�R�sx@
=�ܫ�p�-�5 ��<�<ch��>��T|��͌����jZ��E	���ayϚ3%��BѻF���@z�n��NKԢd��KWQs+?#YqbjÝlϻ'<�d����}׹��
��K��ԗv�q��Ɠ�%�?��1;��m����H�O���dt�v�?s��
};��2E�Y���A��Du[;����-�� 3Eb��T48�[�*`�I~Z���3��;�fI��.�``�rt�e��0�R$��QIa�~�f��z����q�HEl�#�DӝJ[�"�[��{��3�*��ƍ"0���"�J��u��݆��X���
����e�A�O+~�y~�	xp���v:���<�$P��{$WLW^/WS�;]c���F���:~4:ᝪ|{pb\�^�%�N�݊���	iJ��e��Wt<}��c�8�2CW"�ƣ�hWT�<m��=��"�_��0:�;R��j ���2=?��/����s�"�oqC�=���HR�Ͳ�t��v@fu�>��L�^�	R�ç�d���A�=�. ��N<m��}�~�����A���'��C��cI�<��U�W�.� g�Uv�}�:~$W.?xu�ʃ@m X���bh�Eѿ �=Ԁx'a��s�aD3z%4��M�<��2�Ń��Q���fx�c�nA��d�h=ɝNA#�4�#���^fdi�y�Yv����b^u:U1��P����:�����g��]h���*���/��s_�K��k���ob�~�l��8����|{�S�?]��rz<�;B�(�}���Y:�mQ�_!�F� ~��W}֐Zx4�c��쁝��t�֭��32�~�R�����	K�ǁS'G��R.\��9dO��Q��i�c���^ɫ �MJ�[[{:LK�NY�b���ܳZ�ܟ�__*��g�B1�$��+/yx�[޵���E�Fm*ᗼ��8
�~!W��K�Hn�/���2eXfAkwT�sz��][���'^���rJ#��>��oaLn���:i���L��^9x�Tt��j�����3ഩm�>�A!�s�cSI�?��o�����C�
�O��k����K,�	���-�#n�Ws������͏>C!��rӠ�7���v<���iyo�$�:J7�e�e����@�=����h=�\\f�e�	5�ʯ'�L�S-�=W�R����Ԏ�Q��+��S�UҒ$����_�����xg��)��I����9�(��(�c~�C�<�s�������a�]x�vo��&W�p�lL,�L��%��f1���惞�J�ų7���1�{��%%������3��28#i�F��O+�e�`"��2����a��^������0/���[}�x�ca��|������?��_��      �   �	  x��[M�%�<O���^��ʏ�꫍����� Z!k-�#�1����4�]�of�m�`2&��"#�z������'��R���%���&)�T�R�Qn1�����O����]>X��{`I��÷���o�����¼	m�����r�|B�9�w�:���ק��?�p����%��[$j��]�5�?��܂]94����o�t������ �m�R��š=B��Zz�A�Z-[NQ�f��F[�R�5h�G[7�X[wh��*�p��}ZFJ�.�+�J�	e����L�T�c;�Ѕ�k�ȵ���NF9mڣt�3:A���"ť��T�d��H;@k�]s+%U��m$[f�ƴ~�D�T��k�|��i�K�Y��)��TJ�r��9�O���E�5�=^I��!?|���~�|���|JR��`�r�>,����&�q.?=^>=������/�Y[��R�Dxc�����ZL�T2QP_j�Rc��w�iYjn�3��"��^��e{���)d_j;�t�b���5��|��c��,����dm	��z�˭"�8��-f��n���k�+M�l���k���!�G�X��Uh1�J�%�|O.K`�J>A���,�-�{�(�e���z������Bۺh.!�S)�&��&g6@���[ �{*%eK=��e{�ViKk��S)kߊ�^%�5ZIYZO��S)Ć����Z������Rhg}��Z� �m �Ȗk��������ӯ�?=��8�X#��QL��ܩw�{p�A!�����7?=�����0��Qȑ{F�}���oOa��k$5S�Lq V� wΪ~�)�tI�&�C9�ل�pڼ�Z�^D����}@�4�2f�,o� {�#!qI�!9;c���Կgh-_��-Z9;#ٮ��
'�G�Z���f�9�����������+���P�.����.��`�}�)�zSZi5��MN����V/�Ѹ�#��x�^r��e���{lX���О�5Z����9�{��l#ZK<Ӟ�EZ�R�r��5��݈eqh��"m�xˠu��;J'���<Bk�M�pN�\q���v����MK��m�	^4��R��H����8B+����J{쪔ņ����Z��L�$��R��v��]��-R���8�b����F��M�����-��d���f����S��+��e�����&6$6��b��hI1���5�m���Fq^�	zwm��兖�����F�f�kj?e;@o�-O�G�2^��Q�O��;5�W�ݶ��/Y����(��R�D���/���wZMZ�r_��N���T�%����Ҏ&�_��s�s��%�֤�Z�$�{��H<���LT/rQ�a�J� �I<i�lE�s�Z:�^s*���OB�I<�t�d�-^���� �IH�������Y$������?)6�+��xWEGh������_P}?�ɱ��hm��F�"Y2�P���f�a����Z���0d�b���Zt*�Z��@����Eɮ1�F��@b��h1h��KvK
�a�)OM~���Z����wZx>9�h�b78���#��m���lk����&���5�-m�|5S%�h���!��-fhŚ�̵���=Z�Ir����Z{�B�J���GkfZԜ�8�ЊKm�kt	�U)��L�lO��/���^��ݶ�*e�$���ie�=Ak�
cAD��*u��!E^%�������*h�����R�ܜ�f�Y���-+L��U
�1\�@L��#�Hk�oQ}�"�K�n9{/�-�f���=��j�S�C{����6���S)�4��ڞ�5ڜH1��o)a��ӝ쀬�E�ܵ��|�Bh���� ���L�k�W�=4d�e}�Vi{I�>�W(�/0⸴Gh���M�W(��"��N�xF�HĪ��4_��Ӂ-�����	Z�� ���Ol6�a��!d��h+�v��|}b�h��tS8Bk�0nn�c]}�d��h��1�%�V`��Kh�>Y�%����#�J���}��O�7V��/�5�����]}��αO_��2-����P�O�u?`.�g�-ڊ�����6fޛ^�B�Y~8��g�	YȕS�V����O���>���!= ��=Q���O��e?8��a=B��5w���'�0�q��i��<��c����Ozs�
5�2Ӟ��l1ۉV�ѧkl�I�pa;C���+#[G��f�1ʉx��EZ�B�J�@���j��Z[\�6X�:uQ@ש�h1ߌ�ٮ��қ���=�#��[z�l��*�ߢ�ٖ�=�G��P��_9�`�����|�B���2�� -Zo%�s��U�9��u�#������X����7h�ܦ}4@���1&��"��;�#q֗����䝖[�k�䫕l�/�Ʈ+��N���l���lu��KԾj�p�ҩuj���.S����"_%!�i��z�l.��_U�.j�����Z��Fmδϼ'h��Y��:����E�s/H�JL<U� -�ge�����!�����      �     x�m�Mr��
��]���E+��Z���� �
[�;<�/(ā����w�_���7�Mp��������*�pp�n��0`����/�{��p�b�����O1�&��u��P$��h7�E"�P��b/{�����*K��@��w�ג[�Y��j�q9�+��|�n�+��@�D�5IL�Z���Hk�U����s{��$���7�r� �&�I���z�(�~�J���[�f����wP�Fe��d*�a��6�?Q�*i��ΰ+����6ɸE����.p�>�l9L��T��2Vw:�X'���&Zb]fFB�Fa�B�`��pwx�8ѸI.C�8����b��G+�
hŞ�-�[�OT�^��ع"4*���{��X ��O��-� )�P�E��>���@����l ���h4kt�
��B��JO��.�n�u�b�`��Tb��v�n�DŉZ #v�`4JM����],j��)��p�
���Z,�!Լr�g]I��ѷ��@E�X(�����]��j��r-L�:�ƍ�D�X|��ɵM�b�Z.��oo�6A^ݏ������.�š3/�6�8P�4�27�=Hm�L��j��u&������ xt�A��ֶX�m�A~�e7�_\�Nxh��)�g�i/�����}��� .JU�Dm�8~��Q�]w�X?=(k���5�c���(L�JWft;�Fq�|�L�,�n���h-�K����h	��=��;i�D�K�ˈ	μvT������Ւ�V+� ��qWi#���m^�t�VK�Z9�R,}'�ЩVln-#8G�5:�ʁ]i�K���jU�rF�8W�D�S�D�fB��ow��F�j�`Gm��/;�X�UZ��+/!���Pu�y���b�;W��j��*� ���҇Z�j���n��Z��n�kl�k%XW#�lM4Q�BEi��=Z�+�ۂJ5U����}�p�y�c���I�O���](�n��z���=�wCx�9�>��d�^
�'�-Ϩ:�\�e����F�7Z�^�wKP�k�|���V�lT:jLT굦����f�A}M����#b[�Y�S-�k6�����}��{;g�=�5}���J�{�vT_	�'��X���ޣ��M��׉�F�:Q�~��z�ޣ�6�z�����z���@sk��,":N�=[�:J�<��7�k+�@y�K�,=k�{���6�w���h�8Ѩ�eY-9h��j�bU �8�F�V�?�\[���h��Z��!;����j��+~���.90ybnݝ�V�D�^���.�j�OT���F�N�Պx�Pjա+գm'�����i�ގ�+՞l��i�k���7���2C�ܲ�"�Y����[N�+�~=z'�N-��5�{`��,��"s!������'#����N�,;XO�r$�n>�%�~����Ox���W�y�ډ~҈	��$��#Հ5�f���~މ�#�S���� -��y__�8[�2��ǚ���T��!�N}�����`+vM}��= ��0�58_E�׹��������?=}�      �      x������ � �      �     x�m��n����g=E��6H���rfE�N�}�AIіl� %h�?�
�E@����'���1 �� ��Q���_@<�x�,�ilp
�M��"��[l:p�aQ68~p�`'�!� l�E����6�	�M����:ȷ��;8�Hǯ��������Ͽ>�l��ӑ��ܯkt� �M���78>H�� �t];�V@� E�6r��WR�(��L���� X*#���x��r
��Х�3��}��C�]7�a["vsrlR#���q�ހt���!ؤ�n��0����ބ����L(��H*d|�����ȶH���D9���X$��	m�a��I
)t�����˨�P��	�No�2�^d?EN��<+�ĕ��+�y��w�4�(��52�;`:S�����q4�>E^(ԋy̏A:�BY(�)�L�ʨ�l�� 8̚��h�J�(�4���JE�g��_�6�G��i/��N��j�=��U�;�UT�]Ҋ��ڿ�YĄ�4�B񳎂RZe��Y��Xm��q�ٗu��0����ћu�~%Y(ԝ��P�"5Q���o��	^���7�5���-k4���� RЈ��Ak�+���Mr�
���zY����*�F=��"�V{Eu��>���u+GGE-�B�-��mU��^�#̮6�V`�[,�p4�>�
�X��
��~ �V�V��VP�k�U��U}�f��X��I���tE*�~�C�a�k[M�����e�XM@���Z���Z]@zEgP���V�QPVo��y���ڀB%-r�#Pd~�WqW�F�_�P�dV�V*�w`�>�Z�U^%[�b���gxfy�Ht��o�z$��5��ծU~A�0u���M���������-�ClF+�`�^P�Y\�f�F�FEc9b�����2�&�e�e�UY+JѲ�iu�w�oT�^��d�� ��-��]K��e�jEe�c�DWZ��Q/-jz˺�ڪXQ��hƐM[Vi�*V�r0c�W�ڗX>
�W!���IV�|`7�ɲ	���U�6S U����W�b�n�7wșZV��*��~+d������U�FѲI�mtZ�b��>0��B!+{���@o�rh��^{�k�L�����|�X^[}�v�F��*���*�������0�a�I������`�~_Zi��>�+�F��/�,��V%���V��{���l��~i%��"]e�� o�ba�"���%���:��>bv�g���+����hB�j����Bl��9�+Z�K,��������WPX��|���E�n	XXOC_��C+g]#U��J��mdyS�gx)�=�B����1�K�>ַLi�b"&��r)lNo�Z�
g�Ϡ���Y{t�Ӯ�=�"Xe����p-�Y�z����[��=jY���f#r��r��l#T�c��qףl���"VV�[�Ϋ���F�{Nz���a�٪�p���Bƙ��E�����L{����[7/���<~��wXZ�V��n��Ns��m׾Y�M��&K�핝OR]���~��Q�xU�YJ�eޭ��D��Rn4��|�ݹIX�{����u�TP��o�3�N7z���G�v��������#ک�~r]m�F/��<n��'W�����T��@��[����QݢM��7�bн���y���x����Ŭfc��|�HVb��~bec��|�HV�άt��c��|��Y(�0�V����U����WƳKA�/�-��#���0+�ز=_9��^%�p�~ز=�9��[f�����®G�:iNb�Iܖ��1�{�&��;�Z/p< �e�~�b��o9<9%�|�L��kC�
k��G�Ox����s�bv;c+ͭ±�.�ty�y��ٗ~�E?aݰTxD*р~�y[�q>�7��	���ُ��zԂ5I�T?�|� �k��~v��4j~�o��Ϝ�f]y�o?�s���w�u��"o�aҮg��fo�o�qt$�tM��cQF�ø΂q=H�����urGu�	�J��(��v݈dj��p��a���u�y*8�����|�T���      �   %  x�}�ˍ�@C��*r_D�_#���:v���8�f>�$ECi���F�+�+��t���� ���z6���R6J{�e(���&h*�|�s��z�x��b*a��}��v{��	�srx�T�~� ,��%�0'�Qb�B� yd��2��K���l ��@w]��{h�`���KMtd~�A�Jv�@�߀�"8�*�����D!��z�x8�\�Xc��{v��rVrq,�lS+�C�^�b�]�:��rwB�lo��	�/`�R��ء�-��m�:U�!      �   p  x�}V;�$7�{N�����DbO��q�`�Ù��l>�{>�f4�uЅ"�Ţz;����?�u|�z�~R�T�`����/D�(ժ����_jC����~Ø��,��!��u���a�����]QB�lX+Aަ� ���6mW�9�`�]��E��ɠ���+��P*��}n�A"�$?��ZZ7&��Z-y~��Z���^�ܗ���/4W��p)J��'���*ۡ��}H��.�^��x�E�씀S�^aN��1E�&I��$/"�������YX��G�l/��;j��w�Y`w��[{�uI+:r���>��I��{]Hb��W���^`�]\1߯V��Xe�r��z r}�Z2���o-yU���,�]�o�B3�����_Gƻ9�ł9>X��]���aJ�J�e���*�u���8Mo]g���u��"�x��P[X0���Y�2��K��c�� 9T�R+���`��ئ��ڄ�t�1|�l�$#��[��x�O��.���<�%g��g�\1uP;1AM��Il��2�=p�f��K��� $�%��C�6۳!elòx�q����F��(eh�asf�tN�31iSԨ�� j���em�қ�J�M�96'��[7���;@�yb=��#(�~�;~l��=@y��h$3׭����Eڬtτ��+ ���se�����h�<���;p�{:������p�%H�1��Ґ�s�V�vݾgВK>Nxn���ev>jQ_��d�yU�>q�Zٗ������:�i5���u��~"�\����z ��lG���5�x�4�e��b���AȎ*d�n���,u������"@ 9_+������!-VP=��{m���"��j��WoSu���r�	�ᄣ      �      x��}�r,Ǒ�3�W���p��S��޴��T�(1�#9��Dc�q0"��b�m���/�/��Y��S�� ��`,�'��ny��,�������?~�ew{{�L0!/���n��%�K	��_��LÌ֖��}����X����ԍW�%�k�֚�\Bl.kD���L�1D��u�S���F���U�1���UK��R5\�
bK+,98�J�z�ù^
�*�n -��%b���_J۔$1@��gh�����>C �%C�ؽd��b�����&�Kɉ�\ �dpx��*v��\�Ƙ���H��["�<�������FSŏ Lq5�_,�9���U�{�qB�`�gM�T�\�p�(00���#� ����{����P&W���є�:��3L��O9�c�D#���AJ��3��"z�¤��F�z���5©:z�rW�֊9���U6����m�)p��b�܁`srQ�l�*v��i%�G/�r��x9�����"
�=�-�i�܌P	���/�쒩����SL�i����#A�A��H0����/p-"A�QY� RV��"��=���hoT�*� ��ބk���A��+"?��@m9���������HI�r3,B���r�,.^S�$��lzoeʴ���9�6z��8�-�}ʶ:�!�J�6zn4���2������B�	�kS�;B�@�x�E���`�Wqy!z�B�qP#~D����\!.fh���;B�cbF%J5)8�dhsk��d5>M�R�b�޺�9�� �ʆ�笝���<���{Ӷ����qu�� kٌ�7�:�X���AI������=��=�_�(6;�M?�s�g	DX��������a�����6�æ���b��}wjO�������?oڇ���6��m~��/��b�믿�b��w����W���O��~��m{j7_�����y�m���B�̊�כ�����7_�l����W��Եw����<v���lJ?aw�S�XO7���H<l�w�?~I�⯇���v��n������a�?�q�W��x�(����Ӈ�Mw��o�~����xx�Sr�x�KE�.QU�m8Jz�R�����J����7r�p��p�=4�t�i�����sf�5�%����������|���qm��-�����?�v���$ ?��?��#��?���F:�,�{t9��c�HhB�����c�R���Ǯ�=|ߞ|�q���S�����4�lN�"2�X�� c�� ����UG��9�����Em%��a0H���=ݞ�~�N�Oݏ?���{!�*Z9�腡e�I	}e��s�I[�I�����z'�\s�$c�Nx�wrh9�������Dah�������;�����'QU��:~j�6��m�V8!M��4\Q�G�,Z�V1#�}<#��GP�chi'�Qr�G&/�|J<�#��g���F�L��gS�x��i}�
G�BT9G��RP�@)���0av��E5��[�_JK!��&`��:w����w"ѥ��&R~�������~�ŷ������ӯP���ݢ��������|�mw�Qo���]п���_7ׇ��)�����׾�M�}����ƫmT�������G��q���㩽�v��ӣ78a�h��x�v���뮻E��u�����7��ө�cB4��������3��c��}�q&��SU�F�lmp�("�n�>�I-�]�P�+��Y�,w;+)A0�����E�z�d���p���;ы�z9e�p���@x�П���ϴk��Qe>^�r#l��ϯ�W-�g��,(��:gR��	���)\��;WMgz��j6h=շ��}i�rG&ޞ?�|�~L:��DY���$ˌYa���쓆��"7�2>�g%�(O���	!�WV����W+�������P�)���=EJR�%{
�9vd$�u&��(?eC˥1�;2`�1���aʭC����@��GL��?R��(^>��u�ǀi�L���Y6�yi�m�ⳁ�f>��q���6\�Ң"�-*�{k΢2ɁwݢҩOdS���F0=�i�c��'�$9kXa�Amd5j@r���3䍞8ӈg�Eթ7q)���R�uyBqMT�-�9�����oA���Q!����,��F�0�Y����";���]E�Q�"m�K0� ��jY�M�Z�l�4�CЫ�f���l��%r-�#�ٌ�L�A�i�X��q:Z��L�����	)��*��fn�o	�6�#��h3�ųSQY�>>	H'$�t��,Abdww�qCڧ&��>�D���b�t��V�Y�3�&C�['��l�H�1W�6� �(jS���l��iz�J��z1��hK.{[f�~�E�n%�<��[�83�fP��nt���?R�֐�V	�-�8Y���F��S+�������}+^rBoH�
Yj�l?��(��� i�t�n�e���LqyYqR�Q`(�g���2�� ���V��Bכ1��=���˞�
'�BؑTV��3#��t$'}]���+���6V@$���/w\#K҃�i ��e��b�}SY8�O�dM�P"�.ӁK�s\��o��*݈��v�'��.Ϻ	��ѩʻ�C0�G<<h��G�qz2zܿ�C��eN��!�Դ;������-�`Q�iW�kIR����E�3�Z@�^9 �a@w��g������}����W�Q�%�t��p��1=�r��{r�.H~:��Y�ǀֈ����bfZ���La���;��
��Ƈ�7E/��E�r Y.�Lڞ�>��8?�j����++��d+ �
��A�j�"A=�o�6A2bъ1�A�"��QO7�*�KW磞��Q �Dr+�\D�G�������d|�4�&I�D��L����D��$�ņl`��!勐d��ǄU)�(�cm������4m�P� �W����dI'*�A���2�q6ekEޱ�ir�����V�Ɖ�J�{�yR���5�\aq6��QO"M=�������m;������{�����=b<�Z<n9����pӰ�L�9��pN�U�h���MBv5v�YY
�H�ɍ��N�SQ��t���ٮ(�f�NH]n��)-]. ��>�Z�l)����@�0wH�b�⼈Z�1E���[�(�G������i�v�q���C�x<��3�O�����'B�dQ�[��>��A������-�Y;�1T��1H�گ5:^{�U{�?Aؿ�ko�ͱ�۾�m�[t��Rx����=ݴ���֊M����������-pV�.�3 s�� ��>e]���g��fM$ZpA�纮ɆYAκ�������J(#,��R�lG�̲!8'z���Ӿ$2��E��5�%�1�w帏cGNA�wiǥ�?m���8o�#Ξ{�8�?���ǥ��L-'�Ɋ�	�ʙ �yE���u+�#"���R�R����b�_Gd��5&g#�A�t[IC�;����'O�4�rgIV����L����*�(��}�Oh�VX�<?c��Mp� h��� ��%Պ�/G���%hJ�n�(�aWt#�nD��'ӠV��U�w�vId�������"Yz��)�I�r\��\�����h'KV,��E֝#�34!���nw}���TV͓A�/��3���i��BǦ�S$/�\Xc�]>�,��R9����iPot����'k:��!WP�2��)�\�	f
�>�����H4�)���X�B�3I�Ut�D^�=�����y�
�bi2�8�ӑ��R��N|���>�E�b��LW� $˝\!������n�hp�y7ȂAsu�`��yb���&P�ge��Q����v��=��RA�G�F��'��I�Y�����q��3��U�a��7;�C|�'���U�����rM4J��햽�Ԣ֍?���qU�)�90�k�5��
O��X61s�;(4���-z2�F���t�����RO���rC�����D
k���4D�Ot��"C[�y20��3%��o�J�H�(��z���NP`���į�Dkř�J'	]`�)R�X~    M��� �h˙ో����-q�'\Z�w�
�PjvҭwQґ�=�JG5�_q�l�z�`�[�&H< �U�����PslJ�d*��޳�#3[�V�lq��#��v���2�8k�Xc�Ʊv�役��%�"9;S��[�t�W҅��gz~�ٵ:��.)�^1;�OF�v�H�i��]!{��uZ`�n�|����t|�Ϋ�FU(B	���9��"�����r�h�d��c�Jox���V�w�u��L�)TD �.����·��G�2�1>!�(���{�:1X���T!�%QV�d5���%@�wͦ�=��C����O�:n���C�x�mO������C΢;Tls���>�=�#��p���5�������qs}x��ΰ`����J��]w"|�f{��~w�[�Ǉn���o7?�w��������Aa�ٶǮ�b����RgrO�Zq8�5N����Q���Rz�E�\B0�R�ȡ0O����)(�#~�8�pj�$`�7��,��DV���ʅk �$^�r��n�6�\F ��<(���Ι^�0\t/]/YS����
^5��ĭT-��E�v3q-5\+Eq�i)^zn�pQ\�P�Y��-+b��1�K�p�BG���gD)����e�v�w���pS��f�-�$0r0��C+S�q[��ĩ�׌!�:ѳ�B� ��*v��[��Z�=��D�̔��zK���$T���#��|�6�Mη�g�zƨk��O�(�lu�ju;J����:A	_BЪ�أUsS���jk
7e�G��pFB��x�}���tB�d�#�
b�Ȱgd���X딻(�#�fN�;��?C9�g���R6�F�<�+C	�#�절��zw��Zd�꫱��������f���{���(�!�f412��@+aEhO��@��Q����D䯸Yq���		���,r�Tcx�n�{�ùB=�<Z7����$>Cv�@��)�5a�Ȳ�^�Ա�p3��y�*����D��")ERI�#B+i��y��6�$n�A��"�f��4Z�S�ك�q�5��A���1hR��P�	�,�� ��*S�4 yoɢs��� �=��R�Kh�]�H�yEr�j
q�k��h�P�p�|u����o_q���� tȜQp�!� jS��o� 
�~5�&=��K���N��հ4���p�mm�qX�&������%X�4�ȉ��]q�eRo�2����ViKAnH���@BIp�'�߷��w��fע_�E�F����ޥ�!�q�����o���t�I�[�.����J����u||ȅ�ŧ=�4�ph{�3�A�X�
!��+>f��E�yԧ�2��-K�dy�=���ڗ(���#Ō\��f&Ǉ��P����]�����C0Y��8�6�c\s.c�r:���'����J�uR:��[5��}�4ʑ|n�b,����������s�5�?��O�Ϳ.8���e�$�'�d!�/���Sg���G4hS�eE�RPʀ�|i�O�|M���*s��Ir�������S����Aқ���R�'��#�e�(��5V�fd|\�&f��7���1`M��`m�e+���b�O|� ���|�vm֤��|�/��K���
�)��`(��Ki�Pm�\�wQ��H�b�\Zl�i�~J*��q�k��0k,;a}�\��O�� ����\qÇ�4f4�O��}.�p\��٧�����\��Y�5[gt����A)�F���X�?�WRGd�NkrvA�kX�6��T+���5�ҧDS�r�f�.۞�W��5��6�3Bh��� ��Q��6���շ��ߊ��<�*�ޗ{B\�ζ>�Ǩ5	�n�ǈ�z7����fEG"���N�bǾ�Gc
;��r��
�*XL�7�f	z��r��9Y� u�<���oI6�D$HA~���6j$�ީH��&�o�a���
Qa�� y1#X��#���:ֻ�E���Z�Y��,�l�ݱ��D�"��Xm׸=2��ޏ��:ib�[��Z������&	"���.y�ż��z/���{!��pcq�7��qU��Z���1�^��@�ͻ�H4���*��՘^�*s'y����k�wN]ć{YKE@��+8�O�m�	�/0��QDL��,{��>�J��,7PB���)	�eùx�H��I��զdɈ��C?y~J�'�e���#5�u1_��
18��W�݈s�&�֫�h믿X����R��vع��X{�f��U�VgGn���Jhi�͆4�.t�j���Y����i5��1Ԏ����SU�V�u�Գ���������/��'튤�8@�tn�ő��̘��F8�&�wC*�5�'��	O�	�ĮvK@n(�W?Z@�o�����Ѣc "�f�n6��#qYSRIPE����Heh�+�O�����R�%h��aJ:�j%�&-�ƀ��	�Eet�F�Cɶ�ׁ��rzA�7}ӑ��ϟ��%����,�WU����R�C�Ytd.�u���9��q[�)܃xC���u�ZG�#Ä+=[�ߩ�4IQ�C1��*��nD�j&=A* ����8W,�Py_v"��tT��%>*�Y�Y� ���f��Q�����悛䂿�%�vJ��W��b3F��-����Q�4o$P�w�t���d�CM�T9��9��	�թ��W�/��ZԒ~s��sq�FUƿa��P#P����,�X0��k+iR"��Lt+��F,y>�)��|U��G2fGV�U��q֗��5��;��kE�����Iz?Ax���,@�ic�:͌��B�+���>��V��/B��5QH-��h6�6������gi��T7P_5Jqц����V��$�$�>���z�zq	&
�	OD�N��'��$���E�2n�'�8I�<�����?畍�OIK����XWJۈW6��6
��
��r���
K���:��6)��_����d�~ĉ׀^-�(tB�g�l�E'��bf�F���yX!o��Y��q/]C/��|H���ܫG}iN���"�3>����uv�g�8-�@&�%g�(j.� �!���G2��r�8��'k;ʷ?<8�x�2|�!*�=&��@d���QJ��%�P	�5����3���%j0Qn������A�c���IYz��~����W��0����IU+�' 9��{l˙o�*�,�!9=����<�>L���*]XD��8+jK�'Eް�(��'�d�9��ěyj���c��OA�h�-���d�B���������Xb��_^?p��:�/�N��Rx��%�q��Y�L��c�\M.O�8ȴc
������!�>�(���H�f�O%F9�T�=��ʂ�(�y�!ԓT���7�2l���_���W��Z�1,t����4����M%�j{ �,�r��5�������'��3�ɳ'�+�,)i�U�lChᜮaN�����಑���׺���0r�l�"��N-��-Oz�(�j�-��V1�a럐�1�[X�7����*�0��t��UT�9&�U��]�����hd�_�	x�ئ�e� �(om!��3�1�
1SETC'lU.Ѧnr��e(W��j�^���R������69~U�����}�L�&0jΪmi��H�j�mI�%H�Y,&�3�[��X��hQ��^�9g�H&�*�q�iꛏϴ.� ����SG �̧��Kk�O0��ɛ��R�[Q��3��5C��E�z!(�\�h�7&����C���s�#|y��R0>U���q����N�Yy��H&6�~�yfp4����8�N��慲Q�)�\p��G�c�.=@N��2���o���m��N+0_�W��������=IԴ�ґo��+"ᨚJ�7\PTU(�A���<0���.h?��/}��K�3�r-�\tg"l��^~�`2�̵�L%T�8Ӫ3#8Y�7�ɳ\��{z�)�'ѧGO�7��������C���������w���(����xx:�\�k�~�o86���ۿ<����m��-IJc9=����_���`_?��mOM�=cߣ�M=-6��=���_�Ow��� �  ����������?B���8�;d���)$��ߩ�5����wJ�Sv��_v�;	���&�m������cʡ��DB��B��/�� hy��a����Ǜ�����M��ӗD6��?�fӛ�?��Y��У���������?��5N�{|<<"�r4��=|����61d�^�pO}ߖ��*����-%�Ͼ�S3��-|7�G�Nr��o��>�+@ސUJ}H�$����W��>��HP%@�xs�7�(�ȸY�%�2��T���̀!<edE����)#5A��`v�C�=�X^G�"��éD�(�R�M���d���p��c���э�k�KR�.⩂���� ��e|rӗ��g��}V"���
�?�P��	��k���qq?yz�ɂ���$ �?n��~q.�����D�]T����Q�����O�X�?��S��icVƧ�SֲHgSLƧ�IQ1˥��*��5H;�q鱡g(YmF�WL���T�܌҈H���G�����$��U�Љ] ���C�����ΰ��БKgSL�����#:�w����۠��3������J�i���Ъu���)��O���U	|���
��#=�����I��2z��!����	*����Ns�R��NS�d���O�FdT^&M�HA�0��~J?�7����a۞��{o���<=��IL9/��������?,��t Ko0e��?�}�7���"��h�^JRl���g��}�9n�Ն_x��p3�.��h�����Z��;~u��V�n+��6������e)����=b�iY��q��~����vNZ�'��P]�RFU0x���+P�@�L�A�/��;�;ǉ���Z^���ѭ^ƥZ�6L4���cLu/�z��]{j�Rx�-{��mN{���n�?����v{ӽ}YG=����cGn �n�������������!�9GU�ȇr99� �?S��R#g�C�Z�J5��2d�+�:k����Ztl�(�բ_�ΉD�+�Ɨ}�j|YG=5Z&|*�'H�/߆���L������D���)s*
����f���w�֯���ؓΉg���E��#��'@��\ք��/ h���rTt����g�P�q�"��Z.��)C9`��#�\ahܒ^*��aٜΕ��	:�x`��Q���g��8L��е`��6��,�_�T��T���c1I�=���1�%��z�������]wx�m?^��HNj�gqfCφ���㦇�|�3L\�ov�Z�㺮s
T{����v�_o%~ ������+���]�`����[&�rS���H)�>�g&R�;��?��z��԰@%F]��oo�ǜ��_�Ew駃-�+�y�b��Aɋ+.�����T��2m��2�Hi�Jh��ܚs�l��Y7e-�YI��k@n� �P�pS�]��W��,��S}<����|���L����u�r�A�Iv>�p}�Do�x%G����лN�m'@^m�+4��u�v��Z��Qx���x��/p4^�ѠP�O��x�6��F%� ��D �Đ��R|��_��3�4���Թ�.!�iǓ����~�6+q<�I�~YIN�W��-���lٵ�F*�����֘�m�F�����B�5L�ɝʼP毤Z^��D�Bٳ$�I�52��Č�h���yOPf�|�I�B�^1���D9�t�NP��	5=������4�\�_ީ��YB�K�z�P��_űA����I�	>/_�z
Pq�Jy;�^ ����S�z�䯣�7ץ��k�e+��3hw�U�L�3;��ꂡ�t�#�}��#�u4�b�~�G/߆U�Xo�qKoT1C]�@�n� �x�cV���*p��7�1 Pǻ>f�T���8��f,|a@�O*E���Ś��pΐ�R�f���85T`��p�Mެ>_UNW�w8�����Q;inE�t��e�U:��h��<��eاi��/�D8�`Nw�m�Q����$��_�*F٦pR<�!���)��4yM��Q r���d�>E�XZ�	eQ	�#XЀЊ���k��4]�8̋�+�3zѼ���L��?�hj�{�q�:�i���:�IGVԐ��Q��-'�Kn^)�(b-.��>v����pz�:�E�_H�K�	�'!y9���n{�T��>I���[4a)��~��p휞|3��T��#�sO��Qb���\P�N8p�:`�Ρ�����[���5Un`e��˾~������3.z���t�^��|�Y����b���\[�x�f��Z�Y��V��ǐ�I�qV��*�~�CQ�=]常N�j����;�v�Vk�ӺӲ��ʌ�z�y(Z߮	�^7ѧ���"�Y]��ݹs�2_@]|8>�vH`��*�#.oD�S�g@���g<�	� }mA��JUWR�"������#��e`��8N$�f+:��d[r�ݖr����C�����R]����˗u4�qܱO�����P�A�'��TR�.
���9�AWb<eŭ	����G���� t�΁���!��>���p�H�E![��VDu*я
���������8B�
rJ�j.��ȓzp�!AN5(��?� �r���?��IN�F�gDcua�{X��'���LV#��)�-5� ��e�g:��r �qB�8�ܕ��49�ծ3k�� �n��ZIQ�����u49��r?a2.��-"/S}q*�em�0�� ��9Q@'��L 6�Đ��ĸ��.~Yo����ۙ����:$�+%mKEBv�Ө�ִ���X3�Qg�S��Mz����L@u��d\ \L��k�^�ҍyݰ�*	b���s-ٹ�g��\�"v�k�g��a*p5��@/܂�0t yu��Փ�cͩ�6p�7"nA��5�rjm`am�W*ն�6�#E-�KH�>�U�1���Ѧ8�
 _`W�4]B@J��R�f��byG=�*�Z�֘��	N��mg�Rbd�v�^9w�w[up�mM{%��Tڼ��/��Z�e�������V�6T�΢R3�!T{��SZ}ڞ��Z1rƹ�t�?������� �܋����,�� ��0�na���$���L�8�BX�����3�-��(��k��2��S��}~����_n꼴ǁ�3</�����Oؓ����D�D��D��Y�~!�jY�J��6o޼��?�G      �   �  x���I��0E׮S�Q�Hj�����џ�]NK�r��E~qR���`I�������2�$�P��z��R��Gˊ�*3�|��������z�4�G���զX9Z�bE�ĶZ=Z_cR>����j�hc}R�z�΢X?z�b4N���i�i�O�g+Y1JG��?�]�ٗ����'��30��������'�s�	��˖�|f�����v���(Gok��c⮠z������#/�l�䓒�����+�ˍ#�?�06�#/���3�2y�q|����y��ߏ���������u��Q7޽8s�j|߷��nG]ލ�ۯc�f��-g��}���
�LnI�؜��'�)v�clT�X�V�ˀn�1��Y��J�hV��J�1�z=������Rڃ�,�S� �a��B�`?I����� ��������8�{X�QV���j!��q+�*�?8S~���L���Ը��V�������^RZi�A�"*f��� B[:{򣨱7�7�|��٨��XU��ԟaÕ��}a�W�{pfC,VV���y�l|qv8��������GY����Y�I�V�7�-9W���03;��u��׾�WN����/��fe޼Q�s�ڕ�Y�o�k��5�F9{�� hZ_�`C�4 ��D�@�+�|�U6t0��ɷ��iyۛ*?wDfh6��P�J[{d��34�N�a�d�XQ��u�9V��XI������}q9_u$C4k5���vnj�9��IӢ�yv�����+<;�AA�tfO��R�g�\`ah̷�ux�6M��	�%�6D��gru�h$������ȶF�H�qLI�QR3�t5��3%R�4��<s ��v���Yz�ّ��0P�,=�4��g|E�Q��?B�H�C���d陦́�t��f���LS�[am�-K�4S2��YPא����13��!�������1�䈀��ըY(/5�U��ܼ�@�By)
#�w�BW��sr1R�3�L�Id�E��	��rOkZ��Nݐ�	�(��-Ka���u"��,�vG����Ec�/Ҵ��D��-W���RФ��'GW� �TH�s �	���Xs��!TV>b/�!a�j5�PY	�I�g��
Y���GJ�%�C�*+9���5a�E�s�8QMq"�sQY\$�<�IXiQ[8���s$W�4-Z1'�G~�N��u�y79N&�<0���d�':*�h����i�N#ք���� KB������&u�X���8B?R*�~do/5
�<� �d��-U/M5S��Q�Y�l�4����ɬs�3܎�I}��"����~j�r�d��D�>E� ��Y4]��d�Re=��̛��R����fw�$�I!%�n�t���p5�10ҘZ�D��=�j����j	l�c�KcJ�N��QI���Kc*�DI���%�X�-�I܍�%��X����D�C�$�X�}�I���9�Zi�"%�Y���Ks�$
)T�BIc㡢���0����*8��F��4Ħ��D=������8��(`�v:HQ���8|��O�#3�t�k�M˛�$�Rbw��Tܤ�oi,���6�Im�#��+-�Α����ƹO�IT�-қ�bZ�$'!N������M�)�F�s�����>I�T��щ�w�=H�A���SF�6�eZ�ɪU>�=u!�kқ�~�1�7���ʯ�/��;�Y՞9�%X�Zq��"A�{����2��(���z�PS"��|h��S�ѕg6�����Ze�5��F�9�J��T��f��� �嫥�o04gYH��Y�������Io�=-�a//(QkdL�By��NvqYrY*	�� �N7����>��%�
KuK�q��RFې6*MayKKu^$�'�Z��������Ks\x�%��՞�d����&�c�&�܂���F��0�����]�)O�\��嗼�<[cԼ����7�H��	��gn��x�մ��7��"�;�P�h$���r�E.�42�	��Y�򓪕҂��� :�{��7�:��^�[&z��7Y5�հ�f"o�[�M6�N�3���3;o�wd��]}Կ���S�w�r���Y3�E�����AZs�k,�7/2�)�X�g������rX��]3�y}��P���қ���7��^�X�|�R8YlV�0 �T�����K͗�����k����ݸI����M�e����)Ś8��}�A�m���%���T�{yni���>I� >����nr��v�*���Ԝ�Z��_k���\l��T���xA�iT�{�F����Z�B� �b��7�թ�@��{2��V˪�=�Ԩ���KŤŹ�ѳX���V��5�����lz�����?��k�_��^��N6+��$�p
�89��&#*h��ż�o���=�9�Z3�x��hئl�$%��uK�1�rw}�i0tp>z�h4�)��#��u:�?�Y���9"��t�M��/r���"�*�l��F�����7[�tr�&H�>Y�lS�$#�j4�SB�wC�H"*h �s�t���ts�)�3��.�{�oѰ�.�H��/�4���F�yp�C�E�>�I�av��_*v�~eU$H�]+�/d�C���c�ӝ�aB%$�����5T�c��������J&�1��_��R�1���t_j�8��$�f��l�_d�}B�O�fF�(��� G�chX���g��e��~��whX��IR�A���IF��
y�Q�A�B_�9�'d�H߃7'Ys�N�(��yO�^d�L�]���C��~}��9.��oo�%��{L�&cw�(M-�o�E�K�n$o3U��i�I�hr������OsQ��l ��d�63޵�
	/O�վ��\y��I�e�\y?�I��\.��Y���O�u��7N�qe�Xܤ>V���\4�!@r�����%��s�d?��j�yfd���g��V�tP_3cE8h���Gߓ)�	�=��Z����A�+s�NE���$�,O㦼-�$��v������B��?      �   2
  x���I��8EתS�Q�(j�Y�������Kr�����I'�F!q̥����o���gg�t�-���d��K���O�!��^�΂�P�+��P�;V���w��B��^����B�G���P��tPT�b��;G�rD!�/!\2.���\50q���*f\��8��R	<޸2�c_�r5�rpF��΃7�;ה!�)���gǨj�w�W���%�#�sI�2�s�>H�=���w����,�����8{�j~��-����5z�㝳�������8��L6:c9	9inc
mi>:���ݲ�Q��a�\�#Zz0���6:S<�ղ�sh���#�,�T9R2�qm�tr9K9Z5����3���mZ������r�m�y#�e�ә3L}������c����ї��\�ΧЗ��8N�%M7�P_Ɵr)��5��-�/�vA)��r�N�?���WC_����f���.I������2L�Eܮ;��\#�3v?��06V�0=�h,��89��$���X��xף
������2��5��O)�ސ`�aC�X ���G�@��h�iǰH��D�v��Tak{t�*��Zў<��b��)������F4���Ea@5iQ@��x�����\f�@M�*�����KWq��_�I��������/1��v�xeVE)�������)0~�Q�%f�4�-s�^`Fp[�4q��
"hs:��P�DsiU,�"�D��Di�D��aY�Ƅ�ހ0�В ����X���Ȗ4矁M�[�Co�4�[�Ϥ�ƄTx�����I�� Â�n���O
�I<�Ezd�57��d}͉��+��ȿ~H�N�K�4�u�1j��=ϩ2<����܇Wx�&=��Q��p
/��$p"�gi��n�9�+�1<������D8���``����/��43��f�%/�������O�K^�D������"�#�]`�
�'e�)u�L0��H��b�A)���'e�!�;�Yݖ�2lD]�T�ѣ�R^�/�9�FJee��DBBj�q��Jee�,1ۤ�����D��6�L	��U���}��L�����AV#ᜅf�H��fZ\9-fP#����=��>���!͏�q�d�=��s��q������*i��"�x�J!=c����X%eBu�!'��	iBun�7	�1�F$�3݈I�	"}&Y�uB�$d�i)��3E�P�*���?��r�����	dҧc2ȦQ�[S���&���ii�4OFJę>��_S_�gR��Z�y-����Fj%��M���E'�Y��di �G��4�_d5+�m�<y|��T��d��r�U*�o|�GS;��F��to��:;	�������Әt��Uf������XE��hS��N�ds�2(yԡ�Ә��&q��}���7��LO�Mtq�� '�H�|�)>�X^H���a��q!c�,��75�Bߤ[I~^��/iyĸ�<�}��v��ť�A{����2�~IK#��I��$�R��l��$>�nB�d���7!���0�<�$�=�C�whY��/�H<�ܾ�����JU�&zT�<g#1IT�G���A�����# ���sN�t��*�j��9���:׏�uN$�M	�E>��o��	`A6�yf��`I�lƜ�;>g��,Izf�J#*)�	kv�s��4�%��(FF�z���b��~f�4Ȏ���s\�'}/}�'-�eW`�xK��D4������.�?R7$J-cSA�����r��;����5�|��3�E.��z�����L:�\%I�Wݒ���W����P2������_msf���.��enܤ'���en��cB��W�jϕ�,6���7Y�tN��t�=׹�D:~Λ|����kT�n?�`|��~ݭ�'�Mx�,�� �O�&�l���]����Mv��p�&�4ob^H:��"Q�y� ��0+��̛l72��!����0`�+Du�t�u&����a����oN��7͹ad��H�)S�	Ϗ[ �nԢN�~s�'�v� ��.f_~�vs�(��E�{�Ly� Ǐ~���V��\@|��_�:�.s|\d�o��{.�_�?1�7t��O������1���ye�Z7)��ތ�Au�L!�.�I�o��S���o�"��q��F]�M}�r�&%B�Nœ�_?H�q�/2�ўs�'	T�L���ƍ��(6b'��?�6+(�x�|&��Iq��B��G�����	���S��u�B��,Aل�
i�-H-J~�0�c���$1@Ek�IV���ՙ�M���e�ݧ�L$7�,#a�ơB�9��d��[�T!ۧ��	���d�T�n����	I{\HI(Oxݷ5�den~#��{��|��9/�B����feK�/e��7��/1�#�I~Us}�p�E$��Li}�7��hVfEz�s�2�³���9e��������g��dQa�΄H��:�"%�
J�[���J�7iq��ijߤ�1�?�:<I�;�5?w���|���D�
ς�&��j+B�<�T��QT{�� ��g��K�vz��{�ѕ�pי��ݍ�	�����,V��wc湹)�Ng�<;ς��y��k#�4v�E��%
�b���ϟ?�,�:     