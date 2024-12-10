import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Main from "./components/Main";
import Signup from "./components/Singup";
import Login from "./components/Login";
import Chatbot from "./components/Chatbot";
import SavedMessages from "./components/Chatbot/SavedMessages";
import FavouriteMessages from "./components/Chatbot/Favourite";
import History from "./components/Chatbot/History";


function App() {
  const user = localStorage.getItem("token");

  return (
    <Routes>
      {user ? (
        <>
          <Route path="/" exact element={<Main />} />
          <Route path="/chatbot" exact element={<Chatbot />} />
        </>
      ) : (
        <Route path="/" element={<Navigate replace to="/login" />} />
      )}
      <Route path="/SavedMessages" exact element={<SavedMessages />} />
      <Route path="/favourite" element={<FavouriteMessages />} />
      <Route path="/history" exact element={<History />} />
      <Route path="/signup" exact element={<Signup />} />
      <Route path="/login" exact element={<Login />} />
    </Routes>
  );
}

export default App;
