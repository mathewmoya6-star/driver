import React from 'react';

const services = [
  {
    icon: '🚀',
    title: 'Digital Transformation',
    description: 'Modernize your business with cutting-edge technology solutions and digital strategies.',
    color: '#4CAF50'
  },
  {
    icon: '💻',
    title: 'Web Development',
    description: 'Responsive, fast, and scalable web applications built with modern frameworks.',
    color: '#2196F3'
  },
  {
    icon: '📱',
    title: 'Mobile Solutions',
    description: 'Native and cross-platform mobile apps that deliver exceptional user experiences.',
    color: '#FF9800'
  },
  {
    icon: '☁️',
    title: 'Cloud Services',
    description: 'Scalable cloud infrastructure and deployment solutions for your business needs.',
    color: '#9C27B0'
  },
  {
    icon: '🤖',
    title: 'AI & Automation',
    description: 'Leverage artificial intelligence to automate processes and gain insights.',
    color: '#E91E63'
  },
  {
    icon: '🔒',
    title: 'Cybersecurity',
    description: 'Protect your business with enterprise-grade security solutions.',
    color: '#F44336'
  }
];

const Services: React.FC = () => {
  return (
    <section className="services" id="services">
      <div className="container">
        <h2 className="section-title">Our Services</h2>
        <p className="section-subtitle">Comprehensive technology solutions tailored for African businesses</p>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon" style={{ color: service.color }}>
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <button className="service-btn">Learn More →</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
