import express, { urlencoded } from "express";
import expressLayouts from "express-ejs-layouts";
import expressUploads from "express-fileupload";
import { JSONFilePreset } from "lowdb/node";
import expressMethodOverride from "method-override";
import { join } from "path";

const __dirname = import.meta.dirname;

const app = express();
const port = 3000;

// Middleware
app.use(expressLayouts);
app.use(expressUploads());
app.use(expressMethodOverride("_method"));
app.use(urlencoded({ extended: true }));
app.use(express.static("public"));

// not secure, but it's fine for this project
app.use((req, res, next) => {
	res.removeHeader("Content-Security-Policy");
	next();
});

// Express Settings
app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));
app.set("layout", "layouts/layout");

// Local Database
const db = await JSONFilePreset("templates.json", {
	templates: [],
});

const { templates } = db.data;

app.get("/", async (_, res) => {
	res.render("home", {
		templates: templates.map((template) => {
			return {
				...template,
				stringified: sanitizeJSON(JSON.stringify(template)),
			};
		}),
		query: "",
	});
});

app.get("/template/:id", (req, res) => {
	const { id } = req.params;

	const template = templates.find((template) => template.id === id);

	if (!template) {
		return res.status(404).send("Template not found");
	}

	const lines = template.body.split("\n");

	let staticMailData = {
		TO: {
			label: "Who are you sending this to?",
			defaultValue: "",
		},
		CC: {
			label: "Who would you like to CC?",
			defaultValue: "",
		},
		BCC: {
			label: "Who would you like to BCC?",
			defaultValue: "",
		},
	};
	let subject = [];
	let body = [];

	lines.forEach((line) => {
		// Split by first colon
		const colonIndex = line.indexOf(":");
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
				staticMailData[trimmedKey] = {
					label: staticMailData[trimmedKey].label,
					defaultValue: trimmedValue,
				};
			}
			if (trimmedKey === "SUBJECT") {
				subject.push(trimmedValue);
			}
		}
	});

	// Parse each line to extract BODY
	let bodyFlag = false;
	lines.forEach((line) => {
		if (line.trim().toUpperCase() === "BODY:") {
			bodyFlag = true;
			return;
		}
		if (bodyFlag) {
			body.push(line);
		}
	});

	const subjectFields = parseTemplate(subject.join("\n"));
	const bodyFields = parseTemplate(body.join("\n"));

	//pass key value pairs to render page for form creation
	res.render("template", {
		template,
		stringified: sanitizeJSON(JSON.stringify(template)),
		subjectFields,
		bodyFields,
		staticMailData,
		subject,
		emailBody: body.join("\n"),
	});
});

app.put("/template/:id", (req, res) => {
	const { id } = req.params;
	const { name, subject, body } = req.body;

	const template = templates.find((template) => template.id === id);

	if (!template) {
		return res.status(404).send("Template not found");
	}

	template.name = name;
	template.subject = subject;
	template.body = body;

	db.write();

	res.redirect("/");
});

app.post("/template", (req, res) => {
	const { name, subject, body } = req.body;

	templates.push({
		id: nanoId(),
		name,
		subject,
		body,
	});

	db.write();

	res.redirect("/");
});

app.delete("/template/:id", (req, res) => {
	const { id } = req.params;

	const index = templates.findIndex((template) => template.id === id);

	if (index === -1) {
		return res.status(404).send("Template not found");
	}

	templates.splice(index, 1);

	db.write();

	res.redirect("/");
});

function sanitizeJSON(unsanitized) {
	return unsanitized
		.replace(/\\/g, "\\\\")
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t")
		.replace(/\f/g, "\\f")
		.replace(/"/g, '\\"')
		.replace(/'/g, "\\'")
		.replace(/\&/g, "\\&");
}

function parseTemplate(template) {
	const regex = /\{\@(.*?)\}/gs;
	let match;
	let fields = [];
	while ((match = regex.exec(template)) !== null) {
		fields.push(match[1]);
	}

	return fields.map((field) => {
		let [type, labelDefault] = field.split(":");
		let [label, defaultValue] = labelDefault.split("|");
		if (!defaultValue) {
			defaultValue = "";
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

app.post("/generate-email", (req, res) => {
	const mailFields = getCleanFormData(req.body);
	const body = req.body.body;
	const subject = req.body.subject;

	const { newBody, newSubject } = generateNewBodySubject(body, subject, mailFields);

	const mailtoLink = `mailto:${encodeURIComponent(mailFields.staticMailData.TO)}?cc=${encodeURIComponent(
		mailFields.staticMailData.CC
	)}&bcc=${encodeURIComponent(mailFields.staticMailData.BCC)}&subject=${encodeURIComponent(
		newSubject
	)}&body=${encodeURIComponent(newBody)}`;

	res.redirect(mailtoLink);
});

function generateNewBodySubject(body, subject, mailFields) {
	let newBody = body;
	let newSubject = subject;

	for (const key in mailFields.bodyFields) {
		const regex = /\{\@(.*?)\}/gs;
		let match;
		while ((match = regex.exec(newBody)) !== null) {
			let field = match[1];
			let [type, labelDefault] = field.split(":");
			let [label, defaultValue] = labelDefault.split("|");
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
			let [type, labelDefault] = field.split(":");
			let [label, defaultValue] = labelDefault.split("|");
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
		if (key.startsWith("static_")) {
			staticMailData[key.replace("static_", "")] = formData[key];
		} else if (key.startsWith("subject_")) {
			subjectFields[key.replace("subject_", "")] = formData[key];
		} else if (key.startsWith("body_")) {
			bodyFields[key.replace("body_", "")] = formData[key];
		}
	}

	const cleanJSON = {
		staticMailData,
		subjectFields,
		bodyFields,
	};

	return cleanJSON;
}

app.get("/search", (req, res) => {
	const query = req.query.q.toLowerCase();

	const searchResults = templates.filter((template) => {
		return (
			template.name.includes(query) || // Add more fields to search
			template.body.includes(query)
		);
	});

	return res.render("home", {
		query,
		templates: searchResults,
	});
});

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});

const nanoId = (length = 5) => {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let str = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		str += chars[randomIndex];
	}
	return str;
};
