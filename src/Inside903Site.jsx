import React, { useMemo, useState } from 'react';
import './Inside903Site.css';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'forum', label: 'Forum' },
  { id: 'schools', label: 'Historic Schools' },
  { id: 'media', label: 'Media' },
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'about', label: 'About' }
];

const forumCategories = [
  {
    title: 'Friday Night Lights',
    threads: 128,
    posts: '4.2k',
    description: 'Game week chatter, predictions, and instant recaps.'
  },
  {
    title: 'Recruiting Radar',
    threads: 64,
    posts: '1.1k',
    description: 'Commitments, offers, and under-the-radar prospects.'
  },
  {
    title: 'Rivalry Central',
    threads: 92,
    posts: '2.8k',
    description: 'Rivalry week history and heated but respectful debate.'
  },
  {
    title: 'Coaches Corner',
    threads: 47,
    posts: '980',
    description: 'Schemes, adjustments, and film-room breakdowns.'
  }
];

const forumFeatures = [
  'Categories + sub-boards by sport, district, and rivalry',
  'Upvotes, downvotes, and best-answer highlights',
  'Direct messages and verified coach accounts',
  'Mod tools: reports, bans, keyword filters, slow-mode',
  'Live game threads with auto-refresh',
  'Pinned breaking-news alerts',
  'User badges, rep levels, and role tags',
  'Media embeds (highlights, photos, podcasts)'
];

const historicSchools = [
  {
    name: 'Pine Ridge High',
    mascot: 'Panthers',
    location: 'Tyler, TX',
    founded: 1968,
    colors: 'Black / Red / White',
    titles: '3 state titles',
    bestYears: '1998, 2005, 2012',
    coaches: 'Coach Everett (1989-2003)',
    notableAlumni: 'J. Carter (NFL), M. Lane (TCU)',
    record: '812-312-18',
    photo: 'Classic field house + new turf upgrade.'
  },
  {
    name: 'East Valley HS',
    mascot: 'Eagles',
    location: 'Longview, TX',
    founded: 1954,
    colors: 'Navy / Gold',
    titles: '1 state title',
    bestYears: '1976, 1991, 2021',
    coaches: 'Coach Alvarez (2009-2022)',
    notableAlumni: 'D. Woods (Baylor), C. Price (SMU)',
    record: '694-401-12',
    photo: 'Renovated stadium with 7,500 seats.'
  },
  {
    name: 'Cedar Grove HS',
    mascot: 'Timberwolves',
    location: 'Lufkin, TX',
    founded: 1979,
    colors: 'Forest / Silver',
    titles: '2 regional titles',
    bestYears: '1984, 1999, 2016',
    coaches: 'Coach Sanders (1997-2010)',
    notableAlumni: 'R. Collins (UT), G. Bryant (LSU)',
    record: '521-309-9',
    photo: 'Historic press box with modern suites.'
  }
];

const highlightStories = [
  {
    title: 'Game of the Week: Ridge vs. Valley',
    tag: 'Instant Classic',
    excerpt: 'A double-overtime thriller ends with a last-second pick-six.'
  },
  {
    title: 'Top 10 Athletes to Watch',
    tag: 'Scouting',
    excerpt: 'Our weekly hotlist across football, baseball, and hoops.'
  },
  {
    title: 'Coaches Clinic Recap',
    tag: 'Strategy',
    excerpt: 'The 3 defensive adjustments that flipped the playoffs.'
  }
];

const sponsorPackages = [
  {
    title: 'Kickoff Partner',
    price: '$499/mo',
    features: ['Hero banner slot', 'Newsletter shoutout', 'Podcast read']
  },
  {
    title: 'Rivalry Partner',
    price: '$899/mo',
    features: ['Forum takeover day', 'Highlight reel spot', 'Event co-branding']
  },
  {
    title: 'Championship Partner',
    price: '$1,499/mo',
    features: ['Homepage masthead', 'VIP live stream', 'Custom content series']
  }
];

const statsBar = [
  { label: 'Members', value: '12,400' },
  { label: 'Weekly Posts', value: '8,900' },
  { label: 'Teams Covered', value: '148' },
  { label: 'Podcasts', value: '3' }
];

