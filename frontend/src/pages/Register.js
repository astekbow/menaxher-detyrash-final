// src/pages/Register.jsx
import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "../api";

export default function Register() {
  const [form, set] = useState({
    username: "",
    password: "",
    show: false,
  });
  const [busy, setBusy] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "" });

  const change = (e) => set({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setSnack({ open: true, message: "Fill both fields" });
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/auth/register", {
        username: form.username,
        password: form.password,
      });
      localStorage.setItem("token", data.token);
      window.location = "/";
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        "Registration error";
      setSnack({ open: true, message: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Sign up
      </Typography>

      <form onSubmit={submit}>
        <TextField
          name="username"
          label="Username"
          fullWidth
          margin="normal"
          value={form.username}
          onChange={change}
        />

        <TextField
          name="password"
          label="Password"
          type={form.show ? "text" : "password"}
          fullWidth
          margin="normal"
          value={form.password}
          onChange={change}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => set({ ...form, show: !form.show })}
                  edge="end"
                >
                  {form.show ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          fullWidth
          type="submit"
          disabled={busy}
          sx={{ mt: 2 }}
        >
          {busy ? "Creating account…" : "Register"}
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
