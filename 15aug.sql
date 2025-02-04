PGDMP     2                    {            workdesk    14.7    15.3 1              0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    17422    workdesk    DATABASE     s   CREATE DATABASE workdesk WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF8';
    DROP DATABASE workdesk;
                cloudsqlsuperuser    false                        2615    2200    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
                cloudsqlsuperuser    false                       0    0    SCHEMA public    ACL     Q   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;
                   cloudsqlsuperuser    false    5                       0    0 4   FUNCTION pg_replication_origin_advance(text, pg_lsn)    ACL     c   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_advance(text, pg_lsn) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    290                       0    0 +   FUNCTION pg_replication_origin_create(text)    ACL     Z   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_create(text) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    278                       0    0 )   FUNCTION pg_replication_origin_drop(text)    ACL     X   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_drop(text) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    279                        0    0 (   FUNCTION pg_replication_origin_oid(text)    ACL     W   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_oid(text) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    280            !           0    0 6   FUNCTION pg_replication_origin_progress(text, boolean)    ACL     e   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_progress(text, boolean) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    281            "           0    0 1   FUNCTION pg_replication_origin_session_is_setup()    ACL     `   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_is_setup() TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    282            #           0    0 8   FUNCTION pg_replication_origin_session_progress(boolean)    ACL     g   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_progress(boolean) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    291            $           0    0 .   FUNCTION pg_replication_origin_session_reset()    ACL     ]   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_reset() TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    283            %           0    0 2   FUNCTION pg_replication_origin_session_setup(text)    ACL     a   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_setup(text) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    284            &           0    0 +   FUNCTION pg_replication_origin_xact_reset()    ACL     Z   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_xact_reset() TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    285            '           0    0 K   FUNCTION pg_replication_origin_xact_setup(pg_lsn, timestamp with time zone)    ACL     z   GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_xact_setup(pg_lsn, timestamp with time zone) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    286            (           0    0    FUNCTION pg_show_replication_origin_status(OUT local_id oid, OUT external_id text, OUT remote_lsn pg_lsn, OUT local_lsn pg_lsn)    ACL     �   GRANT ALL ON FUNCTION pg_catalog.pg_show_replication_origin_status(OUT local_id oid, OUT external_id text, OUT remote_lsn pg_lsn, OUT local_lsn pg_lsn) TO cloudsqlsuperuser;
       
   pg_catalog          cloudsqladmin    false    292            -           1255    18069    get_app_usage(date, bigint)    FUNCTION     �  CREATE FUNCTION public.get_app_usage(date_param date, device_id_param bigint) RETURNS TABLE(id bigint, date date, device bigint, created_at timestamp with time zone, data jsonb, package character varying, duration bigint, app json)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.date,
    u.device,
    u.created_at,
    u.data,
    u.package,
    u.duration,
    json_build_object(
      'id', a.id,
      'data', a.data,
      'package', a.package,
      'name', a.name,
      'created_at', a.created_at
    ) as app
  FROM
    app_usage u
  LEFT JOIN
    device_app a ON u.app = a.id
  WHERE
    u.device = device_id_param
    AND u.date = date_param order by u.duration desc;
END;
$$;
 M   DROP FUNCTION public.get_app_usage(date_param date, device_id_param bigint);
       public          postgres    false    5            �            1259    17424    account    TABLE     J  CREATE TABLE public.account (
    id bigint NOT NULL,
    data jsonb,
    mail character varying,
    phone character varying,
    code character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    type smallint,
    fname character varying,
    lname character varying
);
    DROP TABLE public.account;
       public         heap    postgres    false    5            �            1259    17518    account_role    TABLE     �   CREATE TABLE public.account_role (
    id bigint NOT NULL,
    account bigint,
    role bigint,
    created_at timestamp with time zone DEFAULT now()
);
     DROP TABLE public.account_role;
       public         heap    postgres    false    5            �            1259    17517    account_role_id_seq    SEQUENCE     |   CREATE SEQUENCE public.account_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.account_role_id_seq;
       public          postgres    false    5    218            )           0    0    account_role_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.account_role_id_seq OWNED BY public.account_role.id;
          public          postgres    false    217                       1259    17963    app    TABLE     9  CREATE TABLE public.app (
    id bigint NOT NULL,
    device bigint,
    package character varying,
    data jsonb,
    owner bigint,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    site bigint,
    name character varying,
    download_url character varying
);
    DROP TABLE public.app;
       public         heap    postgres    false    5                       1259    17962 
   app_id_seq    SEQUENCE     s   CREATE SEQUENCE public.app_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 !   DROP SEQUENCE public.app_id_seq;
       public          postgres    false    262    5            *           0    0 
   app_id_seq    SEQUENCE OWNED BY     9   ALTER SEQUENCE public.app_id_seq OWNED BY public.app.id;
          public          postgres    false    261            
           1259    18045 	   app_usage    TABLE     /  CREATE TABLE public.app_usage (
    id bigint NOT NULL,
    date date DEFAULT now(),
    device bigint,
    app bigint,
    site bigint,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    data jsonb,
    package character varying,
    duration bigint
);
    DROP TABLE public.app_usage;
       public         heap    postgres    false    5            	           1259    18044    app_usage_id_seq    SEQUENCE     y   CREATE SEQUENCE public.app_usage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.app_usage_id_seq;
       public          postgres    false    266    5            +           0    0    app_usage_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.app_usage_id_seq OWNED BY public.app_usage.id;
          public          postgres    false    265            �            1259    17714    comment    TABLE     �   CREATE TABLE public.comment (
    id bigint NOT NULL,
    task bigint,
    owner bigint,
    text text,
    data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    project bigint,
    updated_at timestamp with time zone
);
    DROP TABLE public.comment;
       public         heap    postgres    false    5            �            1259    17713    comment_id_seq    SEQUENCE     w   CREATE SEQUENCE public.comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.comment_id_seq;
       public          postgres    false    236    5            ,           0    0    comment_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.comment_id_seq OWNED BY public.comment.id;
          public          postgres    false    235                       1259    18188    comment_view    VIEW     0  CREATE VIEW public.comment_view AS
 SELECT t.id,
    t.task,
    t.text,
    t.data,
    t.project,
    t.created_at AS date,
    json_build_object('id', a.id, 'lname', a.lname, 'fname', a.fname, 'data', a.data) AS "user"
   FROM (public.comment t
     LEFT JOIN public.account a ON ((t.owner = a.id)));
    DROP VIEW public.comment_view;
       public          postgres    false    210    210    210    210    236    236    236    236    236    236    236    5                       1259    17941    device    TABLE     .  CREATE TABLE public.device (
    id bigint NOT NULL,
    serial character varying,
    imei character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    last_online timestamp with time zone,
    data jsonb,
    site bigint,
    owner bigint
);
    DROP TABLE public.device;
       public         heap    postgres    false    5                       1259    18019 
   device_app    TABLE     
  CREATE TABLE public.device_app (
    id bigint NOT NULL,
    package character varying,
    device bigint,
    data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    site bigint,
    name character varying
);
    DROP TABLE public.device_app;
       public         heap    postgres    false    5                       1259    18018    device_app_id_seq    SEQUENCE     z   CREATE SEQUENCE public.device_app_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.device_app_id_seq;
       public          postgres    false    264    5            -           0    0    device_app_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.device_app_id_seq OWNED BY public.device_app.id;
          public          postgres    false    263                       1259    17940    device_id_seq    SEQUENCE     v   CREATE SEQUENCE public.device_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.device_id_seq;
       public          postgres    false    260    5            .           0    0    device_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.device_id_seq OWNED BY public.device.id;
          public          postgres    false    259            �            1259    17508 	   key_chain    TABLE     �   CREATE TABLE public.key_chain (
    id bigint NOT NULL,
    hash text NOT NULL,
    owner bigint,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    data jsonb
);
    DROP TABLE public.key_chain;
       public         heap    postgres    false    5            �            1259    17507    key_chain_id_seq    SEQUENCE     y   CREATE SEQUENCE public.key_chain_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.key_chain_id_seq;
       public          postgres    false    216    5            /           0    0    key_chain_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.key_chain_id_seq OWNED BY public.key_chain.id;
          public          postgres    false    215            �            1259    17493 
   permission    TABLE     	  CREATE TABLE public.permission (
    id bigint NOT NULL,
    name character varying,
    data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    owner bigint,
    "group" bigint,
    code character varying
);
    DROP TABLE public.permission;
       public         heap    postgres    false    5                       1259    17917    permission_group    TABLE       CREATE TABLE public.permission_group (
    id bigint NOT NULL,
    name character varying,
    code character varying NOT NULL,
    data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    owner bigint
);
 $   DROP TABLE public.permission_group;
       public         heap    postgres    false    5                       1259    17916    permission_group_id_seq    SEQUENCE     �   CREATE SEQUENCE public.permission_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.permission_group_id_seq;
       public          postgres    false    258    5            0           0    0    permission_group_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.permission_group_id_seq OWNED BY public.permission_group.id;
          public          postgres    false    257            �            1259    17492    permission_id_seq    SEQUENCE     z   CREATE SEQUENCE public.permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.permission_id_seq;
       public          postgres    false    5    214            1           0    0    permission_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.permission_id_seq OWNED BY public.permission.id;
          public          postgres    false    213            �            1259    17554    project    TABLE     -  CREATE TABLE public.project (
    id bigint NOT NULL,
    data jsonb,
    code character varying,
    owner bigint,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    name character varying,
    template bigint,
    category bigint,
    site bigint
);
    DROP TABLE public.project;
       public         heap    postgres    false    5            �            1259    17571    project_account    TABLE     �   CREATE TABLE public.project_account (
    id bigint NOT NULL,
    project bigint,
    account bigint,
    created_at timestamp with time zone DEFAULT now()
);
 #   DROP TABLE public.project_account;
       public         heap    postgres    false    5            �            1259    17570    project_account_id_seq    SEQUENCE        CREATE SEQUENCE public.project_account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.project_account_id_seq;
       public          postgres    false    5    224            2           0    0    project_account_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.project_account_id_seq OWNED BY public.project_account.id;
          public          postgres    false    223            �            1259    17734    project_category    TABLE     �   CREATE TABLE public.project_category (
    id bigint NOT NULL,
    name character varying,
    data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    owner bigint
);
 $   DROP TABLE public.project_category;
       public         heap    postgres    false    5            �            1259    17733    project_category_id_seq    SEQUENCE     �   CREATE SEQUENCE public.project_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.project_category_id_seq;
       public          postgres    false    240    5            3           0    0    project_category_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.project_category_id_seq OWNED BY public.project_category.id;
          public          postgres    false    239            �            1259    17553    project_id_seq    SEQUENCE     w   CREATE SEQUENCE public.project_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.project_id_seq;
       public          postgres    false    5    222            4           0    0    project_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.project_id_seq OWNED BY public.project.id;
          public          postgres    false    221            �            1259    17670    project_status    TABLE     �   CREATE TABLE public.project_status (
    id bigint NOT NULL,
    "order" smallint,
    project bigint,
    status bigint,
    created_at timestamp with time zone DEFAULT now()
);
 "   DROP TABLE public.project_status;
       public         heap    postgres    false    5            �            1259    17669    project_status_id_seq    SEQUENCE     ~   CREATE SEQUENCE public.project_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.project_status_id_seq;
       public          postgres    false    232    5            5           0    0    project_status_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.project_status_id_seq OWNED BY public.project_status.id;
          public          postgres    false    231            �            1259    17877    project_task_type    TABLE     �   CREATE TABLE public.project_task_type (
    id bigint NOT NULL,
    "order" smallint,
    project bigint,
    task_type bigint,
    created_at timestamp with time zone DEFAULT now()
);
 %   DROP TABLE public.project_task_type;
       public         heap    postgres    false    5            �            1259    17876    project_task_type_id_seq    SEQUENCE     �   CREATE SEQUENCE public.project_task_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.project_task_type_id_seq;
       public          postgres    false    254    5            6           0    0    project_task_type_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.project_task_type_id_seq OWNED BY public.project_task_type.id;
          public          postgres    false    253            �            1259    17724    project_template    TABLE     �   CREATE TABLE public.project_template (
    id bigint NOT NULL,
    name character varying,
    data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    category bigint,
    owner bigint
);
 $   DROP TABLE public.project_template;
       public         heap    postgres    false    5            �            1259    17723    project_template_id_seq    SEQUENCE     �   CREATE SEQUENCE public.project_template_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.project_template_id_seq;
       public          postgres    false    5    238            7           0    0    project_template_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.project_template_id_seq OWNED BY public.project_template.id;
          public          postgres    false    237            �            1259    17779    project_template_status    TABLE     �   CREATE TABLE public.project_template_status (
    id bigint NOT NULL,
    "order" smallint,
    template bigint,
    status bigint,
    created_at timestamp with time zone DEFAULT now()
);
 +   DROP TABLE public.project_template_status;
       public         heap    postgres    false    5            �            1259    17778    project_template_status_id_seq    SEQUENCE     �   CREATE SEQUENCE public.project_template_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public.project_template_status_id_seq;
       public          postgres    false    244    5            8           0    0    project_template_status_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE public.project_template_status_id_seq OWNED BY public.project_template_status.id;
          public          postgres    false    243                        1259    17897    project_template_task_type    TABLE     �   CREATE TABLE public.project_template_task_type (
    id bigint NOT NULL,
    "order" smallint,
    template bigint,
    task_type bigint,
    created_at timestamp with time zone DEFAULT now()
);
 .   DROP TABLE public.project_template_task_type;
       public         heap    postgres    false    5            �            1259    17896 !   project_template_task_type_id_seq    SEQUENCE     �   CREATE SEQUENCE public.project_template_task_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE public.project_template_task_type_id_seq;
       public          postgres    false    5    256            9           0    0 !   project_template_task_type_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE public.project_template_task_type_id_seq OWNED BY public.project_template_task_type.id;
          public          postgres    false    255            �            1259    17764    template_status    TABLE     �   CREATE TABLE public.template_status (
    id bigint NOT NULL,
    name character varying,
    code character varying,
    owner bigint,
    created_at timestamp with time zone DEFAULT now(),
    data jsonb,
    updated_at timestamp with time zone
);
 #   DROP TABLE public.template_status;
       public         heap    postgres    false    5            �            1259    17862    template_task_type    TABLE     �   CREATE TABLE public.template_task_type (
    id bigint NOT NULL,
    name character varying,
    code character varying,
    owner bigint,
    created_at timestamp with time zone DEFAULT now(),
    data jsonb,
    updated_at timestamp with time zone
);
 &   DROP TABLE public.template_task_type;
       public         heap    postgres    false    5                       1259    18095    project_template_view    VIEW     w  CREATE VIEW public.project_template_view AS
 SELECT t.id,
    t.name,
    t.data,
    t.updated_at,
    t.category AS category_id,
    t.owner,
    json_build_object('id', c.id, 'name', c.name) AS category,
    COALESCE(( SELECT json_agg(json_build_object('id', s.id, 'name', s.name, 'data', s.data)) AS json_agg
           FROM (public.template_status s
             JOIN public.project_template_status r ON ((s.id = r.status)))
          WHERE (r.template = t.id)), '[]'::json) AS statuses,
    COALESCE(( SELECT json_agg(json_build_object('id', s.id, 'name', s.name, 'data', s.data)) AS json_agg
           FROM (public.template_task_type s
             JOIN public.project_template_task_type r ON ((s.id = r.task_type)))
          WHERE (r.template = t.id)), '[]'::json) AS types
   FROM (public.project_template t
     LEFT JOIN public.project_category c ON ((t.category = c.id)));
 (   DROP VIEW public.project_template_view;
       public          postgres    false    244    238    238    238    256    252    256    252    252    238    238    238    240    240    242    242    242    244    5            �            1259    17655    status    TABLE     �   CREATE TABLE public.status (
    id bigint NOT NULL,
    name character varying,
    code character varying,
    owner bigint,
    created_at timestamp with time zone,
    data jsonb,
    updated_at timestamp with time zone
);
    DROP TABLE public.status;
       public         heap    postgres    false    5            �            1259    17848 	   task_type    TABLE     �   CREATE TABLE public.task_type (
    id bigint NOT NULL,
    name character varying,
    code character varying,
    owner bigint,
    created_at timestamp with time zone,
    data jsonb,
    updated_at timestamp with time zone
);
    DROP TABLE public.task_type;
       public         heap    postgres    false    5                       1259    18101    project_view    VIEW     W  CREATE VIEW public.project_view AS
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
           FROM (public.status s
             JOIN public.project_status r ON ((s.id = r.status)))
          WHERE (r.project = t.id)), '[]'::json) AS statuses,
    COALESCE(( SELECT json_agg(json_build_object('id', s.id, 'name', s.name, 'data', s.data)) AS json_agg
           FROM (public.task_type s
             JOIN public.project_task_type r ON ((s.id = r.task_type)))
          WHERE (r.project = t.id)), '[]'::json) AS types
   FROM (public.project t
     LEFT JOIN public.project_category c ON ((t.category = c.id)));
    DROP VIEW public.project_view;
       public          postgres    false    222    222    254    254    250    250    250    240    240    232    232    230    230    230    222    222    222    222    222    222    5            �            1259    17478    role    TABLE     �   CREATE TABLE public.role (
    id bigint NOT NULL,
    name character varying,
    data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    owner bigint,
    site bigint
);
    DROP TABLE public.role;
       public         heap    postgres    false    5            �            1259    17477    role_id_seq    SEQUENCE     t   CREATE SEQUENCE public.role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.role_id_seq;
       public          postgres    false    5    212            :           0    0    role_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;
          public          postgres    false    211            �            1259    17536    role_permission    TABLE     �   CREATE TABLE public.role_permission (
    id bigint NOT NULL,
    role bigint,
    permission bigint,
    created_at timestamp with time zone DEFAULT now()
);
 #   DROP TABLE public.role_permission;
       public         heap    postgres    false    5            �            1259    17535    role_permission_id_seq    SEQUENCE        CREATE SEQUENCE public.role_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.role_permission_id_seq;
       public          postgres    false    220    5            ;           0    0    role_permission_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.role_permission_id_seq OWNED BY public.role_permission.id;
          public          postgres    false    219            �            1259    17799    site    TABLE       CREATE TABLE public.site (
    id bigint NOT NULL,
    name character varying,
    type smallint,
    owner bigint NOT NULL,
    data jsonb,
    code character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);
    DROP TABLE public.site;
       public         heap    postgres    false    5            �            1259    17821    site_account    TABLE     �   CREATE TABLE public.site_account (
    id bigint NOT NULL,
    account bigint NOT NULL,
    site bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    owner bigint
);
     DROP TABLE public.site_account;
       public         heap    postgres    false    5            �            1259    17820    site_account_id_seq    SEQUENCE     |   CREATE SEQUENCE public.site_account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.site_account_id_seq;
       public          postgres    false    5    248            <           0    0    site_account_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.site_account_id_seq OWNED BY public.site_account.id;
          public          postgres    false    247            �            1259    17798    site_id_seq    SEQUENCE     t   CREATE SEQUENCE public.site_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.site_id_seq;
       public          postgres    false    5    246            =           0    0    site_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.site_id_seq OWNED BY public.site.id;
          public          postgres    false    245            �            1259    17654    status_id_seq    SEQUENCE     v   CREATE SEQUENCE public.status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.status_id_seq;
       public          postgres    false    230    5            >           0    0    status_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.status_id_seq OWNED BY public.status.id;
          public          postgres    false    229                       1259    18161    task    TABLE     U  CREATE TABLE public.task (
    id bigint NOT NULL,
    code character varying,
    project bigint,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    owner bigint,
    status bigint,
    data jsonb,
    type bigint,
    priority smallint,
    name text,
    parent bigint,
    site bigint
);
    DROP TABLE public.task;
       public         heap    postgres    false    5            �            1259    17690    task_activity    TABLE     �   CREATE TABLE public.task_activity (
    id bigint NOT NULL,
    owner bigint,
    status bigint,
    created_at timestamp with time zone,
    project bigint,
    task bigint,
    data jsonb,
    type smallint
);
 !   DROP TABLE public.task_activity;
       public         heap    postgres    false    5            �            1259    17689    task_activity_id_seq    SEQUENCE     }   CREATE SEQUENCE public.task_activity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.task_activity_id_seq;
       public          postgres    false    5    234            ?           0    0    task_activity_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.task_activity_id_seq OWNED BY public.task_activity.id;
          public          postgres    false    233            �            1259    17615    task_assignee    TABLE     �   CREATE TABLE public.task_assignee (
    id bigint NOT NULL,
    task bigint,
    assignee bigint,
    created_at timestamp with time zone DEFAULT now()
);
 !   DROP TABLE public.task_assignee;
       public         heap    postgres    false    5            �            1259    17614    task_assignee_id_seq    SEQUENCE     }   CREATE SEQUENCE public.task_assignee_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.task_assignee_id_seq;
       public          postgres    false    226    5            @           0    0    task_assignee_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.task_assignee_id_seq OWNED BY public.task_assignee.id;
          public          postgres    false    225                       1259    18160    task_id_seq    SEQUENCE     t   CREATE SEQUENCE public.task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.task_id_seq;
       public          postgres    false    275    5            A           0    0    task_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.task_id_seq OWNED BY public.task.id;
          public          postgres    false    274            �            1259    17635    task_reporter    TABLE     �   CREATE TABLE public.task_reporter (
    id bigint NOT NULL,
    task bigint,
    reporter bigint,
    created_at timestamp with time zone DEFAULT now()
);
 !   DROP TABLE public.task_reporter;
       public         heap    postgres    false    5            �            1259    17634    task_reporter_id_seq    SEQUENCE     }   CREATE SEQUENCE public.task_reporter_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.task_reporter_id_seq;
       public          postgres    false    5    228            B           0    0    task_reporter_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.task_reporter_id_seq OWNED BY public.task_reporter.id;
          public          postgres    false    227            �            1259    17847    task_type_id_seq    SEQUENCE     y   CREATE SEQUENCE public.task_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.task_type_id_seq;
       public          postgres    false    250    5            C           0    0    task_type_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.task_type_id_seq OWNED BY public.task_type.id;
          public          postgres    false    249                       1259    18183 	   task_view    VIEW       CREATE VIEW public.task_view AS
 SELECT t.id,
    t.name,
    t.type,
    t.priority,
    t.project,
    t.status,
    t.code,
    t.data,
    t.updated_at,
    t.created_at,
    t.owner,
    t.site,
    COALESCE(( SELECT json_agg(json_build_object('id', s.id, 'fname', s.fname, 'lname', s.lname, 'data', s.data)) AS json_agg
           FROM (public.account s
             JOIN public.task_assignee r ON ((s.id = r.assignee)))
          WHERE (r.task = t.id)), '[]'::json) AS assignees,
    COALESCE(( SELECT json_agg(json_build_object('id', s.id, 'fname', s.fname, 'lname', s.lname, 'data', s.data)) AS json_agg
           FROM (public.account s
             JOIN public.task_reporter r ON ((s.id = r.reporter)))
          WHERE (r.task = t.id)), '[]'::json) AS reporters
   FROM public.task t;
    DROP VIEW public.task_view;
       public          postgres    false    275    210    210    210    210    226    226    228    228    275    275    275    275    275    275    275    275    275    275    275    5                       1259    18136    team    TABLE        CREATE TABLE public.team (
    id bigint NOT NULL,
    name character varying,
    code character varying,
    data jsonb,
    owner bigint,
    site bigint,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);
    DROP TABLE public.team;
       public         heap    postgres    false    5                       1259    18146    team_account    TABLE     �   CREATE TABLE public.team_account (
    id bigint NOT NULL,
    account bigint,
    team bigint,
    site bigint,
    created_at timestamp with time zone DEFAULT now(),
    owner bigint
);
     DROP TABLE public.team_account;
       public         heap    postgres    false    5                       1259    18145    team_account_id_seq    SEQUENCE     |   CREATE SEQUENCE public.team_account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.team_account_id_seq;
       public          postgres    false    272    5            D           0    0    team_account_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.team_account_id_seq OWNED BY public.team_account.id;
          public          postgres    false    271                       1259    18135    team_id_seq    SEQUENCE     t   CREATE SEQUENCE public.team_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.team_id_seq;
       public          postgres    false    5    270            E           0    0    team_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.team_id_seq OWNED BY public.team.id;
          public          postgres    false    269                       1259    18155 	   team_view    VIEW       CREATE VIEW public.team_view AS
 SELECT t.id,
    t.name,
    t.code,
    t.data,
    t.updated_at,
    t.created_at,
    t.owner,
    t.site,
    COALESCE(( SELECT json_agg(json_build_object('id', s.id, 'fname', s.fname, 'data', s.data, 'lname', s.lname, 'phone', s.phone, 'code', s.code, 'type', s.type, 'mail', s.mail)) AS json_agg
           FROM (public.account s
             JOIN public.team_account r ON ((s.id = r.account)))
          WHERE (r.team = t.id)), '[]'::json) AS members
   FROM public.team t;
    DROP VIEW public.team_view;
       public          postgres    false    272    272    270    270    270    270    270    270    270    270    210    210    210    210    210    210    210    210    5            �            1259    17763    template_status_id_seq    SEQUENCE        CREATE SEQUENCE public.template_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.template_status_id_seq;
       public          postgres    false    242    5            F           0    0    template_status_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.template_status_id_seq OWNED BY public.template_status.id;
          public          postgres    false    241            �            1259    17861    template_task_type_id_seq    SEQUENCE     �   CREATE SEQUENCE public.template_task_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.template_task_type_id_seq;
       public          postgres    false    5    252            G           0    0    template_task_type_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.template_task_type_id_seq OWNED BY public.template_task_type.id;
          public          postgres    false    251            �            1259    17423    user_id_seq    SEQUENCE     t   CREATE SEQUENCE public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.user_id_seq;
       public          postgres    false    210    5            H           0    0    user_id_seq    SEQUENCE OWNED BY     >   ALTER SEQUENCE public.user_id_seq OWNED BY public.account.id;
          public          postgres    false    209            |           2604    17427 
   account id    DEFAULT     e   ALTER TABLE ONLY public.account ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);
 9   ALTER TABLE public.account ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    209    210    210            �           2604    17521    account_role id    DEFAULT     r   ALTER TABLE ONLY public.account_role ALTER COLUMN id SET DEFAULT nextval('public.account_role_id_seq'::regclass);
 >   ALTER TABLE public.account_role ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    217    218    218            �           2604    17966    app id    DEFAULT     `   ALTER TABLE ONLY public.app ALTER COLUMN id SET DEFAULT nextval('public.app_id_seq'::regclass);
 5   ALTER TABLE public.app ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    261    262    262            �           2604    18048    app_usage id    DEFAULT     l   ALTER TABLE ONLY public.app_usage ALTER COLUMN id SET DEFAULT nextval('public.app_usage_id_seq'::regclass);
 ;   ALTER TABLE public.app_usage ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    265    266    266            �           2604    17717 
   comment id    DEFAULT     h   ALTER TABLE ONLY public.comment ALTER COLUMN id SET DEFAULT nextval('public.comment_id_seq'::regclass);
 9   ALTER TABLE public.comment ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    236    235    236            �           2604    17944 	   device id    DEFAULT     f   ALTER TABLE ONLY public.device ALTER COLUMN id SET DEFAULT nextval('public.device_id_seq'::regclass);
 8   ALTER TABLE public.device ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    259    260    260            �           2604    18022    device_app id    DEFAULT     n   ALTER TABLE ONLY public.device_app ALTER COLUMN id SET DEFAULT nextval('public.device_app_id_seq'::regclass);
 <   ALTER TABLE public.device_app ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    264    263    264            �           2604    17511    key_chain id    DEFAULT     l   ALTER TABLE ONLY public.key_chain ALTER COLUMN id SET DEFAULT nextval('public.key_chain_id_seq'::regclass);
 ;   ALTER TABLE public.key_chain ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    215    216            �           2604    17496    permission id    DEFAULT     n   ALTER TABLE ONLY public.permission ALTER COLUMN id SET DEFAULT nextval('public.permission_id_seq'::regclass);
 <   ALTER TABLE public.permission ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    214    213    214            �           2604    17920    permission_group id    DEFAULT     z   ALTER TABLE ONLY public.permission_group ALTER COLUMN id SET DEFAULT nextval('public.permission_group_id_seq'::regclass);
 B   ALTER TABLE public.permission_group ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    257    258    258            �           2604    17557 
   project id    DEFAULT     h   ALTER TABLE ONLY public.project ALTER COLUMN id SET DEFAULT nextval('public.project_id_seq'::regclass);
 9   ALTER TABLE public.project ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    221    222    222            �           2604    17574    project_account id    DEFAULT     x   ALTER TABLE ONLY public.project_account ALTER COLUMN id SET DEFAULT nextval('public.project_account_id_seq'::regclass);
 A   ALTER TABLE public.project_account ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    223    224    224            �           2604    17737    project_category id    DEFAULT     z   ALTER TABLE ONLY public.project_category ALTER COLUMN id SET DEFAULT nextval('public.project_category_id_seq'::regclass);
 B   ALTER TABLE public.project_category ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    240    239    240            �           2604    17673    project_status id    DEFAULT     v   ALTER TABLE ONLY public.project_status ALTER COLUMN id SET DEFAULT nextval('public.project_status_id_seq'::regclass);
 @   ALTER TABLE public.project_status ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    232    231    232            �           2604    17880    project_task_type id    DEFAULT     |   ALTER TABLE ONLY public.project_task_type ALTER COLUMN id SET DEFAULT nextval('public.project_task_type_id_seq'::regclass);
 C   ALTER TABLE public.project_task_type ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    254    253    254            �           2604    17727    project_template id    DEFAULT     z   ALTER TABLE ONLY public.project_template ALTER COLUMN id SET DEFAULT nextval('public.project_template_id_seq'::regclass);
 B   ALTER TABLE public.project_template ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    238    237    238            �           2604    17782    project_template_status id    DEFAULT     �   ALTER TABLE ONLY public.project_template_status ALTER COLUMN id SET DEFAULT nextval('public.project_template_status_id_seq'::regclass);
 I   ALTER TABLE public.project_template_status ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    243    244    244            �           2604    17900    project_template_task_type id    DEFAULT     �   ALTER TABLE ONLY public.project_template_task_type ALTER COLUMN id SET DEFAULT nextval('public.project_template_task_type_id_seq'::regclass);
 L   ALTER TABLE public.project_template_task_type ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    256    255    256            ~           2604    17481    role id    DEFAULT     b   ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);
 6   ALTER TABLE public.role ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    212    211    212            �           2604    17539    role_permission id    DEFAULT     x   ALTER TABLE ONLY public.role_permission ALTER COLUMN id SET DEFAULT nextval('public.role_permission_id_seq'::regclass);
 A   ALTER TABLE public.role_permission ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    219    220    220            �           2604    17802    site id    DEFAULT     b   ALTER TABLE ONLY public.site ALTER COLUMN id SET DEFAULT nextval('public.site_id_seq'::regclass);
 6   ALTER TABLE public.site ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    245    246    246            �           2604    17824    site_account id    DEFAULT     r   ALTER TABLE ONLY public.site_account ALTER COLUMN id SET DEFAULT nextval('public.site_account_id_seq'::regclass);
 >   ALTER TABLE public.site_account ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    248    247    248            �           2604    17658 	   status id    DEFAULT     f   ALTER TABLE ONLY public.status ALTER COLUMN id SET DEFAULT nextval('public.status_id_seq'::regclass);
 8   ALTER TABLE public.status ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    230    229    230            �           2604    18164    task id    DEFAULT     b   ALTER TABLE ONLY public.task ALTER COLUMN id SET DEFAULT nextval('public.task_id_seq'::regclass);
 6   ALTER TABLE public.task ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    274    275    275            �           2604    17693    task_activity id    DEFAULT     t   ALTER TABLE ONLY public.task_activity ALTER COLUMN id SET DEFAULT nextval('public.task_activity_id_seq'::regclass);
 ?   ALTER TABLE public.task_activity ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    233    234    234            �           2604    17618    task_assignee id    DEFAULT     t   ALTER TABLE ONLY public.task_assignee ALTER COLUMN id SET DEFAULT nextval('public.task_assignee_id_seq'::regclass);
 ?   ALTER TABLE public.task_assignee ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    225    226    226            �           2604    17638    task_reporter id    DEFAULT     t   ALTER TABLE ONLY public.task_reporter ALTER COLUMN id SET DEFAULT nextval('public.task_reporter_id_seq'::regclass);
 ?   ALTER TABLE public.task_reporter ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    228    227    228            �           2604    17851    task_type id    DEFAULT     l   ALTER TABLE ONLY public.task_type ALTER COLUMN id SET DEFAULT nextval('public.task_type_id_seq'::regclass);
 ;   ALTER TABLE public.task_type ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    250    249    250            �           2604    18139    team id    DEFAULT     b   ALTER TABLE ONLY public.team ALTER COLUMN id SET DEFAULT nextval('public.team_id_seq'::regclass);
 6   ALTER TABLE public.team ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    269    270    270            �           2604    18149    team_account id    DEFAULT     r   ALTER TABLE ONLY public.team_account ALTER COLUMN id SET DEFAULT nextval('public.team_account_id_seq'::regclass);
 >   ALTER TABLE public.team_account ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    272    271    272            �           2604    17767    template_status id    DEFAULT     x   ALTER TABLE ONLY public.template_status ALTER COLUMN id SET DEFAULT nextval('public.template_status_id_seq'::regclass);
 A   ALTER TABLE public.template_status ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    242    241    242            �           2604    17865    template_task_type id    DEFAULT     ~   ALTER TABLE ONLY public.template_task_type ALTER COLUMN id SET DEFAULT nextval('public.template_task_type_id_seq'::regclass);
 D   ALTER TABLE public.template_task_type ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    251    252    252            �          0    17424    account 
   TABLE DATA           j   COPY public.account (id, data, mail, phone, code, created_at, updated_at, type, fname, lname) FROM stdin;
    public          postgres    false    210   �      �          0    17518    account_role 
   TABLE DATA           E   COPY public.account_role (id, account, role, created_at) FROM stdin;
    public          postgres    false    218   ��                0    17963    app 
   TABLE DATA           q   COPY public.app (id, device, package, data, owner, created_at, updated_at, site, name, download_url) FROM stdin;
    public          postgres    false    262   څ                0    18045 	   app_usage 
   TABLE DATA           q   COPY public.app_usage (id, date, device, app, site, created_at, updated_at, data, package, duration) FROM stdin;
    public          postgres    false    266   ��      �          0    17714    comment 
   TABLE DATA           _   COPY public.comment (id, task, owner, text, data, created_at, project, updated_at) FROM stdin;
    public          postgres    false    236   )�      	          0    17941    device 
   TABLE DATA           j   COPY public.device (id, serial, imei, created_at, updated_at, last_online, data, site, owner) FROM stdin;
    public          postgres    false    260   ,�                0    18019 
   device_app 
   TABLE DATA           c   COPY public.device_app (id, package, device, data, created_at, updated_at, site, name) FROM stdin;
    public          postgres    false    264   ��      �          0    17508 	   key_chain 
   TABLE DATA           R   COPY public.key_chain (id, hash, owner, created_at, updated_at, data) FROM stdin;
    public          postgres    false    216   
�      �          0    17493 
   permission 
   TABLE DATA           b   COPY public.permission (id, name, data, created_at, updated_at, owner, "group", code) FROM stdin;
    public          postgres    false    214   ��                0    17917    permission_group 
   TABLE DATA           _   COPY public.permission_group (id, name, code, data, created_at, updated_at, owner) FROM stdin;
    public          postgres    false    258   µ      �          0    17554    project 
   TABLE DATA           p   COPY public.project (id, data, code, owner, created_at, updated_at, name, template, category, site) FROM stdin;
    public          postgres    false    222   ߵ      �          0    17571    project_account 
   TABLE DATA           K   COPY public.project_account (id, project, account, created_at) FROM stdin;
    public          postgres    false    224   ��      �          0    17734    project_category 
   TABLE DATA           Y   COPY public.project_category (id, name, data, created_at, updated_at, owner) FROM stdin;
    public          postgres    false    240   Ķ      �          0    17670    project_status 
   TABLE DATA           R   COPY public.project_status (id, "order", project, status, created_at) FROM stdin;
    public          postgres    false    232   C�                0    17877    project_task_type 
   TABLE DATA           X   COPY public.project_task_type (id, "order", project, task_type, created_at) FROM stdin;
    public          postgres    false    254   �      �          0    17724    project_template 
   TABLE DATA           c   COPY public.project_template (id, name, data, created_at, updated_at, category, owner) FROM stdin;
    public          postgres    false    238   ��      �          0    17779    project_template_status 
   TABLE DATA           \   COPY public.project_template_status (id, "order", template, status, created_at) FROM stdin;
    public          postgres    false    244   K�                0    17897    project_template_task_type 
   TABLE DATA           b   COPY public.project_template_task_type (id, "order", template, task_type, created_at) FROM stdin;
    public          postgres    false    256   f�      �          0    17478    role 
   TABLE DATA           S   COPY public.role (id, name, data, created_at, updated_at, owner, site) FROM stdin;
    public          postgres    false    212    �      �          0    17536    role_permission 
   TABLE DATA           K   COPY public.role_permission (id, role, permission, created_at) FROM stdin;
    public          postgres    false    220   =�      �          0    17799    site 
   TABLE DATA           Y   COPY public.site (id, name, type, owner, data, code, created_at, updated_at) FROM stdin;
    public          postgres    false    246   Z�      �          0    17821    site_account 
   TABLE DATA           L   COPY public.site_account (id, account, site, created_at, owner) FROM stdin;
    public          postgres    false    248   w�      �          0    17655    status 
   TABLE DATA           U   COPY public.status (id, name, code, owner, created_at, data, updated_at) FROM stdin;
    public          postgres    false    230   ��                0    18161    task 
   TABLE DATA           �   COPY public.task (id, code, project, created_at, updated_at, owner, status, data, type, priority, name, parent, site) FROM stdin;
    public          postgres    false    275   g�      �          0    17690    task_activity 
   TABLE DATA           a   COPY public.task_activity (id, owner, status, created_at, project, task, data, type) FROM stdin;
    public          postgres    false    234   ��      �          0    17615    task_assignee 
   TABLE DATA           G   COPY public.task_assignee (id, task, assignee, created_at) FROM stdin;
    public          postgres    false    226   ��      �          0    17635    task_reporter 
   TABLE DATA           G   COPY public.task_reporter (id, task, reporter, created_at) FROM stdin;
    public          postgres    false    228   �      �          0    17848 	   task_type 
   TABLE DATA           X   COPY public.task_type (id, name, code, owner, created_at, data, updated_at) FROM stdin;
    public          postgres    false    250   =�                0    18136    team 
   TABLE DATA           Y   COPY public.team (id, name, code, data, owner, site, created_at, updated_at) FROM stdin;
    public          postgres    false    270   ��                0    18146    team_account 
   TABLE DATA           R   COPY public.team_account (id, account, team, site, created_at, owner) FROM stdin;
    public          postgres    false    272   7�      �          0    17764    template_status 
   TABLE DATA           ^   COPY public.template_status (id, name, code, owner, created_at, data, updated_at) FROM stdin;
    public          postgres    false    242   ��                0    17862    template_task_type 
   TABLE DATA           a   COPY public.template_task_type (id, name, code, owner, created_at, data, updated_at) FROM stdin;
    public          postgres    false    252   '�      I           0    0    account_role_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.account_role_id_seq', 1, false);
          public          postgres    false    217            J           0    0 
   app_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.app_id_seq', 12, true);
          public          postgres    false    261            K           0    0    app_usage_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.app_usage_id_seq', 2099, true);
          public          postgres    false    265            L           0    0    comment_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.comment_id_seq', 9, true);
          public          postgres    false    235            M           0    0    device_app_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.device_app_id_seq', 117, true);
          public          postgres    false    263            N           0    0    device_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.device_id_seq', 6, true);
          public          postgres    false    259            O           0    0    key_chain_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.key_chain_id_seq', 5, true);
          public          postgres    false    215            P           0    0    permission_group_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.permission_group_id_seq', 1, false);
          public          postgres    false    257            Q           0    0    permission_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.permission_id_seq', 1, false);
          public          postgres    false    213            R           0    0    project_account_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.project_account_id_seq', 1, false);
          public          postgres    false    223            S           0    0    project_category_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.project_category_id_seq', 3, true);
          public          postgres    false    239            T           0    0    project_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.project_id_seq', 13, true);
          public          postgres    false    221            U           0    0    project_status_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.project_status_id_seq', 17, true);
          public          postgres    false    231            V           0    0    project_task_type_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.project_task_type_id_seq', 13, true);
          public          postgres    false    253            W           0    0    project_template_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.project_template_id_seq', 15, true);
          public          postgres    false    237            X           0    0    project_template_status_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public.project_template_status_id_seq', 34, true);
          public          postgres    false    243            Y           0    0 !   project_template_task_type_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('public.project_template_task_type_id_seq', 23, true);
          public          postgres    false    255            Z           0    0    role_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.role_id_seq', 1, false);
          public          postgres    false    211            [           0    0    role_permission_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.role_permission_id_seq', 1, false);
          public          postgres    false    219            \           0    0    site_account_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.site_account_id_seq', 1, false);
          public          postgres    false    247            ]           0    0    site_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.site_id_seq', 1, false);
          public          postgres    false    245            ^           0    0    status_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.status_id_seq', 19, true);
          public          postgres    false    229            _           0    0    task_activity_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.task_activity_id_seq', 1, false);
          public          postgres    false    233            `           0    0    task_assignee_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.task_assignee_id_seq', 25, true);
          public          postgres    false    225            a           0    0    task_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.task_id_seq', 19, true);
          public          postgres    false    274            b           0    0    task_reporter_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.task_reporter_id_seq', 21, true);
          public          postgres    false    227            c           0    0    task_type_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.task_type_id_seq', 14, true);
          public          postgres    false    249            d           0    0    team_account_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.team_account_id_seq', 6, true);
          public          postgres    false    271            e           0    0    team_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.team_id_seq', 2, true);
          public          postgres    false    269            f           0    0    template_status_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.template_status_id_seq', 19, true);
          public          postgres    false    241            g           0    0    template_task_type_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.template_task_type_id_seq', 21, true);
          public          postgres    false    251            h           0    0    user_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.user_id_seq', 5, true);
          public          postgres    false    209            �           2606    17591 *   account_role account_role_account_role_key 
   CONSTRAINT     n   ALTER TABLE ONLY public.account_role
    ADD CONSTRAINT account_role_account_role_key UNIQUE (account, role);
 T   ALTER TABLE ONLY public.account_role DROP CONSTRAINT account_role_account_role_key;
       public            postgres    false    218    218            �           2606    17524    account_role account_role_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.account_role
    ADD CONSTRAINT account_role_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.account_role DROP CONSTRAINT account_role_pkey;
       public            postgres    false    218                       2606    17971    app app_pkey 
   CONSTRAINT     J   ALTER TABLE ONLY public.app
    ADD CONSTRAINT app_pkey PRIMARY KEY (id);
 6   ALTER TABLE ONLY public.app DROP CONSTRAINT app_pkey;
       public            postgres    false    262                       2606    18056 +   app_usage app_usage_date_package_device_key 
   CONSTRAINT     w   ALTER TABLE ONLY public.app_usage
    ADD CONSTRAINT app_usage_date_package_device_key UNIQUE (date, package, device);
 U   ALTER TABLE ONLY public.app_usage DROP CONSTRAINT app_usage_date_package_device_key;
       public            postgres    false    266    266    266                       2606    18054    app_usage app_usage_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.app_usage
    ADD CONSTRAINT app_usage_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.app_usage DROP CONSTRAINT app_usage_pkey;
       public            postgres    false    266            �           2606    17722    comment comment_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.comment DROP CONSTRAINT comment_pkey;
       public            postgres    false    236                       2606    18029 (   device_app device_app_package_device_key 
   CONSTRAINT     n   ALTER TABLE ONLY public.device_app
    ADD CONSTRAINT device_app_package_device_key UNIQUE (package, device);
 R   ALTER TABLE ONLY public.device_app DROP CONSTRAINT device_app_package_device_key;
       public            postgres    false    264    264                       2606    18027    device_app device_app_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.device_app
    ADD CONSTRAINT device_app_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.device_app DROP CONSTRAINT device_app_pkey;
       public            postgres    false    264                       2606    17949    device device_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.device DROP CONSTRAINT device_pkey;
       public            postgres    false    260            �           2606    17516    key_chain key_chain_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.key_chain
    ADD CONSTRAINT key_chain_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.key_chain DROP CONSTRAINT key_chain_pkey;
       public            postgres    false    216            �           2606    17939    permission permission_code_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_code_key UNIQUE (code);
 H   ALTER TABLE ONLY public.permission DROP CONSTRAINT permission_code_key;
       public            postgres    false    214                       2606    17927 *   permission_group permission_group_code_key 
   CONSTRAINT     e   ALTER TABLE ONLY public.permission_group
    ADD CONSTRAINT permission_group_code_key UNIQUE (code);
 T   ALTER TABLE ONLY public.permission_group DROP CONSTRAINT permission_group_code_key;
       public            postgres    false    258            	           2606    17925 &   permission_group permission_group_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.permission_group
    ADD CONSTRAINT permission_group_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.permission_group DROP CONSTRAINT permission_group_pkey;
       public            postgres    false    258            �           2606    17501    permission permission_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.permission DROP CONSTRAINT permission_pkey;
       public            postgres    false    214            �           2606    17577 $   project_account project_account_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.project_account
    ADD CONSTRAINT project_account_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.project_account DROP CONSTRAINT project_account_pkey;
       public            postgres    false    224            �           2606    17579 3   project_account project_account_project_account_key 
   CONSTRAINT     z   ALTER TABLE ONLY public.project_account
    ADD CONSTRAINT project_account_project_account_key UNIQUE (project, account);
 ]   ALTER TABLE ONLY public.project_account DROP CONSTRAINT project_account_project_account_key;
       public            postgres    false    224    224            �           2606    17742 &   project_category project_category_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.project_category
    ADD CONSTRAINT project_category_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.project_category DROP CONSTRAINT project_category_pkey;
       public            postgres    false    240            �           2606    17564    project project_code_owner_key 
   CONSTRAINT     `   ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_code_owner_key UNIQUE (code, owner);
 H   ALTER TABLE ONLY public.project DROP CONSTRAINT project_code_owner_key;
       public            postgres    false    222    222            �           2606    17562    project project_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.project DROP CONSTRAINT project_pkey;
       public            postgres    false    222            �           2606    17676 "   project_status project_status_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.project_status
    ADD CONSTRAINT project_status_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.project_status DROP CONSTRAINT project_status_pkey;
       public            postgres    false    232            �           2606    17678 0   project_status project_status_project_status_key 
   CONSTRAINT     v   ALTER TABLE ONLY public.project_status
    ADD CONSTRAINT project_status_project_status_key UNIQUE (project, status);
 Z   ALTER TABLE ONLY public.project_status DROP CONSTRAINT project_status_project_status_key;
       public            postgres    false    232    232            �           2606    17883 (   project_task_type project_task_type_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.project_task_type
    ADD CONSTRAINT project_task_type_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.project_task_type DROP CONSTRAINT project_task_type_pkey;
       public            postgres    false    254                       2606    17885 1   project_task_type project_task_type_task_type_key 
   CONSTRAINT     z   ALTER TABLE ONLY public.project_task_type
    ADD CONSTRAINT project_task_type_task_type_key UNIQUE (project, task_type);
 [   ALTER TABLE ONLY public.project_task_type DROP CONSTRAINT project_task_type_task_type_key;
       public            postgres    false    254    254            �           2606    17732 &   project_template project_template_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.project_template
    ADD CONSTRAINT project_template_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.project_template DROP CONSTRAINT project_template_pkey;
       public            postgres    false    238            �           2606    17785 4   project_template_status project_template_status_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.project_template_status
    ADD CONSTRAINT project_template_status_pkey PRIMARY KEY (id);
 ^   ALTER TABLE ONLY public.project_template_status DROP CONSTRAINT project_template_status_pkey;
       public            postgres    false    244            �           2606    17787 C   project_template_status project_template_status_template_status_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.project_template_status
    ADD CONSTRAINT project_template_status_template_status_key UNIQUE (template, status);
 m   ALTER TABLE ONLY public.project_template_status DROP CONSTRAINT project_template_status_template_status_key;
       public            postgres    false    244    244                       2606    17903 :   project_template_task_type project_template_task_type_pkey 
   CONSTRAINT     x   ALTER TABLE ONLY public.project_template_task_type
    ADD CONSTRAINT project_template_task_type_pkey PRIMARY KEY (id);
 d   ALTER TABLE ONLY public.project_template_task_type DROP CONSTRAINT project_template_task_type_pkey;
       public            postgres    false    256                       2606    17905 C   project_template_task_type project_template_task_type_task_type_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.project_template_task_type
    ADD CONSTRAINT project_template_task_type_task_type_key UNIQUE (template, task_type);
 m   ALTER TABLE ONLY public.project_template_task_type DROP CONSTRAINT project_template_task_type_task_type_key;
       public            postgres    false    256    256            �           2606    17542 $   role_permission role_permission_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.role_permission DROP CONSTRAINT role_permission_pkey;
       public            postgres    false    220            �           2606    17593 3   role_permission role_permission_role_permission_key 
   CONSTRAINT     z   ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_role_permission_key UNIQUE (role, permission);
 ]   ALTER TABLE ONLY public.role_permission DROP CONSTRAINT role_permission_role_permission_key;
       public            postgres    false    220    220            �           2606    17486    role role_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.role DROP CONSTRAINT role_pkey;
       public            postgres    false    212            �           2606    17829 *   site_account site_account_account_site_key 
   CONSTRAINT     n   ALTER TABLE ONLY public.site_account
    ADD CONSTRAINT site_account_account_site_key UNIQUE (account, site);
 T   ALTER TABLE ONLY public.site_account DROP CONSTRAINT site_account_account_site_key;
       public            postgres    false    248    248            �           2606    17827    site_account site_account_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.site_account
    ADD CONSTRAINT site_account_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.site_account DROP CONSTRAINT site_account_pkey;
       public            postgres    false    248            �           2606    17809    site site_code_key 
   CONSTRAINT     M   ALTER TABLE ONLY public.site
    ADD CONSTRAINT site_code_key UNIQUE (code);
 <   ALTER TABLE ONLY public.site DROP CONSTRAINT site_code_key;
       public            postgres    false    246            �           2606    17807    site site_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.site
    ADD CONSTRAINT site_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.site DROP CONSTRAINT site_pkey;
       public            postgres    false    246            �           2606    17662    status status_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.status DROP CONSTRAINT status_pkey;
       public            postgres    false    230            �           2606    17697     task_activity task_activity_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.task_activity
    ADD CONSTRAINT task_activity_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.task_activity DROP CONSTRAINT task_activity_pkey;
       public            postgres    false    234            �           2606    17621     task_assignee task_assignee_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.task_assignee
    ADD CONSTRAINT task_assignee_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.task_assignee DROP CONSTRAINT task_assignee_pkey;
       public            postgres    false    226            �           2606    17623 -   task_assignee task_assignee_task_assignee_key 
   CONSTRAINT     r   ALTER TABLE ONLY public.task_assignee
    ADD CONSTRAINT task_assignee_task_assignee_key UNIQUE (task, assignee);
 W   ALTER TABLE ONLY public.task_assignee DROP CONSTRAINT task_assignee_task_assignee_key;
       public            postgres    false    226    226                       2606    18171    task task_code_project_key 
   CONSTRAINT     ^   ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_code_project_key UNIQUE (code, project);
 D   ALTER TABLE ONLY public.task DROP CONSTRAINT task_code_project_key;
       public            postgres    false    275    275                       2606    18169    task task_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.task DROP CONSTRAINT task_pkey;
       public            postgres    false    275            �           2606    17641     task_reporter task_reporter_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.task_reporter
    ADD CONSTRAINT task_reporter_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.task_reporter DROP CONSTRAINT task_reporter_pkey;
       public            postgres    false    228            �           2606    17643 -   task_reporter task_reporter_task_reporter_key 
   CONSTRAINT     r   ALTER TABLE ONLY public.task_reporter
    ADD CONSTRAINT task_reporter_task_reporter_key UNIQUE (task, reporter);
 W   ALTER TABLE ONLY public.task_reporter DROP CONSTRAINT task_reporter_task_reporter_key;
       public            postgres    false    228    228            �           2606    17855    task_type task_type_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.task_type
    ADD CONSTRAINT task_type_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.task_type DROP CONSTRAINT task_type_pkey;
       public            postgres    false    250                       2606    18152    team_account team_account_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.team_account
    ADD CONSTRAINT team_account_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.team_account DROP CONSTRAINT team_account_pkey;
       public            postgres    false    272                       2606    18154 *   team_account team_account_team_account_key 
   CONSTRAINT     n   ALTER TABLE ONLY public.team_account
    ADD CONSTRAINT team_account_team_account_key UNIQUE (team, account);
 T   ALTER TABLE ONLY public.team_account DROP CONSTRAINT team_account_team_account_key;
       public            postgres    false    272    272                       2606    18144    team team_pkey 
   CONSTRAINT     L   ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_pkey PRIMARY KEY (id);
 8   ALTER TABLE ONLY public.team DROP CONSTRAINT team_pkey;
       public            postgres    false    270            �           2606    17771 $   template_status template_status_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.template_status
    ADD CONSTRAINT template_status_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.template_status DROP CONSTRAINT template_status_pkey;
       public            postgres    false    242            �           2606    17869 *   template_task_type template_task_type_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.template_task_type
    ADD CONSTRAINT template_task_type_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.template_task_type DROP CONSTRAINT template_task_type_pkey;
       public            postgres    false    252            �           2606    17434    account user_mail_key 
   CONSTRAINT     P   ALTER TABLE ONLY public.account
    ADD CONSTRAINT user_mail_key UNIQUE (mail);
 ?   ALTER TABLE ONLY public.account DROP CONSTRAINT user_mail_key;
       public            postgres    false    210            �           2606    17432    account user_pkey 
   CONSTRAINT     O   ALTER TABLE ONLY public.account
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);
 ;   ALTER TABLE ONLY public.account DROP CONSTRAINT user_pkey;
       public            postgres    false    210            #           2606    17525 &   account_role account_role_account_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.account_role
    ADD CONSTRAINT account_role_account_fkey FOREIGN KEY (account) REFERENCES public.account(id);
 P   ALTER TABLE ONLY public.account_role DROP CONSTRAINT account_role_account_fkey;
       public          postgres    false    210    4029    218            $           2606    17530 #   account_role account_role_role_fkey    FK CONSTRAINT     ~   ALTER TABLE ONLY public.account_role
    ADD CONSTRAINT account_role_role_fkey FOREIGN KEY (role) REFERENCES public.role(id);
 M   ALTER TABLE ONLY public.account_role DROP CONSTRAINT account_role_role_fkey;
       public          postgres    false    4031    218    212            B           2606    17955    device device_owner_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id) NOT VALID;
 B   ALTER TABLE ONLY public.device DROP CONSTRAINT device_owner_fkey;
       public          postgres    false    260    210    4029            C           2606    17950    device device_site_fkey    FK CONSTRAINT     |   ALTER TABLE ONLY public.device
    ADD CONSTRAINT device_site_fkey FOREIGN KEY (site) REFERENCES public.site(id) NOT VALID;
 A   ALTER TABLE ONLY public.device DROP CONSTRAINT device_site_fkey;
       public          postgres    false    4085    260    246            !           2606    17933     permission permission_group_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_group_fkey FOREIGN KEY ("group") REFERENCES public.permission_group(id) NOT VALID;
 J   ALTER TABLE ONLY public.permission DROP CONSTRAINT permission_group_fkey;
       public          postgres    false    4105    214    258            A           2606    17928 ,   permission_group permission_group_owner_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.permission_group
    ADD CONSTRAINT permission_group_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id);
 V   ALTER TABLE ONLY public.permission_group DROP CONSTRAINT permission_group_owner_fkey;
       public          postgres    false    258    210    4029            "           2606    17502     permission permission_owner_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id);
 J   ALTER TABLE ONLY public.permission DROP CONSTRAINT permission_owner_fkey;
       public          postgres    false    214    210    4029            +           2606    17585 ,   project_account project_account_account_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project_account
    ADD CONSTRAINT project_account_account_fkey FOREIGN KEY (account) REFERENCES public.account(id);
 V   ALTER TABLE ONLY public.project_account DROP CONSTRAINT project_account_account_fkey;
       public          postgres    false    210    4029    224            ,           2606    17580 ,   project_account project_account_project_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project_account
    ADD CONSTRAINT project_account_project_fkey FOREIGN KEY (project) REFERENCES public.project(id);
 V   ALTER TABLE ONLY public.project_account DROP CONSTRAINT project_account_project_fkey;
       public          postgres    false    222    4049    224            '           2606    17748    project project_category_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_category_fkey FOREIGN KEY (category) REFERENCES public.project_category(id) NOT VALID;
 G   ALTER TABLE ONLY public.project DROP CONSTRAINT project_category_fkey;
       public          postgres    false    240    222    4075            (           2606    17565    project project_owner_fkey    FK CONSTRAINT     y   ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id);
 D   ALTER TABLE ONLY public.project DROP CONSTRAINT project_owner_fkey;
       public          postgres    false    210    4029    222            )           2606    17815    project project_site_fkey    FK CONSTRAINT     ~   ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_site_fkey FOREIGN KEY (site) REFERENCES public.site(id) NOT VALID;
 C   ALTER TABLE ONLY public.project DROP CONSTRAINT project_site_fkey;
       public          postgres    false    4085    246    222            0           2606    17679 *   project_status project_status_project_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project_status
    ADD CONSTRAINT project_status_project_fkey FOREIGN KEY (project) REFERENCES public.project(id);
 T   ALTER TABLE ONLY public.project_status DROP CONSTRAINT project_status_project_fkey;
       public          postgres    false    232    222    4049            1           2606    17684 )   project_status project_status_status_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project_status
    ADD CONSTRAINT project_status_status_fkey FOREIGN KEY (status) REFERENCES public.status(id);
 S   ALTER TABLE ONLY public.project_status DROP CONSTRAINT project_status_status_fkey;
       public          postgres    false    230    4063    232            >           2606    17886 0   project_task_type project_task_type_project_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project_task_type
    ADD CONSTRAINT project_task_type_project_fkey FOREIGN KEY (project) REFERENCES public.project(id);
 Z   ALTER TABLE ONLY public.project_task_type DROP CONSTRAINT project_task_type_project_fkey;
       public          postgres    false    4049    254    222            ?           2606    17891 2   project_task_type project_task_type_task_type_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project_task_type
    ADD CONSTRAINT project_task_type_task_type_fkey FOREIGN KEY (task_type) REFERENCES public.task_type(id);
 \   ALTER TABLE ONLY public.project_task_type DROP CONSTRAINT project_task_type_task_type_fkey;
       public          postgres    false    254    4091    250            4           2606    17758 /   project_template project_template_category_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project_template
    ADD CONSTRAINT project_template_category_fkey FOREIGN KEY (category) REFERENCES public.project_category(id) NOT VALID;
 Y   ALTER TABLE ONLY public.project_template DROP CONSTRAINT project_template_category_fkey;
       public          postgres    false    238    4075    240            *           2606    17743    project project_template_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_template_fkey FOREIGN KEY (template) REFERENCES public.project_template(id) NOT VALID;
 G   ALTER TABLE ONLY public.project DROP CONSTRAINT project_template_fkey;
       public          postgres    false    238    4073    222            5           2606    17753 ,   project_template project_template_owner_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project_template
    ADD CONSTRAINT project_template_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id) NOT VALID;
 V   ALTER TABLE ONLY public.project_template DROP CONSTRAINT project_template_owner_fkey;
       public          postgres    false    4029    238    210            7           2606    17788 E   project_template_status project_template_status_project_template_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project_template_status
    ADD CONSTRAINT project_template_status_project_template_fkey FOREIGN KEY (template) REFERENCES public.project_template(id);
 o   ALTER TABLE ONLY public.project_template_status DROP CONSTRAINT project_template_status_project_template_fkey;
       public          postgres    false    4073    238    244            8           2606    17793 D   project_template_status project_template_status_template_status_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project_template_status
    ADD CONSTRAINT project_template_status_template_status_fkey FOREIGN KEY (status) REFERENCES public.template_status(id);
 n   ALTER TABLE ONLY public.project_template_status DROP CONSTRAINT project_template_status_template_status_fkey;
       public          postgres    false    242    244    4077            @           2606    17911 D   project_template_task_type project_template_task_type_task_type_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.project_template_task_type
    ADD CONSTRAINT project_template_task_type_task_type_fkey FOREIGN KEY (task_type) REFERENCES public.template_task_type(id);
 n   ALTER TABLE ONLY public.project_template_task_type DROP CONSTRAINT project_template_task_type_task_type_fkey;
       public          postgres    false    252    256    4093                        2606    17487    role role_owner_fkey    FK CONSTRAINT     s   ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id);
 >   ALTER TABLE ONLY public.role DROP CONSTRAINT role_owner_fkey;
       public          postgres    false    4029    212    210            %           2606    17548 /   role_permission role_permission_permission_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_permission_fkey FOREIGN KEY (permission) REFERENCES public.permission(id);
 Y   ALTER TABLE ONLY public.role_permission DROP CONSTRAINT role_permission_permission_fkey;
       public          postgres    false    220    214    4035            &           2606    17543 )   role_permission role_permission_role_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_role_fkey FOREIGN KEY (role) REFERENCES public.role(id);
 S   ALTER TABLE ONLY public.role_permission DROP CONSTRAINT role_permission_role_fkey;
       public          postgres    false    220    212    4031            :           2606    17830 &   site_account site_account_account_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.site_account
    ADD CONSTRAINT site_account_account_fkey FOREIGN KEY (account) REFERENCES public.account(id);
 P   ALTER TABLE ONLY public.site_account DROP CONSTRAINT site_account_account_fkey;
       public          postgres    false    210    248    4029            ;           2606    17835 #   site_account site_account_site_fkey    FK CONSTRAINT     ~   ALTER TABLE ONLY public.site_account
    ADD CONSTRAINT site_account_site_fkey FOREIGN KEY (site) REFERENCES public.site(id);
 M   ALTER TABLE ONLY public.site_account DROP CONSTRAINT site_account_site_fkey;
       public          postgres    false    248    246    4085            9           2606    17810    site site_owner_fkey    FK CONSTRAINT     s   ALTER TABLE ONLY public.site
    ADD CONSTRAINT site_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id);
 >   ALTER TABLE ONLY public.site DROP CONSTRAINT site_owner_fkey;
       public          postgres    false    246    210    4029            /           2606    17664    status status_owner_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id) NOT VALID;
 B   ALTER TABLE ONLY public.status DROP CONSTRAINT status_owner_fkey;
       public          postgres    false    210    230    4029            2           2606    17698 &   task_activity task_activity_owner_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.task_activity
    ADD CONSTRAINT task_activity_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id);
 P   ALTER TABLE ONLY public.task_activity DROP CONSTRAINT task_activity_owner_fkey;
       public          postgres    false    4029    234    210            3           2606    17708 (   task_activity task_activity_project_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.task_activity
    ADD CONSTRAINT task_activity_project_fkey FOREIGN KEY (project) REFERENCES public.project(id);
 R   ALTER TABLE ONLY public.task_activity DROP CONSTRAINT task_activity_project_fkey;
       public          postgres    false    222    4049    234            -           2606    17629 )   task_assignee task_assignee_assignee_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.task_assignee
    ADD CONSTRAINT task_assignee_assignee_fkey FOREIGN KEY (assignee) REFERENCES public.account(id);
 S   ALTER TABLE ONLY public.task_assignee DROP CONSTRAINT task_assignee_assignee_fkey;
       public          postgres    false    210    4029    226            D           2606    18172    task task_owner_fkey    FK CONSTRAINT     s   ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id);
 >   ALTER TABLE ONLY public.task DROP CONSTRAINT task_owner_fkey;
       public          postgres    false    210    275    4029            E           2606    18177    task task_project_fkey    FK CONSTRAINT     w   ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_project_fkey FOREIGN KEY (project) REFERENCES public.project(id);
 @   ALTER TABLE ONLY public.task DROP CONSTRAINT task_project_fkey;
       public          postgres    false    4049    222    275            .           2606    17649 )   task_reporter task_reporter_reporter_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.task_reporter
    ADD CONSTRAINT task_reporter_reporter_fkey FOREIGN KEY (reporter) REFERENCES public.account(id);
 S   ALTER TABLE ONLY public.task_reporter DROP CONSTRAINT task_reporter_reporter_fkey;
       public          postgres    false    4029    228    210            <           2606    17856    task_type task_type_owner_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.task_type
    ADD CONSTRAINT task_type_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id);
 H   ALTER TABLE ONLY public.task_type DROP CONSTRAINT task_type_owner_fkey;
       public          postgres    false    210    250    4029            6           2606    17772 *   template_status template_status_owner_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.template_status
    ADD CONSTRAINT template_status_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id);
 T   ALTER TABLE ONLY public.template_status DROP CONSTRAINT template_status_owner_fkey;
       public          postgres    false    242    210    4029            =           2606    17870 0   template_task_type template_task_type_owner_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.template_task_type
    ADD CONSTRAINT template_task_type_owner_fkey FOREIGN KEY (owner) REFERENCES public.account(id);
 Z   ALTER TABLE ONLY public.template_task_type DROP CONSTRAINT template_task_type_owner_fkey;
       public          postgres    false    210    4029    252            �   �   x���1k�0����+���N'���B�I�,jmp;��!���X��P7�=�'��Ms7��2��n��~�:����PW�4�#i�.�@Y �����g�c{�O �	>��!�r�C����d��mz.,�����"1|+Z>��?:M�pZG(m#����h��b:��_�<.�����AH^��� N�{���>�}6Gk���`K      �      x������ � �         �  x�͔A�� ��3�b/���	$�4�l�C'��I/{AaF�(F���/�c/��M�D��<����P����8��4�R��Lh^jV�����CH��(t.!gb���O���Ǡ���N�2���'sqp��rufl���+ͪ��O�u�#����c}\�>��>�Sꈙzg���JC&�4�K����{g[�9���y��=�5��$J����+Yۜʒ��uJ�BZg_��ֹ����E�f�i�عu�Z���N��Kv�͸!ׂj& �6�BT� ��%v�@��C���\�[�!�m�
