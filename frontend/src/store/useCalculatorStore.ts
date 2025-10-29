import { create } from 'zustand';
import { nanoid } from 'nanoid';

export type CalculationMode = 'recurring' | 'one_off';
export type CalculationStage = 1 | 2;

export type FixedCostCategory =
  | 'infraestrutura'
  | 'pessoas'
  | 'operacional'
  | 'administrativo';

export interface FixedCostItem {
  id: string;
  name: string;
  amount: number;
  weight: number;
  category: FixedCostCategory;
}

export interface VariableCostConfig {
  partnerMonthly: number;
  additional: number;
  partnerSetupFee: number;
  supportHours: number;
  supportHourCost: number;
}

export interface PlanAddon {
  id: string;
  name: string;
  priceSellUnit: number;
  partnerCostUnit: number;
  quantity: number;
}

export interface RecurringPlan {
  id: string;
  name: string;
  priceSell: number;
  partnerCost: number;
  customers: number;
  taxRate?: number;
  addons: PlanAddon[];
}

export interface ProjectRoleEffort {
  role: string;
  hours: number;
  hourlyCost: number;
}

export interface ThirdPartyCost {
  id: string;
  description: string;
  amount: number;
}

export interface GeneralSettings {
  currency: string;
  globalTax: number;
  forecastMonths: number;
  marginTarget: number;
  churnMonthly: number;
  cac: number;
  rateioMethod: 'clientes' | 'receita';
  sensitivity: number;
}

export interface StageTwoSettings {
  targetRevenue: number;
  targetQuantity: number;
  reserves: number;
  withdrawals: number;
  lastChanged: 'revenue' | 'quantity';
}

export interface RecurringSettings {
  plans: RecurringPlan[];
  variableCosts: VariableCostConfig;
}

export interface ProjectSettings {
  priceSell: number;
  installments: number;
  taxRate: number;
  efforts: ProjectRoleEffort[];
  thirdPartyCosts: ThirdPartyCost[];
}

export interface CalculatorState {
  mode: CalculationMode;
  stage: CalculationStage;
  general: GeneralSettings;
  fixedCosts: FixedCostItem[];
  recurring: RecurringSettings;
  project: ProjectSettings;
  stageTwo: StageTwoSettings;
  setMode: (mode: CalculationMode) => void;
  setStage: (stage: CalculationStage) => void;
  updateGeneral: (partial: Partial<GeneralSettings>) => void;
  upsertFixedCost: (id: string, partial: Partial<FixedCostItem>) => void;
  updateFixedCostAmount: (id: string, amount: number) => void;
  updateFixedCostWeight: (id: string, weight: number) => void;
  addFixedCost: (item: Omit<FixedCostItem, 'id'>) => void;
  removeFixedCost: (id: string) => void;
  addRecurringPlan: () => void;
  updateRecurringPlan: (id: string, partial: Partial<RecurringPlan>) => void;
  removeRecurringPlan: (id: string) => void;
  addAddonToPlan: (planId: string) => void;
  updateAddon: (planId: string, addonId: string, partial: Partial<PlanAddon>) => void;
  removeAddon: (planId: string, addonId: string) => void;
  updateVariableCosts: (partial: Partial<VariableCostConfig>) => void;
  updateProjectSettings: (partial: Partial<ProjectSettings>) => void;
  updateProjectEffort: (role: string, partial: Partial<ProjectRoleEffort>) => void;
  addThirdPartyCost: () => void;
  updateThirdPartyCost: (id: string, partial: Partial<ThirdPartyCost>) => void;
  removeThirdPartyCost: (id: string) => void;
  updateStageTwo: (partial: Partial<StageTwoSettings>) => void;
  reset: () => void;
}

