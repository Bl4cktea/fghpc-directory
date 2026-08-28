/**
 * FGHPC Web Directory — Phase 1 setup script (run ONCE).
 *
 * What it does when you run setupDirectory():
 *   1. Opens the FGHPC Directory spreadsheet.
 *   2. Creates/renames the "Directory" tab and clears it.
 *   3. Formats the "Local No." column as plain text (so "7500-7502" and
 *      extension numbers are never mangled into numbers or dates).
 *   4. Writes the header row + all 70 records from the 20 Aug 2026 CSV.
 *   5. Adds dropdown validation for Category and Section.
 *   6. Freezes and bolds the header row, auto-sizes columns.
 *   7. Creates a "Meta" tab with a Last Updated date.
 *
 * How to run:
 *   1. Open the Apps Script project and paste this whole file into it.
 *   2. Save, choose the function "setupDirectory" in the toolbar, click Run.
 *   3. Approve the authorization prompt (it asks for Spreadsheets access —
 *      that's this script reading/writing your own sheet).
 *   4. Check the execution log says "Setup complete: 70 rows written."
 */

var SPREADSHEET_ID = '1hLkTRmUnN8XBArH2LVpTf9fv37NcZ6XPiEOruT9zEYY';

var HEADER = ['ID', 'Category', 'Section', 'First Name', 'Middle Initial',
              'Last Name', 'Suffix', 'Full Name', 'Local No.'];

