import { useDeclarePageHeader } from "./PageHeaderProvider";
import "./styles/about.css";

export default function About() {
  // Declare the page header (this shows up in TopbarClient)
  useDeclarePageHeader(
    "About",
    "Built for security, compliance, and customer care"
  );

  return (
    <div className="dashboard-containerAbout">
      {/* Content Area */}
      <div className="about-content">
        <div className="about-card">
          <h2 className="about-heading">About Silverstar Insurance Agency Inc.</h2>
          <p className="about-description">
            This system streamlines Silverstar Insurance Agency Inc.'s operations by digitizing client and
            policy management, automating premium computations, enabling online payments, and providing a
            client portal for policy details and claims. It also sends automated email and SMS reminders to
            ensure timely payments and renewals.
          </p>
        </div>

        <footer className="about-footer">
          <p>Software Information</p>
          <p>Version: 1.0.0</p>
          <p>Developed by: Silverstar Insurance Inc.</p>
          <p>© Silverstar Insurance Inc.. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}