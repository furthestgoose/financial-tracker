import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import AOS from 'aos';
import 'aos/dist/aos.css';

const HomePage: React.FC = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
    document.title = "FinancePro Home"
  }, []);

  return (
    <div className="bg-gray-100 text-gray-800">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-green-400 to-blue-500 text-center text-white relative overflow-hidden py-12">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate__animated animate__fadeIn animate__delay-1s" data-aos="fade-up">
          Welcome to FinancePro
        </h1>
        <p className="text-lg md:text-xl mb-10 animate__animated animate__fadeIn animate__delay-2s" data-aos="fade-up" data-aos-delay="300">
          Your ultimate solution for managing your finances efficiently and effectively.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
          <Link
            to="/login"
            className="bg-white text-green-600 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-200 transition duration-300 transform hover:scale-105"
            data-aos="fade-up" data-aos-delay="600"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-white text-green-600 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-200 transition duration-300 transform hover:scale-105"
            data-aos="fade-up" data-aos-delay="700"
          >
            Sign Up
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-transparent h-24"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 text-center bg-white">
        <h2 className="text-4xl md:text-5xl font-semibold mb-12" data-aos="fade-up">
          Why Choose FinancePro?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105" data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-2xl font-bold mb-4">Comprehensive Tracking</h3>
            <p>Track all your financial transactions in one place. From daily expenses to long-term investments, manage it all effortlessly.</p>
          </div>
          <div className="bg-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105" data-aos="fade-up" data-aos-delay="400">
            <h3 className="text-2xl font-bold mb-4">Real-Time Insights</h3>
            <p>Get real-time insights into your spending patterns and financial health. Make informed decisions with our intuitive dashboards.</p>
          </div>
          <div className="bg-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105" data-aos="fade-up" data-aos-delay="600">
            <h3 className="text-2xl font-bold mb-4">Secure and Private</h3>
            <p>Your data is securely stored in Firestore. While we don’t control encryption, we ensure privacy and security with best practices.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-4xl md:text-5xl font-semibold mb-12" data-aos="fade-up">
          What Our Users Say
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm transform hover:scale-105 transition-transform duration-300" data-aos="fade-up" data-aos-delay="200">
            <p className="text-lg mb-4">“FinancePro has completely transformed how I manage my money. The insights are invaluable and the platform is so user-friendly!”</p>
            <p className="font-bold">Sarah J.</p>
            <p className="text-gray-500">Financial Advisor</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm transform hover:scale-105 transition-transform duration-300" data-aos="fade-up" data-aos-delay="400">
            <p className="text-lg mb-4">“I love the detailed reports and the ease of tracking my investments. FinancePro makes financial management simple and effective.”</p>
            <p className="font-bold">Michael T.</p>
            <p className="text-gray-500">Entrepreneur</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm transform hover:scale-105 transition-transform duration-300" data-aos="fade-up" data-aos-delay="600">
            <p className="text-lg mb-4">“The security features are top-notch, and I feel confident knowing my data is protected. Highly recommend FinancePro!”</p>
            <p className="font-bold">Emily R.</p>
            <p className="text-gray-500">Freelancer</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-6 text-center bg-green-600 text-white">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4" data-aos="fade-up">
          Ready to Take Control of Your Finances?
        </h2>
        <p className="text-lg mb-8" data-aos="fade-up" data-aos-delay="300">
          Join thousands of users who are making smarter financial decisions every day.
        </p>
        <Link
          to="/signup"
          className="bg-white text-green-600 px-8 py-4 rounded-lg shadow-lg hover:bg-gray-200 transition duration-300 transform hover:scale-105"
          data-aos="fade-up" data-aos-delay="600"
        >
          Get Started
        </Link>
      </section>

      {/* Mobile Disclaimer Section */}
      <section className="py-6 px-6 text-center bg-yellow-100 text-gray-800">
        <p className="text-lg">
          Please note: FinancePro currently offers limited functionality on mobile devices. For the best experience, use a desktop or tablet.
        </p>
      </section>

      {/* Footer */}<footer className="py-8 bg-gray-900 text-white text-center">
        <div className="container mx-auto">
          <p className="mb-4">&copy; 2024 FinancePro. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mb-4">
            <a
              href="https://github.com/furthestgoose/financial-tracker/tree/master"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400 transition duration-300 flex items-center"
            >
              <svg className="h-6 w-6 inline-block" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.388.6.112.82-.26.82-.578v-2.079c-3.338.727-4.04-1.606-4.04-1.606-.544-1.376-1.33-1.744-1.33-1.744-1.087-.743.082-.728.082-.728 1.206.084 1.839 1.239 1.839 1.239 1.072 1.832 2.812 1.301 3.501.995.107-.776.419-1.301.763-1.599-2.665-.305-5.467-1.332-5.467-5.927 0-1.31.468-2.378 1.236-3.219-.124-.305-.536-1.538.116-3.206 0 0 1.007-.322 3.303 1.228.958-.266 1.988-.398 3.011-.402 1.023.004 2.053.136 3.013.402 2.295-1.55 3.302-1.228 3.302-1.228.654 1.668.242 2.901.118 3.206.77.841 1.235 1.91 1.235 3.219 0 4.611-2.809 5.621-5.485 5.921.432.372.821 1.102.821 2.222v3.293c0 .321.217.693.825.576C20.563 21.8 24 17.303 24 12 24 5.373 18.627 0 12 0z"/>
              </svg>
              <span className="ml-2">GitHub</span>
            </a>
            <a
              href="https://furthestgoose.github.io/Portfolio-V1/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400 transition duration-300 flex items-center"
            >
              <svg className="h-6 w-6 inline-block" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
              </svg>
              <span className="ml-2">Portfolio</span>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
