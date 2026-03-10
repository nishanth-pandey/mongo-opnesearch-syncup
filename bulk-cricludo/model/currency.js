/**
 * @fileoverview Currency Model - Currency configuration (likely deprecated).
 * 
 * **Purpose**: Stores currency information. Appears to be legacy code as
 * the app uses hardcoded coin/diamond system.
 * 
 * **Fields**:
 * - name: Currency name
 * - code: Currency code (e.g., USD, EUR)
 * - value: Currency value/exchange rate
 * 
 * **Status**: Likely deprecated in favor of hardcoded currency system
 */

const mongoose = require("mongoose");

/**
 * Currency Schema
 * 
 * **Note**: This model may not be actively used in current implementation.
 */
const currencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxLength: 100,
    },
    code: {
      type: String,
      maxLength: 100,
    },
    value: {
      type: String,
      maxLength: 100,
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } } // Enable timestamps 
);

module.exports = mongoose.model("Currency", currencySchema);
