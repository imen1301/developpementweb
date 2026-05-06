import { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import NotesPage from "./NotesPage";

export default function App() {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

  useEffect(() => {
    if (token) setPage("notes");
    else setPage("login");
  }, [token]);

  const handleLogin = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    setPage("notes");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setPage("login");
  };

  if (page === "login")
    return <LoginPage onLogin={handleLogin} goToRegister={() => setPage("register")} />;
  if (page === "register")
    return <RegisterPage goToLogin={() => setPage("login")} />;
  if (page === "notes")
    return <NotesPage token={token} user={user} onLogout={handleLogout} />;
}