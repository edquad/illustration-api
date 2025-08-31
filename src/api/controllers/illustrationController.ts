import { Request, Response } from "express";
import clientService from "../services/clientService";
import illustrationService, {
  calculateAnnuityFactor,
  calculateIllustrationCalc,
  generateSvgPlot,
  getAllStates,
} from "../services/illustrationServices";

class IllustrationController {
  async annuityFactor(req: Request, res: Response) {
    const {
      account_values,
      annuitization_rate,
      gender,
      certain_year,
      maturity_age,
    } = req.body;
    try {
      const result = await calculateAnnuityFactor(
        account_values,
        annuitization_rate,
        gender,
        certain_year,
        maturity_age,
        undefined // p0 argument, not used
      );
      return res.json(result);
    } catch (error: any) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ err: error.message || "Internal Server Error" });
    }
  }

  async illustrationCalc(req: Request, res: Response) {
    const { client_data, constants } = req.body;
    try {
      const result = calculateIllustrationCalc(
        client_data,
        constants,
        undefined // p0 argument, not used
      );
      return res.json(result);
    } catch (error: any) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ err: error.message || "Internal Server Error" });
    }
  }

  async illustrationSVG(req: Request, res: Response) {
    const { current_surrender_values, term_1, term } = req.body;
    try {
      const result = generateSvgPlot(current_surrender_values, term_1, term);
      return res.json({ svg: result });
    } catch (error: any) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ err: error.message || "Internal Server Error" });
    }
  }

  async getAllStates(req: Request, res: Response) {
    try {
      const result = await getAllStates();
      return res.json(result);
    } catch (error: any) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ err: error.message || "Internal Server Error" });
    }
  }

  async computedIllustration(req: Request, res: Response): Promise<void> {
    try {
      const clientData = req.body;
      const result = await illustrationService.computeIllustrationForClient(
        clientData
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error in computedIllustration:", error);
      res.status(500).json({
        error: "Failed to compute illustration",
        details: error.message,
      });
    }
  }
}

export default new IllustrationController();