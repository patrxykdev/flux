// frontend/src/components/Modal.tsx
import React, { useEffect, useState } from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = () => {
    setIsAnimating(false);
    setTimeout(onClose, 200); // Wait for exit animation
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`modal-overlay ${isAnimating ? 'modal-enter' : 'modal-exit'}`} 
      onClick={handleOverlayClick}
    >
      <div 
        className={`modal-content ${isAnimating ? 'modal-enter' : 'modal-exit'}`} 
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;