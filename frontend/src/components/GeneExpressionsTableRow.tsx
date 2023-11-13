import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { useLayoutEffect, useState } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { GeneExpression, useGeneExpressionAnalysis } from "../utils/api";

const nf = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type GeneExpressionsTableRowProps = {
  row: GeneExpression;
  activeTab?: "all" | "anomaly";
};
const GeneExpressionsTableRow = ({
  row,
  activeTab,
}: GeneExpressionsTableRowProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow>
        <TableCell>
          <b>{row.gene}</b>
        </TableCell>
        <TableCell
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 200,
          }}
        >
          <Tooltip
            title={row.sampleNames.join(", ")}
            placement="top-start"
            sx={{ maxWidth: 200 }}
          >
            <span>{row.sampleNames.join(", ")}</span>
          </Tooltip>
        </TableCell>
        <TableCell align="right">
          {nf.format(row.expressionValues.experRep1)}
        </TableCell>
        <TableCell align="right">
          {nf.format(row.expressionValues.experRep2)}
        </TableCell>
        <TableCell align="right">
          {nf.format(row.expressionValues.experRep3)}
        </TableCell>
        <TableCell align="right" />
        <TableCell align="right">
          {nf.format(row.expressionValues.controlRep1)}
        </TableCell>
        <TableCell align="right">
          {nf.format(row.expressionValues.controlRep2)}
        </TableCell>
        <TableCell align="right">
          {nf.format(row.expressionValues.controlRep3)}
        </TableCell>
        {activeTab === "anomaly" && (
          <TableCell align="right">{nf.format(row.score || 0)}</TableCell>
        )}

        <TableCell align="right">
          <Button
            variant="text"
            color="secondary"
            onClick={() => setOpen(!open)}
          >
            Analyze
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ p: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ px: 3, py: 1, background: "white" }}>
              <GeneExpressionAnalysisContent row={row} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
export default GeneExpressionsTableRow;

// ----------------------------------------------------

const GeneExpressionAnalysisContent = ({
  row,
}: GeneExpressionsTableRowProps) => {
  const { isLoading, data } = useGeneExpressionAnalysis(row.gene);
  if (isLoading) {
    return (
      <Stack justifyContent="center" alignItems="center" py={8}>
        <CircularProgress size={48} />
      </Stack>
    );
  }

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Table sx={{ maxWidth: 460 }} size="small">
        <TableHead>
          <TableRow>
            <TableCell align="right" colSpan={2}>
              Experiment Analysis
            </TableCell>
            <TableCell width={3} sx={{ border: 0 }} />
            <TableCell align="right" colSpan={2}>
              Control Analysis
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "& td": { border: 0 } }}>
            <TableCell align="right" variant="footer">
              Mean:
            </TableCell>
            <TableCell align="right" variant="head">
              {nf.format(data?.exper.mean ?? 0)}
            </TableCell>
            <TableCell />
            <TableCell align="right" variant="footer">
              Mean:
            </TableCell>
            <TableCell align="right" variant="head">
              {nf.format(data?.control.mean ?? 0)}
            </TableCell>
          </TableRow>
          <TableRow sx={{ "& td": { border: 0 } }}>
            <TableCell align="right" variant="footer">
              Median:
            </TableCell>
            <TableCell align="right" variant="head">
              {nf.format(data?.exper.median ?? 0)}
            </TableCell>
            <TableCell />
            <TableCell align="right" variant="footer">
              Median:
            </TableCell>
            <TableCell align="right" variant="head">
              {nf.format(data?.control.median ?? 0)}
            </TableCell>
          </TableRow>
          <TableRow sx={{ "& td": { border: 0 } }}>
            <TableCell align="right" variant="footer">
              Variance:
            </TableCell>
            <TableCell align="right" variant="head">
              {nf.format(data?.exper.variance ?? 0)}
            </TableCell>
            <TableCell />
            <TableCell align="right" variant="footer">
              Variance:
            </TableCell>
            <TableCell align="right" variant="head">
              {nf.format(data?.control.variance ?? 0)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <GeneExpressionChart row={row} />
    </Stack>
  );
};

// ----------------------------------------------------

const GeneExpressionChart = ({ row }: GeneExpressionsTableRowProps) => {
  useLayoutEffect(() => {
    const root = am5.Root.new(`chart-${row.gene}`);
    root.setThemes([am5themes_Animated.new(root)]);

    const data = [
      {
        rep: "Rep 1",
        experimentRep: row.expressionValues.experRep1,
        controlRep: row.expressionValues.controlRep1,
      },
      {
        rep: "Rep 2",
        experimentRep: row.expressionValues.experRep2,
        controlRep: row.expressionValues.controlRep2,
      },
      {
        rep: "Rep 3",
        experimentRep: row.expressionValues.experRep3,
        controlRep: row.expressionValues.controlRep3,
      },
    ];

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        paddingTop: 60,
      })
    );

    chart.get("colors")?.set("step", 2);

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 50,
    });
    xRenderer.grid.template.setAll({
      location: 1,
    });
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "rep",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraMax: 0.1,
        extraMin: 0.1,
        renderer: am5xy.AxisRendererY.new(root, {
          strokeOpacity: 0.1,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    const experimentSeries = chart.series.push(
      am5xy.SmoothedXLineSeries.new(root, {
        name: "Experiment",
        calculateAggregates: true,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "experimentRep",
        categoryXField: "rep",
        tooltip: am5.Tooltip.new(root, {
          labelText: "Experiment: {valueY}",
        }),
      })
    );
    const controlSeries = chart.series.push(
      am5xy.SmoothedXLineSeries.new(root, {
        name: "Control",
        calculateAggregates: true,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "controlRep",
        categoryXField: "rep",
        tooltip: am5.Tooltip.new(root, {
          labelText: "Control: {valueY}",
        }),
      })
    );

    experimentSeries.strokes.template.setAll({
      strokeWidth: 4,
    });
    controlSeries.strokes.template.setAll({
      strokeWidth: 4,
    });

    chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
        xAxis: xAxis,
        yAxis: yAxis,
      })
    );

    const legend = chart.plotContainer.children.push(
      am5.Legend.new(root, {
        y: -30,
      })
    );
    legend.data.setAll(chart.series.values);

    experimentSeries.data.setAll(data);
    controlSeries.data.setAll(data);
    xAxis.data.setAll(data);

    experimentSeries.appear(1000);
    experimentSeries.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [row]);

  return (
    <div
      id={`chart-${row.gene}`}
      style={{ width: "500px", height: "240px" }}
    ></div>
  );
};
