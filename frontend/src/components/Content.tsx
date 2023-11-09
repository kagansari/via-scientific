import SearchIcon from "@mui/icons-material/Search";
import {
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import logo from "../assets/logo.svg";
import useDebounce from "../utils/useDebounce";
import { useGeneExpressions } from "../utils/api";
import GeneExpressionsTable from "./GeneExpressionsTable";

export default function Content() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const geneExpressionsQuery = useGeneExpressions({
    search: debouncedSearchQuery,
  });
  const { isLoading, data, geneExpressions } = geneExpressionsQuery;

  return (
    <Container maxWidth="lg">
      <Stack direction="row" justifyContent="space-between" py={2}>
        <img src={logo} alt="Via Scientific Logo" width={200} />
        <Paper sx={{ px: 3, py: 1, borderRadius: 3 }}>
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="standard"
            label="Gene"
            sx={{ minWidth: 250 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>
      </Stack>
      <Paper
        sx={{
          mt: 3,
          background: "rgba(255,255,255, 0.95)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {isLoading && (
          <Stack justifyContent="center" alignItems="center" py={8}>
            <CircularProgress size={48} />
          </Stack>
        )}
        {data && (
          <GeneExpressionsTable
            rows={geneExpressions}
            geneExpressionsQuery={geneExpressionsQuery}
          />
        )}
      </Paper>
    </Container>
  );
}
