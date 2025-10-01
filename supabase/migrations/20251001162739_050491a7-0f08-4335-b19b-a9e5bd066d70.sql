-- Enable pg_cron for scheduled jobs (safe if already enabled)
create extension if not exists pg_cron with schema public;

-- Ensure delete_expired_items uses a fixed search_path
create or replace function public.delete_expired_items()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.items
  where expires_at < now()
    and status != 'returned';
end;
$$;

-- Add/update updated_at triggers across core tables
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create triggers if they don't exist
-- items
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_items_updated_at'
  ) then
    create trigger trg_items_updated_at
    before update on public.items
    for each row execute function public.handle_updated_at();
  end if;
end $$;

-- profiles
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_profiles_updated_at'
  ) then
    create trigger trg_profiles_updated_at
    before update on public.profiles
    for each row execute function public.handle_updated_at();
  end if;
end $$;

-- verification_requests
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_verification_requests_updated_at'
  ) then
    create trigger trg_verification_requests_updated_at
    before update on public.verification_requests
    for each row execute function public.handle_updated_at();
  end if;
end $$;

-- messages
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_messages_updated_at'
  ) then
    create trigger trg_messages_updated_at
    before update on public.messages
    for each row execute function public.handle_updated_at();
  end if;
end $$;

-- reviews
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_reviews_updated_at'
  ) then
    create trigger trg_reviews_updated_at
    before update on public.reviews
    for each row execute function public.handle_updated_at();
  end if;
end $$;

-- Schedule daily cleanup of expired items at 02:00 UTC
select
  cron.schedule(
    'delete-expired-items-daily',
    '0 2 * * *',
    $$ select public.delete_expired_items(); $$
  )
where not exists (
  select 1 from cron.job where jobname = 'delete-expired-items-daily'
);

-- SECURITY: Restrict public access to personal data in profiles
-- Replace public-wide select with authenticated-only select
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

-- DATA CLEANUP: Remove existing app data and stored images
-- Order matters to avoid any potential references
delete from public.verification_requests;
delete from public.reviews;
delete from public.items;

-- Clean storage buckets for item images and verification docs
-- Note: This only deletes object metadata; files are managed by storage
delete from storage.objects where bucket_id in ('item-images', 'verification-docs');
