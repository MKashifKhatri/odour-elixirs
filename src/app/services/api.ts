import { toast } from "react-hot-toast";
import { AuthUser, Product, User, Category, Address, OrderInfo } from "@/lib/types";
import { axiosClient } from "@/utils/axiosClient";
import { AxiosResponse } from "axios";

export const getCategories = async (): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.get("/category");

    // console.log("Categories fetched:", response.data);

    return response.data.result.allCategory; // Return only the data, not the entire response
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error; // Re-throw the error to handle it where this function is called
  }
};

export const getFeatuaredProducts = async (): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.get("/getFeaturedProducts");

    // console.log("Feateared products fetched:", response.data);

    return response.data.result; // Return only the data, not the entire response

  } catch (error) {
    console.error("Error fetching feateared products:", error);
    throw error; // Re-throw the error to handle it where this function is called
  }
};

export const getProductBySlug = async (slug: string, options?: { suppressErrorToast?: boolean }): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.post("/getProductBySlug", { slug }, options);

    // console.log("Products fetched:", response.data);

    return response.data.result; // Return only the data, not the entire response

  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error; // Re-throw the error to handle it where this function is called
  }
};

export const getProductsByCategory = async (slug: string, page = 1, limit = 6): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.post(
      "/getProductByCategorySlug",
      { slug, page, limit }
    );

    // console.log("Products by category slug is fetched:", response.data);

    return response.data.result; // Return only the data, not the entire response
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error; // Re-throw the error to handle it where this function is called
  }
};

export const getProductByCategorySlug = async (slug: string): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.post("/getProductByCategorySlug", {slug});

    // console.log("Products by category slug is fetched:", response.data);

    return response.data.result; // Return only the data, not the entire response
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error; // Re-throw the error to handle it where this function is called
  }
};


export const login = async (data: {email: string, password: string}): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.post("/login", data);

    // console.log("login: ", response.data);

    return response.data; // Return only the data, not the entire response
  } catch (error: any) {
    console.error("Error on login:", error);
    throw error?.response?.data || error;
  }
};

//add api for product updating
export const updateProduct = async (data: Partial<Product>): Promise<any> => {
  try {
    // console.log(data)
    const response: AxiosResponse<any> = await axiosClient.put("/product", data);
    // console.log("Product updated:", response.data);
    return response.data; // Return only the data, not the entire response
  } catch (error) {
    console.error("Error updating product:", error);
    throw error; // Re-throw the error to handle it where this function is called
  }
};

export const getAllProducts = async (): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.get("/product");
    // console.log("All products fetched:", response.data);
    return response.data.result; // Return only the data, not the entire response
  } catch (error) {
    console.error("Error fetching all products:", error);
    throw error; // Re-throw the error to handle it where this function is called
  }
};

export const addProduct = async (data: Partial<Product>): Promise<any> => {
  try {
    // axiosClient already handles the JWT token in its interceptors
    // It adds the Authorization header from localStorage in the request interceptor
    const response: AxiosResponse<any> = await axiosClient.post("/product", data);
    // console.log("Product added:", response.data);
    return response.data.result;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

// API for removing a product
export const removeProduct = async (id: string): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.delete(`/product`, { data: { id } });
    // console.log("Product removed:", response.data);
    return response.data; // Return only the data, not the entire response
  } catch (error) {
    console.error("Error removing product:", error);
    throw error; // Re-throw the error to handle it where this function is called
  }
};