var DATA = [
  [1, 'Individual', '', 'Abegael', '', 'Santos', '', 'Abegael Santos', '7553'],
  [2, 'Individual', '', 'Babes', 'G.', 'Loja', '', 'Babes G. Loja', '7523'],
  [3, 'Individual', '', 'Belle', '', 'Gamponia', '', 'Belle Gamponia', '7583'],
  [4, 'Individual', '', 'Bon Allystaire', 'B.', 'Caoagdan', '', 'Bon Allystaire B. Caoagdan', '7572'],
  [5, 'Individual', '', 'Bryan', 'D.', 'Evan', '', 'Bryan D. Evan', '7549'],
  [6, 'Individual', '', 'Carlos', 'S.', 'Garcia', '', 'Carlos S. Garcia', '7557'],
  [7, 'Individual', '', 'Charjhune', '', 'Pascua', '', 'Charjhune Pascua', '7603'],
  [8, 'Individual', '', 'Cheng', '', 'Uera', '', 'Cheng Uera', '7577'],
  [9, 'Individual', '', 'Czarina Janine', 'V.', 'Cachuela', '', 'Czarina Janine V. Cachuela', '7558'],
  [10, 'Individual', '', 'Digna', 'T.', 'Nasis', '', 'Digna T. Nasis', '7565'],
  [11, 'Individual', '', 'Don', '', 'Barcelo', 'Jr.', 'Don Barcelo Jr.', '7559'],
  [12, 'Individual', '', 'Donna', 'D.', 'Reyes', '', 'Donna D. Reyes', '7528'],
  [13, 'Individual', '', 'Edwin', 'D.', 'Feliciano', '', 'Edwin D. Feliciano', '7527'],
  [14, 'Individual', '', 'Franklyn', '', 'Dalin', '', 'Franklyn Dalin', '7563'],
  [15, 'Individual', '', 'Gems', 'V.', 'Vargas', '', 'Gems V. Vargas', '7564'],
  [16, 'Individual', '', 'Gene Patrick', 'M.', 'Poblete', '', 'Gene Patrick M. Poblete', '7562'],
  [17, 'Individual', '', 'Ivy', 'U.', 'Villajuan', '', 'Ivy U. Villajuan', '7542'],
  [18, 'Individual', '', 'James Arvin', '', 'Solis', '', 'James Arvin Solis', '7575'],
  [19, 'Individual', '', 'Jia', 'G.', 'Villajuan', '', 'Jia G. Villajuan', '7571'],
  [20, 'Individual', '', 'Jo Ann Marie', 'D.', 'Peredo', '', 'Jo Ann Marie D. Peredo', '7512'],
  [21, 'Individual', '', 'Joeffrey', 'G.', 'Glino', '', 'Joeffrey G. Glino', '7550'],
  [22, 'Individual', '', 'John Erickson', 'M.', 'Faustino', '', 'John Erickson M. Faustino', '7505'],
  [23, 'Individual', '', 'Joseph', 'E.', 'Mapalo', '', 'Joseph E. Mapalo', '7601'],
  [24, 'Individual', '', 'Joshua', '', 'Reyes', '', 'Joshua Reyes', '7504'],
  [25, 'Individual', '', 'Kim Reggie', '', 'Garcia', '', 'Kim Reggie Garcia', '7539'],
  [26, 'Individual', '', 'Leo', '', 'Cabanayan', '', 'Leo Cabanayan', '7602'],
  [27, 'Individual', '', 'Loresa', 'T.', 'Micla', '', 'Loresa T. Micla', '7525'],
  [28, 'Individual', '', 'Ma. Christine', 'T.', 'Mapanao', '', 'Ma. Christine T. Mapanao', '7509'],
  [29, 'Individual', '', 'Mark Anthony', 'D.', 'Martires', '', 'Mark Anthony D. Martires', '7545'],
  [30, 'Individual', '', 'Marlowe', 'M.', 'Chica', '', 'Marlowe M. Chica', '7534'],
  [31, 'Individual', '', 'Michael', 'B.', 'Dela Cruz', '', 'Michael B. Dela Cruz', '7551'],
  [32, 'Individual', '', 'Moshe Salm', 'B.', 'Cuta', '', 'Moshe Salm B. Cuta', '7514'],
  [33, 'Individual', '', 'Nestor', '', 'Bartolome', '', 'Nestor Bartolome', '7543'],
  [34, 'Individual', '', 'Pamela Nelle', 'U.', 'Valeroso', '', 'Pamela Nelle U. Valeroso', '7510'],
  [35, 'Individual', '', 'Ramil', 'M.', 'Cawat', '', 'Ramil M. Cawat', '7518'],
  [36, 'Individual', '', 'Richard', 'P.', 'Difuntorum', '', 'Richard P. Difuntorum', '7600'],
  [37, 'Individual', '', 'Rodante', '', 'Daludado', '', 'Rodante Daludado', '7529'],
  [38, 'Individual', '', 'Romelyn', 'D.', 'Adrados', '', 'Romelyn D. Adrados', '7521'],
  [39, 'Individual', '', 'Ronald', 'M.', 'Salvador', '', 'Ronald M. Salvador', '7508'],
  [40, 'Individual', '', 'Ruben', 'S.', 'Merin', '', 'Ruben S. Merin', '7507'],
  [41, 'Individual', '', 'Steph', 'D.', 'Mauyao', '', 'Steph D. Mauyao', '7503'],
  [42, 'Individual', '', 'Victor Em', 'D.', 'Viloria', '', 'Victor Em D. Viloria', '7520'],
  [43, 'Office/Area', 'Housing Compound', '', '', '', '', 'Basin Tower', '7552'],
  [44, 'Office/Area', 'Housing Compound', '', '', '', '', 'Checkpoint', '7513'],
  [45, 'Office/Area', 'Housing Compound', '', '', '', '', 'Employee Center', '7544'],
  [46, 'Office/Area', 'Housing Compound', '', '', '', '', "Manager's Quarter – Guard", '7566'],
  [47, 'Office/Area', 'Housing Compound', '', '', '', '', "Manager's Quarter – RPD", '7535'],
  [48, 'Office/Area', 'Housing Compound', '', '', '', '', 'Staff House – Guard', '7536'],
  [49, 'Office/Area', 'CHEP', '', '', '', '', 'Control', '7569'],
  [50, 'Office/Area', 'CHEP', '', '', '', '', 'QESH', '7581'],
  [51, 'Office/Area', 'CHEP', '', '', '', '', 'Maintenance', '7582'],
  [52, 'Office/Area', 'MHEP', '', '', '', '', 'Control Room', '7533'],
  [53, 'Office/Area', 'MHEP', '', '', '', '', 'Entrance Gate', '7526'],
  [54, 'Office/Area', 'MHEP', '', '', '', '', 'Operator (Governor Area)', '7532'],
  [55, 'Office/Area', 'MHEP', '', '', '', '', 'Paging System', '7560'],
  [56, 'Office/Area', 'PHEP', '', '', '', '', 'Clinic', '7522'],
  [57, 'Office/Area', 'PHEP', '', '', '', '', 'Conference Room – Admin (Telecon unit)', '7555'],
  [58, 'Office/Area', 'PHEP', '', '', '', '', 'Control Room 1', '7531'],
  [59, 'Office/Area', 'PHEP', '', '', '', '', 'Control Room 2', '7554'],
  [60, 'Office/Area', 'PHEP', '', '', '', '', 'Entrance Gate / Security Office', '7515'],
  [61, 'Office/Area', 'PHEP', '', '', '', '', 'Guard Lobby (PHEP Phone Operator)', '7500-7502'],
  [62, 'Office/Area', 'PHEP', '', '', '', '', 'I&C – Maintenance', '7546'],
  [63, 'Office/Area', 'PHEP', '', '', '', '', 'Maintenance Working Area (Elec., Mech., I&C)', '7556'],
  [64, 'Office/Area', 'PHEP', '', '', '', '', 'Mechanical Shop', '7506'],
  [65, 'Office/Area', 'PHEP', '', '', '', '', 'New Building – 2F Conference', '7573'],
  [66, 'Office/Area', 'PHEP', '', '', '', '', 'New Building – Lobby', '7501'],
  [67, 'Office/Area', 'PHEP', '', '', '', '', 'New Building – Pantry', '7574'],
  [68, 'Office/Area', 'PHEP', '', '', '', '', 'Operator (Governor Area)', '7538'],
  [69, 'Office/Area', 'PHEP', '', '', '', '', 'Paging System', '7561'],
  [70, 'Office/Area', 'PHEP', '', '', '', '', 'Pantry Hall', '7519']
];

