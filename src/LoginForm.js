import "./login.css"
import "./images/Logo.png"
export default function LoginForm(){
    return(

    <div class="container">
        <div class="login-card">
          <div class="logo-panel">
            <img src={require('./images/Logo.png')} alt="silverstar_insurance_inc_Logo" />
          </div>
          <div class="right-panel">
            <h2>Log In to your account</h2>
            <form>
              <label>Email</label>
              <input type="email" placeholder="Enter your email" required />
              <label>Password</label>
              <input type="password" placeholder="Enter your password" required />
              <div class="password-button"></div>
              <button type="submit">Log In</button>
            </form>
          </div>
        </div>
    </div>
        ///test 
    );
}
