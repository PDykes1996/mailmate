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
		updateDialog.querySelector("textarea[name=body]").value = parsedTemplate.body;
	} catch (err) {
		console.error("Failed to parse template JSON:", err);
	}
};

const openDeleteDialog = (template) => {
	const parsedTemplate = JSON.parse(template);

	deleteDialog.showModal();
	deleteDialog.querySelector("form").action = `/template/${parsedTemplate.id}?_method=DELETE`;
};

const openPreviewDialog = (emailBody) => {
	previewDialog.showModal();
	previewDialog.querySelector("p").innerHTML = emailBody.replace(/\n/g, "<br>");
};
