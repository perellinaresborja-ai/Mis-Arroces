import fs from 'fs';
import path from 'path';
import { parseFile } from 'music-metadata';

const dir = 'C:\\Users\\perel\\Desktop\\MIS MUSICA';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp3'));

let sql = `-- INSERT ONLY NEW TRACKS\n`;
sql += `INSERT INTO public.story_music_tracks (title, artist, audio_url, duration_ms, category, source_license, source_url)\n`;
sql += `SELECT * FROM (VALUES\n`;

const values = [];

for (const file of files) {
  try {
    const metadata = await parseFile(path.join(dir, file));
    const durationMs = Math.round((metadata.format.duration || 120) * 1000);
    
    // Naive parsing of title/artist from filename
    let title = file.replace('.mp3', '').replace(/-/g, ' ');
    let artist = 'Pixabay';
    
    // Remove (1) or (2) from title if any
    title = title.replace(/\(\d+\)/g, '').trim();
    
    const parts = file.split('-');
    if (parts.length > 1) {
      artist = parts[0];
      title = parts.slice(1, -1).join(' ') || title;
      title = title.replace(/\(\d+\)/g, '').trim();
    }
    
    // Title case
    title = title.replace(/\b\w/g, l => l.toUpperCase());
    artist = artist.replace(/\b\w/g, l => l.toUpperCase());
    
    // Some manual cleanups
    if (artist === 'Freemusicforvideo') artist = 'Free Music For Video';
    if (artist === 'Mondamusic') artist = 'Monda Music';
    if (artist === 'Tatamusic') artist = 'Tata Music';
    
    const audioUrl = `https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/music_assets/${file}`;
    
    values.push(`('${title.replace(/'/g, "''")}', '${artist.replace(/'/g, "''")}', '${audioUrl}', ${durationMs}, 'Cooking', 'Pixabay Free', 'https://pixabay.com/music/')`);
  } catch (err) {
    console.error(`Error parsing ${file}:`, err.message);
  }
}

sql += values.join(',\n');
sql += `\n) AS t(title, artist, audio_url, duration_ms, category, source_license, source_url)\n`;
sql += `WHERE NOT EXISTS (\n`;
sql += `  SELECT 1 FROM public.story_music_tracks WHERE story_music_tracks.audio_url = t.audio_url\n`;
sql += `);\n`;

fs.writeFileSync('insert_new_tracks.sql', sql);
console.log('SQL generated: insert_new_tracks.sql');
