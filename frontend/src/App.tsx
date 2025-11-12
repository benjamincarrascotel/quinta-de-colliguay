import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Placeholder components (to be implemented)
const HomePage = () => <div className="p-8">Home Page - Coming Soon</div>;
const AdminPage = () => <div className="p-8">Admin Panel - Coming Soon</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
