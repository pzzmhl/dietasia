/**
 * Chiavi semantiche di persistenza locale (Local-First / SharedPreferences / LocalStorage)
 * Centralizzate per prevenire divergenze e garantire coerenza tipologica e di accesso.
 */
export const STORAGE_KEYS = {
  HABIT_TRACKER_LOGS: 'coraline_asia_habit_tracker_v1',
  BACKUP_SNAPSHOT: 'coraline_asia_habit_tracker_backup_snapshot',
  WORKOUT_LOGS: 'coraline_workout_logs',
  KEYS_PER_MONTH: 'coraline_keys_per_month',
  CUSTOM_AVATAR: 'coraline_custom_avatar',
  REMINDER_TIME: 'coraline_reminder_time',
  REMINDER_ENABLED: 'coraline_reminder_enabled',
  HAPTICS_ENABLED: 'coraline_haptics_enabled',
  BG_MUSIC_ENABLED: 'coraline_bg_music_enabled',
  LAST_CLOUD_BACKUP_TIME: 'coraline_last_cloud_backup_time',
  CLOUD_AUTOSYNC: 'coraline_cloud_autosync',
  SUPABASE_URL: 'coraline_supabase_url',
  SUPABASE_ANON_KEY: 'coraline_supabase_anon_key',
  LAST_CAT_QUOTE: 'coraline_last_cat_quote',
  LAST_CAT_CONTEXT: 'coraline_last_cat_context',
  LAST_CELEBRATED_STREAK: 'coraline_last_celebrated_streak',
  LAST_DAILY_GREETING_DATE: 'coraline_last_daily_greeting_date',
  MOUSE_NOTICE_DISMISSED_DATE: 'coraline_mouse_notice_dismissed_date',
  FLOATING_FX: 'coraline_floating_fx',
  VORTEX_ENABLED: 'coraline_vortex_enabled',
  PENDING_SYNC_QUEUE: 'coraline_pending_sync_queue',
  LAST_UPDATE_CHECK: 'coraline_last_update_check',
  IGNORED_UPDATE_VERSION: 'coraline_ignored_update_version'
};

