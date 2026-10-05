// import ContactCard from "../components/ContactCard"
// import Icon from "../components/Icon"
// import ICONS from "../data/constants"
// import { useState, useEffect } from "react";

// import { getContacts, addContact, deleteContact } from "../services/contactService";

// export default function Contacts({ contacts, sosActive }) {

//   const [contacts, setContacts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     relation: "",
//     phone: "",
//     email: "",
//   });

//   const [error, setError] = useState("");

//   // Load contacts for the current user
//   useEffect(() => {
//     const loadContacts = async () => {
//       if (!user) return; // Ensure user is available
//       try {
//         setLoading(true);
//         const userContacts = await getContacts(user.uid);
//         setContacts(userContacts);
//       } catch (error) {
//         console.error("Error loading contacts:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadContacts();
//   }, [user]);

//   // Handle form input changes
//   const handleInputChange = (e) => {

//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   }

//   // Add a new contact
//   const handleAddContact = async (e) => {
//     e.preventDefault();
//     if (!formData.name || !formData.phone) {
//       setError("Name and phone number are required.");
//       return;
//     }
//     try {
//       setError("");
//       const newContactId = await addContact(user.uid, formData);
//       setContacts([...contacts, { id: newContactId, ...formData }]);
//       setFormData({ name: "", relation: "", phone: "", email: "" });
//       setShowForm(false);
//     } catch (error) {
//       console.error("Error adding contact:", error);
//       setError("Failed to add contact. Please try again.");
//     }
//   };

//   // Delete a contact
//   const handleDeleteContact = async (contactId) => {
//     try {
//       await deleteContact(user.uid, contactId);
//       setContacts(contacts.filter((contact) => contact.id !== contactId));
//     } catch (error) {
//       console.error("Error deleting contact:", error);
//       setError("Failed to delete contact. Please try again.");
//     }
//   };

//   if (loading) {
//     return <div className="text-center text-zinc-500">Loading contacts...</div>;
//   }

//     return (
//         <>
//             <div className="flex items-center justify-between">
//               <p className="text-[10px] text-zinc-600 tracking-widest uppercase">Emergency Contacts</p>
//               <button className="flex items-center gap-1 text-xs text-cyan-400 border border-cyan-900/50 px-2 py-1 rounded-lg hover:bg-cyan-950/30">
//                 <Icon path={ICONS.plus} size={12} /> Add
//               </button>
//             </div>
//             <div className="space-y-2">
//               <ContactCard name="Contact 1" relation="Friend" phone="+91 98450 XXXXX" notified={sosActive} />
//               <ContactCard name="Contact 2" relation="Guardian" phone="+91 98440 XXXXX" notified={false} />
//               <ContactCard name="Emergency SOS" relation="Campus Security" phone="080-2323-XXXX" notified={sosActive} />
//             </div>

//             <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
//               <p className="text-[10px] text-zinc-600 mb-3 tracking-widest uppercase">Escalation Flow</p>
//               <div className="space-y-2 text-xs">
//                 {["SOS triggered on device", "BLE broadcast to mesh peers", "Relay via internet-connected peer", "SMS + Push to emergency contacts", "Dashboard notification logged"].map((step, i) => (
//                   <div key={i} className="flex items-center gap-3">
//                     <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 shrink-0">{i+1}</span>
//                     <span className="text-zinc-400">{step}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </>
//     );
// }


import ContactCard from "../components/ContactCard";
import Icon from "../components/Icon";
import ICONS from "../data/constants";

import { useState, useEffect } from "react";

import {
  getContacts,
  addContact,
  deleteContact
} from "../services/contactService";

