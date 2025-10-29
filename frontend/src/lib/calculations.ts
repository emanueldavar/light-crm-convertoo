import type {
  CalculatorState,
  RecurringPlan,
  PlanAddon,
  VariableCostConfig,
  GeneralSettings,
  StageTwoSettings,
  FixedCostItem,
  ProjectSettings
} from '@/store/useCalculatorStore';
import { clamp } from './utils';

type AlertLevels = {
  ltvVsCac: boolean;
  marginBelowTarget: boolean;
  breakEvenBeyondHorizon: boolean;
};

interface BaseStageOneResults {
  mode: 'recurring' | 'one_off';
  totalRevenue: number;
  totalDirectCosts: number;
  marginValue: number;
  marginPercent: number;
  fixedCostAllocation: number;
  roi: number;
  alerts: AlertLevels;
  timeline: Array<{ month: number; revenue: number; costs: number; profit: number }>;
  costComposition: Array<{ name: string; value: number }>;
  cacAllocated: number;
}

export interface RecurringStageOneResults extends BaseStageOneResults {
  mode: 'recurring';
  monthlyRevenue: number;
  totalTaxes: number;
  markup: number;
  operationalProfit: number;
  customers: number;
  arpu: number;
  ltv: number;
  payback: number;
  breakEvenClients: number;
  roiByProduct: Array<{ name: string; roi: number }>;
}

export interface ProjectStageOneResults extends BaseStageOneResults {
  mode: 'one_off';
  totalTaxes: number;
  hoursCost: number;
  thirdPartyCost: number;
  markup: number;
  operationalProfit: number;
  priceIdeal: number;
  breakEvenProjects: number;
}

export type StageOneResults = RecurringStageOneResults | ProjectStageOneResults;

export interface StageTwoResults {
  targetRevenue: number;
  targetQuantity: number;
  projectedMargin: number;
  projectedProfit: number;
  projectedMarginPercent: number;
  projectedROI: number;
  breakEvenGap: number;
  reinvestibleValue: number;
}

export interface CalculatorResults {
  stageOne: StageOneResults;
  stageTwo: StageTwoResults;
}

function sumAddonCosts(addons: PlanAddon[]): { revenue: number; cost: number } {
  return addons.reduce(
    (acc, addon) => {
      acc.revenue += addon.priceSellUnit * addon.quantity;
      acc.cost += addon.partnerCostUnit * addon.quantity;
      return acc;
    },
    { revenue: 0, cost: 0 }
  );
}

