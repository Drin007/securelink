import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">🛡️ SafeWeb<span>Scanner</span></span>
          <p className="footer__tagline">Protecting the web, one link at a time.</p>
        </div>

        <div className="footer__contact">
          <span className="footer__contact-label">Get in touch</span>
          <a href="mailto:tusharmehra0255@gmail.com" className="footer__email">
            tusharmehra0255@gmail.com
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© 2026 Tushar Mehra. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
