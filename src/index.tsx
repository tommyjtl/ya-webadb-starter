import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

/*
  ____          _              ____  _        _            
 |  _ \ ___  __| |_   ___  __ / ___|| |_ __ _| |_ ___  ___ 
 | |_) / _ \/ _` | | | \ \/ / \___ \| __/ _` | __/ _ \/ __|
 |  _ <  __/ (_| | |_| |>  <   ___) | || (_| | ||  __/\__ \
 |_| \_\___|\__,_|\__,_/_/\_\ |____/ \__\__,_|\__\___||___/
                                                           
*/
import { Provider } from "react-redux";
import { store } from "./states/global";

// To be used in the future for SEO and custom page title
// import { Helmet } from "react-helmet";

/*
  ____                 _     ____             _            
 |  _ \ ___  __ _  ___| |_  |  _ \ ___  _   _| |_ ___ _ __ 
 | |_) / _ \/ _` |/ __| __| | |_) / _ \| | | | __/ _ \ '__|
 |  _ <  __/ (_| | (__| |_  |  _ < (_) | |_| | ||  __/ |   
 |_| \_\___|\__,_|\___|\__| |_| \_\___/ \__,_|\__\___|_|   
                                                           
*/
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Provider store={store}>
        <Home />
      </Provider>
    ),
    // errorElement: <ErrorPage />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
