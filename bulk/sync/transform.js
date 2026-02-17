import { Decimal128, Long, Int32 } from "mongodb";

const convert = (value) => {
  if (!value) return value;

  // ObjectId
  if (value._bsontype === "ObjectId") {
    return value.toString();
  }

  // Decimal128 → number
  if (value instanceof Decimal128) {
    return parseFloat(value.toString());
  }

  // Long → number
  if (value instanceof Long) {
    return value.toNumber();
  }

  // Int32 → number
  if (value instanceof Int32) {
    return value.valueOf();
  }

  // Buffer → try number
  if (Buffer.isBuffer(value)) {
    const str = value.toString();
    const num = Number(str);
    return isNaN(num) ? str : num;
  }

  // Date
  if (value instanceof Date) return value;

  // Array
  if (Array.isArray(value)) return value.map(convert);

  // Object
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = {};

    for (const key in value) {
      if (key === "__v") continue;

      let val = convert(value[key]);

      // ✅ normalize twoFactorToken → keyword
      if (key === "twoFactorToken") {
        if (typeof val === "string") {
          obj[key] = val;
          continue;
        }

        if (val?.token) {
          obj[key] = String(val.token);
          continue;
        }

        obj[key] = null;
        continue;
      }

      obj[key] = val;
    }

    return obj;
  }

  return value;
};

export function transformDocument(doc) {
  const plain = doc.toObject ? doc.toObject() : doc;

  const { _id, __v, ...rest } = plain;

  const converted = convert(rest);

  return {
    id: _id.toString(),
    body: {
      ...converted,
      mongoId: _id.toString(),
    },
  };
}
