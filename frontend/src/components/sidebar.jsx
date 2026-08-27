function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="logo">
        LAND-SAFE
      </div>

      <nav className="navigation">

        <a href="/">Dashboard</a>

        <a href="/projects">Projects</a>

        <a href="/analytics">Analytics</a>

        <a href="/map">GIS Map</a>

        <a href="/alerts">Alerts</a>

      </nav>

    </aside>
  );
}

export default Sidebar;