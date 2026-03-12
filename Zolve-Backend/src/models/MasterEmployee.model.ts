import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface MasterEmployeeAttributes {
  employeeId: number;
  title?: string | null;
  nickName?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  maritalStatus?: string | null;
  father_Spouse?: string | null;
  gender?: string | null;
  birthday?: string | null;
  EmployeeNo?: string | null;
  employeeMobile?: number | null;
  employeeEmail?: string | null;
  Unitid?: number | null;
  departmentid?: number | null;
  WorkType?: string | null;
  designationid?: number | null;
  Mdesignationid?: number | null;
  salaryType?: string | null;
  grade?: string | null;
  ReferedBy?: number | null;
  dateOfJoining?: string | null;
  confirmationDate?: string | null;
  emergencyContactPerson?: string | null;
  emergencyNumber?: number | null;
  Relationship?: string | null;
  Delflag?: number | null;
  bloodGroupId?: number | null;
  nationality?: string | null;
  residentialStatus?: string | null;
  religion?: string | null;
  physicallyChallenged?: string | null;
  Detail?: string | null;
  empPresentAddressDno?: string | null;
  empPresentAddressStreet?: string | null;
  empPresentAddressNagar?: string | null;
  empPresentAddressVillage?: string | null;
  empPresentAddressStateId?: number | null;
  empPresentAddressDistrictId?: number | null;
  empPresentAddressPincode?: number | null;
  empPresentAddressTaluk?: string | null;
  empPermanentAddressDno?: string | null;
  empPermanentAddressStreet?: string | null;
  empPermanentAddressNagar?: string | null;
  empPermanentAddressVillage?: string | null;
  empPermanentAddressState?: number | null;
  empPermanentAddressDistrict?: number | null;
  empPermanentAddressPincode?: number | null;
  empPermanentAddressTaluk?: string | null;
  DLNo?: string | null;
  DLVer?: number | null;
  employeeBankName?: string | null;
  branchName?: string | null;
  AccountHolderName?: string | null;
  employeeAccountNo?: string | null;
  bankIfscCode?: string | null;
  bankBranchCode?: string | null;
  OneRsVer?: number | null;
  BankVer?: number | null;
  verifiedAadhaarNumber?: number | null;
  Aadharverified?: number | null;
  verifiedAgeBand?: string | null;
  verifiedState?: string | null;
  verifiedMobileNumber?: number | null;
  verifiedGender?: string | null;
  ESINo?: string | null;
  EsiVer?: number | null;
  PfNumber?: string | null;
  PFVer?: number | null;
  UanNumber?: string | null;
  Nominee?: string | null;
  PfPercentage?: string | null;
  verifiedPanNumber?: string | null;
  fcm_token?: string | null;
  Entrydate?: Date | null;
  Userid?: number | null;
  PersonalReference?: string | null;
  PersonalReferenceMob?: string | null;
  PersonalRefRelationship?: string | null;
  PersonalRefVer?: number | null;
  CommuteType?: string | null;
  Canteen?: number | null;
  Profile?: string | null;
  BLNUPDATE?: number | null;
  Employee_Verified?: number | null;
  CompanyMail?: string | null;
  Is_Employe_Active?: number | null;
  AppTheme?: string | null;
  Height?: string | number | null;
  Weight?: string | number | null;
  Latitude?: string | null;
  Longitude?: string | null;
  IsApplicationSubmited?: number | null;
  Panverified?: number | null;
  RegisterId?: number | null;
  OfficialEmailID?: string | null;
  ShiftId?: number | null;
  CategoryId?: number | null;
  ACType?: string | null;
  AlternativeMobile?: string | null;
  CasteCategory?: string | null;
  DOB?: string | null;
  mother_tongue?: string | null;
  Approve?: number | null;
  ApvBy?: number | null;
  ApvDate?: Date | null;
  Remarks?: string | null;
  DOR?: string | null;
  ESI_Flag?: number | null;
  PF_Flag?: number | null;
  Contractor?: number | null;
  updated_at?: Date | null;
  updated_by?: number | null;
  deleted_at?: Date | null;
  deleted_by?: number | null;
  no_account_flag?: number | null;
  Is_worker_Verified?: number | null;
  employee_insurance?: number | null;
  insurance_number?: string | null;
  uniform_issued?: number | null;
  uniform_issued_date?: string | null;
  ad_shift?: number | null;
}

