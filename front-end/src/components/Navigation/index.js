import React from "react";
import NavigationMenu from '../NavigationMenu';

function Navigation(props) {
  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark">
      <div className="container">
        <NavigationMenu isAdmin={props.isAdmin} />
        {props.children}
      </div>
    </nav>
  );
}

export default Navigation;