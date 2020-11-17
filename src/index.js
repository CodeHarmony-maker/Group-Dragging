import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
// import injectTapEventPlugin from "react-tap-event-plugin";
// try {
//   // to prevent error because of loading twice
//   injectTapEventPlugin();
// } catch (e) {
//   // console.warn(e);
// }

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  rootElement
);
