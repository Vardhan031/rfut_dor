import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const VoterLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0907] relative overflow-x-hidden">
      <Navbar />

      <main className="flex-1 relative z-10 flex flex-col -mt-16 sm:-mt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
