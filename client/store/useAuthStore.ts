import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser } from "@/api/auth";
import toast from "react-hot-toast";

export interface AuthUser {
    email: string;
    name: string;
    token: string;
}


export interface AuthStoreState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => boolean;
}

export const useAuthStore = create<AuthStoreState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            token: null,
            loading: false,

            login: async (email: string, password: string) => {
                set({ loading: true });
                try {
                    const data = await loginUser(email, password);
                    const authUser = {
                        ...data.user,
                    };

                    set({
                        isAuthenticated: true,
                        user: authUser,
                        token: data.token,
                    });

                    localStorage.setItem("authUser", JSON.stringify({
                        ...authUser,
                        token: data.token,
                    }));
                    toast.success("Login successful!");
                } catch (error) {
                    toast.error("Invalid email or password");
                    set({
                        isAuthenticated: false,
                        user: null,
                        token: null,
                    });
                    throw new Error("Invalid credentials");
                } finally {
                    set({ loading: false });
                }
            },

            logout: () => {
                set({ isAuthenticated: false, user: null, token: null });
                localStorage.removeItem("authUser");
                toast.success("Logged out successfully!");
            },

            checkAuth: () => {
                const stored = localStorage.getItem("authUser");
                if (stored) {
                    try {
                        const userObj = JSON.parse(stored);
                        set({
                            user: userObj,
                            isAuthenticated: true,
                            token: userObj.token ?? null,
                        });
                        return true;
                    } catch {
                        set({
                            user: null,
                            isAuthenticated: false,
                            token: null,
                        });
                        return false;
                    }
                }
                set({
                    user: null,
                    isAuthenticated: false,
                    token: null,
                });
                return false;
            },
        }),
        {
            name: "auth-storage",
        }
    )
);
