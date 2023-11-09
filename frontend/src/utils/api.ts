import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export class GeneExpressionValues {
  experRep1!: number;
  experRep2!: number;
  experRep3!: number;
  controlRep1!: number;
  controlRep2!: number;
  controlRep3!: number;
}

export class GeneExpression {
  gene!: string;
  sampleNames!: string[];
  expressionValues!: GeneExpressionValues;
}

export type GeneExpressionsQueryResult = {
  items: GeneExpression[];
  total: number;
  page: number;
};

export type GeneExpressionStatistics = {
  mean: number;
  median: number;
  variance: number;
};

export type GeneExpressionAnalysis = {
  geneExpression: GeneExpression;
  exper: GeneExpressionStatistics;
  control: GeneExpressionStatistics;
};

const sleep = (ms = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const getGeneExpressions = async ({
  page = 1,
  search = "",
}): Promise<GeneExpressionsQueryResult> => {
  await sleep(1000);
  const url = new URL(`/list`, API_URL);
  url.searchParams.append("search", search);
  url.searchParams.append("page", String(page));
  return axios.get(url.href).then((res) => res.data);
};

const analyzeGeneExpression = async (
  gene: string
): Promise<GeneExpressionAnalysis> => {
  await sleep(1000);
  return axios.get(`${API_URL}/analyze/${gene}`).then((res) => res.data);
};

export const useGeneExpressions = ({ search = "" }) => {
  const infiniteQuery = useInfiniteQuery({
    queryKey: ["geneExpressions", search],
    queryFn: ({ pageParam }) => getGeneExpressions({ page: pageParam, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      console.log("lastPage", lastPage);
      if (lastPage.page * 100 < lastPage.total) {
        return Number(lastPage.page) + 1;
      }
    },
    refetchOnWindowFocus: false,
  });

  return {
    ...infiniteQuery,
    geneExpressions:
      infiniteQuery.data?.pages.flatMap(({ items }) => items) || [],
  };
};

export const useGeneExpressionAnalysis = (gene: string) => {
  const query = useQuery({
    queryKey: ["geneAnalysis", gene],
    queryFn: () => analyzeGeneExpression(gene),
  });

  return query;
};
