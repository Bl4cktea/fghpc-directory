/**
 * FGHPC Web Directory — JSON API (Phase 2).
 *
 * Serves the Directory sheet as JSON for the web frontend.
 *
 *   GET <webapp-url>            → full directory JSON (cached ~5 min)
 *   GET <webapp-url>?fresh=1    → bypass the cache (for testing after edits)
 *
 * Response shape:
 * {
 *   "ok": true,
 *   "updatedAt": "2026-08-20",
 *   "count": 70,
 *   "entries": [
 *     { "id": 1, "category": "Individual", "section": "",
 *       "fullName": "Abegael Santos", "localNo": "7553" },
 *     ...
 *   ]
 * }
 *
 * Keep this file in the same Apps Script project as setup.gs.
 * (setup.gs can be deleted after Phase 1 — it's no longer needed.)
 */

var SPREADSHEET_ID = '1hLkTRmUnN8XBArH2LVpTf9fv37NcZ6XPiEOruT9zEYY';
var CACHE_KEY = 'directory_json_v1';
var CACHE_SECONDS = 300; // 5 minutes — sheet edits show up within this window

function doGet(e) {
  var params = (e && e.parameter) || {};
  var cache = CacheService.getScriptCache();

  var json = params.fresh ? null : cache.get(CACHE_KEY);
  if (!json) {
    try {
      json = JSON.stringify(buildPayload());
      cache.put(CACHE_KEY, json, CACHE_SECONDS);
    } catch (err) {
      json = JSON.stringify({ ok: false, error: String(err) });
    }
  }

  return ContentService.createTextOutput(json)
      .setMimeType(ContentService.MimeType.JSON);
}

function buildPayload() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // --- entries from the Directory tab ---
  var sheet = ss.getSheetByName('Directory');
  if (!sheet) throw new Error('Sheet "Directory" not found');
  var values = sheet.getDataRange().getValues();
  var header = values[0].map(function (h) { return String(h).trim(); });

  var col = {};
  header.forEach(function (name, i) { col[name] = i; });
  ['ID', 'Category', 'Section', 'Full Name', 'Local No.'].forEach(function (name) {
    if (!(name in col)) throw new Error('Missing column: ' + name);
  });

  var entries = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var fullName = String(row[col['Full Name']]).trim();
    var localNo = String(row[col['Local No.']]).trim();
    if (!fullName || !localNo) continue; // skip incomplete rows

    entries.push({
      id: Number(row[col['ID']]) || r,
      category: String(row[col['Category']]).trim(),
      section: String(row[col['Section']]).trim(),
      fullName: fullName,
      localNo: localNo
    });
  }

  // --- last-updated date from the Meta tab (optional) ---
  var updatedAt = '';
  var meta = ss.getSheetByName('Meta');
  if (meta) {
    var v = meta.getRange('B1').getValue();
    updatedAt = (v instanceof Date)
        ? Utilities.formatDate(v, 'Asia/Manila', 'yyyy-MM-dd')
        : String(v).trim();
  }

  return { ok: true, updatedAt: updatedAt, count: entries.length, entries: entries };
}

/**
 * Optional helper: run manually (or wire to an onEdit trigger) to clear the
 * cache immediately after editing the sheet, instead of waiting ~5 minutes.
 */
function clearCache() {
  CacheService.getScriptCache().remove(CACHE_KEY);
  Logger.log('Cache cleared.');
}

/**
 * Test helper: run this in the editor and check the log to preview the JSON
 * without deploying.
 */
function testBuildPayload() {
  Logger.log(JSON.stringify(buildPayload(), null, 2));
}
