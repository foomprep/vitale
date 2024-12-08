import MacroInfo from "../types/MacroInfo";
import MacrosByServing from "../types/MacrosByServing";
import ProductResponse from "../types/ProductResponse";

export const getFoodItemByUpc = async (upc: string): Promise<any> => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${upc}?fields=brands,categories_tags,code,image_url,product_name,nutriments,quantity`
    );
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Product with UPC ${upc} not found.`);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching nutrition info:', error);
    throw error;
  }
};

/**
 * Search for products in Open Food Facts database by name
 * @param {string} searchQuery - Product name to search for
 * @param {Object} options - Search options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.pageSize - Results per page (default: 24)
 * @param {string} options.locale - Locale for results (default: 'world')
 * @returns {Promise<Object>} Search results with products and pagination info
 */
export const searchFoodItemByText = async (searchQuery: string, options = {}) => {
  const {
    page = 1,
    pageSize = 24,
    locale = 'world'
  } = options;

  // Encode the search query for URL
  const encodedQuery = encodeURIComponent(searchQuery);
  
  // Construct the search URL
  const url = `https://${locale}.openfoodfacts.org/cgi/search.pl?` + 
    `search_terms=${encodedQuery}&` +
    `search_simple=1&` +
    `action=process&` +
    `json=true&` +
    `page=${page}&` +
    `page_size=${pageSize}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    // Transform the response into a more friendly format
    return {
      count: data.count,
      page: data.page,
      pageSize: data.page_size,
      totalPages: Math.ceil(data.count / data.page_size),
      products: data.products.map(product => ({
        id: product._id,
        name: product.product_name || 'Unknown Product',
        brand: product.brands || null,
        image: product.image_url || null,
        quantity: product.quantity || null,
        categories: product.categories_tags || [],
        nutriments: {
          calories: product.nutriments['energy-kcal_100g'] || 0,
          protein: product.nutriments.proteins_100g || 0,
          carbs: product.nutriments.carbohydrates_100g || 0,
          fat: product.nutriments.fat_100g || 0,
          fiber: product.nutriments.fiber_100g || 0
        }
      }))
    };
  } catch (error) {
    throw new Error(
      `Failed to search products: ${error.message}`
    );
  }
}

/**
 * Parses a serving size string to extract the amount and unit
 * @param servingSize - Serving size string (e.g., "100 g", "1 cup (240 ml)")
 * @returns Object containing amount and unit
 */
function parseServingSize(servingSize: string): { amount: number; unit: string } {
  // Remove parenthetical content
  const cleanServing = servingSize.replace(/\([^)]*\)/g, '').trim();
  
  // Extract number and unit
  const match = cleanServing.match(/^([\d.]+)\s*([a-zA-Z]+)?/);
  
  if (!match) {
    throw new Error(`Unable to parse serving size: ${servingSize}`);
  }

  return {
    amount: parseFloat(match[1]),
    unit: (match[2] || 'g').toLowerCase()
  };
}

/**
 * Converts a serving amount to grams if necessary
 * @param amount - The amount to convert
 * @param unit - The unit to convert from
 * @returns Amount in grams
 */
function convertToGrams(amount: number, unit: string): number {
  const conversions: { [key: string]: number } = {
    g: 1,
    kg: 1000,
    mg: 0.001,
    oz: 28.3495,
    lb: 453.592,
    ml: 1, // Assuming density of 1g/ml for simplicity
    l: 1000,
  };

  const conversionFactor = conversions[unit.toLowerCase()];
  if (!conversionFactor) {
    throw new Error(`Unsupported unit: ${unit}`);
  }

  return amount * conversionFactor;
}

/**
 * Calculates macros based on a specific serving amount
 * @param product - Product response from OpenFoodFacts API
 * @param servingAmount - Amount to calculate macros for
 * @param servingUnit - Unit of the serving amount (default: 'g')
 * @returns Calculated macros for the specified serving amount
 */
export function calculateMacrosByServing(
  productResponse: ProductResponse,
  servingAmount: number,
  servingUnit: string = 'g'
): MacrosByServing {
  const { product } = productResponse;
  const { nutriments } = product;

  // Convert serving amount to grams for calculation
  const amountInGrams = convertToGrams(servingAmount, servingUnit);
  
  // Calculate the ratio for scaling nutrients (per 100g to actual serving)
  const ratio = amountInGrams / 100;

  // Calculate scaled macros, rounding to 1 decimal place
  const scaledMacros = {
    calories: Math.round(nutriments['energy-kcal_100g'] * ratio * 10) / 10,
    protein: Math.round(nutriments.proteins_100g * ratio * 10) / 10,
    carbs: Math.round(nutriments.carbohydrates_100g * ratio * 10) / 10,
    fat: Math.round(nutriments.fat_100g * ratio * 10) / 10,
    fiber: Math.round(nutriments.fiber_100g * ratio * 10) / 10,
  };

  return {
    servingInfo: {
      amount: servingAmount,
      unit: servingUnit,
      originalServingSize: product.serving_size || null,
    },
    product: {
      name: product.product_name || 'Unknown Product',
      brand: product.brands || null,
    },
    macros: scaledMacros,
  };
}

class ProductNotFoundError extends Error {
  constructor(upc: string) {
    super(`Product not found for UPC: ${upc}`);
    this.name = 'ProductNotFoundError';
  }
}

/**
 * Fetches macro nutritional information for a given UPC barcode from Open Food Facts API
 * @param upc - The UPC barcode number
 * @returns Promise containing the macro nutritional information
 * @throws {ProductNotFoundError} When the product is not found
 * @throws {Error} When there's an API error or network issue
 */
export async function getMacros(upc: string): Promise<MacroInfo> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${upc}.json`
    );

    console.log(response);
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json() as ProductResponse;

    if (data.status !== 1) {
      throw new ProductNotFoundError(upc);
    }

    const { product } = data;
    const { nutriments } = product;

    return {
      productName: product.product_name || 'Unknown Product',
      servingSize: product.serving_size || null,
      brand: product.brands || null,
      macros: {
        calories: Math.round(nutriments['energy-kcal_100g'] * 100) / 100,
        protein: Math.round(nutriments.proteins_100g * 100) / 100,
        carbs: Math.round(nutriments.carbohydrates_100g * 100) / 100,
        fat: Math.round(nutriments.fat_100g * 100) / 100,
        fiber: Math.round(nutriments.fiber_100g * 100) / 100,
      },
    };
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      throw error;
    }
    throw new Error(
      `Failed to fetch product information: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
