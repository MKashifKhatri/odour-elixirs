// src/store/reducer/userReducer.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser, Category, Product } from "@/lib/types";

interface UserReducerInitialState {
  user: AuthUser | null;
  loading: boolean;
  allCategories: Category[];
  featuredProducts: Product[];
  categoryProducts: {
    [categorySlug: string]: Product[];
  };
}


const initialState: UserReducerInitialState = {
  user: null,
  loading: false,
  allCategories: [],
  featuredProducts: [],
  categoryProducts: {},
};

export const userReducer = createSlice({
  name: "userReducer",
  initialState,
  reducers: {
    userExist: (state, action: PayloadAction<AuthUser>) => {
      // console.log("User exists action dispatched:", action.payload);
      state.loading = false;
      state.user = action.payload;
    },
    userNotExist: (state) => {
      state.loading = false;
      state.user = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addCategories: (state, action: PayloadAction<Category[]>) => {
      state.allCategories = action.payload;
    },
    addFeaturedProducts: (state, action: PayloadAction<Product[]>) => {
      state.featuredProducts = action.payload;
    },
    setCategoryProducts: (
      state,
      action: PayloadAction<{ slug: string; products: Product[] }>
    ) => {
      state.categoryProducts[action.payload.slug] = action.payload.products;
    },
    updateUserName: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.name = action.payload;
      }
    },
  },
});

export const { userExist, userNotExist, setLoading, addCategories, addFeaturedProducts, setCategoryProducts, updateUserName } = userReducer.actions;

export default userReducer.reducer;
