import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Session, AuthError } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize auth and set up listener for auth state changes
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          const supabaseUser = currentSession.user;
          
          // Map Supabase user to our app's User type
          const appUser: User = {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || "User",
            email: supabaseUser.email || "",
            avatar: supabaseUser.user_metadata?.avatar_url || "",
            settings: {
              theme: "system",
              currency: "INR",
              emailNotifications: true,
              budgetReminders: true,
            },
          };
          
          setUser(appUser);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        const supabaseUser = currentSession.user;
        
        // Map Supabase user to our app's User type
        const appUser: User = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || "User",
          email: supabaseUser.email || "",
          avatar: supabaseUser.user_metadata?.avatar_url || "",
          settings: {
            theme: "system",
            currency: "INR",
            emailNotifications: true,
            budgetReminders: true,
          },
        };
        
        setUser(appUser);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Login Successful",
        description: "You've been successfully logged in.",
      });
      
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: authError.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Account Created",
        description: "Your account has been successfully created.",
      });
      
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: authError.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // OTP verification through Supabase - Since Supabase handles this automatically,
  // we'll keep this function for API compatibility but it now just returns true
  const verifyOtp = async (otp: string): Promise<boolean> => {
    return true;
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged Out",
        description: "You've been successfully logged out.",
      });
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: authError.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated,
        login,
        signup,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
