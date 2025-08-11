import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-black via-purple-900 to-pink-700 p-10 text-white font-sans">
      <header className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-wide mb-6 drop-shadow-[0_0_10px_rgba(255,0,255,0.7)]">
          BRUTAL TABLE TEST
        </h1>
        <p className="text-lg text-pink-300 font-semibold tracking-wider">
          Ultra vibrant table styled with Tailwind CSS
        </p>
      </header>

      <main className="max-w-6xl mx-auto bg-gradient-to-br from-gray-900/80 via-purple-900/70 to-pink-900/80 rounded-3xl p-8 shadow-2xl ring-2 ring-pink-500/50">
        <button
          onClick={() => setCount(count + 1)}
          className="mb-8 px-10 py-4 bg-pink-600 hover:bg-pink-700 active:scale-95 rounded-full shadow-lg text-xl font-bold tracking-widest uppercase transition-transform duration-200"
        >
          Click me! Count: {count}
        </button>

        <div className="overflow-x-auto rounded-xl border-4 border-pink-500 shadow-xl">
          <table className="w-full table-fixed text-left border-collapse">
            <thead className="bg-pink-700/90 backdrop-blur-md shadow-inner">
              <tr>
                <th className="py-5 px-6 text-white text-2xl font-extrabold uppercase tracking-wide border-r border-pink-500">
                  Name
                </th>
                <th className="py-5 px-6 text-white text-2xl font-extrabold uppercase tracking-wide border-r border-pink-500">
                  Age
                </th>
                <th className="py-5 px-6 text-white text-2xl font-extrabold uppercase tracking-wide">
                  City
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Petar', age: 27, city: 'Belgrade' },
                { name: 'Jovana', age: 25, city: 'Novi Sad' },
                { name: 'Marko', age: 30, city: 'Niš' },
                { name: 'Ana', age: 22, city: 'Subotica' },
              ].map(({ name, age, city }, i) => (
                <tr
                  key={name}
                  className={`cursor-pointer transform transition duration-300 ease-in-out
                    ${
                      i % 2 === 0
                        ? 'bg-gradient-to-r from-red via-purple-900 to-pink-900'
                        : 'bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900'
                    }
                    hover:scale-105 hover:shadow-pink-600 hover:shadow-lg`}
                >
                  <td className="py-4 px-6 text-xl font-semibold text-pink-300 border-r border-pink-700">
                    {name}
                  </td>
                  <td className="py-4 px-6 text-xl font-semibold text-pink-300 border-r border-pink-700">
                    {age}
                  </td>
                  <td className="py-4 px-6 text-xl font-semibold text-pink-300">
                    {city}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="mt-12 text-center text-pink-400 font-mono tracking-wide uppercase drop-shadow-md">
          Made with 💜 using Tailwind CSS
        </footer>
      </main>
    </div>
  );
}

export default App;
