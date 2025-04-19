import React from "react";
import "./MainArea.css";
import NavBar from "./NavBar";
import Dashboard from "./Dashboard";
import "./dashboard-styles.css"

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

