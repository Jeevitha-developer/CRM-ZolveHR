// src/seeders/plans.seeder.ts
import { sequelize } from "../config/database";
import { Plan, initPlan } from "../models/Plan.model";

const plans = [
  {
    name:           "Silver",
    description:    "Quarterly billing plan. Ideal for small teams getting started with HRMS.",
    price_per_user: 129,
    billing_cycle:  "quarterly",
    billing_months: 3,
    billing_type:   "prepaid",
    min_users:      5,
    max_users:      100,
    overage_policy: "hard_stop",
    features:       [
      "Attendance Management",
      "Leave Management",
      "Basic Payroll",
      "Employee Self Service",
    ],
    module_access:  {
      attendance:   true,
      leave:        true,
      payroll:      true,
      recruitment:  false,
      performance:  false,
      analytics:    false,
      api_access:   false,
    },
    is_active: true,
  },
  {
    name:           "Gold",
    description:    "Half yearly billing plan. Perfect for growing companies needing advanced features.",
    price_per_user: 109,
    billing_cycle:  "half_yearly",
    billing_months: 6,
    billing_type:   "prepaid",
    min_users:      5,
    max_users:      300,
    overage_policy: "charge_overage",
    features:       [
      "Attendance Management",
      "Leave Management",
      "Advanced Payroll",
      "Employee Self Service",
      "Recruitment",
      "Performance Management",
    ],
    module_access:  {
      attendance:   true,
      leave:        true,
      payroll:      true,
      recruitment:  true,
      performance:  true,
      analytics:    false,
      api_access:   false,
    },
    is_active: true,
  },
  {
    name:           "Platinum",
    description:    "Yearly billing plan. Best value for large enterprises with full feature access.",
    price_per_user: 99,
    billing_cycle:  "yearly",
    billing_months: 12,
    billing_type:   "prepaid",
    min_users:      5,
    max_users:      500,
    overage_policy: "notify_only",
    features:       [
      "Attendance Management",
      "Leave Management",
      "Advanced Payroll",
      "Employee Self Service",
      "Recruitment",
      "Performance Management",
      "Analytics & Reports",
      "API Access",
    ],
    module_access:  {
      attendance:   true,
      leave:        true,
      payroll:      true,
      recruitment:  true,
      performance:  true,
      analytics:    true,
      api_access:   true,
    },
    is_active: true,
  },
];

const seed = async (): Promise<void> => {
  try {
    initPlan(sequelize);
    await sequelize.authenticate();
    console.log("✅ Database connected");

    let seeded  = 0;
    let skipped = 0;

    for (const plan of plans) {
      const existing = await Plan.findOne({ where: { name: plan.name } });

      if (existing) {
        console.log(`⚠️  Plan "${plan.name}" already exists — skipping`);
        skipped++;
        continue;
      }

      await Plan.create(plan as any);
      console.log(`✅ Plan "${plan.name}" created — ₹${plan.price_per_user}/user/${
        plan.billing_cycle === "quarterly"   ? "month (billed quarterly)"   :
        plan.billing_cycle === "half_yearly" ? "month (billed half yearly)" :
                                               "month (billed yearly)"
      }`);
      seeded++;
    }

    console.log(`\n🎉 Seeding complete — ${seeded} created, ${skipped} skipped\n`);
    process.exit(0);

  } catch (err: any) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seed();