import React from "react";
import NavigationMenu from '../NavigationMenu';

function Navigation(props) {
  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark p-4">
      <div className="container">
        <NavigationMenu isAdmin={props.isAdmin} />
        {props.children}
      </div>
    </nav>
  );
}

export default Navigation;