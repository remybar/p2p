import React from "react";
import { NavLink } from "react-router-dom";

function NavigationMenu(props) {
  return (
    <div>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item"><NavLink className="nav-link" to="/">Offers</NavLink></li>
        <li className="nav-item"><NavLink className="nav-link" to="/my-offers">My Offers</NavLink></li>
        {props.isAdmin && <li className="nav-item"><NavLink className="nav-link" to="/admin">Admin</NavLink></li>}
      </ul>
    </div>
  );
}

export default NavigationMenu;
