import connection from "../configs/snowflake.js";
import * as adminSQL from "../models/admin-SQL.json";

export interface Product {
  PRODUCT_ID: number;
  PRODUCT: string;
  IS_ACTIVE: boolean;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface ProductInput {
  PRODUCT: string;
  IS_ACTIVE?: boolean;
}

export interface Term {
  TERM_DETAILS_ID: number;
  TERM_DETAILS_VALUE: string;
  IS_ACTIVE: boolean;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface TermInput {
  TERM_DETAILS_VALUE: string;
}

class AdminService {
  async getAllProducts(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: adminSQL.getAllProducts,
          binds: [],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in getAllProducts:", err);
              reject(err);
            } else {
              resolve(rows || []);
            }
          },
        });
      });
    });
  }

  async getProductById(id: number): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: adminSQL.getProductById,
          binds: [id],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in getProductById:", err);
              reject(err);
            } else {
              resolve(rows && rows.length > 0 ? rows[0] : null);
            }
          },
        });
      });
    });
  }

  async createProduct(productData: ProductInput): Promise<Product> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: adminSQL.createProduct,
          binds: [productData.PRODUCT],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in createProduct:", err);
              reject(err);
            } else {
              // Get the created product by fetching the last inserted record
              clientConnection.execute({
                sqlText: "SELECT PRODUCT_ID, PRODUCT, IS_ACTIVE, CREATED_AT, UPDATED_AT FROM DB_DEV_HARMONIZED.POC.PRODUCT WHERE PRODUCT_ID = (SELECT MAX(PRODUCT_ID) FROM DB_DEV_HARMONIZED.POC.PRODUCT)",
                binds: [],
                complete: (err2: Error | null, stmt2: any, rows2: any[]) => {
                  if (err2) {
                    console.error("Error fetching created product:", err2);
                    reject(err2);
                  } else {
                    resolve(rows2[0]);
                  }
                },
              });
            }
          },
        });
      });
    });
  }

  async updateProduct(id: number, productData: ProductInput): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: adminSQL.updateProduct,
          binds: [productData.PRODUCT, productData.IS_ACTIVE ?? true, id],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in updateProduct:", err);
              reject(err);
            } else {
              // Fetch the updated product
              clientConnection.execute({
                sqlText: adminSQL.getProductById,
                binds: [id],
                complete: (err2: Error | null, stmt2: any, rows2: any[]) => {
                  if (err2) {
                    console.error("Error fetching updated product:", err2);
                    reject(err2);
                  } else {
                    resolve(rows2 && rows2.length > 0 ? rows2[0] : null);
                  }
                },
              });
            }
          },
        });
      });
    });
  }

  async deleteProduct(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: adminSQL.deleteProduct,
          binds: [id],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in deleteProduct:", err);
              reject(err);
            } else {
              resolve(true);
            }
          },
        });
      });
    });
  }

  async toggleProductStatus(id: number, isActive: boolean): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: adminSQL.toggleProductStatus,
          binds: [isActive, id],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in toggleProductStatus:", err);
              reject(err);
            } else {
              // Fetch the updated product
              clientConnection.execute({
                sqlText: adminSQL.getProductById,
                binds: [id],
                complete: (err2: Error | null, stmt2: any, rows2: any[]) => {
                  if (err2) {
                    console.error("Error fetching toggled product:", err2);
                    reject(err2);
                  } else {
                    resolve(rows2 && rows2.length > 0 ? rows2[0] : null);
                  }
                },
              });
            }
          },
        });
      });
    });
  }

  async getAllTerms(): Promise<Term[]> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: adminSQL.getAllTerms,
          binds: [],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in getAllTerms:", err);
              reject(err);
            } else {
              resolve(rows);
            }
          },
        });
      });
    });
  }

  async getTermById(id: number): Promise<Term | null> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: adminSQL.getTermById,
          binds: [id],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in getTermById:", err);
              reject(err);
            } else {
              resolve(rows && rows.length > 0 ? rows[0] : null);
            }
          },
        });
      });
    });
  }

  async createTerm(termData: TermInput): Promise<Term> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: adminSQL.createTerm,
          binds: [termData.TERM_DETAILS_VALUE],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in createTerm:", err);
              reject(err);
            } else {
              // Get the created term by fetching the last inserted record
              clientConnection.execute({
                sqlText: "SELECT TERM_DETAILS_ID, TERM_DETAILS_VALUE, IS_ACTIVE, CREATED_AT, UPDATED_AT FROM DB_DEV_HARMONIZED.POC.TERM_DETAILS WHERE TERM_DETAILS_ID = (SELECT MAX(TERM_DETAILS_ID) FROM DB_DEV_HARMONIZED.POC.TERM_DETAILS)",
                binds: [],
                complete: (err2: Error | null, stmt2: any, rows2: any[]) => {
                  if (err2) {
                    console.error("Error fetching created term:", err2);
                    reject(err2);
                  } else {
                    resolve(rows2[0]);
                  }
                },
              });
            }
          },
        });
      });
    });
  }

  async updateTerm(id: number, termData: TermInput & { IS_ACTIVE: boolean }): Promise<Term | null> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: adminSQL.updateTerm,
          binds: [termData.TERM_DETAILS_VALUE, termData.IS_ACTIVE, id],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in updateTerm:", err);
              reject(err);
            } else {
              // Fetch the updated term
              clientConnection.execute({
                sqlText: adminSQL.getTermById,
                binds: [id],
                complete: (err2: Error | null, stmt2: any, rows2: any[]) => {
                  if (err2) {
                    console.error("Error fetching updated term:", err2);
                    reject(err2);
                  } else {
                    resolve(rows2 && rows2.length > 0 ? rows2[0] : null);
                  }
                },
              });
            }
          },
        });
      });
    });
  }

  async deleteTerm(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: adminSQL.deleteTerm,
          binds: [id],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in deleteTerm:", err);
              reject(err);
            } else {
              resolve(true);
            }
          },
        });
      });
    });
  }

  async toggleTermStatus(id: number, isActive: boolean): Promise<Term | null> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: adminSQL.toggleTermStatus,
          binds: [isActive, id],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in toggleTermStatus:", err);
              reject(err);
            } else {
              // Fetch the updated term
              clientConnection.execute({
                sqlText: adminSQL.getTermById,
                binds: [id],
                complete: (err2: Error | null, stmt2: any, rows2: any[]) => {
                  if (err2) {
                    console.error("Error fetching toggled term:", err2);
                    reject(err2);
                  } else {
                    resolve(rows2 && rows2.length > 0 ? rows2[0] : null);
                  }
                },
              });
            }
          },
        });
      });
    });
  }
}

export default new AdminService();