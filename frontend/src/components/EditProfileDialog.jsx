import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import axios from "axios";

export default function EditProfileDialog({ open, onClose, onSaved, user }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName, lastName: user.lastName, password: "" });
    }
  }, [user]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/auth/me`,
        { ...form },
        { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
      );
      onSaved();
    } catch (e) {
      console.error(e);
      alert("Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit profile</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            name="firstName"
            label="First name"
            value={form.firstName}
            onChange={change}
            required
          />
          <TextField
            name="lastName"
            label="Last name"
            value={form.lastName}
            onChange={change}
            required
          />
          <TextField
            name="password"
            label="New password"
            type="password"
            value={form.password}
            onChange={change}
            helperText="Leave blank to keep current password"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
