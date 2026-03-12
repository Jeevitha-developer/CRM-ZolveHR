import { Sequelize } from "sequelize";

import { Register, initRegister } from "./Register.model";
import { MasterEmployee, initMasterEmployee } from "./MasterEmployee.model";
import { CompanyUnit, initCompanyUnit } from "./CompanyUnit.model";
import { CompanySettings, initCompanySettings } from "./CompanySettings.model";

export const initTenantModels = (sequelize: Sequelize) => {

  // Initialize models
  initRegister(sequelize);
  initMasterEmployee(sequelize);
  initCompanyUnit(sequelize);
  initCompanySettings(sequelize);

  // Associations

  CompanySettings.belongsTo(CompanyUnit, {
    foreignKey: "Unitid",
    targetKey: "id",
    as: "Unit",
    constraints: false,
  });

  return {
    Register,
    MasterEmployee,
    CompanyUnit,
    CompanySettings,
  };
};