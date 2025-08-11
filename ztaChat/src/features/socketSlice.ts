import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SocketState {
  connected: boolean;
  error: string | null;
  connectionInfo: {
    conversationId?: number;
    profileId?: number;
  } | null;
  lastMessage?: string;
}

const initialState: SocketState = {
  connected: false,
  error: null,
  connectionInfo: null,
};

export const connectSocket = createAsyncThunk(
  "socket/connect",
  async (
    {
      conversationId,
      profileId,
    }: { conversationId: number; profileId: number },
    { rejectWithValue }
  ) => {
    try {
      if (!conversationId || !profileId) {
        throw new Error("Missing conversation or profile ID");
      }

      // The actual WebSocket connection is handled by the WebSocketContext
      // This thunk is mainly for state management
      return {
        conversationId,
        profileId,
      };
    } catch (error) {
      console.log("Error connecting to WebSocket:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Connection failed"
      );
    }
  }
);

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setConnectionInfo: (
      state,
      action: PayloadAction<{ conversationId: number; profileId: number }>
    ) => {
      state.connectionInfo = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.connected = false;
    },
    clearConnection: (state) => {
      state.connected = false;
      state.error = null;
      state.connectionInfo = null;
    },
    addMessage: (state, action: PayloadAction<string>) => {
      state.lastMessage = action.payload;
    },
    clearMessages: (state) => {
      state.lastMessage = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectSocket.pending, (state) => {
        state.error = null;
      })
      .addCase(connectSocket.fulfilled, (state, action) => {
        // Store connection info when successfully connected
        state.connectionInfo = action.payload;
        state.error = null;
      })
      .addCase(connectSocket.rejected, (state, action) => {
        state.connected = false;
        state.error = action.error.message || "Failed to connect to WebSocket";
      });
  },
});

export const {
  setConnected,
  setConnectionInfo,
  setError,
  clearConnection,
  addMessage,
  clearMessages,
} = socketSlice.actions;
export default socketSlice.reducer;