const Inside903Site = () => {
  const [page, setPage] = useState('home');

  const pageTitle = useMemo(() => {
    const item = navItems.find((nav) => nav.id === page);
    return item ? item.label : 'Home';
  }, [page]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="brand">
          <div className="logo-badge">
            <span className="logo-top">Inside the</span>
            <span className="logo-main">903</span>
            <span className="logo-sub">ETX Sports Network</span>
          </div>
          <div className="brand-text">
            <p className="brand-title">Inside the 903</p>
            <p className="brand-tagline">East Texas high school sports, live and uncensored.</p>
          </div>
        </div>
        <nav className="site-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-pill ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button className="ghost-button">Log in</button>
          <button className="primary-button">Join the Huddle</button>
        </div>
      </header>

      <main>
        <section className="hero" aria-label="Inside the 903 hero">
          <div className="hero-content">
            <span className="hero-kicker">{pageTitle}</span>
            <h1>ETX sports, built for real fans and real talk.</h1>
            <p>
              A modern sports community with live forums, historic school pages, and media
              coverage that puts the spotlight on East Texas athletes.
            </p>
            <div className="hero-actions">
              <button className="primary-button">Start a thread</button>
              <button className="ghost-button">Explore schools</button>
            </div>
            <div className="stat-bar">
              {statsBar.map((stat) => (
                <div key={stat.label} className="stat-card">
                  <p className="stat-value">{stat.value}</p>
                  <p className="stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-panel">
            <div className="hero-panel-top">
              <p className="panel-title">Live Boards</p>
              <p className="panel-sub">Fast, organized, and always open.</p>
            </div>
            <div className="panel-list">
              {forumCategories.map((cat, index) => (
                <div key={cat.title} className="panel-item" style={{ animationDelay: `${index * 80}ms` }}>
                  <div>
                    <p className="panel-item-title">{cat.title}</p>
                    <p className="panel-item-text">{cat.description}</p>
                  </div>
                  <div className="panel-item-meta">
                    <span>{cat.threads} threads</span>
                    <span>{cat.posts} posts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {page === 'home' && (
          <>
            <section className="section">
              <div className="section-header">
                <h2>Forums built for athletes, coaches, and die-hard fans</h2>
                <p>Fast loading, organized by sport, and designed for high-energy game day talk.</p>
              </div>
              <div className="feature-grid">
                {forumFeatures.map((feature, index) => (
                  <div key={feature} className="feature-card" style={{ animationDelay: `${index * 60}ms` }}>
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="section alt">
              <div className="section-header">
                <h2>Historic schools, built like a digital trophy case</h2>
                <p>Every school page includes history, legacy stats, coaches, and championship runs.</p>
              </div>
              <div className="school-grid">
                {historicSchools.map((school) => (
                  <article key={school.name} className="school-card">
                    <div className="school-card-top">
                      <div>
                        <p className="school-name">{school.name}</p>
                        <p className="school-meta">{school.location} • {school.mascot}</p>
                      </div>
                      <span className="school-badge">{school.titles}</span>
                    </div>
                    <div className="school-details">
                      <p><strong>Founded:</strong> {school.founded}</p>
                      <p><strong>Colors:</strong> {school.colors}</p>
                      <p><strong>Best Years:</strong> {school.bestYears}</p>
                      <p><strong>Notable Coaches:</strong> {school.coaches}</p>
                      <p><strong>Notable Alumni:</strong> {school.notableAlumni}</p>
                      <p><strong>Program Record:</strong> {school.record}</p>
                    </div>
                    <div className="school-photo">{school.photo}</div>
                  </article>
                ))}
              </div>
            </section>

            <section className="section">
              <div className="section-header">
                <h2>Media that moves fast</h2>
                <p>Podcasts, highlight reels, and weekly scouting intel with a clean broadcast look.</p>
              </div>
              <div className="story-grid">
                {highlightStories.map((story) => (
                  <div key={story.title} className="story-card">
                    <span className="story-tag">{story.tag}</span>
                    <h3>{story.title}</h3>
                    <p>{story.excerpt}</p>
                    <button className="ghost-button">Read more</button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {page === 'forum' && (
          <section className="section forum-layout">
            <div>
              <div className="section-header">
                <h2>Forum Index</h2>
                <p>Choose a board, jump into live threads, and keep the convo moving.</p>
              </div>
              <div className="forum-board">
                {forumCategories.map((cat) => (
                  <div key={cat.title} className="forum-row">
                    <div>
                      <p className="forum-title">{cat.title}</p>
                      <p className="forum-desc">{cat.description}</p>
                    </div>
                    <div className="forum-meta">
                      <span>{cat.threads} threads</span>
                      <span>{cat.posts} posts</span>
                      <button className="ghost-button">Enter</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <aside className="forum-sidebar">
              <div className="sidebar-card">
                <h3>Must-have features</h3>
                <ul>
                  {forumFeatures.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="sidebar-card">
                <h3>Moderation stack</h3>
                <p>
                  Flagging, keyword filters, vote-based sorting, and a three-tier moderator system.
                </p>
                <button className="primary-button">Apply to moderate</button>
              </div>
            </aside>
          </section>
        )}

        {page === 'schools' && (
          <section className="section">
            <div className="section-header">
              <h2>Historic Schools Directory</h2>
              <p>Explore program timelines, championship history, and legendary coaches.</p>
            </div>
            <div className="filters">
              <input type="text" placeholder="Search schools" />
              <select>
                <option>All Sports</option>
                <option>Football</option>
                <option>Baseball</option>
                <option>Basketball</option>
              </select>
              <select>
                <option>All Districts</option>
                <option>District 7-5A</option>
                <option>District 8-4A</option>
                <option>Private</option>
              </select>
              <button className="ghost-button">Apply</button>
            </div>
            <div className="school-grid">
              {historicSchools.map((school) => (
                <article key={school.name} className="school-card">
                  <div className="school-card-top">
                    <div>
                      <p className="school-name">{school.name}</p>
                      <p className="school-meta">{school.location} • {school.mascot}</p>
                    </div>
                    <span className="school-badge">{school.titles}</span>
                  </div>
                  <div className="school-details">
                    <p><strong>Founded:</strong> {school.founded}</p>
                    <p><strong>Colors:</strong> {school.colors}</p>
                    <p><strong>Best Years:</strong> {school.bestYears}</p>
                    <p><strong>Notable Coaches:</strong> {school.coaches}</p>
                    <p><strong>Notable Alumni:</strong> {school.notableAlumni}</p>
                    <p><strong>Program Record:</strong> {school.record}</p>
                  </div>
                  <div className="school-photo">{school.photo}</div>
                  <button className="ghost-button full">View full timeline</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {page === 'media' && (
          <section className="section">
            <div className="section-header">
              <h2>Media Hub</h2>
              <p>Live shows, highlight packages, and weekly scouting breakdowns.</p>
            </div>
            <div className="media-grid">
              <div className="media-card">
                <h3>Inside the 903 Live</h3>
                <p>Weekly live show with coaches, players, and callers.</p>
                <button className="primary-button">Watch live</button>
              </div>
              <div className="media-card">
                <h3>Film Room</h3>
                <p>Breakdowns of big plays, schemes, and championship runs.</p>
                <button className="ghost-button">Browse breakdowns</button>
              </div>
              <div className="media-card">
                <h3>Recruiting Spotlight</h3>
                <p>Profiles, interviews, and commitment trackers.</p>
                <button className="ghost-button">View spotlights</button>
              </div>
            </div>
          </section>
        )}

        {page === 'sponsors' && (
          <section className="section alt">
            <div className="section-header">
              <h2>Advertising & Sponsorships</h2>
              <p>Premium placements built for local partners and regional brands.</p>
            </div>
            <div className="sponsor-grid">
              {sponsorPackages.map((pkg) => (
                <div key={pkg.title} className="sponsor-card">
                  <h3>{pkg.title}</h3>
                  <p className="sponsor-price">{pkg.price}</p>
                  <ul>
                    {pkg.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <button className="primary-button">Get started</button>
                </div>
              ))}
            </div>
            <div className="ad-slots">
              <div className="ad-slot">Leaderboard 970x90</div>
              <div className="ad-slot">Sidebar 300x250</div>
              <div className="ad-slot">In-Feed 728x90</div>
            </div>
          </section>
        )}

        {page === 'about' && (
          <section className="section">
            <div className="section-header">
              <h2>About Inside the 903</h2>
              <p>Independent coverage with a community-first culture.</p>
            </div>
            <div className="about-grid">
              <div className="about-card">
                <h3>Our mission</h3>
                <p>Give East Texas schools a professional spotlight and a home for fair, open debate.</p>
              </div>
              <div className="about-card">
                <h3>Community standards</h3>
                <p>Respect the athletes. No personal attacks. Critique play, not people.</p>
              </div>
              <div className="about-card">
                <h3>Contact</h3>
                <p>partner@insidethe903.com • press@insidethe903.com</p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div>
          <p className="footer-title">Inside the 903</p>
          <p>ETX High School Sports Network</p>
        </div>
        <div className="footer-links">
          <button className="ghost-button">Terms</button>
          <button className="ghost-button">Privacy</button>
          <button className="ghost-button">Advertise</button>
        </div>
      </footer>
    </div>
  );
};

export default Inside903Site;
