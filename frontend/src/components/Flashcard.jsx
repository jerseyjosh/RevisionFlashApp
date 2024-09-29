import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Flashcard = ({ card, onNext, isLast }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Handle resetting isCorrect and showAnswer when the flashcard changes
  useEffect(() => {
    setIsCorrect(null);  // Reset the correctness message when the card changes
    setShowAnswer(false); // Reset the showAnswer flag when the card changes
  }, [card]);

  const handleSubmit = async () => {
    try {
      // Make API request to validate the answer
      const response = await axios.post('http://localhost:8000/validate_answer', {
        answer: card.answer,
        userAnswer: userAnswer,
      });

      // Assuming the API response is something like { "isCorrect": true/false }
      setIsCorrect(response.data.isCorrect);
      setUserAnswer(''); // Clear the input after submission

    } catch (error) {
      console.error('Error validating answer:', error);
    }
  };

  // Show the correct answer without validating user input
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  // Skip to the next question without answering
  const handleSkip = () => {
    setUserAnswer('');
    onNext();
  };

  return (
    <div className="flashcard">
      <h2>{card.question}</h2>
      <input
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Your answer"
      />
      <button onClick={handleSubmit}>Check Answer</button>

      {isCorrect !== null && (
        <p>{isCorrect ? 'Correct!' : 'Wrong, try again.'}</p>
      )}

      {showAnswer && (
        <p className="answer">Answer: {card.answer}</p>
      )}

      {/* Show Answer and Skip buttons */}
      <div className="button-group">
        <button onClick={handleShowAnswer}>Show Answer</button>
        <button onClick={handleSkip}>Skip</button>
      </div>

      {/* Next question button */}
      {isCorrect && !isLast && (
        <button onClick={onNext}>Next Question</button>
      )}
    </div>
  );
};

export default Flashcard;
