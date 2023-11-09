import { Severity, index, modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: { timestamps: true },
})
export class GeneExpressionValues {
  _id: false;

  @prop({ required: true })
  experRep1: number;

  @prop({ required: true })
  experRep2: number;

  @prop({ required: true })
  experRep3: number;

  @prop({ required: true })
  controlRep1: number;

  @prop({ required: true })
  controlRep2: number;

  @prop({ required: true })
  controlRep3: number;
}

@index({ gene: 1 }, { unique: true })
export class GeneExpression {
  @prop({ required: true })
  gene: string;

  @prop({ required: true })
  sampleNames: string[];

  @prop({ required: true })
  expressionValues: GeneExpressionValues;
}
