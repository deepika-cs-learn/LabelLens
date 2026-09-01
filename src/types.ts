export type Verdict = 'COMPLIANT' | 'NEEDS_REVIEW' | 'VIOLATION';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface DeclarationResult {
  field: string;
  extracted_text: string;
  confidence: number;
  bounding_box: [number, number, number, number] | null; // [x_min, y_min, x_max, y_max] in 0-100 %
  relative_font_note: string; // e.g. "much smaller", "similar", "larger"
  verdict: Verdict;
  rule_reference: string; // e.g. "PC Rules 2011, Rule 6(1)(e)"
  explanation: string;
}

export interface ComplianceEvaluation {
  product_name_guess: string;
  manufacturer_name_guess: string;
  overall_compliance_percent: number;
  risk_level: RiskLevel;
  declarations: DeclarationResult[];
}

export interface EvaluationRecord {
  id: string;
  timestamp: number;
  imageUrl: string;
  evaluation: ComplianceEvaluation;
  sourceType: 'sample' | 'upload' | 'camera';
  notes?: string;
}

export interface SamplePack {
  id: string;
  title: string;
  category: string;
  brand: string;
  thumbnail: string;
  imageData: string; // data URL or path
  description: string;
  expectedViolationsCount: number;
  scenarioType: 'compliant' | 'missing_mrp_taxes' | 'non_standard_net_qty' | 'missing_consumer_care' | 'imported_goods_violation' | 'micro_font_disparity';
}

export interface LegalMetrologyRuleInfo {
  ruleId: string;
  title: string;
  section: string;
  description: string;
  mandatoryRequirements: string[];
  commonViolations: string[];
  penaltyDetails: string;
}
