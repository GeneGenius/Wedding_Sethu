/**
 * ================================================================
 * Code.gs — Google Apps Script Web App
 * Wedding of Jabulani Tshabalala & Sphosethu Phiri
 * ================================================================
 *
 * SHEET STRUCTURE
 * ---------------
 * Sheet: "Registry"
 * Columns: A=id | B=name | C=category | D=description | E=price | F=purchased
 *
 * Example rows:
 *   1  | Kitchen Stand Mixer | Kitchen | A versatile stand mixer... | 4999  | FALSE
 *   2  | Bed Linen Set       | Bedroom | Premium Egyptian cotton... | 2800  | FALSE
 *
 * Sheet: "RSVPs"
 * Columns: A=timestamp | B=firstName | C=lastName | D=email | E=phone
 *          F=attending | G=guestCount | H=dietary | I=message
 *
 * ================================================================
 * DEPLOYMENT STEPS
 * ----------------
 * 1. Open script.google.com → New Project → paste this file
 * 2. Rename the project (e.g. "Wedding Web App")
 * 3. Click Deploy → New deployment
 *    · Type: Web App
 *    · Execute as: Me
 *    · Who has access: Anyone
 * 4. Copy the Web App URL into SCRIPT_URL in registry.js and rsvp.js
 * 5. Create a Google Sheet named "Wedding — J & S"
 *    and add both tabs: "Registry" and "RSVPs"
 *    with the column headers listed above.
 * ================================================================
 */

/* ---- Configuration ------------------------------------------- */
var SPREADSHEET_NAME = 'Wedding — J & S';  // Change if you rename the sheet
var REGISTRY_SHEET   = 'Registry';
var RSVPS_SHEET      = 'RSVPs';

/* ---- CORS headers -------------------------------------------- */
function corsHeaders() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---- Spreadsheet helper ------------------------------------- */
function getSheet(sheetName) {
  var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (!files.hasNext()) {
    throw new Error('Spreadsheet "' + SPREADSHEET_NAME + '" not found.');
  }
  var ss = SpreadsheetApp.open(files.next());
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet "' + sheetName + '" not found in spreadsheet.');
  }
  return sheet;
}

/* ================================================================
   doGet — handles GET requests
   Actions: getItems | markPurchased
   ================================================================ */
function doGet(e) {
  var params = e.parameter || {};
  var action = params.action || '';

  try {
    if (action === 'getItems') {
      return handleGetItems();
    }

    if (action === 'markPurchased') {
      var id = params.id || '';
      if (!id) {
        return jsonResponse({ success: false, error: 'Missing id parameter.' });
      }
      return handleMarkPurchased(id);
    }

    // Default: return status
    return jsonResponse({ status: 'ok', message: 'Wedding Web App is running.' });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/* ================================================================
   doPost — handles POST requests
   Actions: submitRSVP
   ================================================================ */
function doPost(e) {
  try {
    var body = {};

    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      body = e.parameter;
    }

    var action = body.action || '';

    if (action === 'submitRSVP') {
      return handleSubmitRSVP(body);
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/* ================================================================
   handleGetItems
   Returns all registry items as a JSON array.
   ================================================================ */
function handleGetItems() {
  var sheet = getSheet(REGISTRY_SHEET);
  var data  = sheet.getDataRange().getValues();

  // Row 0 is the header row — skip it
  var items = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Skip completely empty rows
    if (!row[0] && !row[1]) continue;

    items.push({
      id:          String(row[0]),      // Column A — id
      name:        String(row[1] || ''),// Column B — name
      category:    String(row[2] || ''),// Column C — category
      description: String(row[3] || ''),// Column D — description
      price:       row[4] !== '' ? row[4] : '',  // Column E — price
      purchased:   row[5] === true || String(row[5]).toLowerCase() === 'true'
    });
  }

  return jsonResponse(items);
}

/* ================================================================
   handleMarkPurchased
   Marks a registry item as purchased by setting column F to TRUE.
   ================================================================ */
function handleMarkPurchased(id) {
  var sheet = getSheet(REGISTRY_SHEET);
  var data  = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var rowId = String(data[i][0]);
    if (rowId === String(id)) {
      // Column F (index 5) — set to TRUE
      sheet.getRange(i + 1, 6).setValue(true);
      return jsonResponse({ success: true, id: id });
    }
  }

  return jsonResponse({ success: false, error: 'Item with id "' + id + '" not found.' });
}

/* ================================================================
   handleSubmitRSVP
   Appends a new row to the RSVPs sheet.

   Expected body fields:
     firstName, lastName, email, phone,
     attending, guestCount, dietary, message, timestamp
   ================================================================ */
function handleSubmitRSVP(body) {
  // Basic validation
  if (!body.firstName || !body.lastName || !body.email || !body.attending) {
    return jsonResponse({
      success: false,
      error: 'Missing required fields: firstName, lastName, email, attending.'
    });
  }

  var sheet     = getSheet(RSVPS_SHEET);
  var timestamp = body.timestamp || new Date().toISOString();

  // Append row matching the RSVPs sheet column order:
  // A=timestamp | B=firstName | C=lastName | D=email | E=phone
  // F=attending | G=guestCount | H=dietary | I=message
  sheet.appendRow([
    timestamp,
    String(body.firstName  || '').trim(),
    String(body.lastName   || '').trim(),
    String(body.email      || '').trim(),
    String(body.phone      || '').trim(),
    String(body.attending  || ''),
    String(body.guestCount || ''),
    String(body.dietary    || '').trim(),
    String(body.message    || '').trim()
  ]);

  // Optional: send a confirmation email to the couple
  // sendConfirmationEmail(body);

  return jsonResponse({ success: true, message: 'RSVP received. Thank you!' });
}

/* ================================================================
   OPTIONAL: Email notification when a new RSVP is submitted
   Uncomment and set EMAIL_TO to enable.
   ================================================================ */
/*
var EMAIL_TO = 'your-email@example.com';

function sendConfirmationEmail(body) {
  var subject = 'New RSVP — ' + body.firstName + ' ' + body.lastName;
  var msg =
    'A new RSVP has been submitted:\n\n'
    + 'Name:        ' + body.firstName + ' ' + body.lastName + '\n'
    + 'Email:       ' + body.email + '\n'
    + 'Phone:       ' + (body.phone || '—') + '\n'
    + 'Attending:   ' + body.attending + '\n'
    + 'Guests:      ' + (body.guestCount || '—') + '\n'
    + 'Dietary:     ' + (body.dietary || '—') + '\n'
    + 'Message:     ' + (body.message || '—') + '\n'
    + '\nTimestamp: ' + body.timestamp;
  MailApp.sendEmail(EMAIL_TO, subject, msg);
}
*/
