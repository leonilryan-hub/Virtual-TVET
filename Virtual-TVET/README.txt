VIRTUAL TVET CAMPUS - PHASE 2b + ACCESS LOCK
Electrical Installation and Maintenance NC III
Developed by LEONIL RYAN L. DELA PENA, Senior TESD Specialist, RTC-Cebu

HOW TO OPEN ON THIS PC
  Double-click index.html (Chrome or Edge).
  Until config.js has your Google link, it runs in DEMO mode
  (registrations are saved only on that device).

HOW TO ADD OR UPDATE A CBLM
  1. Save the CBLM in the Basic, Common or Core folder.
     File name pattern:  CBLM_EIM-NCIII_<UnitCode>_<ShortTitle>_Rev00.docx
  2. Double-click "Update Catalog.bat".
  3. Upload the new CBLM and catalog.js to GitHub (same folders).

------------------------------------------------------------
A. GOOGLE SHEETS (learner records)
------------------------------------------------------------
  1. Go to sheets.google.com > Blank spreadsheet.
     Name it "Virtual TVET Records".
  2. Extensions > Apps Script. Delete the sample code.
     Open "Google-Apps-Script (DO NOT UPLOAD)\Code.gs" with Notepad, copy everything,
     paste it in, then click Save.
  3. In the toolbar, choose the function "setup" and click Run.
     Allow the permissions (Advanced > Go to project > Allow).
     Two tabs appear in the Sheet: Learners and LearnerType.
  4. Deploy > New deployment > gear icon > Web app.
       Execute as: Me
       Who has access: Anyone
     Click Deploy and copy the Web app URL (it ends with /exec).
  5. Open config.js with Notepad and paste the URL between the quotes:
       apiUrl: "https://script.google.com/macros/s/....../exec"
     Save.

  If you change Code.gs later:
     Deploy > Manage deployments > pencil icon > Version: New version > Deploy.
     (The URL stays the same.)

------------------------------------------------------------
B. GITHUB PAGES (put the campus online)
------------------------------------------------------------
  1. Create a free account at github.com.
  2. Click + (top right) > New repository.
     Name: virtual-tvet   Public   > Create repository.
  3. Click "uploading an existing file".
     From the "EIM NC III CBLM" folder, drag in:
        the Basic, Common, Core and Virtual-TVET folders
        and index.html
     Wait for all files to finish, then click "Commit changes".
  4. Settings > Pages > Source: Deploy from a branch
     Branch: main   Folder: / (root)   > Save.
  5. Wait 1-2 minutes. Your link appears at the top of the Pages screen:
        https://<your-username>.github.io/virtual-tvet/
     Open it on your phone.

  NOTE: A public repository means anyone with the link can see the files.
  Never upload the Google Sheet or any learner data to GitHub.

------------------------------------------------------------
FILES
------------------------------------------------------------
  index.html          the campus game
  catalog.js          list of CBLMs (made by Update Catalog.bat)
  config.js           your Google Apps Script link
  build-catalog.ps1   script that builds catalog.js
  Update Catalog.bat  double-click to run the script
  assessment-bank.js  Self-Assessment items + pre-test questions (no answers)
  trainer.html        Trainer Page: activation QR code, NFC tag, learner access
  qr.js               QR code maker used by the Trainer Page
  tools\protect-files.html   makes locked (.enc) copies of the CBLMs

  The Google Apps Script code is in the folder
  "Google-Apps-Script (DO NOT UPLOAD)" next to Basic/Common/Core.
  It contains the pre-test ANSWER KEYS. Never upload it to GitHub.

------------------------------------------------------------
C. UPDATING TO PHASE 2b (RPL Self-Assessment + Pre-test)
------------------------------------------------------------
  1. Google Apps Script: select all the old code, delete it, paste the new
     Code.gs, Save. Run "setup" once (adds 3 new tabs:
     SelfAssessment, PreTest, TrainingNeeds).
     Deploy > Manage deployments > pencil > Version: New version > Deploy.
  2. GitHub: open the Virtual-TVET folder in your repository >
     Add file > Upload files > drop in index.html and assessment-bank.js
     > Commit changes.
  3. GitHub: delete the old google-apps-script folder from the repository
     (open google-apps-script/Code.gs > ... menu > Delete file > Commit).

