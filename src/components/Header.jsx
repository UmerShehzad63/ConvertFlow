import React from 'react';

export default function Header() {
    return (
        <header className="header">
            <div className="header-inner">
                <a href="/" className="logo" aria-label="ConvertFlow Home">
                    <div className="logo-icon">⚡</div>
                    <span>Convert<span className="gradient-text">Flow</span></span>
                </a>
                <nav className="header-nav" aria-label="Main navigation">
                    <a
                        href="https://buymeacoffee.com/umershehzad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="coffee-link"
                        aria-label="Buy me a coffee"
                    >
                        ☕ <span>Buy me a coffee</span>
                    </a>
                </nav>
            </div>
        </header>
    );
}
