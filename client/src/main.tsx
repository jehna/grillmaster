import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom CSS for Material Icons and animation effects
const style = document.createElement('style');
style.textContent = `
  .timeline-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .timeline-container::-webkit-scrollbar {
    display: none;
  }
  
  .timeline-tick {
    position: absolute;
    width: 1px;
    background-color: #e5e7eb;
    height: 100%;
  }
  
  .timeline-item {
    position: absolute;
    border-radius: 0.375rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    white-space: nowrap;
    color: white;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  
  .flip-indicator {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: white;
    top: -10px;
    transform: translateX(-10px);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  
  .shake {
    animation: shake 0.5s;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }

  .grilling-animation {
    background: linear-gradient(to right, #f97316, #dc2626);
    background-size: 200% 100%;
    animation: gradientMove 2s infinite linear;
  }
  
  @keyframes gradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
