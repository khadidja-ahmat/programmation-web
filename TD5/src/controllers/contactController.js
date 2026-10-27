import Contact from '../models/contactModel.js';

// Get all contacts
export async function getAllContacts() {
    let total = await Contact.countDocuments({});
    let limit = parseInt(total);

    try {
        const contacts = await Contact.find().limit(limit);
        return {
            success: true,
            data: contacts,
            total: total.toString(),
        }
    } catch (err) {
        return { success: false, message: "Contacts not found " + err };
    }
}

// Get contact by Id
export async function getContactById(id) {
    try {
        const contact = await Contact.findById(id);
        if (!contact) {
            return { success: false, message: "Contact not found" };
        }
        return { success: true, data: contact };
    } catch (err) {
        return { success: false, message: "Contact not found " + err };
    }
}

// Add a new contact, returns the added contact
export async function addContact(body) {
    try {
        const contact = await Contact.create({ name: body.name, age: body.age });
        return { success: true, data: contact };
    } catch (err) {
        return { success: false, message: "Contact not added " + err };
    }
}

// Update an existing contact
export async function updateContact(id, name = null, age = null) {
    try {
        // On ne met à jour que les champs réellement fournis
        const changes = {};
        if (name !== null) changes.name = name;
        if (age !== null) changes.age = age;

        const contact = await Contact.findByIdAndUpdate(id, changes, { new: true });
        if (!contact) {
            return { success: false, message: "Contact not found" };
        }
        return { success: true, data: contact };
    } catch (err) {
        return { success: false, message: "Contact not updated " + err };
    }
}

// Remove an existing contact
export async function removeContact(id) {
    try {
        const contact = await Contact.findByIdAndDelete(id);
        if (!contact) {
            return { success: false, message: "Contact not found" };
        }
        return { success: true, data: contact };
    } catch (err) {
        return { success: false, message: "Contact not removed " + err };
    }
}
