import React from 'react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-links">
                    <a href="#" onClick={e => e.preventDefault()}>About</a>
                    <a href="#" onClick={e => e.preventDefault()}>Privacy</a>
                    <a href="#" onClick={e => e.preventDefault()}>Terms</a>
                    <a
                        href="https://buymeacoffee.com/umershehzad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="coffee-link"
                    >
                        ☕ Support this project
                    </a>
                </div>
                <p>© {new Date().getFullYear()} ConvertFlow — Upload anything. Convert everything.</p>
            </div>
        </footer>
    );
}
