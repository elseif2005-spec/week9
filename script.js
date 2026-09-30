
function getElement(id) {
  return document.getElementById(id);
}

const form = getElement("form");
const modal = getElement("modal");
const contactsContainer = getElement("contacts");
const searchInput = getElement("search");

function clean(text) {
  const div = document.createElement("div");
  div.textContent = text === undefined || text === null ? "" : String(text);
  return div.innerHTML;
}

function fixContact(contact) {
  return {
    id: Number(contact.id) || Date.now() + Math.floor(Math.random() * 1000),
    name: contact.name || "",
    phone: contact.phone || "",
    email: contact.email || "",
    address: contact.address || "",
    company: contact.company || "",
    job: contact.job || "",
    group: contact.group || "Family",
    notes: contact.notes || "",
    favorite: Boolean(contact.favorite),
    emergency: Boolean(contact.emergency),
    image: contact.image || ""
  };
}

function loadContacts() {
  try {
    const saved = JSON.parse(localStorage.getItem("contacthub-contacts"));
    if (!Array.isArray(saved)) return [];
    return saved.map(fixContact);
  } catch (error) {
    return [];
  }
}

let contacts = loadContacts();
let editingId = null;
let contactImage = "";

function saveContacts() {
  try {
    localStorage.setItem("contacthub-contacts", JSON.stringify(contacts));
  } catch (error) {
    console.warn("تعذر الحفظ في المتصفح");
  }
}

function showMessage(title) {
  if (window.Swal) {
    Swal.fire({ title: title, icon: "success", timer: 1400, showConfirmButton: false });
  } else {
    alert(title);
  }
}
function createAvatar(contact) {
  if (contact.image) {
    return `<div class="pic"><img src="${contact.image}" alt="${clean(contact.name)}"></div>`;
  }
  const letter = contact.name ? contact.name.charAt(0).toUpperCase() : "?";
  return `<div class="pic">${clean(letter)}</div>`;
}

function createContactCard(contact) {
  const favoriteIcon = contact.favorite ? '<img class="badge-icon" src="images/star.svg" alt="Favorite">' : "";
  const emergencyIcon = contact.emergency ? '<img class="badge-icon" src="images/heart.svg" alt="Emergency">' : "";
  const address = contact.address ? `<span><img class="detail-icon" src="images/location.svg" alt="">${clean(contact.address)}</span>` : "";

  return `
    <article class="contact">
      <div class="contact-top">
        ${createAvatar(contact)}
        <div class="contact-info">
          <strong>${clean(contact.name)} ${favoriteIcon} ${emergencyIcon}</strong>
          <small>${clean(contact.job || contact.group)}${contact.company ? " at " + clean(contact.company) : ""}</small>
        </div>
        <div class="tools">
          <button type="button" data-edit="${contact.id}" title="Edit"><img class="tool-icon" src="images/edit.svg" alt=""></button>
          <button type="button" data-delete="${contact.id}" title="Delete"><img class="tool-icon" src="images/delete.svg" alt=""></button>
        </div>
      </div>
      <div class="details">
        <a href="tel:${clean(contact.phone)}"><img class="detail-icon" src="images/phone.svg" alt="">${clean(contact.phone)}</a>
        <a href="mailto:${clean(contact.email)}"><img class="detail-icon" src="images/mail.svg" alt="">${clean(contact.email)}</a>
        ${address}
      </div>
    </article>`;
}
function showSideList(elementId, list, emptyMessage) {
  const box = getElement(elementId);
  if (!box) return;

  if (list.length === 0) {
    box.innerHTML = emptyMessage;
    return;
  }

  box.innerHTML = list.map(function (contact) {
    return `
      <a class="side-contact" href="tel:${clean(contact.phone)}">
        ${createAvatar(contact)}
        <span><strong>${clean(contact.name)}</strong><small>${clean(contact.phone)}</small></span>
        <img class="side-phone" src="images/phone.svg" alt="Call">
      </a>`;
  }).join("");
}

