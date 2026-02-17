// import dotenv from "dotenv";

// dotenv.config();

// function required(name) {
//   if (!process.env[name]) {
//     throw new Error(`Missing required env var: ${name}`);
//   }
//   return process.env[name];
// }

export const env = {
  mongo: {
    stag: {
      uri: "mongodb://dev_user:Gd444HRFqY57dBmP@dev-cluster-docdb.cluster-cl84m6k0wx28.eu-west-2.docdb.amazonaws.com:27017/ProToStag?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=primary&retryWrites=false&authMechanism=SCRAM-SHA-1",
      db: "ProdToStag",
    },
    prod: {
      uri: "mongodb://localhost:27017",
      db: "prod_db",
    },
  },
  opensearchNode:
    "https://search-mongo-sync-stage-sfz22jrapp725sj7ux7etgiq44.eu-west-2.es.amazonaws.com",
  opensearchUser: "Admin",
  opensearchPass: "Admin@123",

  bulkSize: 1000,
};
