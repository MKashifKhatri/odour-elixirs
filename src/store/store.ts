import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./reducer/cartReducer";
import userReducer from "./reducer/userReducer";

export const server = process.env.NEXT_PUBLIC_SERVER_URL;

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;