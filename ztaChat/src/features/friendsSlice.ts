import { Profile } from "@/utils/type";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { USER_SERVER_URL } from "@/utils/constant";
import axios from "axios";

interface Friends {
  friends: Profile[] | [];
  loading: boolean;
  error: string | null;
}

const initialState: Friends = {
  friends: [],
  loading: false,
  error: null,
};

export const getFriends = createAsyncThunk(
  "friends/getFriends",
  async (userId: number) => {
    console.log("🚀 Getting friends for user ID:", userId);

    const token = localStorage.getItem("token");
    console.log("🔑 Auth token exists:", !!token);

    const { data } = await axios.get(`${USER_SERVER_URL}/get_friends`, {
      params: {
        id: userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("👥 Friends API response:", data);
    return data;
  }
);

export const friendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<Profile[] | []>) => {
      state.friends = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFriends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFriends.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success) {
          state.friends = action.payload.friends || [];
        } else {
          state.error = "Failed to fetch friends";
        }
      })
      .addCase(getFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch friends";
      });
  },
});

export const { setFriends, setError, clearError } = friendsSlice.actions;
export default friendsSlice.reducer;
