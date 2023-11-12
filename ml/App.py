import os
import json
import pymongo
from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest
from bson import json_util

from pymongo import MongoClient
database_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017/via-scientific")
client = MongoClient(database_url)
db = client['via-scientific']
pd.set_option('display.max_rows', 500)


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/anomaly-detection')
@cross_origin()
def detect_anomalies():
    cursor = db.geneexpressions.find()
    df =  pd.DataFrame(list(cursor))    
    df_response = df.copy().drop(["_id"], axis=1)
    del df['_id']
    del df['sampleNames']

    # Extract each field of expressionValues to new columns
    df_normalized = pd.json_normalize(df['expressionValues'])
    del df_normalized["_id"]
    del df_normalized["createdAt"]
    del df_normalized["updatedAt"]
    del df["expressionValues"]
    del df["__v"]
    # Concatenate the new columns with the original dataframe
    df = pd.concat([df, df_normalized], axis=1)
    # Remove rows where all numeric columns are 0
    df = df[(df.iloc[:, 1:] != 0).any(axis=1)]

    
    fields = ['experRep1','experRep2','experRep3','controlRep1','controlRep2','controlRep3']

    model=IsolationForest()
    model.fit(df[fields])
    df['score'] = model.decision_function(df[fields])
    df['anomaly'] = model.predict(df[fields])

    df_anomaly = df[df['anomaly']==-1]
    df_anomaly = df_anomaly[df_anomaly['score'] < -0.1]
    df_anomaly = df_anomaly.drop([*fields, "anomaly"], axis=1)

    print(df_anomaly)

    df_response = pd.merge(df_anomaly, df_response, on='gene', how='inner')
    print(df_response)

    df_response_mapped = df_response.applymap(lambda x: str(x) if pd.api.types.is_object_dtype(x) else x)
    df_response_json = df_response_mapped.to_dict(orient='records')
    return json.loads(json_util.dumps(df_response_json))


if __name__ == '__main__':
   app.run(port=8000, debug=True)