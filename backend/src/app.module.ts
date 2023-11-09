import { Module } from "@nestjs/common";
import { TypegooseModule } from "nestjs-typegoose";
import { AppController } from "./app.controller";
import { GeneExpression } from "./gene-expression.model";

@Module({
  imports: [
    TypegooseModule.forRoot(
      process.env.MONGO_URL || "mongodb://localhost:27017/via-scientific",
      {},
    ),
    TypegooseModule.forFeature([
      {
        typegooseClass: GeneExpression,
        schemaOptions: {
          autoIndex: true,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
