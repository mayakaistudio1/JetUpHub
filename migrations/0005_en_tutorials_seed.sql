-- EN tutorials seed — synced from production
-- Applies only if these records don't already exist (safe to re-run)

INSERT INTO tutorials (id, title, language, youtube_id, youtube_url, category, description, is_active, sort_order)
VALUES
  (13, 'Profit Share Tagmarkets', 'en', 'yx2sqYEUWz4', 'https://www.youtube.com/shorts/yx2sqYEUWz4', 'partner-program', '', true, 0),
  (18, 'JetUP - TagMarkets Partner Program overview', 'en', 'nh1a_UqaUqw', 'https://youtu.be/nh1a_UqaUqw', 'partner-program', 'JetUP - TagMarkets Partner Program overview', true, 1),
  (20, 'Sonic AI April Promo — earn more from your existing investment', 'en', 'LCWCzTT_nSM', 'https://youtu.be/LCWCzTT_nSM?si=l6Gy4qlXmpZql991', 'bonuses', 'This April, Sonic AI is running a special promotion for the entire community: five percent of the performance fee is being distributed back to participants as additional shares. You earn shares based on your personal investment, active first-line partners, and team volume. Payout happens at the end of the month. Track your progress anytime inside the IB Portal.', true, 0),
  (24, 'Dennis Fast Start Promo', 'en', 'FS_u-gFmcQc', 'https://youtube.com/shorts/FS_u-gFmcQc?si=BAoTFyUczbi0u7SX', 'bonuses', 'Dennis Fast Start Promo — your strongest entry into recruiting. As a partner, you don''t need a long pitch. You have a clear offer: deposit $100, get $100 from Dennis — and combined with Sonic AI, that gives you $4,800 in trading volume.', true, 0)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  language = EXCLUDED.language,
  youtube_id = EXCLUDED.youtube_id,
  youtube_url = EXCLUDED.youtube_url,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;
