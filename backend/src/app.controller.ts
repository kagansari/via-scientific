import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { DocumentType, ReturnModelType } from "@typegoose/typegoose";
import * as fs from "fs";
import { InjectModel } from "nestjs-typegoose";
import * as path from "path";
import { GeneExpression } from "./gene-expression.model";
import { pipeline } from "stream/promises";
import { Stream } from "stream";

function calculateMean(values: number[]) {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function calculateMedian(values: number[]) {
  if (values.length === 0) return 0;
  values.sort((a, b) => a - b);
  const middle = Math.floor(values.length / 2);
  if (values.length % 2 === 0) {
    return (values[middle - 1] + values[middle]) / 2;
  } else {
    return values[middle];
  }
}

function calculateVariance(values: number[]) {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDifferences = values.map((value) => Math.pow(value - mean, 2));
  const sumOfSquaredDifferences = squaredDifferences.reduce(
    (acc, value) => acc + value,
    0,
  );
  return sumOfSquaredDifferences / values.length;
}

export type GeneExpressionsQueryResult = {
  items: GeneExpression[];
  total: number;
  page: number;
};

class GeneExpressionStatistics {
  mean: number;
  median: number;
  variance: number;
}

class GeneExpressionAnalysis {
  geneExpression: GeneExpression;
  exper: GeneExpressionStatistics;
  control: GeneExpressionStatistics;
}

@Controller()
export class AppController {
  constructor(
    @InjectModel(GeneExpression)
    private readonly geneExpressionModel: ReturnModelType<
      typeof GeneExpression
    >,
  ) {}

  @Post("seed")
  async seed() {
    const csvFileStream = fs.createReadStream(
      path.join(__dirname, "../test/simple_demo.tsv"),
    );

    const result = {
      insertedCount: 0,
      errorCount: 0,
    };

    await this.geneExpressionModel.deleteMany();

    await pipeline(
      csvFileStream,
      new Stream.Writable({
        write: async (chunk, _encoding, next) => {
          const rows = chunk.toString().split("\n");

          const geneExpressions: DocumentType<GeneExpression>[] = [];

          rows.forEach((row, index) => {
            if (row.trim() === "" || index === 0) return;

            const [
              gene,
              transcript,
              exper_rep1,
              exper_rep2,
              exper_rep3,
              control_rep1,
              control_rep2,
              control_rep3,
            ] = row.split("\t");

            const geneExpression = new this.geneExpressionModel({
              gene,
              sampleNames: transcript?.split(",") || [],
              expressionValues: {
                experRep1: Number(exper_rep1 || 0),
                experRep2: Number(exper_rep2 || 0),
                experRep3: Number(exper_rep3 || 0),
                controlRep1: Number(control_rep1 || 0),
                controlRep2: Number(control_rep2 || 0),
                controlRep3: Number(control_rep3 || 0),
              },
            });
            geneExpressions.push(geneExpression);
          });

          try {
            await this.geneExpressionModel.bulkSave(geneExpressions);

            result.insertedCount += rows.length;
          } catch (error) {
            console.error(
              `${error.result?.result?.writeErrors?.length} errors while inserting documents`,
            );
            result.insertedCount += error.result?.insertedCount;
            result.errorCount += error.result?.result?.writeErrors?.length;
          }
          console.log(
            "result.insertedCount",
            result.insertedCount,
            "rows.length: ",
            rows.length,
          );

          next();
        },
      }),
    );

    return result;
  }

  @Get("retrieve")
  async retrieve(
    @Query("geneIDs") geneIDs: string | string[],
  ): Promise<GeneExpression[]> {
    // if (!geneIDs) {
    //   throw new BadRequestException("geneId is required");
    // }
    const genes = Array.isArray(geneIDs) ? geneIDs : [geneIDs];

    const geneExpressions = await this.geneExpressionModel.find({
      gene: {
        $in: genes,
      },
    });

    if (geneExpressions.length !== genes.length) {
      const foundGenes = geneExpressions.map((g) => g.gene);
      const errorGenes = genes.filter((x) => !foundGenes.includes(x));
      throw new BadRequestException(
        `${errorGenes.length} of ${genes.length} genes not found: ` +
          `'${errorGenes.join("','")}'`,
      );
    }

    return geneExpressions;
  }

  @Get("list")
  async list(
    @Query("search") search: string,
    @Query("page") page: number,
  ): Promise<GeneExpressionsQueryResult> {
    const query = search
      ? {
          gene: new RegExp(`^${search}`),
        }
      : undefined;

    const geneExpressions = await this.geneExpressionModel
      .find(query)
      .skip(100 * (page - 1))
      .limit(100);
    const total = await this.geneExpressionModel.find(query).count();

    return {
      items: geneExpressions,
      total,
      page: Number(page),
    };
  }

  @Get("analyze/:gene")
  async analyze(@Param("gene") gene: string): Promise<GeneExpressionAnalysis> {
    const geneExpression = await this.geneExpressionModel.findOne({
      gene,
    });
    if (!geneExpression) {
      throw new BadRequestException("Gene not found");
    }

    const {
      experRep1,
      experRep2,
      experRep3,
      controlRep1,
      controlRep2,
      controlRep3,
    } = geneExpression.expressionValues;
    const experValues = [experRep1, experRep2, experRep3];
    const controlValues = [controlRep1, controlRep2, controlRep3];

    const experMean = calculateMean(experValues);
    const experMedian = calculateMedian(experValues);
    const experVariance = calculateVariance(experValues);

    const controlMean = calculateMean(controlValues);
    const controlMedian = calculateMedian(controlValues);
    const controlVariance = calculateVariance(controlValues);

    return {
      geneExpression,
      exper: {
        mean: Math.round(experMean * 100) / 100,
        median: Math.round(experMedian * 100) / 100,
        variance: Math.round(experVariance * 100) / 100,
      },
      control: {
        mean: Math.round(controlMean * 100) / 100,
        median: Math.round(controlMedian * 100) / 100,
        variance: Math.round(controlVariance * 100) / 100,
      },
    };
  }
}
