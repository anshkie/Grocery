import React, { useEffect, useState } from "react";
const id = localStorage.getItem("customerId");
const API_URL = `https://grocery-k9j1.onrender.com/customer/profile/${id}`; // Adjust as needed

export default function Profile() {
    const [profile, setProfile] = useState({
        CustomerID: "",
        CustomerName: "",
        ContactEmail: "",
        ContactPhone: "",
        Address: "",
    });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setProfile(data.customer);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await fetch(API_URL, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });
            if (res.ok) {
                setMessage("Profile updated successfully!");
                setEditing(false);
            } else {
                setMessage("Failed to update profile.");
            }
        } catch {
            setMessage("Error updating profile.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-blue-700 flex items-center gap-2">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Profile
            </h2>
            {message && (
                <div className="mb-4 text-center text-sm text-green-600">{message}</div>
            )}
            <form onSubmit={handleUpdate} className="space-y-5">
                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Customer ID</label>
                    <input
                        type="text"
                        name="CustomerID"
                        value={profile.CustomerID}
                        disabled
                        className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Name</label>
                    <input
                        type="text"
                        name="CustomerName"
                        value={profile.CustomerName}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`w-full px-3 py-2 border rounded ${editing ? "bg-white" : "bg-gray-100 cursor-not-allowed"}`}
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Email</label>
                    <input
                        type="email"
                        name="ContactEmail"
                        value={profile.ContactEmail}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`w-full px-3 py-2 border rounded ${editing ? "bg-white" : "bg-gray-100 cursor-not-allowed"}`}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Phone</label>
                    <input
                        type="text"
                        name="ContactPhone"
                        value={profile.ContactPhone}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`w-full px-3 py-2 border rounded ${editing ? "bg-white" : "bg-gray-100 cursor-not-allowed"}`}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-semibold mb-1">Address</label>
                    <textarea
                        name="Address"
                        value={profile.Address}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`w-full px-3 py-2 border rounded ${editing ? "bg-white" : "bg-gray-100 cursor-not-allowed"}`}
                        rows={3}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    {editing ? (
                        <>
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={() => {
                                    setEditing(false);
                                    setMessage("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => setEditing(true)}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}