export function transformDocument(doc) {
  const { _id, ...rest } = doc;

  return {
    id: _id.toString(),
    body: {
      ...rest,
      mongoId: _id.toString(),
    },
  };
}
