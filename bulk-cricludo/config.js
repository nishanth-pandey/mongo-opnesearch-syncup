export const env = {
  mongo: {
    stag: {
      uri: "mongodb://dev_user:Gd444HRFqY57dBmP@dev-cluster-docdb.cluster-cl84m6k0wx28.eu-west-2.docdb.amazonaws.com:27017/circludo?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=primary&retryWrites=false&authMechanism=SCRAM-SHA-1",
      db: "circludo",
    },
    prod: {
      uri: "mongodb://dev_user:Gd444HRFqY57dBmP@my-db-cluster.cluster-cl84m6k0wx28.eu-west-2.docdb.amazonaws.com:27017/circludo?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=primary&retryWrites=false&authMechanism=SCRAM-SHA-1",
      db: "circludo",
    },
  },

  opensearchNode:
    "https://search-mongo-sync-stage-sfz22jrapp725sj7ux7etgiq44.eu-west-2.es.amazonaws.com",

  opensearchUser: "Devloper",
  opensearchPass: "Devloper@0703",

  indexName: "cricludo_analytics",

  bulkSize: 1000,
};
