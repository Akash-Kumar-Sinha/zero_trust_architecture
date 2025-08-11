import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Conversation } from "@/utils/type";
import { USER_SERVER_URL } from "@/utils/constant";
import axios from "axios";

interface ConversationsState {
  activeConversation: Conversation | null;
  loading: boolean;
  error: string | null;
}

const initialState: ConversationsState = {
  activeConversation: null,
  loading: false,
  error: null,
};

export const getConversations = createAsyncThunk(
  "conversation/getConversation",
  async ({
    userOneUsername,
    userTwoUsername,
  }: {
    userOneUsername: string;
    userTwoUsername: string;
  }) => {
    const { data } = await axios.get(`${USER_SERVER_URL}/get_conversation`, {
      params: {
        user_one_username: userOneUsername,
        user_two_username: userTwoUsername,
      },
    });
    console.log("Fetched conversation data:", data);
    return data;
  }
);

export const conversationsSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setActiveConversation: (
      state,
      action: PayloadAction<Conversation | null>
    ) => {
      state.activeConversation = action.payload;
      state.error = null;
    },
    clearActiveConversation: (state) => {
      state.activeConversation = null;
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
      .addCase(getConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success) {
          state.activeConversation = action.payload.conversation || null;
        } else {
          state.error = "Failed to fetch conversation";
        }
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch conversation";
      });
  },
});

export const {
  setActiveConversation,
  clearActiveConversation,
  setError,
  clearError,
} = conversationsSlice.actions;

export default conversationsSlice.reducer;
