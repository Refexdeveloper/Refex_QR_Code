import axios from 'axios';
import PropTypes from 'prop-types';
import { useMemo, useEffect, useContext, useReducer, createContext } from 'react';

// Action types
const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isAuthenticated: true,
        authToken: action.payload.authToken,
        user: action.payload.user,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        authToken: null,
        user: null,
      };
    default:
      return state;
  }
};

// Function to load authentication state from local storage
const loadAuthState = () => {
  // Initial state
  const initialState = {
    isAuthenticated: false,
    authToken: null,
    user: null,
  };
  try {
    const authState = sessionStorage.getItem('authState');
    return authState ? JSON.parse(authState) : initialState;
  } catch (error) {
    console.error('Error loading auth state:', error);
    return initialState;
  }
};

// Function to save authentication state to local storage
const saveAuthState = (state) => {
  try {
    sessionStorage.setItem('authState', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving auth state:', error);
  }
};

// Initial state
const initialState = loadAuthState();

// Create context
const AuthContext = createContext();

// Function to set the authorization header for Axios requests
const setAuthorizationHeader = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Save authentication state to local storage whenever it changes
    saveAuthState(state);
    setAuthorizationHeader(state.authToken);
  }, [state]);

  const login = (authToken, user) => {
    dispatch({ type: LOGIN, payload: { authToken, user } });
    setAuthorizationHeader(authToken);
  };

  const logout = () => {
    dispatch({ type: LOGOUT });
    setAuthorizationHeader(null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: state.isAuthenticated,
      authToken: state.authToken,
      user: state.user,
      login,
      logout,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.element,
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
