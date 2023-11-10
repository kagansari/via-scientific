import SearchIcon from "@mui/icons-material/Search";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  CircularProgress,
  Container,
  IconButton,
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
import { GitHub } from "@mui/icons-material";

export default function Content() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const geneExpressionsQuery = useGeneExpressions({
    search: debouncedSearchQuery,
  });
  const { isLoading, data, geneExpressions } = geneExpressionsQuery;

  return (
    <Container maxWidth="lg">
      <Stack
        direction="row"
        justifyContent="space-between"
        py={2}
        flexWrap="wrap"
        gap={3}
      >
        <img src={logo} alt="Via Scientific Logo" width={200} />
        <Paper sx={{ px: 3, py: 1, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" gap={1}>
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
            <Box minWidth={32} flexGrow={1} />
            <SeedDataButton />
            <a
              href="https://github.com/kagansari/via-scientific"
              target="_blank"
            >
              <IconButton>
                <GitHub />
              </IconButton>
            </a>
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
  const { data } = useGeneExpressions({});

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

  const disabled = (data?.pages?.[0]?.total ?? 0) > 30000;

  return (
    <Tooltip
      title={
        disabled
          ? "Mock data samples_demo.tsv is already impoorted"
          : "Reads mock data samples_demo.tsv and imports sample gene expressions to database"
      }
      placement="bottom"
    >
      <Box>
        <LoadingButton
          variant="contained"
          color="info"
          onClick={() => mutate()}
          loading={isPending}
          disabled={disabled}
        >
          Import Data
        </LoadingButton>
      </Box>
    </Tooltip>
  );
};
