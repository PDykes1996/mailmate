const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Directory for email templates
const templatesPath = path.join(__dirname, 'email_templates');


// Home route (hardcoded to go directly to email1)
app.get('/', (req, res) => {
  fs.readdir(templatesPath, (err, files) => {
    if (err) {
      return res.status(500).send('Failed to load templates');
    }

    const textFiles = files.filter(file => path.extname(file) === '.txt');

  res.render('home', {textFiles});
  })
});

//this route will use regex on specified text file to match curly brace enclosed data and create fields based on it
app.get('/parseTemplate/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(templatesPath, filename);

  //make sure file exists and is .txt
  if (path.extname(filename) === '.txt') {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        return res.status(404).send('File not found or unable to read');
      }

      const lines = data.split('\n');
      
      let staticMailData = {
        TO: '',
        CC: '',
        BCC: '',
      };
      let subject = [];
      let body = [];
      
      lines.forEach(line => {
        // Split by first colon
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) {
          return;
        }
        const key = line.slice(0, colonIndex);
        const value = line.slice(colonIndex + 1);
        if (key && value) {
          const trimmedKey = key.trim().toUpperCase();
          let trimmedValue = value.trim();
          if (trimmedValue.startsWith("'") && trimmedValue.endsWith("'")) {
            trimmedValue = trimmedValue.slice(1, -1);
          }
          if (staticMailData.hasOwnProperty(trimmedKey)) {
            staticMailData[trimmedKey] = trimmedValue;
          }
          if (trimmedKey === 'SUBJECT') {
            subject.push(trimmedValue);
          }
        }
      });

      // Parse each line to extract BODY
      let bodyFlag = false;
      lines.forEach(line => {
        if (line.trim().toUpperCase() === 'BODY:') {
          bodyFlag = true;
          return;
        }
        if (bodyFlag) {
          body.push(line);
        }
      }
      );

      subjectFields = parseTemplate(subject.join('\n'));
      bodyFields = parseTemplate(body.join('\n'));
      
      //pass key value pairs to render page for form creation
      res.render('parseTemplate', { subjectFields, bodyFields, staticMailData, subject, body: body.join('\n') });
    });
  } else {
    res.status(400).send('Invalid file type');
  }
});

function parseTemplate(template) {
  const regex = /\{\@(.*?)\}/gs;
  let match;
  let fields = [];
  while ((match = regex.exec(template)) !== null) {
    fields.push(match[1]);
  }

  return fields.map(field => {
    let [type, labelDefault] = field.split(':');
    let [label, defaultValue] = labelDefault.split('|');
    if (!defaultValue) {
      defaultValue = '';
    }
    if (!label) {
      // TODO: Handle error
    }
    return {
      type: type.trim(),
      label: label.trim(),
      defaultValue: defaultValue.trim(),
    };
  });
}

// Route to generate the mailto link from user input
app.post('/generate-email', (req, res) => {
  const mailFields = getCleanFormData(req.body);
  const body = req.body.body;
  const subject = req.body.subject;
  
  const { newBody, newSubject } = generateNewBodySubject(body, subject, mailFields);

  const mailtoLink = `mailto:${encodeURIComponent(mailFields.staticMailData.TO)}?cc=${encodeURIComponent(mailFields.staticMailData.CC)}&bcc=${encodeURIComponent(mailFields.staticMailData.BCC)}&subject=${encodeURIComponent(newSubject)}&body=${encodeURIComponent(newBody)}`;

  res.redirect(mailtoLink);
});

// Function to generate new body and subject with user input. Replace template fields with user input
function generateNewBodySubject(body, subject, mailFields) {
  let newBody = body;
  let newSubject = subject;

  for (const key in mailFields.bodyFields) {
    const regex = /\{\@(.*?)\}/gs;
    let match;
    while ((match = regex.exec(newBody)) !== null) {
      let field = match[1];
      let [type, labelDefault] = field.split(':');
      let [label, defaultValue] = labelDefault.split('|');
      if (label.trim() === key) {
        newBody = newBody.replace(match[0], mailFields.bodyFields[key]);
      }
    }
  }

  for (const key in mailFields.subjectFields) {
    const regex = /\{\@(.*?)\}/gs;
    let match;
    while ((match = regex.exec(newSubject)) !== null) {
      let field = match[1];
      let [type, labelDefault] = field.split(':');
      let [label, defaultValue] = labelDefault.split('|');
      if (label.trim() === key) {
        newSubject = newSubject.replace(match[0], mailFields.subjectFields[key]);
      }
    }
  }

  return { newBody, newSubject };
}


function getCleanFormData(formData) {
  const staticMailData = {};
  const subjectFields = {};
  const bodyFields = {};

  for (const key in formData) {
    if (key.startsWith('static_')) {
      staticMailData[key.replace('static_', '')] = formData[key];
    } else if (key.startsWith('subject_')) {
      subjectFields[key.replace('subject_', '')] = formData[key];
    } else if (key.startsWith('body_')) {
      bodyFields[key.replace('body_', '')] = formData[key];
    }
  }

  const cleanJSON = {
    staticMailData,
    subjectFields,
    bodyFields
  };

  return cleanJSON;
}

//Upload Logic
app.get('/upload', (req, res) => {
  res.render('upload'); // This form should post to '/upload' route
});

// Route to handle file upload
app.post('/upload', (req, res) => {
  if (!req.files || !req.files.templateFile) {
    return res.status(400).send('No file uploaded.');
  }

  const file = req.files.templateFile;
  const uploadPath = path.join(templatesPath, file.name);

  // Check if file is a .txt file
  if (path.extname(file.name) !== '.txt') {
    return res.status(400).send('Invalid file type. Only .txt files are allowed.');
  }

  // Save the file
  file.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).send('Failed to save file.');
    }
    res.redirect('/'); // Redirect back to home to see the uploaded file in the list
  });
});

// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

