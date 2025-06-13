import React, { useState } from "react";
import {
  TextField, Button, Container, Typography, Snackbar, IconButton, InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "../api";

export default function Login() {
  const [values, set] = useState({ username: "", password: "", show: false });
  const [busy, setBusy] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "" });

  const handle = (e) => set({ ...values, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!values.username || !values.password) {
      setSnack({ open: true, message: "Please fill both fields" });
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/auth/login", {
        username: values.username,
        password: values.password,
      });
      localStorage.setItem("token", data.token);
      window.location = "/";
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Invalid credentials";
      setSnack({ open: true, message: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Sign in
      </Typography>

      <form onSubmit={submit}>
        <TextField
          name="username"
          label="Username"
          fullWidth
          margin="normal"
          value={values.username}
          onChange={handle}
        />
        <TextField
          name="password"
          label="Password"
          type={values.show ? "text" : "password"}
          fullWidth
          margin="normal"
          value={values.password}
          onChange={handle}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => set({ ...values, show: !values.show })}>
                  {values.show ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          type="submit"
          fullWidth
          disabled={busy}
          sx={{ mt: 2 }}
        >
          {busy ? "Signing in…" : "Login"}
        </Button>
      </form>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ open: false, message: "" })}
        message={snack.message}
      />
    </Container>
  );
}
