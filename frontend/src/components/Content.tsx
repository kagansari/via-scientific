import SearchIcon from "@mui/icons-material/Search";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import logo from "../assets/logo.svg";
import useDebounce from "../utils/useDebounce";

import { useGeneExpressions, useSeedSampleData } from "../utils/api";
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
          <Stack direction="row" alignItems="center" gap={8}>
            <SeedDataButton />
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
          </Stack>
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

// ------------------------------------------------

const SeedDataButton = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { mutate, isPending } = useSeedSampleData({
    onSuccess: (data) => {
      let message = `${data.insertedCount} items inserted`;
      let variant: "success" | "error" = "success";
      if (data.errorCount) {
        message += `, ${data.errorCount} items failed`;
        variant = "error";
      }

      enqueueSnackbar(<Typography variant="body1">{message}</Typography>, {
        variant,
      });
    },
  });

  return (
    <Tooltip
      title="Read mock data samples_demo.tsv and import sample gene expressions to database"
      placement="bottom"
    >
      <LoadingButton
        variant="contained"
        color="info"
        onClick={() => mutate()}
        loading={isPending}
      >
        Seed Data
      </LoadingButton>
    </Tooltip>
  );
};
