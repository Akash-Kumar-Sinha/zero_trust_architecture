import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { load } from "@tauri-apps/plugin-store";

interface StoreState {
  tokens: {
    authToken: string | null;
    otpToken: string | null;
    privateKey: string | null;
  };
  userEmail: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: StoreState = {
  tokens: {
    authToken: null,
    otpToken: null,
    privateKey: null,
  },
  userEmail: null,
  loading: false,
  error: null,
};

export const loadStoredData = createAsyncThunk(
  "store/loadStoredData",
  async () => {
    try {
      const store = await load("store.json", { autoSave: true });

      const authToken = await store.get("zta_auth_token");
      const otpToken = await store.get("otp_token");
      const privateKey = await store.get("zta_private_key");
      const userEmail = await store.get("u_email");

      return {
        authToken: authToken as string | null,
        otpToken: otpToken as string | null,
        privateKey: privateKey as string | null,
        userEmail: userEmail as string | null,
      };
    } catch (error) {
      console.error("❌ Error loading stored data:", error);
      throw error;
    }
  }
);

export const saveOtpToken = createAsyncThunk(
  "store/saveOtpToken",
  async (token: string) => {

    try {
      const store = await load("store.json", { autoSave: true });
      await store.set("otp_token", token);

      return token;
    } catch (error) {
      console.error("❌ Error saving OTP token:", error);
      throw error;
    }
  }
);

export const saveAuthCredentials = createAsyncThunk(
  "store/saveAuthCredentials",
  async ({
    authToken,
    privateKey,
    userEmail,
  }: {
    authToken: string;
    privateKey: string;
    userEmail: string;
  }) => {

    try {
      const store = await load("store.json", { autoSave: true });

      await store.set("zta_auth_token", authToken);
      await store.set("zta_private_key", privateKey);
      await store.set("u_email", userEmail);

      await store.delete("otp_token");

      return {
        authToken,
        privateKey,
        userEmail,
      };
    } catch (error) {
      console.error("❌ Error saving auth credentials:", error);
      throw error;
    }
  }
);

export const clearStoredData = createAsyncThunk(
  "store/clearStoredData",
  async () => {
    try {
      const store = await load("store.json", { autoSave: true });

      await store.delete("zta_auth_token");
      await store.delete("otp_token");
      await store.delete("zta_private_key");
      await store.delete("u_email");

      return true;
    } catch (error) {
      console.error("❌ Error clearing stored data:", error);
      throw error;
    }
  }
);

export const getAuthHeaders = createAsyncThunk(
  "store/getAuthHeaders",
  async (_, { getState }) => {
    const state = getState() as { store: StoreState };
    const { authToken } = state.store.tokens;

    if (!authToken) {
      const store = await load("store.json", { autoSave: true });
      const token = await store.get("zta_auth_token");

      if (!token) {
        throw new Error("No auth token found");
      }

      return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    }

    return {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
  }
);

export const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setOtpToken: (state, action: PayloadAction<string | null>) => {
      state.tokens.otpToken = action.payload;
    },
    setAuthToken: (state, action: PayloadAction<string | null>) => {
      state.tokens.authToken = action.payload;
    },
    setPrivateKey: (state, action: PayloadAction<string | null>) => {
      state.tokens.privateKey = action.payload;
    },
    setUserEmail: (state, action: PayloadAction<string | null>) => {
      state.userEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadStoredData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadStoredData.fulfilled, (state, action) => {
        state.loading = false;
        state.tokens.authToken = action.payload.authToken;
        state.tokens.otpToken = action.payload.otpToken;
        state.tokens.privateKey = action.payload.privateKey;
        state.userEmail = action.payload.userEmail;
      })
      .addCase(loadStoredData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load stored data";
      })

      .addCase(saveOtpToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveOtpToken.fulfilled, (state, action) => {
        state.loading = false;
        state.tokens.otpToken = action.payload;
      })
      .addCase(saveOtpToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to save OTP token";
      })
      
      .addCase(saveAuthCredentials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveAuthCredentials.fulfilled, (state, action) => {
        state.loading = false;
        state.tokens.authToken = action.payload.authToken;
        state.tokens.privateKey = action.payload.privateKey;
        state.tokens.otpToken = null;
        state.userEmail = action.payload.userEmail;
      })
      .addCase(saveAuthCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to save auth credentials";
      })

      .addCase(clearStoredData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearStoredData.fulfilled, (state) => {
        state.loading = false;
        state.tokens.authToken = null;
        state.tokens.otpToken = null;
        state.tokens.privateKey = null;
        state.userEmail = null;
      })
      .addCase(clearStoredData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to clear stored data";
      })

      .addCase(getAuthHeaders.rejected, (state, action) => {
        state.error = action.error.message || "Failed to get auth headers";
      });
  },
});

export const {
  setError,
  clearError,
  setOtpToken,
  setAuthToken,
  setPrivateKey,
  setUserEmail,
} = storeSlice.actions;

export default storeSlice.reducer;
