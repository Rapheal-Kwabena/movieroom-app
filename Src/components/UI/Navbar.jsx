// src/components/UI/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import Button from './Button';
import './Navbar.css';

const Navbar = () => {
    return (
        <header className="navbar">
            <Link to="/" className="logo"> {/* Use Link for Logo to Home */}
                <span className="logo-icon">▶</span>MOVIEROOM
            </Link>
            <nav className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/explore">Explore Rooms</Link> {/* Explore link */}
                <Link to="/signin">Sign In</Link>
                {/* Button that navigates to the Create page */}
                <Link to="/create"> 
                    <Button>Create Room</Button>
                </Link>
            </nav>
        </header>
    );
};

export default Navbar;