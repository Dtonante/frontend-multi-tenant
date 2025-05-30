
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, CardMedia, TextField,  Button, Typography, Alert, CircularProgress, useMediaQuery,  useTheme, Grid,  MenuItem,  Select, InputLabel,  FormControl } from "@mui/material";
import showSuccessAlert from "../components/alerts/showSuccessAlert";

const URI_CREATE_USER = "http://localhost:3000/api/v1/Tenant/users";
const URI_LIST_TENANTS = "http://localhost:3000/api/v1/Tenant"; 

const CreateUsers = () => {
  const [name_user, setName_user] = useState("");
  const [cellPhoneNumber, setCellPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState(""); 
  const [tenants, setTenants] = useState([]); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));


  useEffect(() => {
    // Obtener la lista de tenants
    const fetchTenants = async () => {
      try {
        const response = await axios.get(URI_LIST_TENANTS);
        setTenants(response.data.tenants); // Guardar los tenants en el estado
      } catch (err) {
        setError("Error al obtener los tenants");
      }
    };

    fetchTenants();
  }, []);

   const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return "La contraseña debe tener al menos 8 caracteres.";
    if (!hasUpperCase) return "La contraseña debe contener al menos una letra mayúscula.";
    if (!hasLowerCase) return "La contraseña debe contener al menos una letra minúscula.";
    if (!hasNumber) return "La contraseña debe contener al menos un número.";
    if (!hasSpecialChar) return "La contraseña debe contener al menos un carácter especial.";

    return null;
  };

  const handleCreateUser = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  // Validar campos vacíos
  if (!name_user || !tenantId || !cellPhoneNumber || !password) {
    setError("Todos los campos son obligatorios.");
    setLoading(false);
    return;
  }

  // Validar contraseña
  const passwordError = validatePassword(password);
  if (passwordError) {
    setError(passwordError);
    setLoading(false);
    return;
  }

  try {
    const response = await axios.post(URI_CREATE_USER, {
      name_user,
      tenant_id: tenantId,
      cellPhoneNumber,
      password,
    });

    if (response.status === 201) {
      const { email } = response.data.user;

      // Mostrar alerta con email y contraseña generada
      await showSuccessAlert(email, password);

      // Redirigir al inicio o login
      navigate("/");
    }

  } catch (err) {
    console.error("Error al crear usuario:", err.response?.data || err.message);
    setError(err.response?.data?.message || "Error al crear usuario");
    setPassword(""); 
  } finally {
    setLoading(false);
  }
};


  // const handleCreateUser = async (e) => {
  //   e.preventDefault();
  //   setError(null);
  //   setLoading(true);

  //   try {
  //     const plainPassword = password;

  //     const response = await axios.post(URI_CREATE_USER, {
  //       name_user,
  //       tenant_id: tenantId, 
  //       cellPhoneNumber,
  //       password: plainPassword,
  //     });

  //     if (response.status === 201) {
  //       const { email } = response.data.user;
  
  //       await showSuccessAlert(email, plainPassword);
  //       navigate("/");
  //     }
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Error al crear usuario");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
        backgroundColor: "#2c2c2c",
      }}
    >
      <Card
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          maxWidth: isMobile ? 400 : 1000,
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            padding: isMobile ? 3 : 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: isMobile ? "100%" : "60%",
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
            Crear Usuario
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleCreateUser} sx={{ mt: 1 }}>
            {/* Input para seleccionar el tenant */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="tenant-select-label">Seleccionar Tenant</InputLabel>
              <Select
                labelId="tenant-select-label"
                id="tenant-select"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                label="Seleccionar Tenant"
                required
              >
                {tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.name_tenant}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              label="Nombre"
              value={name_user}
              onChange={(e) => setName_user(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Teléfono"
              value={cellPhoneNumber}
              onChange={(e) => setCellPhoneNumber(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="success"
              disabled={loading}
              sx={{ py: 1.5, mt: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Crear Usuario"}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/")}
              sx={{ mt: 2 }}
            >
              Volver al login
            </Button>
          </Box>
        </CardContent>

        <CardMedia
          component="img"
          image="/Timezy.jpg"
          alt="Barbería fondo"
          sx={{
            flex: 1,
            objectFit: "cover",
            minHeight: isMobile ? 200 : 500,
            order: isMobile ? -1 : 1,
            width: isMobile ? "100%" : 540,
          }}
        />
      </Card>
    </Box>
  );
};

export default CreateUsers;
