const { ContactBook } = require("../../models/contactBooks.model");
const { User } = require('../../models/user.model');

// Escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Fetch contacts based on search string and CreatedBy
async function getContacts(searchObj) {
  try {
    const escapedSearch = escapeRegExp(searchObj.search || '');
    const searchRegex = new RegExp(escapedSearch, 'i');

    const query = {
      CreatedBy: searchObj.CreatedBy,
      IsDeleted: { $ne: true },
      $or: [
        { Name: { $regex: searchRegex } },
        { Email: { $regex: searchRegex } }
      ]
    };

    const contacts = await ContactBook.find(query).lean();
    return contacts;
  } catch (err) {
    console.error('Error while fetching contacts:', err);
    throw err;
  }
}

// GET /api/contacts/:search
async function getSigners(req, res) {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const searchObj = {
      search: req.params.search || '',
      CreatedBy: req.user._id
    };

    const result = await getContacts(searchObj);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in getSigners:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// POST /api/contacts
async function addContact(req, res) {
  try {
    const { Name, Email, Phone } = req.body;

    if (!Name || !Email) {
      return res.status(400).json({ error: 'Name and Email are required' });
    }

    const newContact = new ContactBook({
      Name,
      Email,
      Phone,
      CreatedBy: req.user._id,
      IsDeleted: false
    });


    const user = await User.findOne({ email: Email });
    if (user) {
      newContact.UserId = user._id;
    } else {
      const newUser = await User.create({ email: Email, name: Name, defaultCurrency: 'INR' });

      newContact.UserId = newUser._id;
    }

    const savedContact = await newContact.save();

    return res.status(201).json(savedContact);
  } catch (err) {
    console.error('Error in addContact:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

const getContactDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await ContactBook.findById(id);

    return res.status(201).json(record);
  } catch (err) {
    console.error('Error in addContact:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

const updateUserRole = async (req, res) => {
  try {
    const { role, id } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const updatedContact = await ContactBook.findByIdAndUpdate(
      id,
      { UserRole: role },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    return res.status(200).json(updatedContact);
  } catch (err) {
    console.error("Error in updateUserRole:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getSigners,
  addContact,
  getContactDetails,
  updateUserRole,
};
