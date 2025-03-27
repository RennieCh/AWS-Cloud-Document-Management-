import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  id: string | null;
  username: string | null;
  email: string | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  id: null,
  username: null,
  email: null,
  token: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signIn: (state, action) => {
      const { id, username, email, token } = action.payload;
      state.id = id;
      state.username = username;
      state.email = email;
      state.token = token;
      state.isAuthenticated = true;
    },
    signOut: (state) => {
      state.id = null;
      state.username = null;
      state.email = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { signIn, signOut } = userSlice.actions;
export default userSlice.reducer;
