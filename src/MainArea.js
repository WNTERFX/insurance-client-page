import { Outlet } from 'react-router-dom';
import Topbar_client from './Topbar-client';
import Sidebar from './Sidebar-client';
import "./styles/MainArea-styles.css"
export default function MainArea() 
{
    return(
       <div className="main-area">
    {/*  <Topbar_client />*/}
      <div className="body-area">
        <Sidebar />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
         

    );

}