export interface MasterEmployeeCreationAttributes
  extends Optional<MasterEmployeeAttributes, "employeeId"> {}

export class MasterEmployee
  extends Model<MasterEmployeeAttributes, MasterEmployeeCreationAttributes>
  implements MasterEmployeeAttributes
{
  public employeeId!: number;
  public title?: string | null;
  public nickName?: string | null;
  public FirstName?: string | null;
  public LastName?: string | null;
  public maritalStatus?: string | null;
  public father_Spouse?: string | null;
  public gender?: string | null;
  public birthday?: string | null;
  public EmployeeNo?: string | null;
  public employeeMobile?: number | null;
  public employeeEmail?: string | null;
  public Unitid?: number | null;
  public departmentid?: number | null;
  public WorkType?: string | null;
  public designationid?: number | null;
  public Mdesignationid?: number | null;
  public salaryType?: string | null;
  public grade?: string | null;
  public ReferedBy?: number | null;
  public dateOfJoining?: string | null;
  public confirmationDate?: string | null;
  public emergencyContactPerson?: string | null;
  public emergencyNumber?: number | null;
  public Relationship?: string | null;
  public Delflag?: number | null;
  public bloodGroupId?: number | null;
  public nationality?: string | null;
  public residentialStatus?: string | null;
  public religion?: string | null;
  public physicallyChallenged?: string | null;
  public Detail?: string | null;
  public empPresentAddressDno?: string | null;
  public empPresentAddressStreet?: string | null;
  public empPresentAddressNagar?: string | null;
  public empPresentAddressVillage?: string | null;
  public empPresentAddressStateId?: number | null;
  public empPresentAddressDistrictId?: number | null;
  public empPresentAddressPincode?: number | null;
  public empPresentAddressTaluk?: string | null;
  public empPermanentAddressDno?: string | null;
  public empPermanentAddressStreet?: string | null;
  public empPermanentAddressNagar?: string | null;
  public empPermanentAddressVillage?: string | null;
  public empPermanentAddressState?: number | null;
  public empPermanentAddressDistrict?: number | null;
  public empPermanentAddressPincode?: number | null;
  public empPermanentAddressTaluk?: string | null;
  public DLNo?: string | null;
  public DLVer?: number | null;
  public employeeBankName?: string | null;
  public branchName?: string | null;
  public AccountHolderName?: string | null;
  public employeeAccountNo?: string | null;
  public bankIfscCode?: string | null;
  public bankBranchCode?: string | null;
  public OneRsVer?: number | null;
  public BankVer?: number | null;
  public verifiedAadhaarNumber?: number | null;
  public Aadharverified?: number | null;
  public verifiedAgeBand?: string | null;
  public verifiedState?: string | null;
  public verifiedMobileNumber?: number | null;
  public verifiedGender?: string | null;
  public ESINo?: string | null;
  public EsiVer?: number | null;
  public PfNumber?: string | null;
  public PFVer?: number | null;
  public UanNumber?: string | null;
  public Nominee?: string | null;
  public PfPercentage?: string | null;
  public verifiedPanNumber?: string | null;
  public fcm_token?: string | null;
  public Entrydate?: Date | null;
  public Userid?: number | null;
  public PersonalReference?: string | null;
  public PersonalReferenceMob?: string | null;
  public PersonalRefRelationship?: string | null;
  public PersonalRefVer?: number | null;
  public CommuteType?: string | null;
  public Canteen?: number | null;
  public Profile?: string | null;
  public BLNUPDATE?: number | null;
  public Employee_Verified?: number | null;
  public CompanyMail?: string | null;
  public Is_Employe_Active?: number | null;
  public AppTheme?: string | null;
  public Height?: string | number | null;
  public Weight?: string | number | null;
  public Latitude?: string | null;
  public Longitude?: string | null;
  public IsApplicationSubmited?: number | null;
  public Panverified?: number | null;
  public RegisterId?: number | null;
  public OfficialEmailID?: string | null;
  public ShiftId?: number | null;
  public CategoryId?: number | null;
  public ACType?: string | null;
  public AlternativeMobile?: string | null;
  public CasteCategory?: string | null;
  public DOB?: string | null;
  public mother_tongue?: string | null;
  public Approve?: number | null;
  public ApvBy?: number | null;
  public ApvDate?: Date | null;
  public Remarks?: string | null;
  public DOR?: string | null;
  public ESI_Flag?: number | null;
  public PF_Flag?: number | null;
  public Contractor?: number | null;
  public updated_at?: Date | null;
  public updated_by?: number | null;
  public deleted_at?: Date | null;
  public deleted_by?: number | null;
  public no_account_flag?: number | null;
  public Is_worker_Verified?: number | null;
  public employee_insurance?: number | null;
  public insurance_number?: string | null;
  public uniform_issued?: number | null;
  public uniform_issued_date?: string | null;
  public ad_shift?: number | null;

  public static associate(models: Record<string, any>): void {
    MasterEmployee.belongsTo(models.Register, {
      foreignKey: "EmployeeNo",
      targetKey: "EmployeeNo",
      as: "CreatedBy",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.Register, {
      foreignKey: "ReferedBy",
      targetKey: "id",
      as: "Referrer",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.Department, {
      foreignKey: "departmentid",
      targetKey: "id",
      as: "Department",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.Designation, {
      foreignKey: "designationid",
      targetKey: "id",
      as: "Designation",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.Designation, {
      foreignKey: "Mdesignationid",
      targetKey: "id",
      as: "ManageDesignation",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.CompanyUnit, {
      foreignKey: "Unitid",
      targetKey: "id",
      as: "Unit",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.MasterBloodGroup, {
      foreignKey: "bloodGroupId",
      targetKey: "ID",
      as: "BloodGroup",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.States, {
      foreignKey: "empPresentAddressStateId",
      targetKey: "StateID",
      as: "PresentState",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.Districts, {
      foreignKey: "empPresentAddressDistrictId",
      targetKey: "id",
      as: "PresentDistrict",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.States, {
      foreignKey: "empPermanentAddressState",
      targetKey: "StateID",
      as: "PermanentState",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.Districts, {
      foreignKey: "empPermanentAddressDistrict",
      targetKey: "id",
      as: "PermanentDistrict",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.MasterShift, {
      foreignKey: "ShiftId",
      targetKey: "shiftid",
      as: "ShiftDetails",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.MasterShift, {
      foreignKey: "ad_shift",
      targetKey: "shiftid",
      as: "AdShiftDetails",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.CompanySettings, {
      foreignKey: "Unitid",
      targetKey: "Unitid",
      as: "UnitSettings",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.Master_Work_Category, {
      foreignKey: "CategoryId",
      targetKey: "id",
      as: "category_id_for_work",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.Register, {
      foreignKey: "RegisterId",
      targetKey: "id",
      as: "registered_id_for_master_employee",
      constraints: false,
    });
    MasterEmployee.hasMany(models.EmployeePunchData, {
      foreignKey: "EmployeeNo",
      sourceKey: "EmployeeNo",
      as: "PunchData",
      constraints: false,
    });
    MasterEmployee.hasMany(models.MapShiftGroup, {
      foreignKey: "employeeId",
      sourceKey: "employeeId",
      as: "ShiftGroupHistory",
      constraints: false,
    });
    MasterEmployee.hasMany(models.MasterEmployeeLanguageKnown, {
      foreignKey: "employeeId",
      sourceKey: "employeeId",
      as: "LanguagesKnown",
      constraints: false,
    });
    MasterEmployee.hasMany(models.MasterEmployeeEducation, {
      foreignKey: "employeeId",
      sourceKey: "employeeId",
      as: "EducationDetails",
      constraints: false,
    });
    MasterEmployee.hasMany(models.MasterEmployeePrevious, {
      foreignKey: "employeeId",
      sourceKey: "employeeId",
      as: "PreviousEmployments",
      constraints: false,
    });
    MasterEmployee.hasMany(models.MasterEmployeeFamilyDetails, {
      foreignKey: "employeeId",
      sourceKey: "employeeId",
      as: "FamilyDetails",
      constraints: false,
    });
    MasterEmployee.hasMany(models.MasterEmployeeDocument, {
      foreignKey: "employeeId",
      sourceKey: "employeeId",
      as: "Documents",
      constraints: false,
    });
    MasterEmployee.hasMany(models.MasterEmployeeReporting, {
      foreignKey: "employeeId",
      sourceKey: "employeeId",
      as: "ReportingDetails",
      constraints: false,
    });
    MasterEmployee.hasMany(models.MasterEmployeeSalary, {
      foreignKey: "employeeId",
      sourceKey: "employeeId",
      as: "SalaryDetails",
      constraints: false,
    });
    MasterEmployee.hasMany(models.OLSSubMap, {
      foreignKey: "EmployeeNo",
      sourceKey: "EmployeeNo",
      as: "OLSSubMap",
      constraints: false,
    });
    MasterEmployee.hasMany(models.EmployeeExpense, {
      foreignKey: "EmployeeNo",
      sourceKey: "EmployeeNo",
      as: "Expenses",
      constraints: false,
    });
    MasterEmployee.belongsTo(models.MasterEmployeeReporting, {
      foreignKey: "employeeId",
      targetKey: "employeeId",
      as: "ReportingManagerDetails",
      constraints: false,
    });
  }
}

export const initMasterEmployee = (sequelize: Sequelize): void => {
  MasterEmployee.init(
    {
      employeeId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING(5) },
      nickName: { type: DataTypes.STRING(45) },
      FirstName: { type: DataTypes.STRING(45) },
      LastName: { type: DataTypes.STRING(15) },
      maritalStatus: { type: DataTypes.STRING(20) },
      father_Spouse: { type: DataTypes.STRING(45) },
      gender: { type: DataTypes.STRING(10) },
      birthday: { type: DataTypes.DATEONLY },
      EmployeeNo: { type: DataTypes.STRING(20) },
      employeeMobile: { type: DataTypes.BIGINT },
      employeeEmail: { type: DataTypes.STRING(45) },
      Unitid: { type: DataTypes.INTEGER },
      departmentid: { type: DataTypes.INTEGER },
      WorkType: { type: DataTypes.STRING(20) },
      designationid: { type: DataTypes.INTEGER },
      Mdesignationid: { type: DataTypes.INTEGER },
      salaryType: { type: DataTypes.STRING(45) },
      grade: { type: DataTypes.STRING(5) },
      ReferedBy: { type: DataTypes.INTEGER },
      dateOfJoining: { type: DataTypes.DATEONLY },
      confirmationDate: { type: DataTypes.DATEONLY },
      emergencyContactPerson: { type: DataTypes.STRING(50) },
      emergencyNumber: { type: DataTypes.BIGINT },
      Relationship: { type: DataTypes.STRING(45) },
      Delflag: { type: DataTypes.INTEGER },
      bloodGroupId: { type: DataTypes.INTEGER },
      nationality: { type: DataTypes.STRING(45) },
      residentialStatus: { type: DataTypes.STRING(45) },
      religion: { type: DataTypes.STRING(45) },
      physicallyChallenged: { type: DataTypes.STRING(10) },
      Detail: { type: DataTypes.STRING(30) },
      empPresentAddressDno: { type: DataTypes.STRING(45) },
      empPresentAddressStreet: { type: DataTypes.STRING(255) },
      empPresentAddressNagar: { type: DataTypes.STRING(255) },
      empPresentAddressVillage: { type: DataTypes.STRING(255) },
      empPresentAddressStateId: { type: DataTypes.INTEGER },
      empPresentAddressDistrictId: { type: DataTypes.INTEGER },
      empPresentAddressPincode: { type: DataTypes.INTEGER },
      empPresentAddressTaluk: { type: DataTypes.STRING(45) },
      empPermanentAddressDno: { type: DataTypes.STRING(45) },
      empPermanentAddressStreet: { type: DataTypes.STRING(255) },
      empPermanentAddressNagar: { type: DataTypes.STRING(255) },
      empPermanentAddressVillage: { type: DataTypes.STRING(255) },
      empPermanentAddressState: { type: DataTypes.INTEGER },
      empPermanentAddressDistrict: { type: DataTypes.INTEGER },
      empPermanentAddressPincode: { type: DataTypes.INTEGER },
      empPermanentAddressTaluk: { type: DataTypes.STRING(45) },
      DLNo: { type: DataTypes.STRING(50) },
      DLVer: { type: DataTypes.INTEGER, defaultValue: 0 },
      employeeBankName: { type: DataTypes.STRING(255) },
      branchName: { type: DataTypes.STRING(100) },
      AccountHolderName: { type: DataTypes.STRING(45) },
      employeeAccountNo: { type: DataTypes.STRING(20) },
      bankIfscCode: { type: DataTypes.STRING(45) },
      bankBranchCode: { type: DataTypes.STRING(45) },
      OneRsVer: { type: DataTypes.INTEGER, defaultValue: 0 },
      BankVer: { type: DataTypes.INTEGER, defaultValue: 0 },
      verifiedAadhaarNumber: { type: DataTypes.BIGINT },
      Aadharverified: { type: DataTypes.INTEGER, defaultValue: 0 },
      verifiedAgeBand: { type: DataTypes.STRING(45) },
      verifiedState: { type: DataTypes.STRING(100) },
      verifiedMobileNumber: { type: DataTypes.BIGINT },
      verifiedGender: { type: DataTypes.STRING(10) },
      ESINo: { type: DataTypes.STRING(75) },
      EsiVer: { type: DataTypes.INTEGER, defaultValue: 0 },
      PfNumber: { type: DataTypes.STRING(75) },
      PFVer: { type: DataTypes.INTEGER, defaultValue: 0 },
      UanNumber: { type: DataTypes.STRING(75) },
      Nominee: { type: DataTypes.STRING(255) },
      PfPercentage: { type: DataTypes.STRING(255) },
      verifiedPanNumber: { type: DataTypes.STRING(10) },
      fcm_token: { type: DataTypes.TEXT },
      Entrydate: { type: DataTypes.DATE },
      Userid: { type: DataTypes.INTEGER },
      PersonalReference: { type: DataTypes.STRING(150) },
      PersonalReferenceMob: { type: DataTypes.STRING(15) },
      PersonalRefRelationship: { type: DataTypes.STRING(75) },
      PersonalRefVer: { type: DataTypes.INTEGER, defaultValue: 0 },
      CommuteType: { type: DataTypes.STRING(45) },
      Canteen: { type: DataTypes.INTEGER, defaultValue: 0 },
      Profile: { type: DataTypes.STRING(500) },
      BLNUPDATE: { type: DataTypes.INTEGER },
      Employee_Verified: { type: DataTypes.INTEGER, defaultValue: 0 },
      CompanyMail: { type: DataTypes.STRING(45) },
      Is_Employe_Active: { type: DataTypes.INTEGER, defaultValue: 0 },
      AppTheme: { type: DataTypes.STRING(45) },
      Height: { type: DataTypes.DECIMAL(18, 2) },
      Weight: { type: DataTypes.DECIMAL(18, 2) },
      Latitude: { type: DataTypes.STRING(45) },
      Longitude: { type: DataTypes.STRING(45) },
      IsApplicationSubmited: { type: DataTypes.INTEGER, defaultValue: 0 },
      Panverified: { type: DataTypes.INTEGER, defaultValue: 0 },
      RegisterId: { type: DataTypes.INTEGER },
      OfficialEmailID: { type: DataTypes.STRING(45) },
      ShiftId: { type: DataTypes.INTEGER },
      CategoryId: { type: DataTypes.INTEGER },
      ACType: { type: DataTypes.STRING(45) },
      AlternativeMobile: { type: DataTypes.STRING(45) },
      CasteCategory: { type: DataTypes.STRING(45) },
      DOB: { type: DataTypes.DATEONLY },
      mother_tongue: { type: DataTypes.STRING(25) },
      Approve: { type: DataTypes.TINYINT, defaultValue: 0 },
      ApvBy: { type: DataTypes.INTEGER },
      ApvDate: { type: DataTypes.DATE },
      Remarks: { type: DataTypes.TEXT },
      DOR: { type: DataTypes.DATEONLY },
      ESI_Flag: { type: DataTypes.TINYINT, defaultValue: 0 },
      PF_Flag: { type: DataTypes.TINYINT, defaultValue: 0 },
      Contractor: { type: DataTypes.TINYINT, defaultValue: 0 },
      updated_at: { type: DataTypes.DATE, allowNull: true },
      updated_by: { type: DataTypes.INTEGER, allowNull: true },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
      deleted_by: { type: DataTypes.INTEGER, allowNull: true },
      no_account_flag: { type: DataTypes.TINYINT, defaultValue: 0 },
      Is_worker_Verified: { type: DataTypes.TINYINT, defaultValue: 0 },
      employee_insurance: { type: DataTypes.TINYINT, defaultValue: 0 },
      insurance_number: { type: DataTypes.STRING(45) },
      uniform_issued: { type: DataTypes.TINYINT, defaultValue: 0 },
      uniform_issued_date: { type: DataTypes.DATEONLY },
      ad_shift: { type: DataTypes.TINYINT, allowNull: true },
    },
    {
      sequelize,
      modelName: "MasterEmployee",
      tableName: "masteremployee",
      timestamps: true,
      paranoid: true,
      createdAt: "Entrydate",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );
};
