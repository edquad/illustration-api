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