import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, Stack
} from "@mui/material";
import axios from "axios";

const blank = {
  title: "", description: "", priority: "Low",
  status: "To Do", deadline: "", tags: ""
};

export default function TaskDialog({ open, onClose, onSaved, task }) {
  // if task == null ➜ Add  |  else ➜ Edit
  const [form, setForm]   = useState(blank);
  const [saving, setSaving]= useState(false);

  // populate form when editing
  useEffect(() => {
    if (task) {
      setForm({
        ...task,
        tags: task.tags?.join(", ") ?? ""
      });
    } else {
      setForm(blank);
    }
  }, [task]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const body = {
        ...form,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      const url  = `${process.env.REACT_APP_API_URL}/api/tasks` +
                   (task ? "/" + task._id : "");
      const method = task ? "put" : "post";
      await axios[method](url, body, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      onSaved();           // notify parent
    } catch (err) {
      console.error(err);
      alert("Failed to save task");
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField name="title" label="Title" required
            value={form.title} onChange={change} autoFocus />
          <TextField name="description" label="Description"
            value={form.description} onChange={change}
            multiline rows={3} />
          <Stack direction="row" spacing={2}>
            <TextField select fullWidth name="priority" label="Priority"
              value={form.priority} onChange={change}>
              {["Low","Medium","High"].map(p=>(
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
            <TextField select fullWidth name="status" label="Status"
              value={form.status} onChange={change}>
              {["To Do","In Progress","Done"].map(s=>(
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField name="deadline" label="Deadline"
            type="date" InputLabelProps={{shrink:true}}
            value={form.deadline} onChange={change} />
          <TextField name="tags" label="Tags (comma separated)"
            value={form.tags} onChange={change} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={save} variant="contained" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
