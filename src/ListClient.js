import { useNavigate } from "react-router-dom";
import './styles/ListClient.css';

export default function ListClient() {
    const navigates = useNavigate();
    return (
        <div className="client-list-container">
        <h2>List Client</h2>
  
        <div className="client-list-box">
          <div className="edit-button-wrapper">
            <button className="edit-button" onClick={() => navigates("/appinsurance/MainArea/Policy/NewClient/VehicleDetails/ListClient/EditClientForm")}>Edit</button>
          </div>
  
          <ul className="client-list">
            <li>Client Name</li>
            <li>Client Name</li>
            <li>Client Name</li>
          </ul>
        </div>
      </div>
    );
}