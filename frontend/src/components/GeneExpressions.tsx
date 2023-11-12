import SearchIcon from "@mui/icons-material/Search";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import logo from "../assets/logo.svg";
import useDebounce from "../utils/useDebounce";

import { GitHub } from "@mui/icons-material";
import {
  useAnomalyDetection,
  useGeneExpressions,
  useSeedSampleData,
} from "../utils/api";
import GeneExpressionsTable from "./GeneExpressionsTable";

export default function Content() {
  const [activeTab, setActiveTab] = useState<"all" | "anomaly">("all");

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const allDataQuery = useGeneExpressions({
    search: debouncedSearchQuery,
  });
  const anomalyDataQuery = useAnomalyDetection({
    enabled: activeTab === "anomaly",
  });

  const totalItemCount =
    activeTab === "all"
      ? allDataQuery.data?.pages?.[0]?.total
      : anomalyDataQuery.data?.length;

  const geneExpressions =
    activeTab === "all"
      ? allDataQuery.data?.pages.flatMap(({ items }) => items)
      : anomalyDataQuery.data;

  const isLoading = allDataQuery.isFetching || anomalyDataQuery.isLoading;

  return (
    <Container maxWidth="xl">
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
              disabled={activeTab === "anomaly"}
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
        <Tabs value={activeTab} onChange={(_e, value) => setActiveTab(value)}>
          <Tab value="all" label="All Data" />
          <Tab value="anomaly" label="Anomaly Detection" />
        </Tabs>
        <GeneExpressionsTable
          rows={geneExpressions || []}
          showingItemCount={geneExpressions?.length || 0}
          totalItemCount={totalItemCount || 0}
          isLoading={isLoading}
          onScrollEnd={() => {
            if (activeTab === "all") {
              allDataQuery.fetchNextPage();
            }
          }}
          activeTab={activeTab}
        />
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
