// App.js
import Header from './components/header/header';
import './App.css';
import Section from './components/section/section';
import React from 'react';

function App() {
  return (
    <>
    <Header />
    <div className='App'>
      <Section />
    </div>
    <footer className="footer">
        <p>Developed by <a href='https://github.com/Munavvirr/'>Munavvir</a></p>
    </footer>
    </>
  );
}

export default App;
