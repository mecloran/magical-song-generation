import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [songStyle, setSongStyle] = useState('');
  const [songType, setSongType] = useState('');
  const [subjectPerson, setSubjectPerson] = useState('');
  const [tidbits, setTidbits] = useState('');
  const [lyrics, setLyrics] = useState({
    verse1: '', verse2: '', chorus: '', verse3: '', bridge: '', outro: ''
  });
  const [changes, setChanges] = useState({
    verse1: '', verse2: '', chorus: '', verse3: '', bridge: '', outro: '', overall: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [timer, setTimer] = useState(0);
  const [apiInput, setApiInput] = useState('');
  const [apiOutput, setApiOutput] = useState('');
  const [error, setError] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [isInputModified, setIsInputModified] = useState(false);

  const generateString = `Generate lyrics for a ${songStyle} song that is ${songType} about ${subjectPerson} who ${tidbits}.`;

  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    let prompt;
    if (isModified && !isInputModified) {
      const changedSections = Object.entries(changes)
        .filter(([key, value]) => value && key !== 'overall')
        .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${value}`)
        .join('. ');

      prompt = `The user is in the middle of creating lyrics for an AI song generation app and previously sent the following string "${apiInput}" and got back the following song lyrics: "${apiOutput}". The user would now like to change ${changedSections}. ${
        changes.overall ? `In addition, the user would like to make the following overall changes to the song: ${changes.overall}.` : ''
      } Be sure to continue returning exactly 2 verses, a chorus, then a third verse, a bridge and then an outro. Make each verse 4 lines long. Wrap each tag with [] (i.e. [Verse 1], [Verse 2], etc.)`;
    } else {
      prompt = `${generateString} Be sure to have the song have exactly 2 verses, a chorus, then a third verse, a bridge and then an outro. Make each verse 4 lines long. Wrap each tag with [] (i.e. [Verse 1], [Verse 2], etc.)`;
    }

    setIsGenerating(true);
    setApiInput(prompt);
    setApiOutput('');
    setError('');

    try {
      // Read API key from file
      const apiKeyResponse = await fetch('/api_key.txt');
      const apiKey = await apiKeyResponse.text();

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
      });

      const generatedLyrics = response.data.choices[0].message.content;
      setApiOutput(generatedLyrics);
      const parsedLyrics = parseLyrics(generatedLyrics);
      setLyrics(parsedLyrics);
      setIsGenerated(true);
      setIsModified(false);
      setIsInputModified(false);
      setChanges({verse1: '', verse2: '', chorus: '', verse3: '', bridge: '', outro: '', overall: ''});
    } catch (error) {
      console.error('Error generating lyrics:', error);
      setError('An error occurred while generating lyrics. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const parseLyrics = (text) => {
    const sections = ['Verse 1', 'Verse 2', 'Chorus', 'Verse 3', 'Bridge', 'Outro'];
    const lyrics = {};

    sections.forEach(section => {
      const regex = new RegExp(`\\[${section}\\](.*?)(?=\\[|$)`, 's');
      const match = text.match(regex);
      lyrics[section.toLowerCase().replace(' ', '')] = match ? match[1].trim() : '';
    });

    return lyrics;
  };

  const handleChangeInput = (section, value) => {
    setChanges(prev => ({ ...prev, [section]: value }));
    setIsModified(true);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (isGenerated) {
      setIsModified(true);
      setIsInputModified(true);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Magical Song Generation</h1>
      </header>
      <main>
        <div className="generation-string">
          Generate lyrics for a 
          <select 
            value={songStyle} 
            onChange={handleInputChange(setSongStyle)}
          >
            <option value="">Select style</option>
            <option value="country">country</option>
            <option value="rap">rap</option>
            <option value="rock and roll">rock and roll</option>
          </select>
          song that is 
          <select 
            value={songType} 
            onChange={handleInputChange(setSongType)}
          >
            <option value="">Select type</option>
            <option value="love song">love song</option>
            <option value="honoring">honoring</option>
            <option value="roasting">roasting</option>
          </select>
          about 
          <input 
            type="text" 
            value={subjectPerson} 
            onChange={handleInputChange(setSubjectPerson)}
            placeholder="Enter Name of Subject"
          />
          who 
          <input 
            type="text" 
            value={tidbits} 
            onChange={handleInputChange(setTidbits)}
            placeholder="Enter tidbits, separate with commas"
          />
          .
        </div>

        <div className="lyrics-container">
          {Object.entries(lyrics).map(([section, text]) => (
            <div key={section} className="lyric-row">
              <div className={`lyric-box ${isModified ? 'modified' : ''}`}>
                <h3>{section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')}</h3>
                <pre>{text}</pre>
              </div>
              {isGenerated && (
                <div className="change-input">
                  <label>{section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')} Changes to make</label>
                  <input 
                    type="text" 
                    value={changes[section]} 
                    onChange={(e) => handleChangeInput(section, e.target.value)}
                    placeholder="Type something like 'she is a redhead' or 'we went sailing, not fishing'"
                  />
                </div>
              )}
            </div>
          ))}
          {isGenerated && (
            <div className="lyric-row">
              <div className="change-input overall-input">
                <label>Overall Lyric Changes</label>
                <input 
                  type="text" 
                  value={changes.overall} 
                  onChange={(e) => handleChangeInput('overall', e.target.value)}
                  placeholder="Type something like 'make it funnier' or 'add references to faith'"
                />
              </div>
            </div>
          )}
        </div>

        <button onClick={handleGenerate} className="generate-button" disabled={isGenerating}>
          {isGenerating ? 'Generating...' : isModified ? 'Regenerate' : 'Generate'}
        </button>

        {(isGenerating || error) && (
          <div className="timer">
            {error ? error : `Waiting for results... ${timer} seconds`}
          </div>
        )}

        <hr />

        <div className="api-container">
          <div className="api-box">
            <h3>Raw API Input</h3>
            <pre>{apiInput}</pre>
          </div>
          <div className="api-box">
            <h3>Raw API Output</h3>
            <pre>{apiOutput}</pre>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;