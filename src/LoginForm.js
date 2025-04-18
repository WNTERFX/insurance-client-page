import "./login.css"
export default function LoginForm(){
    return(

    <div class="container">
        <div class="login-card">
          <div class="left-panel">
            <img src="logo.png" alt="Silverstar Insurance Agency Inc." />
            <p>Silverstar Insurance Agency Inc.</p>
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

    );
}