function calculateRecurringStageOne(
  general: GeneralSettings,
  recurringPlans: RecurringPlan[],
  variableCosts: VariableCostConfig,
  fixedCosts: FixedCostItem[]
): RecurringStageOneResults {
  const months = Math.max(1, general.forecastMonths);
  const totalFixedMonthly = fixedCosts.reduce((acc, item) => acc + item.amount, 0);
  const totalFixed = totalFixedMonthly * months;

  let totalRevenueMonthly = 0;
  let planDirectMonthly = 0;
  let totalTaxesMonthly = 0;
  let customers = 0;
  const costComposition: Array<{ name: string; value: number }> = [];
  const roiByProduct: Array<{ name: string; roi: number }> = [];

  recurringPlans.forEach((plan) => {
    const addons = sumAddonCosts(plan.addons);
    const monthlyRevenuePlan = plan.priceSell * plan.customers;
    const monthlyRevenueAddons = addons.revenue;
    const monthlyDirectPlan = plan.partnerCost * plan.customers + addons.cost;
    const taxRate = plan.taxRate ?? general.globalTax;
    const monthlyTaxes = (monthlyRevenuePlan + monthlyRevenueAddons) * taxRate;

    totalRevenueMonthly += monthlyRevenuePlan + monthlyRevenueAddons;
    planDirectMonthly += monthlyDirectPlan;
    totalTaxesMonthly += monthlyTaxes;
    customers += plan.customers;

    const planTotalRevenue = (monthlyRevenuePlan + monthlyRevenueAddons) * months;
    const planTotalDirect = monthlyDirectPlan * months;
    const planTotalTax = monthlyTaxes * months;
    const planMargin = planTotalRevenue - planTotalDirect - planTotalTax;
    const planROI = planTotalDirect + planTotalTax + general.cac * plan.customers > 0
      ? planMargin / (planTotalDirect + planTotalTax + general.cac * plan.customers)
      : 0;
    roiByProduct.push({ name: plan.name, roi: planROI });
  });

  const supportCostMonthly = variableCosts.supportHours * variableCosts.supportHourCost * customers;
  const sharedVariableMonthly = variableCosts.partnerMonthly + variableCosts.additional;
  const totalDirectMonthly = (planDirectMonthly + supportCostMonthly + sharedVariableMonthly) * (1 + general.sensitivity);

  const totalDirect = totalDirectMonthly * months + variableCosts.partnerSetupFee;
  const totalTaxes = totalTaxesMonthly * months;
  const totalRevenue = totalRevenueMonthly * months;
  const marginValue = totalRevenue - totalDirect - totalTaxes;
  const marginPercent = totalRevenue > 0 ? marginValue / totalRevenue : 0;
  const fixedCostAllocation = totalFixed;
  const operationalProfit = marginValue - fixedCostAllocation;
  const markup = totalDirect > 0 ? totalRevenue / totalDirect : 0;
  const arpu = customers > 0 ? totalRevenueMonthly / customers : 0;
  const marginPerCustomerMonthly = customers > 0 ? (marginValue / months) / customers : 0;
  const churn = clamp(general.churnMonthly, 0.0001, 0.95);
  const ltv = arpu * (1 / churn) * marginPercent;
  const payback = marginPerCustomerMonthly > 0 ? general.cac / marginPerCustomerMonthly : Infinity;
  const breakEvenClients = marginPerCustomerMonthly > 0 ? (totalFixedMonthly) / marginPerCustomerMonthly : Infinity;
  const cacAllocated = general.cac * customers;
  const roi = totalDirect + fixedCostAllocation + cacAllocated > 0 ? operationalProfit / (totalDirect + fixedCostAllocation + cacAllocated) : 0;

  const partnerDirectMonthly = recurringPlans.reduce((acc, plan) => acc + plan.partnerCost * plan.customers, 0);
  const addonDirectMonthly = recurringPlans.reduce((acc, plan) => acc + plan.addons.reduce((inner, addon) => inner + addon.partnerCostUnit * addon.quantity, 0), 0);
  costComposition.push(
    { name: 'Parceiros', value: partnerDirectMonthly * months },
    { name: 'Add-ons', value: addonDirectMonthly * months },
    { name: 'Suporte', value: supportCostMonthly * months },
    { name: 'Variáveis', value: sharedVariableMonthly * months + variableCosts.partnerSetupFee },
    { name: 'Fixos', value: fixedCostAllocation }
  );

  const alerts: AlertLevels = {
    ltvVsCac: Number.isFinite(ltv) ? ltv < 3 * general.cac : true,
    marginBelowTarget: marginPercent < general.marginTarget,
    breakEvenBeyondHorizon: breakEvenClients > customers * months || breakEvenClients > general.forecastMonths
  };

  const timeline: Array<{ month: number; revenue: number; costs: number; profit: number }> = [];
  let activeCustomers = customers;
  for (let month = 1; month <= months; month++) {
    const churnFactor = Math.pow(1 - general.churnMonthly, month - 1);
    const monthlyRevenue = totalRevenueMonthly * churnFactor;
    const partnerDirect = planDirectMonthly * churnFactor;
    const supportDirect = variableCosts.supportHours * variableCosts.supportHourCost * activeCustomers;
    const monthlyDirect = (partnerDirect + supportDirect + sharedVariableMonthly) * (1 + general.sensitivity);
    const monthlyTaxes = totalTaxesMonthly * churnFactor;
    const monthlyProfit = monthlyRevenue - monthlyDirect - monthlyTaxes - totalFixedMonthly - (month === 1 ? variableCosts.partnerSetupFee : 0);
    const totalCosts = monthlyDirect + monthlyTaxes + totalFixedMonthly + (month === 1 ? variableCosts.partnerSetupFee : 0);
    timeline.push({ month, revenue: monthlyRevenue, costs: totalCosts, profit: monthlyProfit });
    activeCustomers = activeCustomers * (1 - general.churnMonthly);
  }

  return {
    mode: 'recurring',
    totalRevenue,
    monthlyRevenue: totalRevenueMonthly,
    totalTaxes,
    totalDirectCosts: totalDirect,
    marginValue,
    marginPercent,
    markup,
    fixedCostAllocation,
    operationalProfit,
    customers,
    arpu,
    ltv,
    payback,
    breakEvenClients,
    roi,
    cacAllocated,
    alerts,
    timeline,
    costComposition,
    roiByProduct
  };
}

