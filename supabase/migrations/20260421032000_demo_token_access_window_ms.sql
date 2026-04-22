-- Per-token access window (ms) configurable at mint time from admin page.
alter table public.demo_tokens
add column if not exists access_window_ms integer;

alter table public.demo_tokens
drop constraint if exists demo_tokens_access_window_ms_positive;

alter table public.demo_tokens
add constraint demo_tokens_access_window_ms_positive
check (access_window_ms is null or access_window_ms > 0);
