import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom"; // استخدم HashRouter هنا بدلاً من BrowserRouter
import "./index.css";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <HashRouter> {/* استخدم HashRouter بدلاً من BrowserRouter */}
      <App />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
