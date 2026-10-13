export default function Profile({ user, onSignOut }) {
  return (
    <section className="utility-screen">
      <div className="screen-title">
        <p className="section-kicker">YOUR ACCOUNT</p>
        <h1>Profile</h1>
        <p>Your safety details stored for this prototype.</p>
      </div>
      <article className="profile-card">
        <div className="profile-avatar" aria-hidden="true">{user?.name?.charAt(0)?.toUpperCase() ?? "R"}</div>
        <div className="profile-name">{user?.name}</div>
        <div className="profile-area">{user?.area}</div>
        <dl>
          <div><dt>Phone</dt><dd>{user?.phone}</dd></div>
          <div><dt>Preferred language</dt><dd>{user?.language}</dd></div>
          <div><dt>Resident ID</dt><dd>{user?.user_id}</dd></div>
        </dl>
        <p className="profile-note">Prototype only. Your information is stored locally by the demo backend.</p>
        <button className="button button-outline" type="button" aria-label="Change profile" onClick={onSignOut}>Change profile</button>
      </article>
    </section>
  );
}
