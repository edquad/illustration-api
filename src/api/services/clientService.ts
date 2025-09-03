import connection from "../configs/snowflake.js";
import * as clientSQL from "../models/client-SQL.json";

interface Client {
  id?: number;
  first_name: string;
  last_name: string;
  gender: string;
  birthday: string;
  state: string;
  premium: string;
  phone_number: string;
  email: string;
  first_term: number;
  second_term: number;
  tax_qualification: string;
  withdrawal_type: string;
  withdrawal_amount: string;
  withdrawal_from_year: number;
  withdrawal_to_year: number;
  frequency?: number;
  glwb?: boolean;
  glwb_activation_age?: number;
  joint_indicator?: string;
}

// Add CLIENT_INFO interface
interface ClientInfo {
  CLIENT_ID?: number;
  ILLUSTRATION_ID?: string;
  AGENT_NAME?: string;
  ILLUSTRATION_DATE?: string;
  FIRST_NAME: string;
  MIDDLE_NAME?: string;
  LAST_NAME: string;
  FULL_NAME?: string;
  EMAIL?: string;
  PREMIUM?: string;
  FIRST_TERM?: string;
  SECOND_TERM?: string;
  TAX_QUALIFICATION?: string;
  WITHDRAWAL_TYPE?: string;
  WITHDRAWAL_AMOUNT?: string;
  WITHDRAWAL_FROM_YEAR?: number;
  WITHDRAWAL_TO_YEAR?: number;
  WITHDRAWAL_FREQUENCY?: string;
  PHONE?: string;
  DATE_OF_BIRTH?: string;
  AGE?: number;
  GENDER?: string;
  SALUTATION?: string;
  SUFFIX?: string;
  SSN_TAX_ID?: string;
  RESIDENCE_ADDRESS?: string;
  STATE?: string;
  JURISDICTION?: string;
  CREATED_AT?: string;
  UPDATED_AT?: string;
}

interface TermDetail {
  TERM_DETAILS_ID: number;
  TERM_DETAILS_VALUE: string;
  IS_ACTIVE: boolean;
  CREATED_AT: string;
  UPDATED_AT: string;
}
interface TaxQualificationDetail {
  TAX_QUALIFICATION_ID: number;
  TAX_QUALIFICATION_VALUE: string;
  IS_ACTIVE: boolean;
  CREATED_AT: string;
  UPDATED_AT: string;
}
interface WithdrawalTypeDetail {
  WITHDRAWAL_TYPE_ID: number;
  WITHDRAWAL_TYPE_VALUE: string;
  IS_ACTIVE: boolean;
  CREATED_AT: string;
  UPDATED_AT: string;
}
interface StateProductAvailability {
  STATE_CODE: string;
  FIA: boolean;
  MYGA: boolean;
  BUSINESS_TYPE_ID: number;
  PRODUCT_TYPE_ID: number;
  IS_AVAILABLE: boolean;
  CREATED_AT: string;
  UPDATED_AT: string;
}

interface FiaAllocationDetail {
  FIA_ALLOCATION_ID: number;
  FIA_ALLOCATION_VALUE: string;
  IS_ACTIVE: boolean;
  CREATED_AT: string;
  UPDATED_AT: string;
}

class ClientService {
  private clients: Client[] = []; // In-memory storage (replace with database)
  private nextId = 1;

  async getAllClients(): Promise<Client[]> {
    return this.clients;
  }

  async getClientById(id: number): Promise<Client | null> {
    const client = this.clients.find((c) => c.id === id);
    return client || null;
  }

  async createClient(clientData: Client): Promise<Client> {
    const newClient: Client = {
      ...clientData,
      id: this.nextId++,
      frequency: clientData.frequency || 12,
    };

    this.clients.push(newClient);
    return newClient;
  }

  async updateClient(id: number, clientData: Client): Promise<Client | null> {
    const index = this.clients.findIndex((c) => c.id === id);

    if (index === -1) {
      return null;
    }

    const updatedClient: Client = {
      ...clientData,
      id,
      frequency: clientData.frequency || 12,
    };

    this.clients[index] = updatedClient;
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    const index = this.clients.findIndex((c) => c.id === id);

    if (index === -1) {
      return false;
    }

    this.clients.splice(index, 1);
    return true;
  }

