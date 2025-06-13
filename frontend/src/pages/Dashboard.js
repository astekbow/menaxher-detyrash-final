// src/pages/Dashboard.jsx
console.log("✅ Dashboard v2 loaded");

import React, { useEffect, useState } from "react";
import {
  Container, Typography, Grid, Card, CardContent, CardActions,
  IconButton, Chip, Snackbar, Tooltip, Box, CircularProgress,
  Fab, TextField, MenuItem
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Label as LabelIcon,
  Today as TodayIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import api from "../api";
import TaskDialog from "../components/TaskDialog";
import { useLocation, useNavigate } from "react-router-dom";

/* ----- helpers ------ */
const border = { Low: "#9e9e9e", Medium: "#0288d1", High: "#d32f2f" };
const chipS  = { "To Do": "default", "In Progress": "warning", Done: "success" };
const chipP  = { Low: "default", Medium: "info", High: "error" };
const isOverdue = (t) =>
  t.deadline && new Date(t.deadline) < new Date() && t.status !== "Done";

export default function Dashboard() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack]     = useState({ open: false, message: "" });
  const [openAdd, setOpenAdd] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter]   = useState({ text: "", status: "All", priority: "All" });

  const location = useLocation();
  const navigate = useNavigate();

  /* fetch */
  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch {
      setSnack({ open: true, message: "Fetch failed" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchTasks(); }, []);

  /* deep-link “+” */
  useEffect(() => {
    if (location.state?.add) {
      setOpenAdd(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  /* drag reorder (client-only) */
  const onDragEnd = (res) => {
    if (!res.destination) return;
    const copy = [...tasks];
    const [mov] = copy.splice(res.source.index, 1);
    copy.splice(res.destination.index, 0, mov);
    setTasks(copy);
  };

  /* delete */
  const del = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setSnack({ open: true, message: "Task deleted" });
      fetchTasks();
    } catch {
      setSnack({ open: true, message: "Delete failed" });
    }
  };

  /* mark done / undone */
  const toggleDone = (t) =>
    api
      .put(`/tasks/${t._id}`, { status: t.status === "Done" ? "To Do" : "Done" })
      .then(fetchTasks);

  /* filtering */
  const visible = tasks.filter((t) => {
    const txt = filter.text.toLowerCase();
    const txtMatch =
      t.title.toLowerCase().includes(txt) ||
      t.description?.toLowerCase().includes(txt);
    const statMatch =
      filter.status === "All" || t.status === filter.status;
    const prioMatch =
      filter.priority === "All" || t.priority === filter.priority;
    return txtMatch && statMatch && prioMatch;
  });

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Menaxher Detyrash
      </Typography>

      {/* ----- filter bar ----- */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h6">
          {visible.length}/{tasks.length} tasks
        </Typography>

        <TextField
          label="Search"
          size="small"
          value={filter.text}
          onChange={(e) => setFilter({ ...filter, text: e.target.value })}
        />

        <TextField
          label="Status"
          size="small"
          select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          sx={{ width: 140 }}
        >
          {["All", "To Do", "In Progress", "Done"].map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Priority"
          size="small"
          select
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          sx={{ width: 140 }}
        >
          {["All", "Low", "Medium", "High"].map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* ----- body ----- */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress size={48} />
        </Box>
      )}

      {!loading && visible.length === 0 && (
        <Typography>No tasks match your filters.</Typography>
      )}

      {!loading && visible.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(drop) => (
              <Grid
                container
                spacing={2}
                ref={drop.innerRef}
                {...drop.droppableProps}
              >
                {visible.map((t, i) => (
                  <Draggable key={t._id} draggableId={t._id} index={i}>
                    {(drag) => (
                      <Grid
                        item
                        xs={12}
                        md={6}
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        {...drag.dragHandleProps}
                      >
                        <Card
                          elevation={isOverdue(t) ? 6 : 2}
                          sx={{ borderLeft: `6px solid ${border[t.priority]}` }}
                        >
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {t.title}
                            </Typography>

                            {t.description && (
                              <Typography
                                variant="body2"
                                sx={{ mb: 1 }}
                                color="text.secondary"
                              >
                                {t.description}
                              </Typography>
                            )}

                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                flexWrap: "wrap",
                              }}
                            >
                              <Chip
                                size="small"
                                label={t.status}
                                color={chipS[t.status]}
                              />
                              <Chip
                                size="small"
                                label={t.priority}
                                color={chipP[t.priority]}
                              />
                              {t.tags?.map((tag) => (
                                <Chip
                                  key={tag}
                                  size="small"
                                  label={tag}
                                  icon={<LabelIcon fontSize="inherit" />}
                                  variant="outlined"
                                />
                              ))}
                              {t.deadline && (
                                <Tooltip
                                  title={new Date(
                                    t.deadline
                                  ).toLocaleString()}
                                >
                                  <Chip
                                    size="small"
                                    label={new Date(
                                      t.deadline
                                    ).toLocaleDateString()}
                                    icon={<TodayIcon />}
                                    color={isOverdue(t) ? "error" : "default"}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </CardContent>

                          <CardActions>
                            <IconButton onClick={() => toggleDone(t)}>
                              <CheckIcon
                                color={t.status === "Done" ? "success" : "disabled"}
                              />
                            </IconButton>
                            <IconButton onClick={() => setEditTask(t)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => del(t._id)}>
                              <DeleteIcon />
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    )}
                  </Draggable>
                ))}
                {drop.placeholder}
              </Grid>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* FAB */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={() => setOpenAdd(true)}
      >
        <AddIcon />
      </Fab>

      {/* dialogs */}
      <TaskDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSaved={() => {
          setOpenAdd(false);
          fetchTasks();
        }}
        task={null}
      />
      <TaskDialog
        open={Boolean(editTask)}
        onClose={() => setEditTask(null)}
        onSaved={() => {
          setEditTask(null);
          fetchTasks();
        }}
        task={editTask}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ open: false, message: "" })}
        message={snack.message}
      />
    </Container>
  );
}
