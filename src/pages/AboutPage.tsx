import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-4">
          Welcome to our platform! We connect talented creatives with clients looking for exceptional services.
        </p>
        <p className="mb-4">
          Our mission is to make it easy for businesses and individuals to find and book the perfect creative 
          professional for their projects, whether it's photography, design, writing, or any other creative service.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>Browse our curated selection of verified creative professionals</li>
          <li>View portfolios, read reviews, and compare services</li>
          <li>Book directly through our platform with secure payments</li>
          <li>Collaborate seamlessly with built-in communication tools</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us</h2>
        <p className="mb-4">
          We're committed to quality, reliability, and making the creative booking process as smooth as possible 
          for both clients and creatives.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;