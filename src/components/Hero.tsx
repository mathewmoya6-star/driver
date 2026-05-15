import React from 'react';

const Hero: React.FC = () => {
  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero" id="home">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Driving Africa's <span className="highlight">Digital Future</span>
          </h1>
          <p className="hero-subtitle">
            Empowering businesses across Africa with innovative technology solutions that drive growth, efficiency, and success.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={scrollToServices}>
              Get Started
            </button>
            <button className="btn btn-secondary">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
