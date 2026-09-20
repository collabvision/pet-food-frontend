'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  api,
  ApiError,
  API_URL,
  setAccessToken,
  setUnauthorizedHandler,
} from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [status, setStatus] = useState('loading');

  const bootstrapped = useRef(false);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus('guest');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);

    return () => {
      setUnauthorizedHandler(() => {});
    };
  }, [clearSession]);

  /*
   * Restore existing session on page reload.
   *
   * Refresh token is HttpOnly.
   * JavaScript never reads it.
   */
  useEffect(() => {
    if (bootstrapped.current) {
      return;
    }

    bootstrapped.current = true;

    async function restoreSession() {
      try {
        const response = await fetch(
          `${API_URL}/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('No active session');
        }

        const body = await response.json();

        const token =
          body?.data?.accessToken;

        if (!token) {
          throw new Error(
            'No access token returned'
          );
        }

        setAccessToken(token);

        const me = await api.get('/auth/me');

        setUser(me?.data ?? null);

        setStatus('authenticated');
      } catch {
        clearSession();
      }
    }

    restoreSession();
  }, [clearSession]);

  /*
   * LOGIN
   */
  const login = useCallback(
    async ({ email, password }) => {
      const res = await api.post(
        '/auth/login',
        {
          email,
          password,
        },
        {
          auth: false,
        }
      );

      const token =
        res?.data?.accessToken;

      if (!token) {
        throw new ApiError(
          'Login did not return a session. Please try again.',
          500
        );
      }

      setAccessToken(token);

      const loggedInUser =
        res?.data?.user ?? null;

      setUser(loggedInUser);

      setStatus('authenticated');

      return loggedInUser;
    },
    []
  );

  /*
   * REGISTER
   *
   * No role is sent.
   * Backend creates USER by default.
   */
  const register = useCallback(
    async ({ name, email, password }) => {
      return api.post(
        '/auth/register',
        {
          name,
          email,
          password,
        },
        {
          auth: false,
        }
      );
    },
    []
  );

  /*
   * EMAIL VERIFICATION
   */
  const verifyEmail = useCallback(
    async ({ email, code }) => {
      return api.post(
        '/auth/verify-email',
        {
          email,
          code,
        },
        {
          auth: false,
        }
      );
    },
    []
  );

  /*
   * RESEND VERIFICATION
   */
  const resendVerification = useCallback(
    async ({ email }) => {
      return api.post(
        '/auth/resend-verification',
        {
          email,
        },
        {
          auth: false,
        }
      );
    },
    []
  );

  /*
   * FORGOT PASSWORD
   */
  const forgotPassword = useCallback(
    async ({ email }) => {
      return api.post(
        '/auth/forgot-password',
        {
          email,
        },
        {
          auth: false,
        }
      );
    },
    []
  );

  /*
   * RESET PASSWORD
   */
  const resetPassword = useCallback(
    async ({ token, password }) => {
      return api.post(
        '/auth/reset-password',
        {
          token,
          password,
        },
        {
          auth: false,
        }
      );
    },
    []
  );

  /*
   * LOGOUT
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {});
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = {
    user,

    status,

    isAdmin:
      user?.role === 'ADMIN',

    login,

    register,

    verifyEmail,

    resendVerification,

    forgotPassword,

    resetPassword,

    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx =
    useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within <AuthProvider>'
    );
  }

  return ctx;
}