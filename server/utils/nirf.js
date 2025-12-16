const axios = require('axios');

function stripTags(html) {
  return html.replace(/<[^>]*>/g, ' ');
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse a NIRF ranking HTML page.
 * Returns array of { rank, name, city, state }.
 */
function parseNirfRankingHtml(html) {
  const rows = [];

  // Robust strategy: NIRF embeds nested tables inside the Name cell (with its own <td> tags).
  // We extract "chunks" for each institute row by splitting on the Institute ID prefix ("IR-"),
  // then extract all <td> values and take:
  // - td[0] = institute id (ignored)
  // - td[1] = institute name (cleaned)
  // - last 4 tds = City, State, Score, Rank
  const parts = String(html).split('<tr><td>IR-');
  for (let i = 1; i < parts.length; i++) {
    const chunk = '<tr><td>IR-' + parts[i];
    const tdMatches = [...chunk.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
    if (tdMatches.length < 6) continue;

    const tds = tdMatches.map((m) => decodeEntities(stripTags(m[1])));
    const nameRaw = tds[1] || '';
    const name = nameRaw.split('More Details')[0].split('Close')[0].trim();

    const rankStr = tds[tds.length - 1] || '';
    const rank = Number(String(rankStr).match(/\d+/)?.[0] || 0);
    const city = (tds[tds.length - 4] || '').trim();
    const state = (tds[tds.length - 3] || '').trim();

    if (!rank || !name) continue;
    rows.push({ rank, name, city, state });
  }

  // Deduplicate by (rank,name)
  const seen = new Set();
  const deduped = [];
  for (const r of rows) {
    const key = `${r.rank}::${r.name}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(r);
  }

  return deduped;
}

/**
 * Parse a NIRF "list" page (e.g. rank-band pages or participating institutions),
 * rendered as: <tr><td>Name</td><td>City</td><td>State</td></tr>
 * If rankStart is provided, assigns increasing ranks.
 */
function parseNirfListHtml(html, { rankStart } = {}) {
  const rows = [];
  const cleaned = html.replace(/<div class="tbl_hidden"[\s\S]*?<\/div>/gi, '');

  const rowRegex =
    /<tr[^>]*>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;

  let match;
  while ((match = rowRegex.exec(cleaned)) !== null) {
    const name = decodeEntities(stripTags(match[1]));
    const city = decodeEntities(stripTags(match[2]));
    const state = decodeEntities(stripTags(match[3]));
    if (!name) continue;
    if (name.toLowerCase() === 'name') continue;
    rows.push({ rank: null, name, city, state });
  }

  if (typeof rankStart === 'number') {
    for (let i = 0; i < rows.length; i++) {
      rows[i].rank = rankStart + i;
    }
  }

  // Deduplicate by name+city+state
  const seen = new Set();
  const deduped = [];
  for (const r of rows) {
    const key = `${r.name}::${r.city}::${r.state}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(r);
  }
  return deduped;
}

async function fetchNirfRanking(url) {
  const res = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 30000,
  });
  return parseNirfRankingHtml(res.data);
}

module.exports = {
  fetchNirfRanking,
  parseNirfRankingHtml,
  parseNirfListHtml,
};


