import { Outlet } from "react-router-dom";
import TopbarClient from "./Topbar-client";
import Sidebar from "./Sidebar-client";
import { PageHeaderProvider } from "./PageHeaderProvider";
import "./styles/MainArea-styles.css";

export default function MainArea() {
  return (
    <PageHeaderProvider>
      <div className="main-area">
        <TopbarClient />
        <div className="body-area">
          <div className="sidebar"><Sidebar /></div>
          <div className="content-area"><Outlet /></div>
        </div>
      </div>
    </PageHeaderProvider>
  );
}
