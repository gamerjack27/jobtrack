import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import ApplicationTable from "./components/ApplicationTable";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <h1 className="text-2xl font-bold px-6 pt-6">JobTrack</h1>
      <ApplicationTable />
    </div>
  );
}

export default App;
