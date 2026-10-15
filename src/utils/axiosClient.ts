import axios from 'axios'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { KEY_ACCESS_TOKEN, removeItem, setItem } from './localStorageManager'

declare module 'axios' {
    interface AxiosRequestConfig {
        suppressErrorToast?: boolean;
    }
}

let isRefreshingToken = false;
let pendingRefreshPromise: Promise<boolean> | null = null;

const isAuthPath = (pathname: string) => {
    if (!pathname) return false;
    const adminLoginPath = `/admin/${process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH}/login`;
    return pathname === '/login' || pathname === '/signup' || pathname.startsWith(adminLoginPath);
};

const handleExpiredSession = (message?: string) => {
    if (typeof window === 'undefined') {
        return;
    }

    const pathname = window.location.pathname;

    if (isAuthPath(pathname)) {
        return;
    }

    removeItem(KEY_ACCESS_TOKEN);
    toast.error(message || 'Session expired');
};

export const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    withCredentials: true,
});

const refreshClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    withCredentials: true,
});

const tryRefreshAccessToken = async (): Promise<boolean> => {
    if (isRefreshingToken && pendingRefreshPromise) {
        return pendingRefreshPromise;
    }

    isRefreshingToken = true;
    pendingRefreshPromise = (async () => {
        try {
            const refreshResponse = await refreshClient.post('/refreshAccessToken');
            const data = refreshResponse?.data;
            // console.log("data from refreshToken", data);
            
            if (data?.success && data?.result?.accessToken) {
                setItem(KEY_ACCESS_TOKEN, data.result.accessToken);
                return true;
            }

            return false;
        } catch (err: any) {
            // If route doesn't exist (404) or refresh fails (401), caller will logout.
            return false;
        } finally {
            isRefreshingToken = false;
            pendingRefreshPromise = null;
        }
    })();

    return pendingRefreshPromise;
};

const retryRequestWithFreshToken = async (originalRequest: any) => {
    const refreshed = await tryRefreshAccessToken();
    if (!refreshed) {
        handleExpiredSession('Session expired');
        return Promise.reject('Session expired');
    }

    // Best-effort immediate retry header; request interceptor also attaches token from Supabase session.
    const token = typeof window !== 'undefined' ? localStorage.getItem(KEY_ACCESS_TOKEN) : null;
    if (token) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
    }

    return axiosClient(originalRequest);
};

// Attach the Supabase access token to every request
axiosClient.interceptors.request.use(
    async (request) => {
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                request.headers['Authorization'] = `Bearer ${session.access_token}`;
            }
        } catch (e) {
            // If session retrieval fails, proceed without token
        }
        return request;
    }
)

axiosClient.interceptors.response.use(
    async (response) => {
        const data = response.data;

        if (data.success) {
            if (data.result?.message) {
                const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
                const isAdminLoginPath = pathname.startsWith(`/admin/${process.env.NEXT_PUBLIC_ADMIN_SECRET_PATH}/login`);
                if (!isAdminLoginPath) {
                    toast.success(data.result.message);
                }
            }
            return response;
        }

        const errorMessage = data.message;
        const statusCode = data.statusCode;

        if (statusCode === 401) {
            const originalRequest: any = response.config || {};

            if (originalRequest._retry) {
                handleExpiredSession(errorMessage || 'Session expired');
                return Promise.reject(errorMessage);
            }

            originalRequest._retry = true;
            return retryRequestWithFreshToken(originalRequest);
        }

        // If user is not verified, don't show toast — let the login page handle it
        if (data.result?.isVerified === false) {
            return Promise.reject(data);
        }

        if (!response.config.suppressErrorToast) toast.error(errorMessage);
        return Promise.reject(errorMessage);
    },
    async (error) => {
        console.error("Error in axiosClient:", error);
        const originalRequest: any = error?.config || {};
        const statusCode = error?.response?.status || error?.response?.data?.statusCode;
        const message = error?.response?.data?.message || error?.message || "Something went wrong";

        if (statusCode === 401) {
            if (originalRequest._retry) {
                handleExpiredSession(message);
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            return retryRequestWithFreshToken(originalRequest);
        }

        if (!originalRequest.suppressErrorToast) toast.error(message);
        return Promise.reject(error);
    }
);
