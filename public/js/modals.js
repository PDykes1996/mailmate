const createDialog = document.getElementById("create-template");
const updateDialog = document.getElementById("update-template");
const deleteDialog = document.getElementById("delete-template");
const previewDialog = document.getElementById("preview-template");
const labelPlaceholderModal = document.getElementById("label-placeholder-modal");

const closeButtons = document.querySelectorAll("[data-close]");

closeButtons.forEach((button) => {
	button.addEventListener("click", () => {
		createDialog.close();
		updateDialog.close();
		deleteDialog.close();
		previewDialog.close();
		labelPlaceholderModal.close();
	});
});

// Store the selected tag type (like "text", "email", etc.)
let selectedType = "";

// Open the label/placeholder modal
function openLabelPlaceholderModal() {
	labelPlaceholderModal.showModal();
	document.getElementById("tagLabel").value = ""; // Reset values
	document.getElementById("tagPlaceholder").value = "";
}

// Insert the dynamic tag based on the user's input
function insertAtCursor(input, text) {
	const start = input.selectionStart;
	const end = input.selectionEnd;
	const before = input.value.substring(0, start);
	const after = input.value.substring(end);

	input.value = before + text + after;
	input.selectionStart = input.selectionEnd = start + text.length;
	input.focus();
}

// Handle the insert action on modal submit
document.getElementById("insertTag").addEventListener("click", () => {
	const label = document.getElementById("tagLabel").value.trim() || "Field";
	const placeholder = document.getElementById("tagPlaceholder").value.trim();

	// Create the dynamic tag based on the label and placeholder
	let tag = `{@${selectedType}:${label}`;
	if (placeholder) tag += `|${placeholder}`;
	tag += "}";

	// Insert the tag into the email body (or anywhere appropriate)
	const emailBodyInput = document.querySelector("textarea[name='body']");
	insertAtCursor(emailBodyInput, tag);
	labelPlaceholderModal.close(); // Close modal after insertion
});

// Function to create the tag buttons dynamically
function generateTags() {
	const tagBank = document.querySelector(".tags"); // The container where tags are stored
	const formInputTypes = [
		"text",
		"email",
		"password",
		"number",
		"tel",
		"url",
		"date",
		"month",
		"week",
		"time",
		"color",
		"search",
		"range",
	];

	formInputTypes.forEach((type) => {
		const button = document.createElement("button");
		button.type = "button";
		button.classList.add("tag");
		button.dataset.type = type;
		button.textContent = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize first letter
		button.addEventListener("click", (event) => {
			selectedType = event.target.dataset.type; // Store selected type
			openLabelPlaceholderModal(); // Open the modal to edit the label/placeholder
		});

		tagBank.appendChild(button);
	});
}

// Call the function to generate tags when the page loads
generateTags();

const openCreateDialog = () => {
	createDialog.showModal();
};

const openUpdateDialog = (template) => {
	try {
		const parsedTemplate = JSON.parse(template);

		// Populate the update dialog with parsed values
		updateDialog.showModal();
		updateDialog.querySelector("form").action = `/template/${parsedTemplate.id}?_method=PUT`;
		updateDialog.querySelector("input[name=name]").value = parsedTemplate.name;
		updateDialog.querySelector("input[name=subject]").value = parsedTemplate.subject;
		updateDialog.querySelector("textarea[name=body]").value = parsedTemplate.body;
		updateDialog.querySelector("input[name=to]").value = parsedTemplate.to;
		updateDialog.querySelector("input[name=cc]").value = parsedTemplate.cc;
		updateDialog.querySelector("input[name=bcc]").value = parsedTemplate.bcc;
	} catch (err) {
		console.error("Failed to parse template JSON:", err);
	}
};

const openDeleteDialog = (template) => {
	const parsedTemplate = JSON.parse(template);

	deleteDialog.showModal();
	deleteDialog.querySelector("form").action = `/template/${parsedTemplate.id}?_method=DELETE`;
};

const openPreviewDialog = (subject, body) => {
	const dynamicFields = document.getElementById("dynamicFields");
	// get all the dynamic inputs from the dynamicFields div
	const dynamicInputs = dynamicFields.querySelectorAll("input");

	dynamicInputs.forEach((input) => {
		const placeholder = input.name;
		let value = input.value.length ? input.value : placeholder;

		// put span tags around the placeholder for styling

		value = `<mark class="${!input.value.length && "error"}">${value}</mark>`;

		subject = subject.replaceAll(placeholder, value);
		body = body.replaceAll(placeholder, value);
	});

	previewDialog.querySelector("h3").innerHTML = subject;
	previewDialog.querySelector("p").innerHTML = body.replace(/\n/g, "<br>");
	previewDialog.showModal();
};

const ccFieldButon = document.getElementById("ccFieldButton");
const bccFieldButton = document.getElementById("bccFieldButton");

const ccField = document.getElementById("ccField");
const bccField = document.getElementById("bccField");

function toggleCcField() {
	ccFieldButon.style.backgroundColor = ccField.style.display === "none" ? "var(--bg-mute)" : "var(--bg-main)";
	ccField.style.display = ccField.style.display === "none" ? "flex" : "none";
	ccFieldButon.innerText = ccField.style.display === "none" ? "Cc" : "Hide Cc";
}

function toggleBccField() {
	bccFieldButton.style.backgroundColor = bccField.style.display === "none" ? "var(--bg-mute)" : "var(--bg-main)";
	bccField.style.display = bccField.style.display === "none" ? "flex" : "none";
	bccFieldButton.innerText = bccField.style.display === "none" ? "Bcc" : "Hide Bcc";
}
