import "./App.css";
import { Button } from "./Button";
import { Stack, Typography } from "@mui/material";

function App() {
  return (
    <div className="shared-playground">
      <Stack spacing={4} alignItems="center" sx={{ mt: 4 }}>
        <div>
          <h1>Hibinka Shared Components</h1>
          <p>Здесь можно тестировать общие компоненты</p>
        </div>

        <Stack spacing={2} alignItems="center">
          <Typography variant="h6">Buttons</Typography>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary">
              Primary
            </Button>
            <Button variant="contained" color="secondary">
              Secondary
            </Button>
            <Button variant="outlined">Outline</Button>
            <Button variant="text">Ghost</Button>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button isLoading>Loading</Button>
            <Button rounded>Rounded</Button>
            <Button size="large">Large</Button>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
}

export default App;