export default function Contacts({ user, sosActive }) {

  // Firebase contacts
  const [contacts, setContacts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    phone: "",
    email: "",
  });

  const [error, setError] = useState("");


  // ================================
  // LOAD CONTACTS FROM FIRESTORE
  // ================================

  useEffect(() => {

    const loadContacts = async () => {

      if (!user) {
        setLoading(false);
        return;
      }

      try {

        setLoading(true);

        const userContacts = await getContacts(user.uid);

        setContacts(userContacts);

      } catch (error) {

        console.error("Error loading contacts:", error);

        setError("Failed to load contacts.");

      } finally {

        setLoading(false);

      }
    };

    loadContacts();

  }, [user]);


  // ================================
  // FORM INPUT
  // ================================

  const handleInputChange = (e) => {
  let value = e.target.value;

  if (e.target.name === "phone") {
    // Remove everything except digits
    let digits = value.replace(/\D/g, "");

    // Remove 91 if user enters it
    if (digits.startsWith("91")) {
      digits = digits.substring(2);
    }

    // Only allow 10 digits
    digits = digits.slice(0, 10);

    // Format as +91XXXXXXXXXX
    value = digits ? `+91${digits}` : "";
  }

  setFormData({
    ...formData,
    [e.target.name]: value,
  });
};


  // ================================
  // ADD CONTACT
  // ================================

  const handleAddContact = async (e) => {

    e.preventDefault();

    if (!formData.name || !formData.phone) {

      setError("Name and phone number are required.");

      return;
    }

    const phoneRegex = /^\+91[6-9]\d{9}$/;

    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid Indian phone number.");
      return;
    }

    if (!user) return;

    try {

      setError("");

      const newContactId = await addContact(
        user.uid,
        formData
      );

      const newContact = {
        id: newContactId,
        userId: user.uid,
        ...formData
      };

      setContacts([
        ...contacts,
        newContact
      ]);

      setFormData({
        name: "",
        relation: "",
        phone: "",
        email: ""
      });

      setShowForm(false);

    } catch (error) {

      console.error("Error adding contact:", error);

      setError(
        "Failed to add contact. Please try again."
      );

    }

  };


  // ================================
  // DELETE CONTACT
  // ================================

  const handleDeleteContact = async (contactId) => {

    try {

      await deleteContact(contactId);

      setContacts(
        contacts.filter(
          (contact) => contact.id !== contactId
        )
      );

    } catch (error) {

      console.error(
        "Error deleting contact:",
        error
      );

      setError(
        "Failed to delete contact. Please try again."
      );

    }

  };


  // ================================
  // LOADING
  // ================================

  if (loading) {

    return (
      <div className="text-center text-zinc-500">
        Loading contacts...
      </div>
    );

  }


  // ================================
  // UI
  // ================================

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between">

        <p className="text-[10px] text-zinc-600 tracking-widest uppercase">
          Emergency Contacts
        </p>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-cyan-400 border border-cyan-900/50 px-2 py-1 rounded-lg hover:bg-cyan-950/30"
        >

          <Icon
            path={ICONS.plus}
            size={12}
          />

          {showForm ? "Cancel" : "Add"}

        </button>

      </div>


      {/* ERROR MESSAGE */}

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}


      {/* ADD CONTACT FORM */}

      {showForm && (

        <form
          onSubmit={handleAddContact}
          className="mt-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2"
        >

          <input
            type="text"
            name="name"
            placeholder="Contact name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-cyan-800"
          />

          <input
            type="text"
            name="relation"
            placeholder="Relation"
            value={formData.relation}
            onChange={handleInputChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-cyan-800"
          />

          <input
            type="tel"
            name="phone"
            placeholder="+91 XXXXX XXXXX"
            value={formData.phone}
            onChange={handleInputChange}
            maxLength={15}
            pattern="^\+?[0-9]{10,15}$"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-cyan-800"
          />

          <input
            type="email"
            name="email"
            placeholder="Email (optional)"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-cyan-800"
          />

          <button
            type="submit"
            className="w-full bg-cyan-950/40 border border-cyan-900/60 text-cyan-400 rounded-lg py-2 text-xs hover:bg-cyan-900/40"
          >
            Save Contact
          </button>

        </form>

      )}


      {/* CONTACT LIST */}

      <div className="space-y-2 mt-3">

        {contacts.length === 0 ? (

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">

            <p className="text-xs text-zinc-500">
              No emergency contacts added yet.
            </p>

          </div>

        ) : (

          contacts.map((contact) => (

            <div
              key={contact.id}
              className="relative"
            >

              <ContactCard
                name={contact.name}
                relation={contact.relation}
                phone={contact.phone}
                email={contact.email}
                notified={sosActive}
              />

              {/* DELETE BUTTON */}

              <button
                onClick={() =>
                  handleDeleteContact(contact.id)
                }
                className="absolute right-2 top-2 text-[10px] text-red-400 hover:text-red-300"
              >
                Delete
              </button>

            </div>

          ))

        )}

      </div>


      {/* ESCALATION FLOW */}

      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 mt-3">

        <p className="text-[10px] text-zinc-600 mb-3 tracking-widest uppercase">
          Escalation Flow
        </p>

        <div className="space-y-2 text-xs">

          {[
            "SOS triggered on device",
            "Emergency network propagation",
            "Relay via internet-connected peer",
            "SMS + Push to emergency contacts",
            "Dashboard notification logged"
          ].map((step, i) => (

            <div
              key={i}
              className="flex items-center gap-3"
            >

              <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 shrink-0">
                {i + 1}
              </span>

              <span className="text-zinc-400">
                {step}
              </span>

            </div>

          ))}

        </div>

      </div>

    </>
  );
}
