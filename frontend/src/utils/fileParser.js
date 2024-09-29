import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip'; // Import JSZip
import { Document, Packer, Paragraph } from 'docx';

// Function to read arbitrary file
export const parseFile = async (file) => {
  const fileType = file.type;

  if (fileType === 'text/plain') {
    return readTxt(file);
  } else if (fileType === 'application/pdf') {
    return readPDF(file);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return readDocx(file);
  } else {
    throw new Error('Unsupported file type');
  }
};

// Function to read text from txt file
const readTxt = (file) => {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = function () {
      const text = this.result;
      resolve(text);
    };

    fileReader.onerror = () => {
      reject('Error reading TXT');
    };

    fileReader.readAsText(file);
  });
};

// Function to read text from a PDF file
const readPDF = async (file) => {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let text = '';
      
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join(' ');
      }
      
      resolve(text);
    };

    fileReader.onerror = () => {
      reject('Error reading PDF');
    };

    fileReader.readAsArrayBuffer(file);
  });
};

// Function to read text from a DOCX file
const readDocx = async (file) => {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = function () {
      const arrayBuffer = this.result;
      const zip = new JSZip(); // JSZip is now defined
      
      zip.loadAsync(arrayBuffer).then(function (zip) {
        zip.file('word/document.xml').async('string').then(function (data) {
          const doc = new DOMParser().parseFromString(data, 'text/xml');
          let paragraphs = doc.getElementsByTagName('w:t');
          let text = '';
          for (let i = 0; i < paragraphs.length; i++) {
            text += paragraphs[i].textContent + ' ';
          }
          resolve(text);
        });
      });
    };

    fileReader.onerror = () => {
      reject('Error reading DOCX');
    };

    fileReader.readAsArrayBuffer(file);
  });
};
