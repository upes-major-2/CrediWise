import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const FEATURES = [
    { icon: '💳', title: 'Smart Card Picks', desc: 'Our rule-based engine evaluates all your cards and picks the one that earns the most rewards for every purchase.' },
    { icon: '📊', title: 'Expense Insights', desc: 'Automatically categorize spending and track patterns across dining, travel, groceries, fuel, and more.' },
    { icon: '🎯', title: 'Reward Maximizer', desc: 'Never miss a milestone bonus or let a reward cap go unnoticed. We track it all so you don\'t have to.' },
    { icon: '📈', title: 'Financial Dashboard', desc: 'Visualize your spending trends, category breakdowns, and rewards earned with beautiful interactive charts.' },
    { icon: '⚡', title: 'Instant Recommendations', desc: 'Enter the amount and merchant — get a ranked list of your cards with clear explanations in under a second.' },
    { icon: '🔒', title: 'Secure by Design', desc: 'Your data is encrypted end-to-end. We never store card numbers or execute any transactions.' },
];

const STEPS = [
    { num: '01', title: 'Add Your Cards', desc: 'Configure your credit cards, wallets, and UPI—enter their reward rules once.' },
    { num: '02', title: 'Log a Transaction', desc: 'Enter the amount, category and merchant name for any purchase.' },
    { num: '03', title: 'Get Ranked Results', desc: 'See which card earns maximum rewards with a clear explanation of why.' },
];

export default function LandingPage() {
    return (
        <div className="landing">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="landing-nav-inner">
                    <div className="logo">
                        <div className="logo-gem">💎</div>
                        <span>CrediWise</span>
                    </div>
                    <div className="nav-actions">
                        <Link to="/login" className="btn btn-ghost">Login</Link>
                        <Link to="/register" className="btn btn-primary">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="hero">
                <div className="hero-glow" />
                <div className="hero-content animate-fade-in">
                    <div className="hero-badge">🇮🇳 Made for Indian cardholders</div>
                    <h1 className="hero-title">
                        Make Every <span className="gradient-text">Rupee</span> Count
                    </h1>
                    <p className="hero-subtitle">
                        CrediWise is your intelligent payment advisor. Tell us what you're buying, and we'll instantly
                        tell you which card earns the maximum rewards — with full transparency on <em>why</em>.
                    </p>
                    <div className="hero-cta">
                        <Link to="/register" className="btn btn-primary btn-lg">Start Saving Free →</Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">I have an account</Link>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat"><strong>100%</strong> <span>Rule-based</span></div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat"><strong>0</strong> <span>Transactions executed</span></div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat"><strong>∞</strong> <span>Cards supported</span></div>
                    </div>
                </div>

                {/* Hero Card Visual */}
                <div className="hero-visual animate-fade-in">
                    <div className="hero-card glass-card">
                        <div className="hc-header">
                            <span className="hc-label">Best card for this purchase</span>
                            <span className="hc-badge">✨ Top Pick</span>
                        </div>
                        <div className="hc-merchant">
                            <span className="hc-icon">🍔</span>
                            <div>
                                <div className="hc-name">Zomato • ₹850</div>
                                <div className="hc-cat">Dining</div>
                            </div>
                        </div>
                        <div className="hc-divider" />
                        {[
                            { name: 'HDFC Swiggy Card', reward: '₹42.50', rate: '5%', rank: 1, color: '#10b981' },
                            { name: 'Axis Flipkart Card', reward: '₹25.50', rate: '3%', rank: 2, color: '#3b82f6' },
                            { name: 'SBI SimplyCLICK', reward: '₹8.50', rate: '1%', rank: 3, color: '#94a3b8' },
                        ].map(card => (
                            <div key={card.rank} className={`hc-rank ${card.rank === 1 ? 'top' : ''}`}>
                                <span className="hc-rank-num" style={{ color: card.color }}>#{card.rank}</span>
                                <span className="hc-card-name">{card.name}</span>
                                <span className="hc-reward" style={{ color: card.color }}>{card.reward}</span>
                            </div>
                        ))}
                        <div className="hc-footer">
                            <span className="hc-exp">5% cashback on Dining. Est. ₹42.50 back. No cap exceeded.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="section">
                <div className="section-inner">
                    <div className="section-label">How It Works</div>
                    <h2 className="section-title">Three steps to smarter spending</h2>
                    <div className="steps-grid">
                        {STEPS.map(step => (
                            <div key={step.num} className="step-card glass-card">
                                <div className="step-num gradient-text">{step.num}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section section-dark">
                <div className="section-inner">
                    <div className="section-label">Features</div>
                    <h2 className="section-title">Everything you need to maximize rewards</h2>
                    <div className="features-grid">
                        {FEATURES.map(f => (
                            <div key={f.title} className="feature-card glass-card">
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section cta-section">
                <div className="cta-glow" />
                <div className="section-inner cta-inner">
                    <h2 className="section-title">Ready to stop leaving money on the table?</h2>
                    <p className="cta-sub">Join CrediWise today — it's completely free.</p>
                    <Link to="/register" className="btn btn-primary btn-lg">Get Started for Free →</Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="logo">
                    <div className="logo-gem">💎</div>
                    <span>CrediWise</span>
                </div>
                <p>© 2026 CrediWise. Built for smarter financial decisions.</p>
            </footer>
        </div>
    );
}
