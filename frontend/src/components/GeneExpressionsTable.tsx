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
import { GeneExpression, useGeneExpressions } from "../utils/api";
import GeneExpressionsTableRow from "./GeneExpressionsTableRow";

type GeneExpressionsTableProps = {
  rows: GeneExpression[];
  geneExpressionsQuery: ReturnType<typeof useGeneExpressions>;
};
const GeneExpressionsTable = ({
  rows,
  geneExpressionsQuery,
}: GeneExpressionsTableProps) => {
  const { isFetching, fetchNextPage, data, geneExpressions } =
    geneExpressionsQuery;

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollingEl = scrollContainerRef.current;
      if (scrollingEl && !isFetching) {
        const { offsetHeight, scrollTop, scrollHeight } = scrollingEl;
        if (offsetHeight + scrollTop >= scrollHeight) {
          fetchNextPage();
        }
        return;
      }
    };

    const scrollingEl = scrollContainerRef.current;
    scrollingEl?.addEventListener("scroll", handleScroll);
    return () => scrollingEl?.removeEventListener("scroll", handleScroll);
  }, [isFetching, fetchNextPage]);

  const totalItemCount = data?.pages?.[0]?.total;
  const showingItemCount = geneExpressions.length;
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
                Showing {showingItemCount} of {totalItemCount} items
              </Typography>
            </TableCell>
            <TableCell align="center" colSpan={3} sx={{ mr: 3 }}>
              Experiment
            </TableCell>
            <TableCell width={8} sx={{ border: 0 }} />
            <TableCell align="center" colSpan={3}>
              Control
            </TableCell>
            <TableCell sx={{ border: 0 }} />
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
            <TableCell sx={sx} />
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <GeneExpressionsTableRow key={row.gene} row={row} />
          ))}
        </TableBody>
      </Table>
      {isFetching && (
        <Stack justifyContent="center" alignItems="center" py={8}>
          <CircularProgress size={48} />
        </Stack>
      )}
    </TableContainer>
  );
};

export default GeneExpressionsTable;