function calculateProjectStageOne(
  general: GeneralSettings,
  project: ProjectSettings,
  fixedCosts: FixedCostItem[]
): ProjectStageOneResults {
  const hoursCost = project.efforts.reduce((acc, effort) => acc + effort.hours * effort.hourlyCost, 0);
  const thirdPartyCost = project.thirdPartyCosts.reduce((acc, item) => acc + item.amount, 0);
  const directCost = (hoursCost + thirdPartyCost) * (1 + general.sensitivity);
  const taxes = project.priceSell * project.taxRate;
  const marginValue = project.priceSell - taxes - directCost;
  const marginPercent = project.priceSell > 0 ? marginValue / project.priceSell : 0;
  const fixedCostTotal = fixedCosts.reduce((acc, item) => acc + item.amount, 0);
  const operationalProfit = marginValue - fixedCostTotal;
  const markup = directCost > 0 ? project.priceSell / directCost : 0;
  const priceIdeal = directCost / (1 - general.marginTarget);
  const cacAllocated = general.cac;
  const roi = directCost + fixedCostTotal + cacAllocated > 0 ? operationalProfit / (directCost + fixedCostTotal + cacAllocated) : 0;
  const breakEvenProjects = marginValue > 0 ? fixedCostTotal / marginValue : Infinity;
  const alerts: AlertLevels = {
    ltvVsCac: marginValue < 3 * general.cac,
    marginBelowTarget: marginPercent < general.marginTarget,
    breakEvenBeyondHorizon: breakEvenProjects > project.installments
  };

  const timeline = Array.from({ length: project.installments }, (_, index) => {
    const revenue = project.priceSell / project.installments;
    const cost = (directCost + taxes + fixedCostTotal) / project.installments;
    return {
      month: index + 1,
      revenue,
      costs: cost,
      profit: revenue - cost
    };
  });

  const costComposition = [
    { name: 'Horas', value: hoursCost },
    { name: 'Terceiros', value: thirdPartyCost },
    { name: 'Impostos', value: taxes },
    { name: 'Fixos', value: fixedCostTotal }
  ];

  return {
    mode: 'one_off',
    totalRevenue: project.priceSell,
    totalTaxes: taxes,
    totalDirectCosts: directCost,
    hoursCost,
    thirdPartyCost,
    marginValue,
    marginPercent,
    markup,
    operationalProfit,
    priceIdeal,
    roi,
    breakEvenProjects,
    fixedCostAllocation: fixedCostTotal,
    alerts,
    timeline,
    costComposition,
    cacAllocated
  };
}

function computeStageTwo(
  general: GeneralSettings,
  stageTwo: StageTwoSettings,
  stageOne: StageOneResults
): StageTwoResults {
  const baselineRevenue = stageOne.totalRevenue;
  const baselineQuantity = stageOne.mode === 'recurring' ? stageOne.customers : 1;
  const baselineMargin = stageOne.marginValue;
  const baselineDirect = stageOne.totalDirectCosts;
  const baselineCAC = stageOne.mode === 'recurring' ? stageOne.cacAllocated : general.cac;
  const baselineROI = stageOne.mode === 'recurring' ? stageOne.roi : stageOne.roi;
  const pricePerUnit = baselineQuantity > 0 ? baselineRevenue / baselineQuantity : baselineRevenue;

  const effectiveTargetRevenue = stageTwo.lastChanged === 'revenue'
    ? stageTwo.targetRevenue || baselineRevenue
    : (stageTwo.targetQuantity || baselineQuantity) * pricePerUnit;

  const effectiveTargetQuantity = stageTwo.lastChanged === 'quantity'
    ? stageTwo.targetQuantity || baselineQuantity
    : pricePerUnit > 0
      ? (stageTwo.targetRevenue || baselineRevenue) / pricePerUnit
      : baselineQuantity;

  const marginPerRevenue = baselineRevenue > 0 ? baselineMargin / baselineRevenue : 0;
  const directPerRevenue = baselineRevenue > 0 ? baselineDirect / baselineRevenue : 0;
  const cacPerUnit = stageOne.mode === 'recurring' && baselineQuantity > 0 ? baselineCAC / baselineQuantity : general.cac;
  const projectedMargin = effectiveTargetRevenue * marginPerRevenue;
  const projectedDirect = effectiveTargetRevenue * directPerRevenue;
  const projectedProfit = projectedMargin - stageOne.fixedCostAllocation - effectiveTargetQuantity * cacPerUnit;
  const projectedMarginPercent = effectiveTargetRevenue > 0 ? projectedMargin / effectiveTargetRevenue : 0;
  const projectedROI = projectedDirect + stageOne.fixedCostAllocation + effectiveTargetQuantity * cacPerUnit > 0
    ? projectedProfit / (projectedDirect + stageOne.fixedCostAllocation + effectiveTargetQuantity * cacPerUnit)
    : baselineROI;
  const breakEvenGap = stageOne.mode === 'recurring'
    ? effectiveTargetQuantity - stageOne.breakEvenClients
    : effectiveTargetQuantity - stageOne.breakEvenProjects;
  const reinvestibleValue = projectedProfit - stageTwo.reserves - stageTwo.withdrawals;

  return {
    targetRevenue: effectiveTargetRevenue,
    targetQuantity: effectiveTargetQuantity,
    projectedMargin,
    projectedProfit,
    projectedMarginPercent,
    projectedROI,
    breakEvenGap,
    reinvestibleValue
  };
}

export function computeCalculatorResults(state: CalculatorState): CalculatorResults {
  const stageOne =
    state.mode === 'recurring'
      ? calculateRecurringStageOne(state.general, state.recurring.plans, state.recurring.variableCosts, state.fixedCosts)
      : calculateProjectStageOne(state.general, state.project, state.fixedCosts);

  const stageTwo = computeStageTwo(state.general, state.stageTwo, stageOne);

  return { stageOne, stageTwo };
}
