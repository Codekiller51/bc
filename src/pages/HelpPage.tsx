import React from 'react';

const HelpPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Help & Support</h1>
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">How do I book a creative professional?</h3>
              <p className="text-gray-600">
                Browse our directory, select a creative that matches your needs, and click "Book Now" 
                to start the booking process.
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers for your convenience.
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-2">How do I become a creative on the platform?</h3>
              <p className="text-gray-600">
                Click "Join as Creative" and complete our application process. We'll review your 
                portfolio and get back to you within 2-3 business days.
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Create your account</li>
            <li>Complete your profile</li>
            <li>Browse available creatives</li>
            <li>Make your first booking</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Need More Help?</h2>
          <p className="mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Email:</strong> support@example.com</p>
            <p><strong>Live Chat:</strong> Available 9 AM - 6 PM EST</p>
            <p><strong>Phone:</strong> (555) 123-4567</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;