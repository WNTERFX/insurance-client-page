import React from "react";
import "./MainArea.css";
import NavBar from "./NavBar";
import Policy from "./Policy";
import "./Policy-styles.css"
import Dashboard from "./Dashboard";
import "./dashboard-styles.css"
import Client from "./Client";
import "./Client-styles.css"
import Due from "./Due";
import "./Due-styles.css"

export default function MainArea() 
{

    return (
        <div className="main-area">
            <div className="nav-area">
                <NavBar />
            </div>
            <div className="content-area"> 
                <Client/>
            </div>
        </div>
    );
}

