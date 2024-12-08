const createDialog = document.getElementById("create-template");
const updateDialog = document.getElementById("update-template");
const deleteDialog = document.getElementById("delete-template");
const previewDialog = document.getElementById("preview-template");

const closeButtons = document.querySelectorAll("[data-close]");

closeButtons.forEach((button) => {
	button.addEventListener("click", () => {
		createDialog.close();
		updateDialog.close();
		deleteDialog.close();
		previewDialog.close();
	});
});

createDialog.addEventListener("click", (event) => {
	if (event.target === createDialog) {
		createDialog.close();
	}
});

updateDialog.addEventListener("click", (event) => {
	if (event.target === updateDialog) {
		updateDialog.close();
	}
});

deleteDialog.addEventListener("click", (event) => {
	if (event.target === deleteDialog) {
		deleteDialog.close();
	}
});

previewDialog.addEventListener("click", (event) => {
	if (event.target === previewDialog) {
		previewDialog.close();
	}
});

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
