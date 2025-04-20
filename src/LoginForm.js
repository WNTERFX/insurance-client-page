import "./login.css"
import "./images/logo.png"
<<<<<<< HEAD
=======
import { useNavigate } from "react-router-dom";

>>>>>>> main
export default function LoginForm(){
    return(
    <div class="container">
        <div class="login-card">
<<<<<<< HEAD
          <div class="left-panel">
            <img src={require('./images/logo.png')} alt="Silverstar Insurance Agency Inc." />
            <p>Silverstar Insurance Agency Inc.</p>
=======
          <div class="logo-panel">
            <img src={require('./images/logo.png')} alt="silverstar_insurance_inc_Logo" />
>>>>>>> main
          </div>
          <div class="right-panel">
            <h2>Log In to your account</h2>
            <form>
              <label>Email</label>
              <input type="email" placeholder="Enter your email" required />
              <label>Password</label>
              <input type="password" placeholder="Enter your password" required />
    
              <button type="submit">Log In</button>
            </form>
          </div>
        </div>
    </div>
        ///test 
    );
}
