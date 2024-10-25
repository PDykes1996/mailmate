const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Directory for email templates
const templatePath = path.join(__dirname, 'email_templates', 'test_email1.txt');

// Home route (hardcoded to go directly to email1)
app.get('/', (req, res) => {
  res.render('home');
});

// Route to load the form (hardcoded for email1)
app.get('/email1', (req, res) => {
  fs.readFile(templatePath, 'utf-8', (err, content) => {
    if (err) {
      console.error('Error reading the template:', err.message);
      return res.status(404).send('Template not found or unable to read the template.');
    }

    // Define hardcoded fields from the template (no dynamic placeholders)
    const fields = ['TO', 'CC', 'SUBJECT', 'PROJECT_ID', 'DATE', 'SENDER'];
    res.render('email1', { fields });
  });
});

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
});

// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
