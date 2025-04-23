import "./styles/nav-styles.css"
import {Menu} from 'lucide-react';
import { Link } from 'react-router-dom';

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
      
      <Link to="/appinsurance/MainArea/Dashboard" className="side-bar-item">Home</Link>
      <Link to="/appinsurance/MainArea/Client" className="side-bar-item">Clients</Link>
      <Link to="/appinsurance/MainArea/Due" className="side-bar-item">Due</Link>
      <Link to="/appinsurance/MainArea/Policy" className="side-bar-item">Policy</Link>
      <Link to="#" className="side-bar-item">Monthly Data</Link> 
      <Link to="#" className="side-bar-item">Login</Link>
       
    </div>
  </div>
  );
}