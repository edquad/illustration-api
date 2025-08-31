// routes/fiaEappRouter.ts
import { Router } from "express";
import IllustrationController from "../controllers/illustrationController";
import { MygaCalculationService, DEFAULT_CONSTANTS, ClientData } from "../services/mygaCalculationService";
import { calculateFiaIllustration } from "../services/fiaCalculationService";

const router = Router();

// Existing illustration routes
router.post("/annuity-factor", IllustrationController.annuityFactor);
router.post("/illustration-calc", IllustrationController.illustrationCalc);
router.post("/illustration-svg", IllustrationController.illustrationSVG);

// NEW: MYGA calculation endpoint
router.post("/myga-calc", async (req, res) => {
  try {
    console.log('Received MYGA calculation request:', req.body);
    
    const clientData: ClientData = req.body;
    
    // Validate required fields
    if (!clientData.premium || !clientData.birthday) {
      console.error('Missing required fields:', { premium: clientData.premium, birthday: clientData.birthday });
      return res.status(400).json({ error: "Premium and birthday are required" });
    }

    // Validate data types
    if (typeof clientData.premium !== 'number' || clientData.premium <= 0) {
      return res.status(400).json({ error: "Premium must be a positive number" });
    }

    // Use default constants (in production, these would come from database)
    console.log('Creating MYGA calculator with constants:', DEFAULT_CONSTANTS);
    const calculator = new MygaCalculationService(clientData, DEFAULT_CONSTANTS);
    const result = calculator.calculate();

    console.log('MYGA calculation successful, returning result');
    res.json({
      status: "success",
      illustration_calc_data: result
    });
  } catch (error: any) {
    console.error("MYGA calculation error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: "Calculation failed: " + (error.message || 'Unknown error'),
      details: error.stack
    });
  }
});

// NEW: FIA calculation endpoint
router.post("/fia-calc", calculateFiaIllustration);

// States routes
router.get("/states", IllustrationController.getAllStates);

export default function illustrationRouter() {
  return router;
}