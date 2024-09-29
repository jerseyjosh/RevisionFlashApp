import React, { useState } from 'react';
import axios from 'axios';
import { parseFile } from '../utils/fileParser';

const FileUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Set the selected file in state
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      // Parse file text from file
      const fileText = await parseFile(file);

      // Make request to backend using axios
      const response = await axios.post('http://localhost:8000/generate_flashcards', {
        text: fileText, // Send parsed file text to backend as JSON
      });

      // Get flashcards from response
      const flashcards = response.data;

      // Call the callback function to send flashcards data back
      onFileUpload(flashcards);
      
    } catch (error) {
      console.error('Error during file upload or parsing:', error);
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Backend error:', error.response.status, error.response.data);
      } else if (error.request) {
        // Request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Error:', error.message);
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload File</button>
    </div>
  );
};

export default FileUpload;
