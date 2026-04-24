INSERT INTO tutorials (id, title, language, youtube_url, youtube_id, is_active, sort_order, category)
VALUES
  (8,  'Profit Share Bonus Tagmarkets',                                 'de', 'https://www.youtube.com/shorts/HypHmjYabfk',                    'HypHmjYabfk', true, 0, 'getting-started'),
  (10, 'Was ist eine CopyX-Strategie?',                                 'de', 'https://www.youtube.com/shorts/tYyfI3aKKD4',                    'tYyfI3aKKD4', true, 0, 'getting-started'),
  (15, 'JetUP Kurz erklärt',                                            'de', 'https://youtu.be/VsrTcbNQsz8',                                  'VsrTcbNQsz8', true, 0, 'getting-started'),
  (16, 'JetUP - Tag Markets Partner Programm Überblick',                'de', 'https://youtu.be/9EVU4mzbhVY',                                  '9EVU4mzbhVY', true, 1, 'getting-started'),
  (19, 'Sonic AI April-Promo — so profitierst du jetzt zusätzlich',    'de', 'https://youtu.be/259PIl-uscU?si=nGqnb11bx3T37Coy',              '259PIl-uscU', true, 0, 'getting-started'),
  (22, 'Fast Start Promo bei Dennis',                                    'de', 'https://www.youtube.com/shorts/1wKLFUvgUWI',                   '1wKLFUvgUWI', true, 0, 'getting-started'),
  (26, 'JetUP Präsentation',                                            'de', 'https://youtu.be/wclURtfbGmc?si=dAxiPvHZE6Z2vcys',             'wclURtfbGmc', true, 0, 'getting-started'),
  (28, 'JetUP FAQ: Unterschied IB Portal und TagMarkets',               'de', 'https://youtube.com/shorts/8rBuy-QlLBE?si=mYjmki6KKxbaGQVF',  '8rBuy-QlLBE', true, 0, 'getting-started')
ON CONFLICT (id) DO UPDATE SET
  title       = EXCLUDED.title,
  youtube_url = EXCLUDED.youtube_url,
  youtube_id  = EXCLUDED.youtube_id,
  is_active   = EXCLUDED.is_active,
  sort_order  = EXCLUDED.sort_order,
  category    = EXCLUDED.category;
