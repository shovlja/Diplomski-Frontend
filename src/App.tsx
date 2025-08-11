import { useState } from 'react';
import Welcome from './pages/Welcome';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app-container">
      <Welcome />
    </div>
  );
}

export default App;
