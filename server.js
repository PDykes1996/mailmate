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

app.get("/guide", (_, res) => {
	res.render("guide");
});

app.get("/template/:id", (req, res) => {
	const { id } = req.params;

	const template = templates.find((template) => template.id === id);

	if (!template) {
		return res.status(404).send("Template not found");
	}

	res.render("template", {
		template,
		stringified: sanitizeJSON(JSON.stringify(template)),
		subject: template.subject,
		emailBody: template.body,
	});
});

app.put("/template/:id", async (req, res) => {
	const { id } = req.params;
	const { name, to, cc, bcc, subject, body } = req.body;

	const template = templates.find((template) => template.id === id);

	if (!template) {
		return res.status(404).send("Template not found");
	}

	template.name = name;
	template.to = to;
	template.cc = cc;
	template.bcc = bcc;
	template.subject = subject;
	template.body = body;

	template.fields = extractDynamicFields(`${subject}${body}`);

	await db.write();

	res.redirect("/");
});

const extractDynamicFields = (content) => {
	content = content.trim();

	const regex = /\{@(.*?):(.*?)\}/gm;
	const fields = [];

	const matches = content.match(regex);

	for (let match of new Set(matches)) {
		const dup = match.slice(1, -1);
		const [type, body] = dup.split(":");
		const [label, value = ""] = body.split("|");

		fields.push({ id: match, type: type.replace("@", ""), label: label.trim(), value: value.trim() });
	}

	return fields;
};

const replaceDynamicFields = (content, fields) => {
	let newContent = content;

	for (const [id, value] of Object.entries(fields)) {
		newContent = newContent.replaceAll(id, value);
	}

	return newContent;
};

app.post("/template", async (req, res) => {
	const { name, to, cc, bcc, subject, body } = req.body;

	const id = nanoId();

	const fields = extractDynamicFields(`${subject}${body}`);

	templates.push({
		id,
		name,
		to,
		cc,
		bcc,
		subject,
		body,
		fields,
	});

	await db.write();

	res.redirect("/");
});

app.delete("/template/:id", async (req, res) => {
	const { id } = req.params;

	const index = templates.findIndex((template) => template.id === id);

	if (index === -1) {
		return res.status(404).send("Template not found");
	}

	templates.splice(index, 1);

	await db.write();

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

app.post("/generate", (req, res) => {
	const { templateId } = req.query;
	const { to, cc, bcc, ...fields } = req.body;

	const template = templates.find((template) => template.id === templateId);

	if (!template) {
		return res.status(404).send("Template not found");
	}

	for (const field of template.fields) {
		if (!fields[field.id]) {
			return res.status(400).send(`Field ${field.label} is required`);
		}
	}

	const subject = replaceDynamicFields(template.subject, fields);
	const body = replaceDynamicFields(template.body, fields);

	const e = encodeURIComponent;
	const mailtoLink = `mailto:${e(to)}?cc=${e(cc)}&bcc=${e(bcc)}&subject=${e(subject)}&body=${e(body)}`;

	res.redirect(mailtoLink);
});

app.get("/search", (req, res) => {
	const query = req.query.q.toLowerCase();

	const searchResults = templates.filter((template) => {
		return (
			template.name.toLowerCase().includes(query) ||
			template.body.toLowerCase().includes(query) ||
			template.subject.toLowerCase().includes(query)
		);
	});

	return res.render("home", { query, templates: searchResults });
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
