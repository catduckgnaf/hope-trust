import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import Amplify from "@aws-amplify/core";
import { Auth } from "aws-amplify";
import { amplifyConfiguration } from "./amplify-config";

Amplify.configure(amplifyConfiguration);
Auth.configure(amplifyConfiguration);

ReactDOM.render(<BrowserRouter basename="/"><App /></BrowserRouter>, document.getElementById("root"));
