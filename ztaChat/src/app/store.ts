import { configureStore } from "@reduxjs/toolkit";
import conversationsReducer from "@/features/conversationsSlice";
import friendsReducer from "@/features/friendsSlice";
import userReducer from "@/features/userSlice";
import storeReducer from "@/features/storeSlice";
import socketReducer from "@/features/socketSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    conversations: conversationsReducer,
    friends: friendsReducer,
    store: storeReducer,
    socket: socketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
