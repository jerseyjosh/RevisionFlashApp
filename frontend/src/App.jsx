import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import Flashcard from './components/Flashcard';
import './App.css'; // Import global CSS

const App = () => {
  // State to hold flashcards generated from the uploaded file
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const colors = ['#FF6F61', '#6B5B95', '#88B04B', '#FFA500', '#009B77', '#F7CAC9', '#92A8D1', '#955251', '#B565A7'];

  // Callback function that gets passed to the FileUpload component
  const handleFileUpload = (generatedFlashcards) => {
    setFlashcards(generatedFlashcards);  // Set the flashcards state with the data from the file
    setCurrentCardIndex(0);  // Reset the current card index to 0
  };

  // Function to move to the next flashcard
  const handleNextCard = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length); // Loop back to the first card if at the end
  };

  // Set background color based on current flashcard index
  useEffect(() => {
    document.documentElement.style.setProperty('--flashcard-bg', colors[currentCardIndex % colors.length]);
  }, [currentCardIndex]);

  return (
    <div className="app-container">
      {!flashcards.length ? (
        <FileUpload onFileUpload={handleFileUpload} />
      ) : (
        <Flashcard 
          card={flashcards[currentCardIndex]} 
          onNext={handleNextCard} 
          isLast={currentCardIndex === flashcards.length - 1}
        />
      )}
    </div>
  );
};

export default App;
