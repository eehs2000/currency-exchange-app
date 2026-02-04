import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Header.scss";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <img src="/logo.png" alt="Exchange app" className="header-logo-img" />
          <span className="header-logo-text">Exchange app</span>
        </div>
      </div>
      <nav className="header-nav">
        <div className="header-nav-links">
          <NavLink
            to="/exchange"
            className={({ isActive }) =>
              `header-nav-link ${isActive ? "active" : ""}`
            }
          >
            환전 하기
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `header-nav-link ${isActive ? "active" : ""}`
            }
          >
            환전 내역
          </NavLink>
        </div>
        <button className="header-logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </nav>
    </header>
  );
};

export default Header;
