import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [songStyle, setSongStyle] = useState('');
  const [songType, setSongType] = useState('');
  const [subjectPerson, setSubjectPerson] = useState('');
  const [tidbits, setTidbits] = useState('');
  const [lyrics, setLyrics] = useState(null);

  const generateString = `Generate lyrics for a ${songStyle} song that is ${songType} about ${subjectPerson} who has the following ${tidbits}.`;

  const handleGenerate = async () => {
    const prompt = `${generateString} Be sure to have the song have exactly 2 verses, a chorus, then a third verse, a bridge and then an outro. Wrap each tag with [] (i.e. [Verse 1], [Verse 2], etc.)`;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      }, {
        headers: {
          'Authorization': `Bearer sk-proj-2iYiwsmHAtQdKIuA5iyzT3BlbkFJsU9vW3UefNUvCGObuxcv`,
          'Content-Type': 'application/json',
        },
      });

      const generatedLyrics = response.data.choices[0].message.content;
      const parsedLyrics = parseLyrics(generatedLyrics);
      setLyrics(parsedLyrics);
    } catch (error) {
      console.error('Error generating lyrics:', error);
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
            onChange={(e) => setSongStyle(e.target.value)}
          >
            <option value="">Select style</option>
            <option value="country">country</option>
            <option value="rap">rap</option>
            <option value="rock and roll">rock and roll</option>
          </select>
          song that is 
          <select 
            value={songType} 
            onChange={(e) => setSongType(e.target.value)}
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
            onChange={(e) => setSubjectPerson(e.target.value)}
            placeholder="Enter Name of Subject"
          />
          who has the following 
          <input 
            type="text" 
            value={tidbits} 
            onChange={(e) => setTidbits(e.target.value)}
            placeholder="Enter tidbits, separate with commas"
          />
          .
        </div>

        <button onClick={handleGenerate} className="generate-button">Generate</button>

        {lyrics && (
          <div className="lyrics-container">
            {['verse1', 'verse2', 'chorus', 'verse3', 'bridge', 'outro'].map((section) => (
              <div key={section} className="lyric-box">
                <h3>{section.charAt(0).toUpperCase() + section.slice(1)}</h3>
                <p>{lyrics[section]}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;