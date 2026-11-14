// ABOUT PAGE

import { useState } from "react";
import { submitFeedback } from "../services/feedbackService";

export default function About({ user }) {
  const [form, setForm] = useState({
    category: "General Feedback",
    rating: "5",
    message: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!form.message.trim()) {
      setError("Please enter your feedback.");
      return;
    }

    if (form.message.trim().length < 10) {
      setError("Feedback must contain at least 10 characters.");
      return;
    }

    try {
      setSubmitting(true);

      await submitFeedback({
        userId: user.uid,
        name: user.displayName || "Anonymous",
        email: user.email || "",
        category: form.category,
        rating: Number(form.rating),
        message: form.message.trim()
      });

      setSuccess("Thank you! Your feedback has been submitted successfully.");

      setForm({
        category: "General Feedback",
        rating: "5",
        message: ""
      });

    } catch (err) {
      console.error("Feedback submission failed:", err);
      setError("Unable to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ABOUT HEADER */}
      <div className="text-center py-5">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-950 border border-red-800 mb-4">
          <span className="text-3xl text-red-400">🛡️</span>
        </div>

        <h1 className="text-2xl font-black text-white tracking-widest">
          ABOUT <span className="text-red-400">MESH SOS</span>
        </h1>

        <p className="text-xs text-zinc-500 mt-2">
          Decentralized Emergency Assistance System
        </p>
      </div>

      {/* PROBLEM STATEMENT */}
      <section className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
        <h2 className="text-sm font-bold text-red-400 tracking-widest mb-3">
          THE PROBLEM
        </h2>

        <p className="text-sm text-zinc-300 leading-7">
          During emergencies such as accidents, medical situations,
          or personal safety threats, people may be unable to contact
          emergency services or communicate their exact location.
          Delayed communication and lack of nearby assistance can
          increase the risk to the victim.
        </p>
      </section>

      {/* OUR SOLUTION */}
      <section className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
        <h2 className="text-sm font-bold text-cyan-400 tracking-widest mb-3">
          OUR SOLUTION
        </h2>

        <p className="text-sm text-zinc-300 leading-7">
          MESH SOS is an emergency assistance platform designed to
          help people communicate distress signals and share their
          location with nearby registered users who have enabled
          location sharing and Available to Help.
        </p>

        <p className="text-sm text-zinc-300 leading-7 mt-3">
          When an SOS is activated, the system identifies eligible
          nearby helpers and sends them emergency notifications
          containing the victim's location. Helpers can view the
          emergency and navigate towards the victim using Google Maps.
        </p>
      </section>

      {/* KEY FEATURES */}
      <section className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
        <h2 className="text-sm font-bold text-emerald-400 tracking-widest mb-4">
          KEY FEATURES
        </h2>

        <div className="space-y-4">

          {[
            ["🚨", "Emergency SOS", "Quickly activate an emergency alert and share your location."],
            ["📍", "Location Sharing", "Identify eligible nearby helpers using GPS location."],
            ["👥", "Nearby Assistance", "Notify registered users within the configured emergency radius."],
            ["🤕", "Fall Detection", "Detect possible falls using mobile motion sensors."],
            ["🎤", "Scream Detection", "Detect possible high-volume screams using microphone-based audio analysis."],
            ["🗺️", "Navigation", "Allow nearby helpers to navigate towards the victim."],
            ["📴", "Offline Support", "Store SOS events locally when offline and synchronize them when connectivity returns."]
          ].map(([icon, title, description]) => (
            <div key={title} className="flex gap-3">
              <span className="text-xl">{icon}</span>

              <div>
                <h3 className="text-sm font-bold text-zinc-200">
                  {title}
                </h3>

                <p className="text-xs text-zinc-500 leading-5 mt-1">
                  {description}
                </p>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
        <h2 className="text-sm font-bold text-amber-400 tracking-widest mb-3">
          TECHNOLOGY STACK
        </h2>

        <div className="flex flex-wrap gap-2">
          {[
            "React.js",
            "Tailwind CSS",
            "Firebase Authentication",
            "Cloud Firestore",
            "Cloud Functions",
            "GPS",
            "Device Motion Sensors",
            "Web Audio API",
            "Google Maps"
          ].map((tech) => (
            <span
              key={tech}
              className="px-3 py-2 rounded-lg text-xs text-cyan-300 bg-zinc-800 border border-zinc-700"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* FEEDBACK FORM */}
      <section className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800">

        <h2 className="text-sm font-bold text-red-400 tracking-widest mb-2">
          SHARE YOUR FEEDBACK
        </h2>

        <p className="text-xs text-zinc-500 mb-5">
          Your suggestions help us improve MESH SOS.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-xs text-zinc-400 mb-2">
              Feedback Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white outline-none focus:border-cyan-500"
            >
              <option>General Feedback</option>
              <option>Bug Report</option>
              <option>Feature Request</option>
              <option>UI/UX Improvement</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2">
              Rate Your Experience
            </label>

            <select
              name="rating"
              value={form.rating}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white outline-none focus:border-cyan-500"
            >
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Poor</option>
              <option value="1">⭐ Very Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2">
              Your Feedback
            </label>

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="5"
              maxLength={1000}
              placeholder="Share your suggestions or report an issue..."
              className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-white outline-none resize-none focus:border-cyan-500"
            />

            <p className="text-right text-[10px] text-zinc-600 mt-1">
              {form.message.length}/1000
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          {success && (
            <p className="text-xs text-emerald-400">{success}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold transition"
          >
            {submitting ? "SUBMITTING..." : "SUBMIT FEEDBACK"}
          </button>

        </form>
      </section>

      <p className="text-center text-[10px] text-zinc-600 pb-3">
        MESH SOS · Designed for safer communities
      </p>

    </div>
  );
}