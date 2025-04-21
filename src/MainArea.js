import React from "react";
import "./styles/main_area-styles.css";
import NavBar from "./NavBar";
import Policy from "./Policy";
import "./styles/policy-styles.css"
import Dashboard from "./Dashboard";
import "./styles/dashboard-styles.css"
import Client from "./Client";
import "./styles/client-styles.css"
import Due from "./Due";
import "./styles/due-styles.css"

export default function MainArea() 
{

    return (
        <div className="main-area">
            <div className="nav-area">
                <NavBar />
            </div>
            <div className="content-area"> 
                <Dashboard />
            </div>
        </div>
    );
}

