import React, { useEffect, useState, useRef } from "react";
import {
  Container, Grid, Card, CardContent, Typography, Box, Avatar, IconButton,
  Divider, CircularProgress, Chip, Snackbar, Tooltip, Button, Skeleton, Paper
} from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";
import EditIcon      from "@mui/icons-material/Edit";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import axios  from "axios";
import dayjs  from "dayjs";
import EditProfileDialog from "../components/EditProfileDialog";

/* ------------------------------------------------------------------ */
/* helper to compute task progress %                                   */
/* ------------------------------------------------------------------ */
const pct = (done, total) => (total === 0 ? 0 : Math.round((done / total) * 100));

export default function Profile() {
  const [user,   setUser]   = useState(null);
  const [stats,  setStats]  = useState({ total: 0, done: 0 });
  const [state,  setState]  = useState("loading");   // 'loading' | 'error' | 'ready'
  const [snack,  setSnack]  = useState({ open:false, message:"" });
  const [openEdit,setOpenEdit]= useState(false);
  const fileInput = useRef(null);

  /* ---------------- Fetch user + tasks ---------------- */
  const fetchData = async () => {
    setState("loading");
    try {
      const hdr = { headers:{ Authorization:"Bearer "+localStorage.getItem("token") } };
      const [{data:me},{data:tasks}] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, hdr),
        axios.get(`${process.env.REACT_APP_API_URL}/api/tasks`,   hdr),
      ]);
      if (!me) throw new Error("No user payload");
      setUser(me);
      setStats({ total: tasks.length, done: tasks.filter(t=>t.status==="Done").length });
      setState("ready");
    } catch (e) {
      console.error(e);
      setState("error");
    }
  };
  useEffect(()=>{ fetchData(); },[]);

  /* ---------------- Avatar upload ---------------- */
  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const fd=new FormData(); fd.append("avatar",file);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/avatar`,
        fd,
        {
          headers:{
            Authorization:"Bearer "+localStorage.getItem("token"),
            "Content-Type":"multipart/form-data",
          },
        }
      );
      setSnack({open:true,message:"Avatar updated"});
      fetchData();
    } catch (err) {
      console.error(err);
      setSnack({open:true,message:"Avatar upload failed"});
    }
  };

  /* ==================== 3 UI STATES ==================== */

  /* ---------- 1. LOADING (skeleton) ---------- */
  if (state === "loading") {
    return (
      <Container sx={{ py:4, maxWidth:600 }}>
        <Skeleton variant="rectangular" height={140} sx={{ borderRadius:2, mb:2 }} />
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius:2 }} />
      </Container>
    );
  }

  /* ---------- 2. ERROR (empty-state) ---------- */
  if (state === "error") {
    return (
      <Container sx={{ py:10, textAlign:"center" }}>
        <Paper elevation={0} sx={{ p:4 }}>
          <ErrorOutline color="error" sx={{ fontSize:56, mb:2 }}/>
          <Typography variant="h6" gutterBottom>
            Unable to load your profile
          </Typography>
          <Typography color="text.secondary" sx={{ mb:3 }}>
            We couldn’t retrieve your data. Check your connection or try again.
          </Typography>
          <Button variant="contained" onClick={fetchData}>Try again</Button>
        </Paper>
      </Container>
    );
  }

  /* ---------- 3. READY (main profile) ---------- */
  const progress = pct(stats.done, stats.total);

  return (
    <Container sx={{ py:4 }}>
      <Grid container spacing={3} justifyContent="center">
        {/* ====== Profile Card ====== */}
        <Grid item xs={12} md={7}>
          <Card elevation={2}>
            <Box
              sx={{
                height:120,
                background:"linear-gradient(135deg, rgba(3,155,229,0.7) 0%, rgba(0,188,212,0.7) 100%)",
              }}
            />
            <CardContent sx={{ pt:0 }}>
              <Box sx={{ display:"flex", alignItems:"center", mt:-8 }}>
                <Box sx={{ position:"relative" }}>
                  <Avatar
                    src={user.avatarUrl || undefined}
                    sx={{ width:96, height:96, border:"4px solid white" }}
                  >
                    {user.firstName?.[0]}
                  </Avatar>
                  <IconButton
                    size="small"
                    sx={{
                      position:"absolute", bottom:0, right:0,
                      bgcolor:"background.paper",
                    }}
                    onClick={()=>fileInput.current?.click()}
                  >
                    <CameraAltIcon fontSize="small"/>
                  </IconButton>
                  <input hidden ref={fileInput} type="file" accept="image/*" onChange={uploadAvatar}/>
                </Box>

                <Box sx={{ ml:3, flexGrow:1 }}>
                  <Typography variant="h5" sx={{ fontWeight:600 }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography color="text.secondary">@{user.username}</Typography>
                </Box>

                <Tooltip title="Edit profile">
                  <IconButton onClick={()=>setOpenEdit(true)}><EditIcon/></IconButton>
                </Tooltip>
              </Box>

              <Divider sx={{ my:3 }}/>

              <Typography><strong>Email:</strong> {user.email}</Typography>
              <Typography sx={{ mt:1 }}>
                <strong>Member since:</strong> {dayjs(user.createdAt).format("DD MMM YYYY")}
              </Typography>

              <Box sx={{ display:"flex", gap:2, mt:3 }}>
                <Chip label={`Tasks: ${stats.total}`} color="primary"/>
                <Chip label={`Done: ${stats.done}`}  color="success"/>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ====== Progress Donut ====== */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ p:3, textAlign:"center" }}>
            <Typography variant="h6" gutterBottom>Completion</Typography>
            <Box sx={{ position:"relative", display:"inline-flex", mb:1 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={150}
                thickness={5}
                sx={{ color:"grey.300" }}
              />
              <CircularProgress
                variant="determinate"
                value={progress}
                size={150}
                thickness={5}
                color={progress >= 100 ? "success" : "primary"}
                sx={{ position:"absolute", left:0 }}
              />
              <Box
                sx={{
                  top:0, left:0, bottom:0, right:0, position:"absolute",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}
              >
                <Typography variant="h4" component="div">
                  {progress}%
                </Typography>
              </Box>
            </Box>
            <Typography color="text.secondary">
              {stats.done} of {stats.total} tasks completed
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* ---------- Edit dialog ---------- */}
      <EditProfileDialog
        open={openEdit}
        onClose={()=>setOpenEdit(false)}
        onSaved={()=>{ setOpenEdit(false); fetchData(); }}
        user={user}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={()=>setSnack({open:false,message:""})}
        message={snack.message}
      />
    </Container>
  );
}
