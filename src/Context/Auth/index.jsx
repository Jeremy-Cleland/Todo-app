import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import cookie from "react-cookies";
import axios from "axios";
export const LoginContext = React.createContext();

const LoginProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({ capabilities: [] });
  const [error, setError] = useState(null);
  const can = (capability) => {
    return user?.capabilities?.includes(capability);
  };

  const validateToken = (token) => {
    try {
      const validUser = jwt_decode(token);
      setLoggedIn(true);
      setUser(validUser);
      cookie.save("auth", token);
    } catch (e) {
      setLoggedIn(false);
      setUser({ capabilities: [] });
      setError(e);
      console.log("Token Validation Error", e);
    }
  };

  const login = async (username, password) => {
    // const authUser = testUsers[username];
    const config = {
      method: "post",
      baseURL: "https://api-js401.herokuapp.com",
      url: "/signin",
      auth: { username, password },
    };

    const response = await axios(config);

    // let response = response.data.user;
    const token = response.data.token;

    if (token) {
      try {
        validateToken(token);
      } catch (e) {
        setLoggedIn(false);
        setUser({ capabilities: [] });
        setError(e);
        console.error(e);
      }
    }
  };

  const logout = () => {
    setUser({});
    setLoggedIn(false);
    // cookie.remove("auth");
  };

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const cookieToken = cookie.load("auth");
    const token = qs.get("token") || cookieToken || null;
    validateToken(token);
  }, []);

  const values = {
    user,
    loggedIn,
    error,
    can,
    login,
    logout,
  };

  return (
    <LoginContext.Provider value={values}>{children}</LoginContext.Provider>
  );
};
export default LoginProvider;
