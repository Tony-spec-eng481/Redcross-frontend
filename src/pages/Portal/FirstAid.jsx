import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FirstAid() {
  const [data, setData] = useState([]);
  const [question, setQuestion] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/firstaid').then(res => setData(res.data));
  }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/firstaid/questions', { text: question });
    alert('Question submitted!');
    setQuestion('');
  };

  return (
    <div className="portal-page">
      <h2>First Aid Resources</h2>
      <div style={{ marginBottom: '2rem' }}>
        {data.map(item => (
          <div key={item.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h3>{item.title}</h3>
            <p>{item.content}</p>
          </div>
        ))}
      </div>
      <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
        <h3>Ask a Question</h3>
        <form onSubmit={handleAsk}>
          <textarea rows="3" style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} value={question} onChange={e => setQuestion(e.target.value)} required placeholder="Type your question here..."></textarea>
          <button type="submit" className="button button-red" style={{ marginTop: '1rem' }}>Send to Everyone</button>
        </form>
      </div>
    </div>
  );
}