------------------------------------------------------------
D. ACCESS LOCK (Register > scan QR/NFC > PIN > auto-lock)
------------------------------------------------------------
HOW IT WORKS FOR LEARNERS
  1. Register at the Support Service Area (Trainee ID + PIN).
  2. Scan the QR code on the trainer's phone (or tap the NFC tag),
     then log in. The campus opens for the number of days in Settings.
  3. Every time they open the campus, they enter their PIN.
  4. When the days are over, the campus locks again. They scan again.
  - Only the Support Service Area and Trainer's Resource Area open
    while locked. CBLMs, assessments and other areas stay locked.
  - Device lock: their Trainee ID works only on the phone/PC where
    they first activated. 5 wrong PINs pause the account 15 minutes.

STEP 1 - Update Google Apps Script
  1. Open your Sheet > Extensions > Apps Script.
     Select all the old code, delete it, paste the new Code.gs from
     "Google-Apps-Script (DO NOT UPLOAD)", Save.
  2. Choose "setup" and click Run (allow permissions if asked).
     New tabs appear: Trainers, AccessLog, Downloads, Settings.
     New columns appear at the end of Learners.
  3. Deploy > Manage deployments > pencil > Version: New version > Deploy.
  4. Trainers tab: type your own PIN (numbers only) in the PIN cell of
     TR-001. Add more trainers in new rows (TR-002 ...), Active = Yes.
     Leave QRSecret and NFCCode blank; they fill in automatically.
     Never share the Sheet: it holds trainer PINs and keys.
  5. Settings tab: LockDays (default 30), DeviceLock (Yes/No), etc.

  NOTE: learners who registered before this update must scan your
  QR code once to unlock.

STEP 2 - Upload to GitHub (Virtual-TVET folder)
  index.html, config.js, trainer.html, qr.js and the tools folder.
  Also upload the index.html in the main "EIM NC III CBLM" folder
  (it now keeps the QR code when it redirects).

STEP 3 - Using the Trainer Page
  Open on your phone:
     https://leonilryan-hub.github.io/Virtual-TVET/Virtual-TVET/trainer.html
  (or Trainer's Resource Area > Open the Trainer Page). Log in with TR-001.
  - Activate (QR): learners scan the code. It changes every 30 seconds.
    "Full screen" makes it bigger for a class. Learners without a camera
    can type the code shown under the QR.
  - NFC tag: buy NTAG213/215 stickers or cards. On an Android phone with
    Chrome tap "Write to NFC tag", or use the free NFC Tools app to write
    the link. "Change tag code" makes lost tags stop working.
  - Learners: Extend (add days, or open now without scanning), Lock now,
    Revoke / Restore, Reset device (new phone), lock days for one
    learner, Reset PIN (forgot PIN).
  Everything is recorded in the AccessLog tab; downloads in Downloads.

STEP 4 - Protect the CBLM files on GitHub (important)
  Without this step the .docx files are still public on GitHub: anyone
  who knows a file's link can download it without a PIN.
  1. Settings tab: copy the ContentKey.
  2. Double-click Virtual-TVET\tools\protect-files.html (Chrome or
     Edge), paste the key, click "Choose folder" and pick the
     "EIM NC III CBLM" folder. Locked copies go to the new folder
     "GitHub-Upload (protected)".
  3. GitHub: Add file > Upload files > drag in the Basic, Common and
     Core folders from "GitHub-Upload (protected)" > Commit.
  4. config.js: set  protectedFiles: true  and upload config.js.
  5. Test on a phone: download a CBLM after unlocking.
  6. Remove the plain .docx files from GitHub. Deleting them is not
     enough, because GitHub keeps old versions in its history. The clean
     way: GitHub > Settings > delete the repository, create it again with
     the same name (same link), and upload only: index.html, the
     Virtual-TVET folder, and the Basic/Common/Core folders from
     "GitHub-Upload (protected)". Then turn GitHub Pages on again (part B).
  When you add or revise a CBLM: run protect-files.html again and upload
  the new .enc file.

LIMITS (good to know)
  - The lock stops casual sharing. A learner who already downloaded a
    CBLM can still pass the Word file to others.
  - If a learner clears their browser data, their device ID changes.
    Use "Reset device" on the Trainer Page.
  - If you change the ContentKey, protect and upload all files again.