�\��,�-���w���'���(�a)|Ʒ
?Er�Bxn���N��A;�h.��W
w��w���j۽�R7�?V���y���.�����quwmCʝ.�`��[���s*�{<\s�Yz 9��#5E������S������)�            x��\]�#7�}��y�؂D}P�������5@P��������3�����vY�D��f&���)���em�{�o����c�~���?�_t\)�r�9g�3��T���z�u�ތ�nx���w/C:>�g}����<�bA��s+�:��O��hV�+���%�h�������h�a� ��R��3�����c_?�^����f�����o��v�6��`L�Gi��6�rfe|t�^���a�>W��f���S���v<=!Z�g`��MӴY���2��q|�]�=������u�z��Eml|֥ed�f���r����Lŕ�?u�e��n8�	ο�}��{��:B5��V2�[e[GHv��i�!�6��x�N]�������p���%�k#A�س5��cs���ޝ���~�	s8��Hvx؆
�6���R(��v�^��vN,���1�XƲ�Z9��gW�#���C�]0.3���2��<x�L2�Ud�FxN�F���҇��~�C��Ɛ}�����ms8�^���n�$��">R1�H�� m{����1�4\��J�N�|�����7�ӆ�d#��6�tV�� |�]\p����1�	�?�H�<d�����h����fZ�ŋV�1�� ^2&\�n���]���v��?g���/��脠�r�l�P��l��P3���>i�v?ɬmڢ͸���E��,�-гe��������?����GZT�]��Rv�*G:(��z�n;�'.�9\Ȫ��� ��`Ȭ�m����N�;�M;�Є0u���p��s�����O�|���1���$� ������Iܬ:P�H9~}����v�mO^�F��w���퉗=�Mp��6n�u�r��AN��s�ǁ��b�F0Kw�x�kFDu�5 i/s����Y��$A��Tw�S�s�ik��,\$t�c�-YI��Ľ�t����\���3�`3� �N�
-��@�n�O�9�HgFȪ���-�W�Q:_����ؤ�m�?���7ry0h����m��U��;�k�
�\oǯ׷m�q?��'��p{o	�Ym��c��4r����H�=s���� 0��6��K���>�ͱﾎ�$����<ض�$M@�L2��O�m�c��ؐ��/�-�4�{�l��,�����C��Ü����O����~���G:?��];z:��I�(���w#���c��o�/D����0BД�x��v�OI����o����Ӱ������4$�L��
GR�>��,��7㐀�gx9~������0�h�yi��mgH]4h��f�+*M<khO�5�� �,�C��p�-��I'070���И�$�6L2gZ�m��q^/(o���i��1%Ċ�iG�E��/׻J�מb��0?~����!i�i}F�N��J��}��aK�}�F�'ƪ�/iP���4:����CbTO���%h���A�1X�WP�r��0��D�UQz����:%W��+V�pD����Q�F�Uh"G�`���hy�`��`m	�e����ˡr�H��"֕ (�@�A��`.��xO��`|	D�h��")��R�ĩ�%b��T�}���W�60�W�ӫ��E�9/V�	��qQ�GEe�|��ߜ>�^�B];�VZ����bH���̸��<o��k�����_��hNRʮ,��B��e��_̝��ud�m-7��K��$,�����o���]��C��,���T�����O����S*�(��]����Z6r-\�	�!�#�0�&��}&�0��v,�A�=�K1�n�B,�Y�{9\�(��/T��?���=E/#	�E5�Q��E�`��}n��$���6Uh�sQ"��QE9s/�j��]��ӄ��	�%"q���;j��A�L�)��t�ω�i0�z�c�V��k$ $!AU[!�*�
�P����*��|2Y1�[�{FU!�"fF�{��,Y�Q�(gB��mu!�k�̢�F��%��|��3
QCѦxY��x�.;@k-�2"��)q8���X�a�� �8m�y��WJ�Tc}�_Aυ�,N1�b��wz���x�$��I1z�:�@���9ceu!��%�?�=��v3\؍e#�k�"e/�a����\�*�AJ�������~7l��貋�����o�O����~M��2�$TFW�\4�����qGb{��U�{�p�65�쒣�jg�f�L�J�6X\��md�f�����ȩ�����@FlV�R	���E�"3=�&�`�rxX-�p,�+��0e�l#�ؙlPA�Sa�ej#�a��ai}�S"��l���cH�����BY�� u��7+����]¸���R���85i&l�{V���j������Ӏc9+?)�#�y7NE4Ò	 ��"��}���ז2�!@�lNN��ܶ�L�~C�;����EBY�P��%����is���($���vr�e���Ebz��D��m��~�M6y���8���q�lʽ�H�Q��u2��`��[������,`f��l�y�j~�\�u�l�.
��z������:�C)���VBI�н� �i�ٜ;1q ,Ǳ��I���w�滺���{,�=�fxP���ׅ\�z��B���F�6�����}�pB<&8�}E�3�b��L��#� B��$g���
=S�\(�pB�c�S˵��Cy�d4����3�W!T���-�=@á��$[+����� ���|CD��E��7I�ԇ<���cg�@��n:B�͞���L�����a1�ŖZ�wl��]p�W�ϙn����B�Q���.�K�]]�e�b-x��lc��ՅXp(J$����S����,�PlG� �e��������xe1��b�J�Z̭Tw�`Y���_�c�;>�s�x����
��Zv����XpAl#�v��$�U�|��e� G^�(��)�,�b,�� W��9ҍ^���:�%���![��)�8�A��B�	Ř%�ۼrǢ?��b�o"��icQ�j�2�\MwwF	C/���Xw��:�+���6&�;(G��wzH������"H1 �C'��7L�a�Q�����&'�L��ږO��a.��� ^ǪU6c�2a�K^NF+[v�kq���� ZV�6,]���1���on����l*N��l�j�n˦�۲�Ɵ[�ڨyQ:���E)-��r�*�-l`�����\���y�h�/x�)c��mokG��U�ŗo���+:a|h&ɲ��F��������GֲWn��-�=ߔ攑���Y�z�5A�(����-��­����Q��P���Y��:v^� �-�'��c�V�ۺ�|�W9��]�L�u-�h����YǢ�֠���<��$5i]y�֜ץ�X�#kMY�⬞��-���6Xa�Z���y���k����u,�j5:#���ڃ>ֱ�e��xA^���װs6'��r6�w��u�:Bޥ9SGQV����,j���m�Hk���n[���t�T)��+�W.�l���#�"P���$r �Ml�c�Y��cP9����)!�s�s^��p�p�zF��<�U����hyƦ�h̼�6�������w��#T���zF��߼(��lG��<��ַl�$�y^-nӬglZ����À�A�#��֗g3�7J������sַd�EC�\]=6�b=��u��6}�]{Ѣ�/*�qt�V�o��XTA��LP,RS��9���AE�R�7V�.�uE��P��W�o>b�p$�1C�-�ٷ���h�r��"��`�����O�y4U�Yt6������"<S��*�x -˿^��|�E��=ռ�S�?�k�GѢ<&��ۢ�?��.��<뛧yA�<�޽`"%����Br%B���2dJ$���6��N/�/�X5p����(k�p�MA�-��E��aD["^��<fs
�ym��c�Nn^��|�e�`�4�E�,�1��.ͼ�EF������d9z�e%��=4��AMJ��/��Vj9�W�ͦ�K���_[�R�:�0�A�����s��uΝ]d��tXTN�B���RL%���s��8J�Z�i j  ^({��Ѧn�)2X���J3�w\9��ك,���+�V:R���-�D���l��ѕ�a�G�y^� oc���b����)Ơ(3(ѳ%�eSӄy��2zC�ޢ��9�mDŭM��TCۺ~�*9�Z���]��憶�|/�j��S�ۑZ5!$H����	�R��9M�߻R# �0������<�܆rq��N�X�r>�d���1�V��"�T�����^J2�7��[/Фp&�c���c"�����]
DҾS��3F9�D6�W��C��2	�3I:��E\2`q�X��5��Jn�XF	�,P� M�s'��Ձ�4��B�A�W��E�[�;}��(���:@#)�4%d'��*�
�$
���v�N�Hſ��pޫ�Y�lMZ8� �P�%y��� �(��A���T'K�Ox��y&5Eu��񡍩��z��`]� f��=��'yF]o���1��tRmwΫFs<1�hg//�x��:	ġAM��IA�h%R�ݒr����-f9�-�.�[o�惞��iF�Z˂���Uݻ�8�Z[�*)}g�D��m��@R����t����u�n�Y�F�&&�%a1!�fAe-"�2���^�k���(��� b�z���ǣ��1USb���O���i���1IH9�"XD�;`$�e�����m�r�#�XH>6�u'"���^�Y@�	���g0�� 97��R"��8��4i�(��.�.l�]��e�o�X0�b���6���"�h�I�v�Ρ��uxM���3������^�)�2k����E� g��(k~+�UID�H�(s����OM�J+M�z���Ghu��鴬��r �U~V��lҒϿu������      �   �   x�}��n!Ek���#�y2��M��n��E��"�Q�ﳰ��l�{8sA�N���Ώ��� v@���HAd9Cz �P�z�<�I����j̬��!6��=�T(�J�C�`O����C)��L4ű�&�\������E,(I�;�p_������a2��������U�]��Ǧ��ԧm�k}�����:/��\�z{L
@�=*+��������2i)�v���}� ����s��:͇c      	   J  x��[�r�}�|��OIeD��T^��4^����eכ�"!�k����m�֤���|I�H�R�ev��NM�H 4�ݧ!���ڵj[Ҭ���e�=KӬޞ�T���.6:�U��uE�=���B{?�����{$%��N�������p��<�zw4�q�@�kٶ�Ň#|���ph��Z
av��Wվ�)#U�K!���mk�w)ܯ���s���`������̣�h�O����X4�Y������!��~$ZYrAJ���;��E�*�bt��!����#C�����w�p|��p���h�����,&0���&���JIJã�㡘��F�.�,��5�&$���_�N:b7��8���/��QmT��/���я��Lh�I��WM4�R�`�V*��)o�T�Q1��;W�sJx�cwT�GV߰;�˫���_;����e]�HQu�`K�!�X������r���R���7:�>\�_h�F�����TN�"��銦b���z��7@C���{<�����>�sS��Tq��c����PJ�L�}�ӽ��$o_Ĺ���r�}��'Ϣۈ��n6�$�ۊ)9� �8����Sg�v��w���(���n>��F���Su�I���&bμ����x�N���YD�����u܊�_�Ѣ�8�ĳ��~�E��SP��J���&?r9i��|��l���$ 5������P7�~���U�{]�����"L J�'<_ ��γB�,�@��:���1��J���}���>�� �uP
�6;�4hH�l
G=�ŲGK��h�gY8)z��3��1�)�_8�?Dd��ie�S��<In��a���:Z����t>~��s���i�b���2�|�D�Z�E
oR*}*	����?�q�fq]�g!M_�8%�4e�p�7a�4��6���%�14�կ�Y����V���18,�.�E�y"�Ú�4(c��,qYL�����y�^�^U쨞�6R��ϏNF·�㓡\` �e���$�|��,�<!�ТpBN��=�p��	v��b�s����K8�}����5�&rI�F��_��|�<��a�	�x�Rt���Mi��x~�<�h�2�8~�)� �/���q!rr�d� :��r�CD"3�9"\�wqO'"�6����>�(� lX����	����B"�;Y�\"�U"��3~+]>��A�����f<�8��v��~38;9��6�8�������S��}?���`X��)	��,4���ne�e���u���Lƞeb�馍���Kdt���p߰M�>,`Pի����U��l�2��.��  Ov_7dH����VT(-�i��uE&S��n�X��v5 һ��,85c�7�����M�*�yH2��GV�����?l`)ɦ6q���-`��=�U����:N|��B�� ,(�tlI�,aJ���cz�?��`C���/E\kJq��H3��+���-��*y,N� j�2A�Ypl=v��58���UV6 �O�~�;�)yx��P!�i*��x1���ԧ��"N�<�N�=���l�_��A�J(?wwǏ���cՕDYpK"��X	��G�/ �	��I�:�,�����Х�$��[�)�Ɠ1���I��7�Tn�{?�ؽ���o��N�g��V�)Kٔ�Y����j�֡�eNp��5.4�H��X}s���`YNkܬ��X���U$����I�8����R׬�p?������`� dwb����o;��S�P�
G�3l=�^���	M'��r���~?:9�0:>;��u.��Ǭ.�nWv+�9t�|��JC��I�D��D~zK��E�pH4�	įR?��d�y��(�� �$xB��07'r)J)��ߤF��DK�Ƕ�
��6e��*�I�FA`Ϣ\����/�F�Sʐ�e�r7�sGM��g�����g������%�8�Y�`W���~��% w�
�<�,(=�>GWk��AҔ±������Ӧ�6�E���	u�ϒĐ-y�:����a]�(J�g��Lǲ�E�T"�EC��V���6߫�5UU}���5s�šiE���,��`$��tV܊�g��詨��\�V��7��j*Z��=m�ԣXJ�\��@QU��� ���(?��֏�gq% �^R$��#�DUƸwu��Ib�l�"Rv6�X�H�2�
N5ϫ�#�wN�ؐ��M�Z���g�r!�&���Y�&$�?�1>���-VTz '|���`P�rqtxz|sڎ���	+��$����ԻwV�GxH!�t�z�_w��B��k*B����3V\���ja��j��NT��;�^��!^K*� ���2�e�\t��F�����<8T����$��㣋������q4���IɒIY3.�i+1\/���x3DP=Y6J��k�W6�A���щ#^k��4o�!ڨ�v��Ž�����hͪ��Ӹ'�;���dV�'m$�wI�v ��U>K�P����h�f�cq �*�)�C�N��H��B�p�͜�*-�+��؃d�5����\�<>;N�3������\�lxRS�V�X�Т"���F���e��ړI�MY}�,����J����9_���ƏSqS��n����٨�^����˫��U���K^�뭅�eQݕ��J����Dj�1�@8'OO�/�����IM�{�|aS>�t��#�rt��q��Έ�U����y���Qhv�m�1�2�$��l�]v����'D�����s57�����+�)�nY5P$5t�aY����JRf����-hVc��YH�6B���j���hv�`bp<��
�������9�����|�-�0	-[��m5��0Ɋ �$/O�W����v=%jR/k�����xpxs�^7oPU3x��+95X�s���ط6;(���5��Vwۭ��hF���],��v�񍨋�.�-���U6H��(�����O��N3b�R�޳mݶ�ׯda�V�O�ֻV,��6/h�V�(�T��e�W�R\	\�2��	�q,d"��M�f7���ݞ�M������K������!���V�i�D��v�Sm��y�jղ怕����t*�*j�*��O�rC�<N{rFJ���T~w��.�-uB�T~
�W#ے+�G�ȹC�� t*kWC/�� 茲���צxZ�8�NiMͳ��y����E-8��g$ ȭ�u��^+����&a�6$�+�F�zRm9Nk5�@��v�-��g��[�����aM&��?��h�L9���5�ϖǦO?�6~��'�V�o�l�D��$��?#�����oy^L�<��خSa�S8���E��Ű���&�*ꥇ	ri��w�~�럪b�G�ݻw���*%         t  x��Z�r��}�|�SF���7[�l'K�#)v%�U.�I�@�@����[�ei\fx1r�핗�p�o�����}�(�m��-�r��MV��+q�ǧ+N�xC�."ή���*��J��"&���.�L��7@f���u���d'Ų*�%�n�¢��=$a�����Z�y/�ޔ+��@��cA��'��iѢrݴx����L�^��:�j�9z ;e�T(�1�@������KY.w�y���H�<'OY�g�#s��T;�PVdo;��7 #�?Q����"i�� w�&M��0��Di���Z�Mǰ.�u�zh	�xY.P��J�9~;��V�sJ�EY��ca4�VJ���� ��\-VYU7�x��]�m��9�Eq-0��A>���Dw��w LD��&�o����F��]Y>���H�!/�zQ�/�<����@�3�ы2ֻ��/���s}��
�<�1�x�uh�ǽ�X4���Ԩ��
��"����1Z+� hpZo��Fd��Ŧ�uV7� �����޳~K��m��W"���x_��*�$M��<�����g�EY�������%i��i�%C���@E��"�_����ʗ��C2�yo���(�}�mVd�<��U��վƾ:�[i��-W�= E� ED�d���	n����s������3�8�|A��e�ߊkn�%����x(2�Y����z΢ܖ�Sz��y��s�=v2�?c=��%�@E�Z,��ޟY	�̒�O�4i�}X]+sg�F-����߲�!I���"�P��|<�;#�p8�����G�!�w�e�&�]�_{��H�����H��.7��%�#x*��)~B� ����:jPŢ�ϊo���*{�X%˴"r��EU֝��vۤH�i��i��J���OQSF_�bY��ġ�2�7��h��_V�bP&�8UƧ���pD�$��Y���,-��2�f���2i�dQHzq����3�A�(	D{�e���.�$��H�-��]8/���h�C��Q4[(_�v�D�� �ZC@�M�ی�N@ܷ���τW������{���KY����v�Ü)��~�&U͒��lI�UY��&��Nf�שA�"~�15 L5�G�NL�C�CN鑡�1Qd�ş����{�i�=�(щېRR}���!z{�Ѵ]��n�_���y�җ	HŬ�Gȳ�֧�u�l�����Kp<)Xo��Y�a?'�O�e������Y�����QC��x뵈p/5a��S�?|�.G|γhf�B+��O���̓E2���N��h���N�|!b~������ӊ�$|��BK�����￿wXDбٵŨ�c��%e�*���l����zʖ��6�9$p�UB�B!�QV����Ê�j@�=����q
Å�h�0!Cܵ0D����T���z�m9(ۉڬb���ӑ	��\*�[��~�ʓ*�J�es�+Ϊ��gվ����������,�j���c��*��~hLp�"� "{o�$�k�_��I>�6��o�ǂH��_1�ǻ$��t<���Vxgn�h�9i��UV1�Q��o5�I��?��У��� N]�-'5q��j-}��`�M�F��½�?Hx�MR`��!�M4�Z��7��E��uV@y'L�}�*�S|�%c����;	`�7��� 'xn��&�<k�vh�+����w��з����Mt�}��^L��y�I�߾AA�>���	�o�s�1�u��Gʄ�*��1wn1z���,�z������#.q+@��"d�(��s*���O7ї��ᆠ�}��:���)��zo� 	a�wt�-8��e�v�����6o�X�Z0�兩[1�S(/rǧ�� :Q*�P������]��h`����2��1��ԧ�~��+��Sm%�@��3;@�L�xm�p;��2(F��s0#�� q�O6z�񲁎�� �$'|��|��������~���R!�>&��5z,����2r����%<c��z�ҜA9�X\;�(��T*���ؚM(}uACյ`�X�KM���#�m�V�*}����i�����Y��&��2�͍?�qw��X)��*��\ʋ�	�>K�i�Vä	d�,z���0Il��	�],��a`����Q\Y��Ѱ�X\�]̬&�{�TQj6>�2b���I��%	Rhh���((0�T]�'�ܺ����/��Q��9=RO�H���]�d�à�L�d���R"�m��DB=q[MNzV��"T�a5���G�T�/|T�,�>o���'X��h}<4�'=>�t���98~_��M>��W��	6i8~��_�Y��(��6��i�& �e�͇@��|�CJe�:-B�}>�r�џ`p��&	��gT�j���*�Ѥ �}F5�U�`p����9Y*C��i���COъ*BZ;�*3��%�X+㼆��:I��uke��#{�	l-��#CA=#F��2Nd�V�J��O�Ų�z���8�2а��E��ل�ڡnL�I��̴��y��O�]�<�;o�&p�ų���c�&��D/���{���ϴ�eSϮp�p�����ٕ��;�����Ҷ�)Xq�S�AWâ�R�d������c�����b4���c;���4�8�e5�7�� ��JY	P�Y����)s��aP��	��1�;��M��#�Yp�9�,���6kx����/ZP�xm�>�_��aX|1��`P����v�³a*:�vg�+P�K�o���5c�D��Jh���!��(����ܗB2�vZ�;q.��+����N7��<>�� s��}���]:�K��]�4����ʻw���~p�-�-4y�������m�1�JO�[n�D�7CB�iA���Kg�d�_�KϨ�9���$:)��?P�qG�?*�#&���z��      �   �   x�]�;
1���f�K�}�&�܀`a7�X�� ��{GN����p�ޏ�-0�D�넥5��nFD�w��W����,�d�B`�>=��י@FAu�o�SAV�.th�J�PM�\%waC���#�ތ�R�bV1���U7	      �      x������ � �            x������ � �      �   �   x��Ͻ� �������m��ح:�حv#6��d�w��&�&N$��{"{�[?u�9��,�BvC�tq_b|�p�֞�T@A�5xB��Y��YmY��,Cb�Vx:W0�q���H���qJk[�v���*W���[&Q�e���a����?l���y���I@v��2����Vq�_��P�      �      x������ � �      �   o   x�m˱
�0�����p�]�{]���!�R�`����8��ݗ����J�@¢-��A1��*#ߘ '������/|2Q/Q���+�����C�A�껂��9F��hE!B      �   �   x�m�1n1��{���o��aϒ��#���"�����jh"-A�`} 7�(J����˛$�]@���rrp��o�t;h�2��x�<}9i��d�z��i�(�Vi2�n^�M�d'�|�G����A�a	]c�i��+n��ЗM������P�u���AZ.�Ε�L�ݯ��XN�         p   x�m�;
�0E��^��!����Z��u��@�īWQP��D��S1�)<F�?�.���}�4�i<-h�l�6�7;A
�S7��i���� �a����5�	���~}Q���$      �   �   x�u�1�0��
vCsw�-��8Y�VbD0���b$D�_����X�}q
��8^/u)�  ����N)��4�'��i�c� ���|7-�X�ZZc��(��r1��,-ӨpR$2�����%�q�M@������2��d^�"m���h}��7_�3��x�i��|�e��ۛ� ޾[RS      �     x�m�1n!К=E��[���Yr�s{�!m��,37�&hʊ��Kb˃C�����ʺ@5
zӂ~B[��3�h������&¬'���}�\����D� ��,C���о��}��v^!���W)=C��+s��U��Pm�d�����R�3C��+�п�"C�Ņ� �Q��28G��N�J^��R�\"!���x��LF�ߠ[�GP[Դ���bƇ5���A�^'���p\�b�w�y���U�r`�	$�+�$���y~�څ�         �   x�mл�0E�ښ"}`��?�,���r�$6�ʃKHЍ7����ξ+?0��$������,h�Н{�Ъx̿���p2�C��rG3�]N0E��c������D�p_0�(��������[dL�f�	�Nk�
� XA�*��|`�,;�8u��U��q"m}ϋZko�VH�      �      x������ � �      �      x������ � �      �      x������ � �      �      x������ � �      �   �   x����� Fgx
�٘��q���ɱ[K�	���w��]�
$,$�pN�:�Σ洜w���V;�?�ې��·�ʩ����a���<��c?	6�5��F (1���mp�n�U3
B9�2�W���_��u�0@�1$,I-��3�Fe���k���&E�}^�k�4�Z��,���6�5aN���U�����f�1��z1           x���M��F�Ϟ_Q��������	�6�YB���Eki�"���d&K�O�-�����`T��z�Ӵ��1=�zD�Hh�tQ+��Ӓ~B�ZI�d2+���e5l��O�0���z�5]�/�C���"J�d;�d�����d�l5*�=.�D�#���C4��K��*�������W�+�l�T�Ư���#�I����Q�^ۉj����D�r�JG�B�`)V(������ݜ�f�(��)��޻<���s��M�Y5�?'�`TF���v	tX��zL����<ܰx��N���#<D
B{Z�6�,\Np9�U&���J�`U^���L��WM��M���._�������:����q�O?��T.��c�z4O�L�yY��\��-t�ᢻ����ڧ���3I��MQ��L�ly�%r��笟�}pu�t���tR�Z�R*�ù���M��r�eJ�֊��د
򂝐�.	��ۉl�ԧ2:I�]���(�|���K�m�3���.�F(��y��<)����o��۳�u�2�c�	���'�R���MYB�~�O|�a���� �P�0v�-�š��>����P�u5�U;�/P��;��i˾��ߊ�~�x����t��_롂z�׺i���C��sѤ�-�;ֶ-�4�E?��t��c�6��

���]��l.i8�v���=}��(�S�ǰ�S<)����)�{����_���>���^��b����F	Zw�}�H��T��>_�h�0��i��Oem����6�����O٤��1�,�3d=      �      x������ � �      �   N  x�m�A�D!C��)f?��,s�s�W�]��Ub�q������?4�*}���b���B�t1�u0��3�bJ��ٌ�okr�'Q
u[�(���Ɠ����/Ƌ�ԙi^����ff1���0��mT���)��$"���0����Tl��<�
�$��u����0ې�a1LyC�]nF)փb�]�N�E��c�ƶ����d��I5Z��(K����Ʀ��R���Z�yj����e�IV!�V����k�&��Z�&3dnu�x��2��Q���Ɲ���8*��ZQ��0�5�B͋ZZ2~rU�q9*v_jlQ��z�*֥�      �   !  x�e��q!г:
�]���%��\<��W_��F���/��^*�28��a`��d���H�;G��"2��L�B�i���5+ʼ���L���e��FN�3��;��.�����2�]Fu�/���-�MiBX�R�k#�|'-u�;j�#�V/b�<��[�R�q[�y���k~g���s�ʀ�p�j�� D�< ��q���V�d����ށ쥘��s�m�qz+�&F
�8{%t�Ke���!q.���x)�2j��U���}�R�M�����<��j�F      �   �   x�3�t*M��j����d%+��Ҝ�����" ���������ܠ��ˈ,]Ɯ!����h��012�05k3!�2S�,3#�2s�,� �2K�-�4�41037k34�I-.!ّ��d�G^"1$>��ZG^2����� Ś�p         P   x�3�IM�Up��!Cad`d�k`�k`�`hie`fej�gbhin`�m` T�e��[������������9TS� ��         k   x�u��	�0Dѵ\E���d��"RA�����悔@�C¢7��r!ۚ���h?fB�3L�
*�M?������Ǿ>�������5"<�.<B��Y����?�f,�      �   e  x��ԻN�@���
+-d53��qe�d���9<
Ŀ�kG`�<�������wu��m�b���KpKJ�umY���(����E]bЂ�;�V�)�m�=�a�;I��ޒw����ގ�-��m�����7�P��:q�4-���'8A�F��`�K��:`����b���Y��0���)�Ӂ�&�׈*�	��m�='�e��
)+��s�H4��:��&2�p�ѥd���h��P��4 xMb��K�tE��i�8n��(���-;��Mح�ݾ7�m5�[�qH�a��autE���w^�ga�y�t�>|��ϓ.+$�x��L���C���gH@_8��FZ��, ��L�         i  x���=O1��_Q�B-�vndFL�,U[1PQ���$���HY����&�ݾ?u���0����3���Uԯ����v�}�f�Y):~�k=O#x ��fM�t��s���qʈP�H�ghKC	2"�45RSC�5�65lZC5p������pP��4bR��4�,���<�Q�"�h�G��5b`��� j��d�4j�Xd:"Cr(%Y.�4�Q!ʔ����n�X�!�zͺ���m���2b I���SL4��ȑ9�y�Yќ�!%#���R�y�zٙ��:���'�_��4|8�;����uU=�x>G�kU��(��!��nY�/���lj.L���-�\"�Y�#�}�j�I     