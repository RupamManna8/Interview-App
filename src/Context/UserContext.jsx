import React, {
    useState,
    useEffect,
    createContext,
    useCallback,
  } from "react";
  
  export const UserContext = createContext();
  
  const serverUrl =
    import.meta.env.VITE_SERVER_URL?.replace(/\/$/, "") ||
    window.location.origin;
  
  // ------------------------------------------------------
  // ✅ Reusable API Helper
  // ------------------------------------------------------
  const apiRequest = async (endpoint, options = {}) => {
    const response = await fetch(`${serverUrl}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  
    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  
    if (!response.ok) {
      throw new Error(data?.message || "Something went wrong");
    }
  
    return data;
  };
  
  // ------------------------------------------------------
  // ✅ Provider
  // ------------------------------------------------------
 export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previousMail, setPreviousMail] = useState(null);
    const [isInterViewStarted, setIsInterViewStarted] = useState(false)
    const [uploadedResumes, setUploadedResumes] = useState([]);
    // ------------------------------------------------------
    // ✅ Check Auth on Load (with abort controller)
    // ------------------------------------------------------
    useEffect(() => {
      const controller = new AbortController();
  
      const checkAuthStatus = async () => {
        try {
          const data = await apiRequest("/auth/current", {
            method: "GET",
            signal: controller.signal,
            credentials: "include",
          });
  
          if (data?.user) {
            setUser(data.user);
          }
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Auth check failed:", error.message);
          }
        } finally {
          setLoading(false);
        }
      };
  
      checkAuthStatus();
  
      return () => controller.abort();
    }, []);
  
    // ------------------------------------------------------
    // ✅ Login
    // ------------------------------------------------------
    const login = useCallback(async (email, password) => {
      try {
        const data = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            AttemptMail: email,
          }),
          credentials: "include",
        });
  
        setUser(data.user);
        return { ok: true, message: data.message };
      } catch (error) {
        return { ok: false, message: error.message };
      }
    }, []);
  
    // ------------------------------------------------------
    // ✅ Google Login
    // ------------------------------------------------------
    const googleLogin = useCallback(async (credential) => {
      try {
        const data = await apiRequest("/auth/google/login", {
          method: "POST",
          body: JSON.stringify({ credential }),
          credentials: "include",
        });
  
        if (data?.user) {
          setUser(data.user);
        }
  
        return { ok: true };
      } catch (error) {
        return { ok: false, message: error.message };
      }
    }, []);
  
    // ------------------------------------------------------
    // ✅ Signup
    // ------------------------------------------------------
    const signup = useCallback(async (name, email, password) => {
      try {
        if (!name || !email || !password) {
          return { ok: false, message: "All fields are required" };
        }
  
        if (previousMail === email) {
          return { ok: false, message: "Enter a valid email id" };
        }
  
        // Check mail
        const checkData = await apiRequest("/auth/check-mail", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
  
        if (checkData.result === false) {
          setPreviousMail(email);
          return { ok: false, message: "Enter a valid email id" };
        }
  
        const data = await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
          credentials: "include",
        });
  
        setUser(data.user);
  
        return { ok: true, message: "Signup successful" };
      } catch (error) {
        return { ok: false, message: error.message };
      }
    }, [previousMail]);
  
    // ------------------------------------------------------
    // ✅ Logout
    // ------------------------------------------------------
    const logout = useCallback(async () => {
      try {
        await apiRequest("/auth/logout", {
          method: "GET",
        });
  
        setUser(null);
        
      } catch (error) {
        console.error("Logout failed:", error.message);
      }
    }, []);
  
    return (
      <UserContext.Provider
        value={{
          serverUrl,
          apiRequest,
          user,
          loading,
          login,
          signup,
          logout,
          googleLogin,
          setUser,
          setIsInterViewStarted,
          isInterViewStarted,
          uploadedResumes, 
          setUploadedResumes
        }}
      >
        {children}
      </UserContext.Provider>
    );
  };
  
  // ------------------------------------------------------
  // ✅ Custom Hook (Cleaner usage)
  // ------------------------------------------------------
 
  