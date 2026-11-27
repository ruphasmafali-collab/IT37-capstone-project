// Google Apps Script Backend for Student Organization Event and Attendance System

// Helper: Hash password using SHA-256
function hashPassword(password) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password));
  var hexHash = '';
  for (var i = 0; i < rawHash.length; i++) {
    var byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    var byteStr = byteVal.toString(16);
    if (byteStr.length === 1) byteStr = '0' + byteStr;
    hexHash += byteStr;
  }
  return hexHash;
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'getEvents') {
    var sheet = ss.getSheetByName('Events');
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var headers = data[0];
    var rows = data.slice(1);
    var events = rows.map(function(row) {
      var obj = {};
      headers.forEach(function(header, i) {
        obj[header] = row[i];
      });
      return obj;
    });
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: events }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getAttendance') {
    var sheet = ss.getSheetByName('Attendance');
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var headers = data[0];
    var rows = data.slice(1);
    var attendance = rows.map(function(row) {
      var obj = {};
      headers.forEach(function(header, i) {
        obj[header] = row[i];
      });
      return obj;
    });
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: attendance }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'registerUser') {
      var sheet = ss.getSheetByName('Users');
      var name = String(contents.name || '').trim();
      var email = String(contents.email || '').trim().toLowerCase();
      var rawPassword = String(contents.password || '');
      var role = contents.role || 'Member (Student)';

      if (!name || !email || !rawPassword) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Name, email, and password are required.'
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var existingData = sheet.getDataRange().getValues();
      for (var i = 1; i < existingData.length; i++) {
        if (String(existingData[i][2] || '').trim().toLowerCase() === email) {
          return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: 'Email is already registered.'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }

      var id = 'USER_' + new Date().getTime();
      var hashedPassword = hashPassword(rawPassword);
      sheet.appendRow([id, name, email, hashedPassword, role]);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'User registered successfully',
        user: { id: id, name: name, email: email, role: role }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'loginUser') {
      var sheet = ss.getSheetByName('Users');
      var data = sheet.getDataRange().getValues();
      var email = String(contents.email || '').trim().toLowerCase();
      var hashedPassword = hashPassword(String(contents.password || ''));

      for (var i = 1; i < data.length; i++) {
        var rowEmail = String(data[i][2] || '').trim().toLowerCase();
        var rowPassword = String(data[i][3] || '');
        if (rowEmail === email && rowPassword === hashedPassword) {
          var token = Utilities.getUuid();
          return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            message: 'Signed in successfully',
            token: token,
            user: {
              id: data[i][0],
              name: data[i][1],
              email: data[i][2],
              role: data[i][4] || 'Member (Student)'
            }
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Invalid email or password.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'createEvent') {
      var sheet = ss.getSheetByName('Events');
      var id = 'EVT_' + new Date().getTime();
      var title = String(contents.title || '').trim();
      var description = String(contents.description || '').trim();
      var date = String(contents.date || '').trim();
      var location = String(contents.location || '').trim();
      var createdBy = String(contents.createdBy || '').trim();

      sheet.appendRow([id, title, description, date, location, createdBy]);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Event created successfully',
        event: {
          id: id,
          title: title,
          description: description,
          date: date,
          location: location,
          createdBy: createdBy
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }

   if (action === 'logAttendance') {
      var sheet = ss.getSheetByName('Attendance');
      var id = 'ATT_' + new Date().getTime();
      var eventId = String(contents.event_id || contents.eventId || '').trim();
      var eventTitle = String(contents.event_title || contents.eventTitle || '').trim();
      var userName = String(contents.user_name || contents.userName || '').trim();
      var userEmail = String(contents.user_email || contents.userEmail || '').trim();
      var status = String(contents.status || 'Present').trim();
      var timestamp = new Date().toISOString();

      sheet.appendRow([id, eventId, eventTitle, userName, userEmail, status, timestamp]);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Attendance logged successfully',
        attendance: {
          id: id,
          event_id: eventId,
          event_title: eventTitle,
          user_name: userName,
          user_email: userEmail,
          status: status,
          timestamp: timestamp
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
