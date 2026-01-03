import { AuroraBackground } from "./components/visuals/AuroraBackground";
import { ChatApp } from "./components/chat/ChatApp";
import { LoginPage } from "./components/auth/LoginPage";

export default function App() {
  const isLoginPage = window.location.pathname === "/login";

  return (
    <>
      <AuroraBackground />
      {isLoginPage ? <LoginPage /> : <ChatApp />}
    </>
  );
}
