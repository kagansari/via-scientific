import { Module } from "@nestjs/common";
import { TypegooseModule } from "nestjs-typegoose";
import { AppController } from "./app.controller";
import { GeneExpression } from "./gene-expression.model";

@Module({
  imports: [
    TypegooseModule.forRoot("mongodb://localhost:27017/via-scientific", {
      //   useNewUrlParser: true,
    }),
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