const defaultFixedCosts: FixedCostItem[] = [
  { id: nanoid(), name: 'Aluguel sala', amount: 3500, weight: 1, category: 'infraestrutura' },
  { id: nanoid(), name: 'Endereço fiscal', amount: 400, weight: 1, category: 'administrativo' },
  { id: nanoid(), name: 'Contabilidade', amount: 950, weight: 1, category: 'administrativo' },
  { id: nanoid(), name: 'Energia', amount: 600, weight: 1, category: 'infraestrutura' },
  { id: nanoid(), name: 'Internet', amount: 250, weight: 1, category: 'infraestrutura' },
  { id: nanoid(), name: 'Condomínio', amount: 780, weight: 1, category: 'infraestrutura' },
  { id: nanoid(), name: 'Garagem', amount: 320, weight: 1, category: 'infraestrutura' },
  { id: nanoid(), name: 'Licenças de programas', amount: 1400, weight: 1, category: 'operacional' },
  { id: nanoid(), name: 'Domínios e renovações', amount: 200, weight: 1, category: 'operacional' },
  { id: nanoid(), name: 'Servidores / VPS', amount: 1200, weight: 1, category: 'operacional' },
  { id: nanoid(), name: 'Contratações / salários', amount: 18000, weight: 1.2, category: 'pessoas' },
  { id: nanoid(), name: 'Outras despesas gerais', amount: 1000, weight: 1, category: 'operacional' }
];

const defaultProjectEfforts: ProjectRoleEffort[] = [
  { role: 'Design', hours: 40, hourlyCost: 80 },
  { role: 'Desenvolvimento', hours: 120, hourlyCost: 100 },
  { role: 'Gestão de Projetos', hours: 35, hourlyCost: 95 },
  { role: 'Implantação', hours: 30, hourlyCost: 85 }
];