// API for getting users
export const getUsers = async (): Promise<User[]> => {
  try {
    const response: AxiosResponse<{ success: boolean; result: User[] }> = await axiosClient.get("/getAllUsers");
    // console.log("Users fetched:", response.data);
    
    if (response.data.success) {
      return response.data.result; // Return the list of users
    } else {
      throw new Error("Failed to fetch users");
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; // Re-throw the error to handle it where this function is called
  }
};

export const signup = async (data: { name: string; email: string; password: string }): Promise<any> => {
    try {
        const response = await axiosClient.post("/signup", data);
        return response.data; // Return only the data, not the entire response
    } catch (error) {
        console.error("Error on signup:", error);
        throw error; // Re-throw the error to handle it where this function is called
    }
};

export const verifyCode = async (data: { id: string; code: string }): Promise<any> => {
  try {
      const response = await axiosClient.post(`/verifyCode/${data.id}`, { code: data.code });
      return response.data; // Return only the data, not the entire response
  } catch (error) {
      console.error("Error on verify code:", error);
      throw error; // Re-throw the error to handle it where this function is called
  }
};

export const resendVerificationCode = async (id: string): Promise<any> => {
  const response = await axiosClient.post("/resendVerificationCode", { id });
  return response.data;
};

export const requestPasswordReset = async (email: string): Promise<any> => {
  const response = await axiosClient.post("/forgotPassword", { email }, { suppressErrorToast: true });
  return response.data;
};

export const resetPassword = async (data: { token: string; password: string }): Promise<any> => {
  const response = await axiosClient.post("/resetPassword", data, { suppressErrorToast: true });
  return response.data;
};

export const changePassword = async (data: { currentPassword: string; newPassword: string }): Promise<any> => {
  const response = await axiosClient.post("/changePassword", data);
  return response.data;
};

export const fetchUser = async (): Promise<{
  statusCode: number;
  result: { user: AuthUser } | null;
  message?: string;
}> => {
  try {
    const response = await axiosClient.get("/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const fetchAddress = async (): Promise<Address | null> => {
  try {
    const response = await axiosClient.get(`/address`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error;
  }
};

export const saveUserAddress = async (
  addressData: {
    address: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
    phone_number?: string;
    is_default?: boolean;
  },
  userId: string
) => {
  try {
    // Fetch existing addresses (axiosClient auto-attaches Supabase token)
    const existingAddressesResponse = await axiosClient.get("/address");
    const existingAddresses = existingAddressesResponse.data.result || [];

    let response;

    if (existingAddresses.length === 0) {
      // Create new address for users with no addresses
      response = await axiosClient.post("/address", {
        ...addressData,
        user_id: userId,
        is_default: true,
      });
    } else {
      // Update the default address or the first address
      const defaultAddress =
        existingAddresses.find((addr: any) => addr.is_default) ||
        existingAddresses[0];
      response = await axiosClient.put("/address", {
        ...addressData,
        id: defaultAddress.id,
      });
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to save address");
  }
};

export const getOrders = async (): Promise<any[]> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.get("/orders");
    // console.log("Fetched orders:", response.data);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const getMyOrders = async (): Promise<OrderInfo[]> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.get("/my-orders");
    return response.data.result || [];
  } catch (error) {
    console.error("Error fetching my orders:", error);
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.get(`/orders/${orderId}`);
    // console.log("Fetched order by ID:", response.data);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<any> => {
  try {
    const response = await axiosClient.put(`/orders/${orderId}`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const getProductsBySearch = async (query: string): Promise<any> => {
  try {
    const response = await axiosClient.get(`/product?search=${encodeURIComponent(query)}`);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getCategoryBySlug = async (slug: string): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.post("/getCategoryBySlug", { slug });

    // console.log("Category fetched:", response.data);

    return response.data; // Return only the category data
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    throw error;
  }
};


export const updateCategory = async (categoryData: any): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.put("/category", categoryData);

    // console.log("Category updated:", response.data);

    return response.data.result; // Return updated category or success message
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};


export const removeCategory = async (categoryId: string): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.delete("/category", {
      data: { id: categoryId },
    });

    // console.log("Category deleted:", response.data);

    return response.data.result; // Return deletion result
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// API for adding a category
export const addCategory = async (data: Partial<Category>): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.post("/category", data);
    // console.log("Category added:", response.data);
    return response.data.result; // Return the added category or success message
  } catch (error) {
    console.error("Error adding category:", error);
    throw error; // Re-throw the error to handle it where this function is called
  }
};

export const updateUserName = async (name: string): Promise<User> => {
  try {
    const response: AxiosResponse<any> = await axiosClient.put("/profile", { name });
    // console.log("User name updated:", response.data);
    return response.data.result;
  } catch (error) {
    console.error("Error updating user name:", error);
    throw error;
  }
};

// Admin Dashboard API
export interface DashboardMetrics {
  summary: {
    revenue: number;
    userCount: number;
    orderCount: number;
    productCount: number;
    pendingPaymentCount: number;
  };
  revenueSeries: {
    labels: string[];
    revenue: number[];
    orders: number[];
  };
  categoryBreakdown: {
    name: string;
    productCount: number;
    percentage: number;
  }[];
  latestOrders: {
    id: string;
    customerName: string;
    total: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
  }[];
  statusBreakdown: {
    pending: number;
    shipped: number;
    delivered: number;
  };
}

export const getDashboardData = async (): Promise<DashboardMetrics> => {
  try {
    // Route groups such as `(admin)` do not appear in the URL. The dashboard
    // API therefore resolves to /api/dashboard, with authorization handled by the route.
    const response: AxiosResponse<{ success: boolean; result: DashboardMetrics; message?: string }> = await axiosClient.get("/dashboard");

    if (response.data.success && response.data.result) {
      return response.data.result;
    } else {
      throw new Error(response.data.message || "Failed to fetch dashboard data");
    }
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    throw error;
  }
};
