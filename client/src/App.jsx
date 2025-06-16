import './App.css';
import { useState, useEffect } from 'react';

// functions
import { getTest }  from "./functions/test";

function App() {
  const [data, setData] = useState("Hello World");

  useEffect(() => {
    getTest()
      .then((res) => {
        setData(res.message);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className="App">
      <h1>{data}</h1>
    </div>
  );
}

export default App;