function showContacts() {
  const searchWord = searchInput.value.toLowerCase().trim();

  const filteredContacts = contacts.filter(function (contact) {
    const text = (contact.name + " " + contact.phone + " " + contact.email + " " + contact.company).toLowerCase();
    return text.includes(searchWord);
  });

  const favorites = contacts.filter(function (contact) { return contact.favorite; });
  const emergencies = contacts.filter(function (contact) { return contact.emergency; });

  getElement("total").textContent = contacts.length;
  getElement("contactCount").textContent = contacts.length;
  getElement("favCount").textContent = favorites.length;
  getElement("emergencyCount").textContent = emergencies.length;

  contactsContainer.innerHTML = filteredContacts.map(createContactCard).join("");
  getElement("empty").classList.toggle("hidden", filteredContacts.length > 0);

  showSideList("favorites", favorites, "No favorites yet");
  showSideList("emergency", emergencies, "No emergency contacts");
  saveContacts();
}

function showPhoto() {
  const preview = getElement("photoPreview");
  preview.innerHTML = contactImage
    ? `<img src="${contactImage}" alt="Preview">`
    : '<img src="images/user.svg" alt="">';
}

function openAddModal() {
  editingId = null;
  contactImage = "";
  form.reset();
  getElement("modalTitle").textContent = "Add New Contact";
  getElement("submitBtn").textContent = "Add Contact";
  showPhoto();
  modal.classList.remove("hidden");
}

function editContact(id) {
  const contact = contacts.find(function (item) { return item.id === id; });
  if (!contact) return;

  editingId = id;
  contactImage = contact.image;

  getElement("name").value = contact.name;
  getElement("phone").value = contact.phone;
  getElement("email").value = contact.email;
  getElement("address").value = contact.address;
  getElement("company").value = contact.company;
  getElement("job").value = contact.job;
  getElement("group").value = contact.group;
  getElement("notes").value = contact.notes;
  getElement("favorite").checked = contact.favorite;
  getElement("isEmergency").checked = contact.emergency;

  getElement("modalTitle").textContent = "Edit Contact";
  getElement("submitBtn").textContent = "Save Changes";
  showPhoto();
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}
function getFormData() {
  return fixContact({
    id: editingId || Date.now(),
    name: getElement("name").value.trim(),
    phone: getElement("phone").value.trim(),
    email: getElement("email").value.trim(),
    address: getElement("address").value.trim(),
    company: getElement("company").value.trim(),
    job: getElement("job").value.trim(),
    group: getElement("group").value,
    notes: getElement("notes").value.trim(),
    favorite: getElement("favorite").checked,
    emergency: getElement("isEmergency").checked,
    image: contactImage
  });
}

function saveForm(event) {
  event.preventDefault();

  const contactData = getFormData();
  const isEditing = editingId !== null;

  if (isEditing) {
    contacts = contacts.map(function (contact) {
      return contact.id === editingId ? contactData : contact;
    });
  } else {
    contacts.push(contactData);
  }

  editingId = null;
  contactImage = "";
  form.reset();
  closeModal();
  showContacts();
  showMessage(isEditing ? "Contact updated!" : "Contact added!");
}

function removeContact(id) {
  contacts = contacts.filter(function (contact) { return contact.id !== id; });
  showContacts();
  showMessage("Deleted!");
}

function deleteContact(id) {
  if (window.Swal) {
    Swal.fire({
      title: "Are you sure?",
      text: "This contact will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f9004d"
    }).then(function (result) {
      if (result.isConfirmed) removeContact(id);
    });
  } else if (confirm("Are you sure you want to delete this contact?")) {
    removeContact(id);
  }
}

function choosePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    contactImage = reader.result;
    showPhoto();
  };
  reader.readAsDataURL(file);
}

getElement("addBtn").addEventListener("click", openAddModal);
getElement("closeBtn").addEventListener("click", closeModal);
getElement("cancelBtn").addEventListener("click", closeModal);
getElement("photo").addEventListener("change", choosePhoto);
searchInput.addEventListener("input", showContacts);
form.addEventListener("submit", saveForm);

modal.addEventListener("click", function (event) {
  if (event.target === modal) closeModal();
});

contactsContainer.addEventListener("click", function (event) {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");

  if (editButton) editContact(Number(editButton.dataset.edit));
  if (deleteButton) deleteContact(Number(deleteButton.dataset.delete));
});

showContacts();
