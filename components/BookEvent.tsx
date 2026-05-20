"use client";

import { useState } from "react";

const BookEvent = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    // Simulated API request
    setTimeout(() => {
      setSubmitted(true);
      setEmail("");
      setLoading(false);
    }, 500);
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p aria-live="polite">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>

            <input
              type="email"
              value={email}
              name="email"
              id="email"
              required
              autoComplete="email"
              className="input"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
            />
          </div>

          <button type="submit" className="button-submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
