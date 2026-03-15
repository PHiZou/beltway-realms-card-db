-- Seed region data
INSERT OR IGNORE INTO regions (id, name, theme, color) VALUES
  ('arlington', 'Arlington', 'Government, defense, bureaucracy — the Pentagon''s backyard', '#1a5276'),
  ('reston', 'Reston', 'Tech corridors, startups, and the grind of sprints and standups', '#27ae60'),
  ('tysons', 'Tysons', 'Corporate power, lobbying, luxury, and deal-making', '#8e44ad'),
  ('ashburn', 'Ashburn', 'Data centers, infrastructure, the cloud made physical', '#e67e22'),
  ('citadel', 'Citadel (DC)', 'The seat of power — politics, intrigue, monuments, and secrets', '#c0392b'),
  ('neutral', 'Neutral / Cross-region', 'Cards that work everywhere — the connective tissue of the Beltway', '#7f8c8d');
