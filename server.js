const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

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
      
      //find curly braces
      const regex = /\{(.*?)\}/gs;
      const matches = [...data.matchAll(regex)];
      console.log(matches)
      //split data into key (TO, CC, etc) and value pair
      const fields = matches.map(match => {
        const content = match[1].trim();
        const [key, value] = content.split(':');
        //console.log(key);
        //console.log(value);
        return {
          key: key.trim(),
          value: value ? value.replace(/['"]/g, '').trim() : ''
        };
      });

      //pass key value pairs to render page for form creation
      res.render('parseTemplate', { fields });
    });
  } else {
    res.status(400).send('Invalid file type');
  }
});

/* Mailto link generation must be redone for this version of code
// Route to generate the mailto link from hardcoded email1 template
app.post('/generate-email', (req, res) => {
  const { TO, CC, SUBJECT, PROJECT_ID, DATE, SENDER } = req.body;

  // Hardcode template structure with user input replacements
  const subject = `Help Requested on ${DATE}`;
  const body = `
Hello David,

Wanted to follow up on project ${PROJECT_ID} that needs an install on ${DATE}.

Best regards,
${SENDER}`;

  // Generate the mailto link (hardcoded for email1.txt structure)
  const mailtoLink = `mailto:${encodeURIComponent(TO)}?cc=${encodeURIComponent(CC)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  res.redirect(mailtoLink);
});*/


// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