  // CLIENT_INFO methods
  async getAllClientInfo(): Promise<ClientInfo[]> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: clientSQL.getAllClientInfo,
          binds: [],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in getAllClientInfo:", err);
              reject(err);
            } else {
              resolve(rows || []);
            }
          },
        });
      });
    });
  }

  async getClientInfoById(id: number): Promise<ClientInfo | null> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: clientSQL.getClientInfoById,
          binds: [id],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in getClientInfoById:", err);
              reject(err);
            } else {
              resolve(rows && rows.length > 0 ? rows[0] : null);
            }
          },
        });
      });
    });
  }

  async getClientInfoByIllustrationId(illustrationId: string): Promise<ClientInfo[]> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: clientSQL.getClientInfoByIllustrationId,
          binds: [illustrationId],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in getClientInfoByIllustrationId:", err);
              reject(err);
            } else {
              resolve(rows || []);
            }
          },
        });
      });
    });
  }

  async createClientInfo(clientData: ClientInfo): Promise<ClientInfo> {
    return new Promise((resolve, reject) => {
      // Generate FULL_NAME if not provided
      const fullName = clientData.FULL_NAME || 
        `${clientData.FIRST_NAME} ${clientData.MIDDLE_NAME || ''} ${clientData.LAST_NAME}`.replace(/\s+/g, ' ').trim();

      const binds = [
        clientData.ILLUSTRATION_ID,
        clientData.AGENT_NAME,
        clientData.ILLUSTRATION_DATE,
        clientData.FIRST_NAME,
        clientData.MIDDLE_NAME,
        clientData.LAST_NAME,
        fullName,
        clientData.EMAIL,
        clientData.PREMIUM,
        clientData.FIRST_TERM,
        clientData.SECOND_TERM,
        clientData.TAX_QUALIFICATION,
        clientData.WITHDRAWAL_TYPE,
        clientData.WITHDRAWAL_AMOUNT,
        clientData.WITHDRAWAL_FROM_YEAR,
        clientData.WITHDRAWAL_TO_YEAR,
        clientData.WITHDRAWAL_FREQUENCY,
        clientData.PHONE,
        clientData.DATE_OF_BIRTH,
        clientData.AGE,
        clientData.GENDER,
        clientData.SALUTATION,
        clientData.SUFFIX,
        clientData.SSN_TAX_ID,
        clientData.RESIDENCE_ADDRESS,
        clientData.STATE,
        clientData.JURISDICTION
      ];

      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: clientSQL.insertClientInfo,
          binds: binds,
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in createClientInfo:", err);
              reject(err);
            } else {
              resolve({
                ...clientData,
                FULL_NAME: fullName
              });
            }
          },
        });
      });
    });
  }

  async updateClientInfo(id: number, clientData: ClientInfo): Promise<ClientInfo | null> {
    return new Promise((resolve, reject) => {
      const fullName = clientData.FULL_NAME || 
        `${clientData.FIRST_NAME} ${clientData.MIDDLE_NAME || ''} ${clientData.LAST_NAME}`.replace(/\s+/g, ' ').trim();

      const binds = [
        clientData.ILLUSTRATION_ID,
        clientData.AGENT_NAME,
        clientData.ILLUSTRATION_DATE,
        clientData.FIRST_NAME,
        clientData.MIDDLE_NAME,
        clientData.LAST_NAME,
        fullName,
        clientData.EMAIL,
        clientData.PREMIUM,
        clientData.FIRST_TERM,
        clientData.SECOND_TERM,
        clientData.TAX_QUALIFICATION,
        clientData.WITHDRAWAL_TYPE,
        clientData.WITHDRAWAL_AMOUNT,
        clientData.WITHDRAWAL_FROM_YEAR,
        clientData.WITHDRAWAL_TO_YEAR,
        clientData.WITHDRAWAL_FREQUENCY,
        clientData.PHONE,
        clientData.DATE_OF_BIRTH,
        clientData.AGE,
        clientData.GENDER,
        clientData.SALUTATION,
        clientData.SUFFIX,
        clientData.SSN_TAX_ID,
        clientData.RESIDENCE_ADDRESS,
        clientData.STATE,
        clientData.JURISDICTION,
        id
      ];

      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: clientSQL.updateClientInfo,
          binds: binds,
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in updateClientInfo:", err);
              reject(err);
            } else {
              resolve({
                ...clientData,
                CLIENT_ID: id,
                FULL_NAME: fullName
              });
            }
          },
        });
      });
    });
  }

  async deleteClientInfo(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: clientSQL.deleteClientInfo,
          binds: [id],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in deleteClientInfo:", err);
              reject(err);
            } else {
              resolve(true);
            }
          },
        });
      });
    });
  }

  async getTermDetails(): Promise<TermDetail[]> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: clientSQL.getTermDetails,
          binds: [],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in getTermDetails:", err);
              reject(err);
            } else {
              resolve(rows || []);
            }
          },
        });
      });
    });
  }

  async getTaxQualificationDetails(): Promise<TaxQualificationDetail[]> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: clientSQL.getTaxQualificationDetails,
          binds: [],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in getTaxQualificationDetails:", err);
              reject(err);
            } else {
              resolve(rows || []);
            }
          },
        });
      });
    });
  }

  async getWithdrawalTypeDetails(): Promise<WithdrawalTypeDetail[]> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: clientSQL.getWithdrawalTypeDetails,
          binds: [],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in getWithdrawalTypeDetails:", err);
              reject(err);
            } else {
              resolve(rows || []);
            }
          },
        });
      });
    });
  }

  async getStateProductAvailability(
    stateCode: string
  ): Promise<StateProductAvailability[]> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: clientSQL.getStateProductAvailability,
          binds: [stateCode],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in getStateProductAvailability:", err);
              reject(err);
            } else {
              resolve(rows || []);
            }
          },
        });
      });
    });
  }

  async getFiaAllocation(): Promise<FiaAllocationDetail[]> {
    return new Promise((resolve, reject) => {
      connection.use(async (clientConnection: any) => {
        clientConnection.execute({
          sqlText: clientSQL.getFiaAllocation,
          binds: [],
          complete: (err: Error | null, stmt: any, rows: any[]) => {
            if (err) {
              console.error("Error in getFiaAllocation:", err);
              reject(err);
            } else {
              resolve(rows || []);
            }
          },
        });
      });
    });
  }
}

export default new ClientService();
export type { ClientInfo };