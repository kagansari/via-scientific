import { Test, TestingModule } from "@nestjs/testing";
import { getMockFileStream } from "../test/helpers";
import { AppController } from "./app.controller";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
    jest
      .spyOn(appController, "getFileStream")
      .mockImplementation(getMockFileStream);
  });

  describe("Via Scientific API", () => {
    it("should list gene expressions", async () => {
      const result = await appController.evaluation();
      expect(result).toStrictEqual(mockResultSingleUrl);
    });

    it("should analyze given gene expression ", async () => {
      const result = await appController.evaluation();
      expect(result).toStrictEqual(mockResultMultiUrl);
    });

    it("should get gene expresssinos", async () => {
      const result = await appController.evaluation();
      expect(result).toStrictEqual(mockResultMultiUrl);
    });
  });
});
