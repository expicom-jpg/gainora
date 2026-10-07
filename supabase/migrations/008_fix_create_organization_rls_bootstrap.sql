create or replace function public.create_organization(org_name text)
returns uuid
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
declare
  new_org_id uuid := gen_random_uuid();
begin
  if (select auth.uid()) is null then
    raise exception 'unauthenticated';
  end if;

  if length(trim(org_name)) < 2 or length(trim(org_name)) > 120 then
    raise exception 'invalid organization name';
  end if;

  insert into public.organizations (id, name)
  values (new_org_id, trim(org_name));

  return new_org_id;
end;
$function$;
