
import {Menu, x} from 'lucide-react';
import { useState } from "react";
export default function NavBar() {

 
  return (
  <div className="nav-bar">
    <div className="logo-bar">
    <button className="nav-bar-button" >
      <Menu className="nav-bar-icon" size={30} color="black" />
    </button>
    <h1 className="logo">Silverstar Insurance</h1>
    </div>
    <div className="side-bar">
      <a href="#" className="side-bar-item">Home</a>
      <a href="#" className="side-bar-item">Clients</a>
      <a href="#" className="side-bar-item">Due</a>
      <a href="#" className="side-bar-item">Policy</a>
      <a href="#" className="side-bar-item">App 5</a> 
    </div>
  </div>
  );
}