/**
 * Google Apps Script สำหรับ Personal Progress Dashboard
 * 1) สร้าง Google Sheet ใหม่
 * 2) Extensions > Apps Script
 * 3) วางโค้ดนี้ทั้งหมด
 * 4) Deploy > New deployment > Web app
 * 5) Execute as: Me
 * 6) Who has access: Anyone
 * 7) นำ Web App URL ไปใส่ใน CONFIG.APPS_SCRIPT_URL ใน app.js
 */
const SHEET_NAME = "Daily";

function setup() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(["date","coding","mind","english","communication","exercise","weight","sleep","learning","note","updatedAt"]);
  }
}

function doPost(e) {
  setup();
  const row = JSON.parse(e.postData.contents);
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const dateCol = headers.indexOf("date") + 1;
  let targetRow = -1;
  for (let i=1;i<values.length;i++) {
    if (String(values[i][dateCol-1]) === String(row.date)) { targetRow=i+1; break; }
  }
  const out = [
    row.date,row.coding||0,row.mind||0,row.english||0,row.communication||0,
    row.exercise||0,row.weight||0,row.sleep||0,row.learning||"",row.note||"",
    new Date()
  ];
  if (targetRow > 0) sh.getRange(targetRow,1,1,out.length).setValues([out]);
  else sh.appendRow(out);
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  setup();
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  const data = values.map(r => Object.fromEntries(headers.map((h,i)=>[h,r[i]])));
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}