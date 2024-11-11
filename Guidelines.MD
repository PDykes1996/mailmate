# Guidelines for Uploading the Text File

To ensure proper parsing and dynamic mailto generation, please follow the guidelines below when formatting your text file. The file should contain the following fields: TO, CC, BCC, SUBJECT, and BODY.

## Example Format

```
TO:'example@example.com'
CC:'cc@example.com'
BCC:'bcc@example.com'
SUBJECT:'Help Requested on {@date:Delivery Date | 2018-07-22} for {@text:Receiver|Customer}'

BODY:
Dear {@text:Receiver|Customer},

We received your request for help on {@date:Delivery Date | 2018-07-22}. Our team will review your case and get back to you shortly.

Best regards,
Support Team
```

## Field Formatting

- **TO:** The recipient's email address.
  Example: `TO:'example@example.com'`
- **CC:** Carbon copy recipients' email addresses (optional).
  Example: `CC:'cc@example.com'`
- **BCC:** Blind carbon copy recipients' email addresses (optional).
  Example: `BCC:'bcc@example.com'`
- **SUBJECT:** The subject of the email. This can include dynamic input fields.
  Example: `SUBJECT:'Help Requested on {@date:Delivery Date | 2018-07-22} for {@text:Receiver|Customer}'`
- **BODY:** The body of the email. This can include dynamic input fields.

## Custom Template Formatting

To generate dynamic input fields, use the following format:

`{@type:Label|Placeholder}`

- **type:** The type of the HTML input element.
- **Label:** The label for the input field.
- **Placeholder:** The default value or placeholder for the input field. (Optional)

### Examples of Dynamic Input Fields

1. **Text Input:**
   - Format: `{@text:Receiver|Customer}`
   - Generates: `<input type="text" name="Receiver" value="Customer">`

2. **Date Input:**
   - Format: `{@date:Delivery Date|2018-07-22}`
   - Generates: `<input type="date" name="Delivery Date" value="2018-07-22">`

3. **Email Input:**
   - Format: `{@email:Email}`
   - Generates: `<input type="email" name="Email" value="">`

## HTML Input Types

For a comprehensive list of HTML input types, refer to the [MDN Web Docs on <input>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).

By following these guidelines, you can ensure that your text file is correctly formatted for dynamic mailto generation.