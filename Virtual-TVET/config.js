// Virtual TVET - settings
// Paste your Google Apps Script Web App URL between the quotes below.
// Leave it empty ("") to run in DEMO mode (records are saved only on this device, and the Access Lock is off).
window.VTVET_CONFIG = {
  apiUrl: "https://script.google.com/macros/s/AKfycbxlECRIyyaMZ9kM8CnAqtZ8t9KD48wcJ-YXSMpQq5v-5nrsxgV1wCtwnABlGY-VIbxf/exec",

  // ACCESS LOCK
  // The campus link that the trainer QR code and NFC tag open (must end with /).
  campusUrl: "https://leonilryan-hub.github.io/Virtual-TVET/Virtual-TVET/",
  // true = CBLMs are downloaded from the protected (.enc) copies made with tools/protect-files.html.
  // Set to true only AFTER you have uploaded the .enc files to GitHub.
  protectedFiles: true
};