export const useCalculatorStore = create<CalculatorState>((set) => ({
  mode: 'recurring',
  stage: 1,
  general: {
    currency: 'BRL',
    globalTax: 0.08,
    forecastMonths: 12,
    marginTarget: 0.35,
    churnMonthly: 0.04,
    cac: 600,
    rateioMethod: 'clientes',
    sensitivity: 0
  },
  fixedCosts: defaultFixedCosts,
  recurring: {
    plans: [
      {
        id: nanoid(),
        name: 'Plano Pro',
        priceSell: 499,
        partnerCost: 160,
        customers: 45,
        taxRate: undefined,
        addons: [
          { id: nanoid(), name: 'Onboarding', priceSellUnit: 1200, partnerCostUnit: 400, quantity: 5 }
        ]
      }
    ],
    variableCosts: {
      partnerMonthly: 1800,
      additional: 900,
      partnerSetupFee: 1500,
      supportHours: 10,
      supportHourCost: 70
    }
  },
  project: {
    priceSell: 48000,
    installments: 4,
    taxRate: 0.12,
    efforts: defaultProjectEfforts,
    thirdPartyCosts: [
      { id: nanoid(), description: 'Templates', amount: 1200 },
      { id: nanoid(), description: 'APIs', amount: 800 }
    ]
  },
  stageTwo: {
    targetRevenue: 0,
    targetQuantity: 0,
    reserves: 0,
    withdrawals: 0,
    lastChanged: 'revenue'
  },
  setMode: (mode) =>
    set((state) => ({
      mode,
      stageTwo: {
        ...state.stageTwo,
        targetRevenue: 0,
        targetQuantity: 0,
        lastChanged: 'revenue'
      }
    })),
  setStage: (stage) => set({ stage }),
  updateGeneral: (partial) => set((state) => ({ general: { ...state.general, ...partial } })),
  upsertFixedCost: (id, partial) =>
    set((state) => ({
      fixedCosts: state.fixedCosts.map((item) => (item.id === id ? { ...item, ...partial } : item))
    })),
  updateFixedCostAmount: (id, amount) =>
    set((state) => ({
      fixedCosts: state.fixedCosts.map((item) => (item.id === id ? { ...item, amount } : item))
    })),
  updateFixedCostWeight: (id, weight) =>
    set((state) => ({
      fixedCosts: state.fixedCosts.map((item) => (item.id === id ? { ...item, weight } : item))
    })),
  addFixedCost: (item) =>
    set((state) => ({ fixedCosts: [...state.fixedCosts, { ...item, id: nanoid() }] })),
  removeFixedCost: (id) =>
    set((state) => ({ fixedCosts: state.fixedCosts.filter((item) => item.id !== id) })),
  addRecurringPlan: () =>
    set((state) => ({
      recurring: {
        ...state.recurring,
        plans: [
          ...state.recurring.plans,
          {
            id: nanoid(),
            name: `Novo plano ${state.recurring.plans.length + 1}`,
            priceSell: 299,
            partnerCost: 120,
            customers: 10,
            taxRate: undefined,
            addons: []
          }
        ]
      }
    })),
  updateRecurringPlan: (id, partial) =>
    set((state) => ({
      recurring: {
        ...state.recurring,
        plans: state.recurring.plans.map((plan) => (plan.id === id ? { ...plan, ...partial } : plan))
      }
    })),
  removeRecurringPlan: (id) =>
    set((state) => ({
      recurring: {
        ...state.recurring,
        plans: state.recurring.plans.filter((plan) => plan.id !== id)
      }
    })),
  addAddonToPlan: (planId) =>
    set((state) => ({
      recurring: {
        ...state.recurring,
        plans: state.recurring.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                addons: [
                  ...plan.addons,
                  {
                    id: nanoid(),
                    name: `Add-on ${plan.addons.length + 1}`,
                    priceSellUnit: 120,
                    partnerCostUnit: 40,
                    quantity: 10
                  }
                ]
              }
            : plan
        )
      }
    })),
  updateAddon: (planId, addonId, partial) =>
    set((state) => ({
      recurring: {
        ...state.recurring,
        plans: state.recurring.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                addons: plan.addons.map((addon) =>
                  addon.id === addonId ? { ...addon, ...partial } : addon
                )
              }
            : plan
        )
      }
    })),
  removeAddon: (planId, addonId) =>
    set((state) => ({
      recurring: {
        ...state.recurring,
        plans: state.recurring.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                addons: plan.addons.filter((addon) => addon.id !== addonId)
              }
            : plan
        )
      }
    })),
  updateVariableCosts: (partial) =>
    set((state) => ({
      recurring: {
        ...state.recurring,
        variableCosts: { ...state.recurring.variableCosts, ...partial }
      }
    })),
  updateProjectSettings: (partial) =>
    set((state) => ({ project: { ...state.project, ...partial } })),
  updateProjectEffort: (role, partial) =>
    set((state) => ({
      project: {
        ...state.project,
        efforts: state.project.efforts.map((effort) =>
          effort.role === role ? { ...effort, ...partial } : effort
        )
      }
    })),
  addThirdPartyCost: () =>
    set((state) => ({
      project: {
        ...state.project,
        thirdPartyCosts: [
          ...state.project.thirdPartyCosts,
          { id: nanoid(), description: 'Nova despesa', amount: 0 }
        ]
      }
    })),
  updateThirdPartyCost: (id, partial) =>
    set((state) => ({
      project: {
        ...state.project,
        thirdPartyCosts: state.project.thirdPartyCosts.map((cost) =>
          cost.id === id ? { ...cost, ...partial } : cost
        )
      }
    })),
  removeThirdPartyCost: (id) =>
    set((state) => ({
      project: {
        ...state.project,
        thirdPartyCosts: state.project.thirdPartyCosts.filter((cost) => cost.id !== id)
      }
    })),
  updateStageTwo: (partial) =>
    set((state) => ({ stageTwo: { ...state.stageTwo, ...partial } })),
  reset: () =>
    set(() => ({
      mode: 'recurring',
      stage: 1,
      general: {
        currency: 'BRL',
        globalTax: 0.08,
        forecastMonths: 12,
        marginTarget: 0.35,
        churnMonthly: 0.04,
        cac: 600,
        rateioMethod: 'clientes',
        sensitivity: 0
      },
      fixedCosts: defaultFixedCosts,
      recurring: {
        plans: [
          {
            id: nanoid(),
            name: 'Plano Pro',
            priceSell: 499,
            partnerCost: 160,
            customers: 45,
            addons: [],
            taxRate: undefined
          }
        ],
        variableCosts: {
          partnerMonthly: 0,
          additional: 0,
          partnerSetupFee: 0,
          supportHours: 0,
          supportHourCost: 0
        }
      },
      project: {
        priceSell: 0,
        installments: 1,
        taxRate: 0.12,
        efforts: defaultProjectEfforts,
        thirdPartyCosts: []
      },
      stageTwo: {
        targetRevenue: 0,
        targetQuantity: 0,
        reserves: 0,
        withdrawals: 0,
        lastChanged: 'revenue'
      }
    }))
}));
