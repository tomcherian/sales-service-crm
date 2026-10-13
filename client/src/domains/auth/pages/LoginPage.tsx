import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import LocalLaundryServiceOutlined from "@mui/icons-material/LocalLaundryServiceOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PRODUCT_NAME = "Sales Service CRM";

/** Left-hand brand panel. Purely decorative/presentational: nothing in it is focusable. */
function BrandPanel() {
  return (
    <Box
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        position: "relative",
        overflow: "hidden",
        p: { md: 6, lg: 8 },
        color: "primary.contrastText",
        // Stops at secondary.dark: white text on secondary.main fails WCAG AA.
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary.dark} 100%)`,
      })}
    >
      <Box
        aria-hidden
        sx={(theme) => ({
          position: "absolute",
          width: 420,
          height: 420,
          top: -140,
          right: -140,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.common.white, 0.06),
        })}
      />
      <Box
        aria-hidden
        sx={(theme) => ({
          position: "absolute",
          width: 280,
          height: 280,
          bottom: -100,
          left: -80,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.common.white, 0.04),
        })}
      />
      <Stack spacing={3} sx={{ position: "relative", maxWidth: 440 }}>
        <Box
          sx={(theme) => ({
            width: 72,
            height: 72,
            display: "grid",
            placeItems: "center",
            borderRadius: 1,
            bgcolor: alpha(theme.palette.common.white, 0.12),
          })}
        >
          <LocalLaundryServiceOutlined aria-hidden sx={{ fontSize: 44 }} />
        </Box>
        <Typography variant="h4" component="p">
          {PRODUCT_NAME}
        </Typography>
        <Typography variant="h6" component="p" sx={{ fontWeight: 400, opacity: 0.9 }}>
          Sales, customers and service in one place.
        </Typography>
      </Stack>
    </Box>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setShowPassword(false);
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch {
      setError("Unable to log in. Check your email and password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      <BrandPanel />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 6 },
          bgcolor: "background.paper",
        }}
      >
        <Stack
          component="form"
          spacing={2}
          onSubmit={submit}
          sx={{ width: "100%", maxWidth: 400 }}
        >
          {/* Compact brand header: only shown when the brand panel is hidden. */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              color: "primary.main",
            }}
          >
            <LocalLaundryServiceOutlined aria-hidden sx={{ fontSize: 32 }} />
            <Typography variant="h6" component="p" sx={{ fontWeight: 700 }}>
              {PRODUCT_NAME}
            </Typography>
          </Stack>
          <Typography variant="h5" component="h1">
            Welcome back
          </Typography>
          <Typography color="text.secondary">
            Sign in to your account to continue.
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            fullWidth
            required
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            fullWidth
            required
            slotProps={{
              // Once revealed as type="text", keep spellcheck and mobile
              // autocorrect/auto-capitalise away from the password.
              htmlInput: {
                spellCheck: false,
                autoCapitalize: "none",
                autoCorrect: "off",
              },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      edge="end"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((shown) => !shown)}
                      // Keep focus (and the caret) in the password input on click.
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
