import { USER_SERVER_URL } from "@/utils/constant";
import { Profile } from "@/utils/type";
import { authHeaders } from "@/utils/utils";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { clearStoredData } from "./storeSlice";

interface UserState {
  userProfile: Profile | null;
  loading: boolean;
  error: string | null;
}
const initialState: UserState = {
  userProfile: null,
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async () => {
    try {
      const { headers } = await authHeaders();

      const { data } = await axios.get(`${USER_SERVER_URL}/current_user`, {
        headers,
      });

      return data;
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      throw error;
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (navigate: (path: string) => void, { dispatch }) => {
    try {
      await dispatch(clearStoredData()).unwrap();

      navigate("/auth");

      return true;
    } catch (error) {
      console.error("❌ Error during logout:", error);
      navigate("/auth");
      throw error;
    }
  }
);
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<Profile | null>) => {
      state.userProfile = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success) {
          state.userProfile = action.payload.profile || null;
        } else {
          state.error = "Failed to fetch user profile";
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch user profile";
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.userProfile = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to logout";
      });
  },
});

export const { setUserProfile, setError, clearError } =
  userSlice.actions;

export default userSlice.reducer;