function setupDirectory() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // --- Directory tab ---
  var sheet = ss.getSheetByName('Directory');
  if (!sheet) {
    // Reuse the default first sheet if the spreadsheet is still empty,
    // otherwise create a fresh tab.
    var first = ss.getSheets()[0];
    if (ss.getSheets().length === 1 && first.getLastRow() === 0) {
      sheet = first.setName('Directory');
    } else {
      sheet = ss.insertSheet('Directory');
    }
  }
  sheet.clear();
  sheet.clearConditionalFormatRules();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).clearDataValidations();

  // Plain-text format for Local No. BEFORE writing, so values like
  // "7500-7502" and "7553" are stored exactly as typed.
  sheet.getRange('I:I').setNumberFormat('@');

  // Header + data
  sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
  sheet.getRange(2, 1, DATA.length, HEADER.length).setValues(DATA);

  // Header styling
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADER.length)
       .setFontWeight('bold')
       .setBackground('#1a3d5c')
       .setFontColor('#ffffff');

  // Dropdown validation (covers 1000 rows so future entries get it too)
  var categoryRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Individual', 'Office/Area'], true)
      .setAllowInvalid(false)
      .setHelpText('Choose Individual or Office/Area')
      .build();
  sheet.getRange('B2:B1000').setDataValidation(categoryRule);

  var sectionRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Housing Compound', 'CHEP', 'MHEP', 'PHEP'], true)
      .setAllowInvalid(false)
      .setHelpText('Section applies to Office/Area entries only')
      .build();
  sheet.getRange('C2:C1000').setDataValidation(sectionRule);

  for (var c = 1; c <= HEADER.length; c++) {
    sheet.autoResizeColumn(c);
  }

  // --- Meta tab ---
  var meta = ss.getSheetByName('Meta') || ss.insertSheet('Meta');
  meta.clear();
  meta.getRange('A1:B1').setValues([['Last Updated', '2026-08-20']]);
  meta.getRange('A1').setFontWeight('bold');

  Logger.log('Setup complete: ' + DATA.length + ' rows written.');
}
