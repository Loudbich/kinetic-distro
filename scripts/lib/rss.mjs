/**
 * Minimal, dependency-free parser for SoundCloud's public podcast RSS feed.
 *
 * Feed shape (RSS 2.0 + itunes namespace):
 *   <channel>
 *     <title>Broken Shaman</title>
 *     <itunes:image href="https://i1.sndcdn.com/avatars-...-original.jpg"/>
 *     <item>
 *       <title>Chrome Pulse</title>
 *       <link>https://soundcloud.com/broken_shaman/chrome-pulse</link>
 *       <pubDate>Tue, 18 Aug 2026 09:12:00 +0000</pubDate>
 *       <guid isPermaLink="false">tag:soundcloud,2010:tracks/1234567890</guid>
 *       <itunes:duration>03:41</itunes:duration>
 *       <itunes:image href="https://i1.sndcdn.com/artworks-...-original.jpg"/>
 *       <enclosure url="https://feeds.soundcloud.com/stream/....mp3" type="audio/mpeg"/>
 *     </item>
 *
 * Parsed with regex on purpose: the feed is machine-generated and stable, and
 * this keeps the sync script free of any runtime dependency.
 */

const decode = (s = '') =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&')
    .trim();

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
};

const attr = (xml, name, key) => {
  const m = xml.match(new RegExp(`<${name}\\b[^>]*\\b${key}=["']([^"']+)["']`, 'i'));
  return m ? decode(m[1]) : '';
};

/** SoundCloud serves 500x500 originals; ask for the largest sensible crop. */
export const upsizeArtwork = (url) =>
  url ? url.replace(/-(large|t\d+x\d+|badge|small|tiny|mini|original)\.(jpg|png)/i, '-t500x500.$2') : '';

const toIso = (pubDate) => {
  const d = new Date(pubDate);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

const durationToSeconds = (raw) => {
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return Number(raw);
  const parts = raw.split(':').map(Number);
  if (parts.some(Number.isNaN)) return null;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
};

export function parseSoundCloudRss(xml) {
  if (!xml || !/<rss[\s>]/i.test(xml)) {
    throw new Error('Not an RSS document');
  }

  const channelHead = xml.split(/<item[\s>]/i)[0];

  const channel = {
    title: tag(channelHead, 'title'),
    description: tag(channelHead, 'description') || tag(channelHead, 'itunes:summary'),
    author: tag(channelHead, 'itunes:author'),
    link: tag(channelHead, 'link'),
    image: upsizeArtwork(attr(channelHead, 'itunes:image', 'href')),
  };

  const items = [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)].map((m) => m[0]);

  const tracks = items
    .map((item) => {
      const guid = tag(item, 'guid');
      const id = (guid.match(/tracks\/(\d+)/) || [])[1] ?? guid;
      const date = toIso(tag(item, 'pubDate'));
      return {
        id,
        title: tag(item, 'title'),
        url: tag(item, 'link'),
        date,
        artwork: upsizeArtwork(attr(item, 'itunes:image', 'href')) || channel.image,
        durationSec: durationToSeconds(tag(item, 'itunes:duration')),
        audio: attr(item, 'enclosure', 'url'),
      };
    })
    .filter((t) => t.title && t.id);

  // Newest first, stable on ties.
  tracks.sort((a, b) => (a.date === b.date ? 0 : (b.date ?? '') > (a.date ?? '') ? 1 : -1));

  return { channel, tracks };
}
