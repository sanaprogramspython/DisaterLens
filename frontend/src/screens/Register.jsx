import { useState } from "react";
import { apiRequest } from "../api.js";

const LANGUAGES = ["English", "Hindi", "Telugu", "Urdu"];

export default function Register({ onRegistered }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    area: "Shaikpet, Hyderabad",
    language: "English",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const user = await apiRequest("/api/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onRegistered({ ...form, user_id: user.user_id });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="register-screen">
      <div className="register-intro">
        <span className="register-shield" aria-hidden="true">🛡</span>
        <p className="eyebrow">YOUR LOCAL SAFETY COMPANION</p>
        <h1>Stay ready.<br />Stay safe.</h1>
        <p>Set up your profile to receive area-specific safety updates.</p>
      </div>
      <form className="register-form" onSubmit={submit}>
        <label>
          Full name
          <input name="name" required maxLength={100} autoComplete="name" value={form.name} onChange={update} />
        </label>
        <label>
          Phone number
          <input name="phone" type="tel" required minLength={5} maxLength={30} autoComplete="tel" value={form.phone} onChange={update} />
        </label>
        <label>
          Area
          <input name="area" required maxLength={120} autoComplete="address-level2" value={form.area} onChange={update} />
        </label>
        <label>
          Preferred language
          <select name="language" value={form.language} onChange={update}>
            {LANGUAGES.map((language) => <option key={language}>{language}</option>)}
          </select>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary register-submit" type="submit" aria-label="Register and continue" disabled={submitting}>
          {submitting ? "Creating profile..." : "Get started"}
        </button>
      </form>
    </section>
  );
}
