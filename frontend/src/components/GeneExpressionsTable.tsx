import {
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useRef } from "react";
import { GeneExpression } from "../utils/api";
import GeneExpressionsTableRow from "./GeneExpressionsTableRow";

type GeneExpressionsTableProps = {
  rows: GeneExpression[];
  activeTab: "all" | "anomaly";
  showingItemCount: number;
  totalItemCount: number;
  onScrollEnd: () => void;
  isLoading?: boolean;
};
const GeneExpressionsTable = ({
  rows,
  showingItemCount,
  totalItemCount,
  onScrollEnd,
  isLoading,
  activeTab,
}: GeneExpressionsTableProps) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollingEl = scrollContainerRef.current;
      if (scrollingEl && !isLoading) {
        const { offsetHeight, scrollTop, scrollHeight } = scrollingEl;
        if (offsetHeight + scrollTop >= scrollHeight) {
          onScrollEnd();
        }
        return;
      }
    };

    const scrollingEl = scrollContainerRef.current;
    scrollingEl?.addEventListener("scroll", handleScroll);
    return () => scrollingEl?.removeEventListener("scroll", handleScroll);
  }, [isLoading, onScrollEnd]);

  const sx = { top: 37 }; // https://github.com/mui/material-ui/issues/23090
  return (
    <TableContainer
      sx={{ maxHeight: "calc(100vh - 220px)" }}
      ref={scrollContainerRef}
    >
      <Table
        size="small"
        sx={{ minWidth: 650, whiteSpace: "nowrap" }}
        stickyHeader
      >
        <TableHead>
          <TableRow>
            <TableCell colSpan={2} sx={{ border: 0 }}>
              <Typography variant="caption">
                Showing {showingItemCount} of {totalItemCount} items{" "}
              </Typography>
              {activeTab === "anomaly" && (
                <Typography variant="caption">
                  {" (Isolation Forest score < - 0.1)"}
                </Typography>
              )}
            </TableCell>
            <TableCell align="center" colSpan={3} sx={{ mr: 3 }}>
              Experiment
            </TableCell>
            <TableCell width={8} sx={{ border: 0 }} />
            <TableCell align="center" colSpan={3}>
              Control
            </TableCell>
            <TableCell sx={{ border: 0 }} colSpan={2} />
          </TableRow>
          <TableRow>
            <TableCell sx={sx}>Gene</TableCell>
            <TableCell sx={sx}>Transcript</TableCell>
            <TableCell sx={sx} align="right">
              Rep 1
            </TableCell>
            <TableCell sx={sx} align="right">
              Rep 2
            </TableCell>
            <TableCell sx={sx} align="right">
              Rep 3
            </TableCell>
            <TableCell sx={sx} />
            <TableCell sx={sx} align="right">
              Rep 1
            </TableCell>
            <TableCell sx={sx} align="right">
              Rep 2
            </TableCell>
            <TableCell sx={sx} align="right">
              Rep 3
            </TableCell>
            {activeTab === "anomaly" && (
              <TableCell sx={sx} align="right">
                Score
              </TableCell>
            )}
            <TableCell sx={sx} />
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <GeneExpressionsTableRow
              key={row.gene}
              row={row}
              activeTab={activeTab}
            />
          ))}
        </TableBody>
      </Table>
      {isLoading && (
        <Stack justifyContent="center" alignItems="center" py={8}>
          <CircularProgress size={48} />
        </Stack>
      )}
    </TableContainer>
  );
};

export default GeneExpressionsTable;
