import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/Navbar'
import Router from './routes/Router'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full bg-[#030303] text-zinc-400 font-sans selection:bg-zinc-800 selection:text-zinc-100 flex flex-col items-center">
        <Navbar />
        <Router />
      </div>
    </BrowserRouter>
  )
}

export default App
