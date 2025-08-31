import connection from "../configs/snowflake.js";
import * as contactsSQL from "../models/contacts-SQL.json";

export interface Contact {
  CONTACT_ID: number;
  FIRST_NAME: string;
  LAST_NAME: string;
  EMAIL?: string;
  PHONE?: string;
  DATE_OF_BIRTH?: string;
  AGE?: number;
  GENDER?: string;
  JURISDICTION?: string;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface ContactInput {
  FIRST_NAME: string;
  LAST_NAME: string;
  EMAIL?: string;
  PHONE?: string;
  DATE_OF_BIRTH?: string;
  AGE?: number;
  GENDER?: string;
  JURISDICTION?: string;
}

export interface BusinessType {
  BUSINESS_TYPE_ID: number;
  BUSINESS_NAME: string;
  IS_ACTIVE: boolean;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface ProductType {
  PRODUCT_TYPE_ID: number;
  PRODUCT_NAME: string;
  IS_ACTIVE: boolean;
  CREATED_AT: string;
  UPDATED_AT: string;
}

// Get all contacts
export async function getAllContacts(): Promise<Contact[]> {
  return new Promise((resolve, reject) => {
    connection.use(async (clientConnection: any) => {
      clientConnection.execute({
        sqlText: contactsSQL.getAllContacts,
        binds: [],
        complete: (err: Error | null, stmt: any, rows: any[]) => {
          if (err) {
            console.error("Error in getAllContacts:", err);
            reject(err);
          } else {
            resolve(rows || []);
          }
        },
      });
    });
  });
}

// Get contact by ID
export async function getContactById(
  contactId: number
): Promise<Contact | null> {
  return new Promise((resolve, reject) => {
    connection.use(async (clientConnection: any) => {
      clientConnection.execute({
        sqlText: contactsSQL.getContactById,
        binds: [contactId],
        complete: (err: Error | null, stmt: any, rows: any[]) => {
          if (err) {
            console.error("Error in getContactById:", err);
            reject(err);
          } else {
            resolve(rows && rows.length > 0 ? rows[0] : null);
          }
        },
      });
    });
  });
}

// Create new contact
export async function createContact(
  contactData: ContactInput
): Promise<Contact> {
  return new Promise((resolve, reject) => {
    connection.use(async (clientConnection: any) => {
      clientConnection.execute({
        sqlText: contactsSQL.createContact,
        binds: [
          contactData.FIRST_NAME,
          contactData.LAST_NAME,
          contactData.EMAIL || null,
          contactData.PHONE || null,
          contactData.DATE_OF_BIRTH || null,
          contactData.AGE || null,
          contactData.GENDER || null,
          contactData.JURISDICTION || null,
        ],
        complete: (err: Error | null, stmt: any, rows: any[]) => {
          if (err) {
            console.error("Error in createContact:", err);
            reject(err);
          } else {
            resolve(rows[0]);
          }
        },
      });
    });
  });
}

// Update contact
export async function updateContact(
  contactId: number,
  contactData: Partial<ContactInput>
): Promise<Contact> {
  return new Promise((resolve, reject) => {
    connection.use(async (clientConnection: any) => {
      clientConnection.execute({
        sqlText: contactsSQL.updateContact,
        binds: [
          contactData.FIRST_NAME,
          contactData.LAST_NAME,
          contactData.EMAIL,
          contactData.PHONE,
          contactData.DATE_OF_BIRTH,
          contactData.AGE,
          contactData.GENDER,
          contactData.JURISDICTION,
          contactId,
        ],
        complete: (err: Error | null, stmt: any, rows: any[]) => {
          if (err) {
            console.error("Error in updateContact:", err);
            reject(err);
          } else {
            resolve(rows[0]);
          }
        },
      });
    });
  });
}

// Delete contact
export async function deleteContact(contactId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.use(async (clientConnection: any) => {
      clientConnection.execute({
        sqlText: contactsSQL.deleteContact,
        binds: [contactId],
        complete: (err: Error | null, stmt: any, rows: any[]) => {
          if (err) {
            console.error("Error in deleteContact:", err);
            reject(err);
          } else {
            resolve();
          }
        },
      });
    });
  });
}

export async function getAllBusinessTypes(): Promise<BusinessType[]> {
  return new Promise((resolve, reject) => {
    console.log("=== getAllBusinessTypes Debug Start ===");
    console.log("SQL Query:", contactsSQL.getAllBusinessTypes);

    connection.use(async (clientConnection: any) => {
      clientConnection.execute({
        sqlText: contactsSQL.getAllBusinessTypes,
        binds: [],
        complete: (err: Error | null, stmt: any, rows: any[]) => {
          console.log("=== Query Execution Complete ===");
          console.log("Error:", err);
          console.log("Business Types rows returned:", rows ? rows.length : 0);

          if (err) {
            console.error("Error in getAllBusinessTypes:", err);
            reject(err);
          } else {
            console.log("Resolving with business types:", rows);
            resolve(rows || []);
          }
        },
      });
    });
  });
}

export async function getAllProductTypes(): Promise<ProductType[]> {
  return new Promise((resolve, reject) => {
    console.log("=== getAllProductTypes Debug Start ===");
    console.log("SQL Query:", contactsSQL.getAllProductTypes);

    connection.use(async (clientConnection: any) => {
      clientConnection.execute({
        sqlText: contactsSQL.getAllProductTypes,
        binds: [],
        complete: (err: Error | null, stmt: any, rows: any[]) => {
          console.log("=== Query Execution Complete ===");
          console.log("Error:", err);
          console.log("Product Types rows returned:", rows ? rows.length : 0);

          if (err) {
            console.error("Error in getAllProductTypes:", err);
            reject(err);
          } else {
            console.log("Resolving with product types:", rows);
            resolve(rows || []);
          }
        },
      });
    });
  });
}