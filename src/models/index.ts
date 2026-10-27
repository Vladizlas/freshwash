
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/lib/db";

export type Role = "admin" | "cashier";

export type ProcessStatus =
  | "waiting"
  | "washing"
  | "drying"
  | "ironing"
  | "ready"
  | "picked_up";

export type PaymentStatus = "unpaid" | "partial" | "paid";
export type PaymentMethod = "cash" | "transfer" | "qris";
export type ServiceType = "kiloan" | "unit" | "dry_clean";
export type PackageServiceType = "kiloan" | "dry_clean";
export type PackageSpeed = "regular" | "express";

// Timestamp didefinisikan eksplisit agar sesuai dengan tipe Model.init().
const timestampAttributes = {
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "created_at",
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "updated_at",
  },
};

const createdAtAttribute = {
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: "created_at",
  },
};

// ======================================================
// USER
// ======================================================

interface UserAttrs {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

type UserCreate = Optional<
  UserAttrs,
  "id" | "role" | "createdAt" | "updatedAt"
>;

export class User extends Model<UserAttrs, UserCreate> implements UserAttrs {
  declare id: number;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role: Role;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password_hash",
    },
    role: {
      type: DataTypes.ENUM("admin", "cashier"),
      allowNull: false,
      defaultValue: "cashier",
    },
    ...timestampAttributes,
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

// ======================================================
// CUSTOMER
// ======================================================

interface CustomerAttrs {
  id: number;
  name: string;
  phone: string;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type CustomerCreate = Optional<
  CustomerAttrs,
  "id" | "address" | "createdAt" | "updatedAt"
>;

export class Customer
  extends Model<CustomerAttrs, CustomerCreate>
  implements CustomerAttrs
{
  declare id: number;
  declare name: string;
  declare phone: string;
  declare address: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(120), allowNull: false },
    phone: { type: DataTypes.STRING(30), allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: true },
    ...timestampAttributes,
  },
  {
    sequelize,
    tableName: "customers",
    timestamps: true,
    underscored: true,
  },
);

// ======================================================
// LAUNDRY PACKAGE
// ======================================================

interface PackageAttrs {
  id: number;
  name: string;
  serviceType: PackageServiceType;
  speed: PackageSpeed;
  pricePerKg: number;
  estimatedHours: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type PackageCreate = Optional<
  PackageAttrs,
  "id" | "active" | "createdAt" | "updatedAt"
>;

export class LaundryPackage
  extends Model<PackageAttrs, PackageCreate>
  implements PackageAttrs
{
  declare id: number;
  declare name: string;
  declare serviceType: PackageServiceType;
  declare speed: PackageSpeed;
  declare pricePerKg: number;
  declare estimatedHours: number;
  declare active: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

LaundryPackage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    serviceType: {
      type: DataTypes.ENUM("kiloan", "dry_clean"),
      allowNull: false,
      field: "service_type",
    },
    speed: {
      type: DataTypes.ENUM("regular", "express"),
      allowNull: false,
      defaultValue: "regular",
    },
    pricePerKg: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "price_per_kg",
    },
    estimatedHours: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "estimated_hours",
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    ...timestampAttributes,
  },
  {
    sequelize,
    tableName: "laundry_packages",
    timestamps: true,
    underscored: true,
  },
);

// ======================================================
// UNIT ITEM
// ======================================================

interface UnitItemAttrs {
  id: number;
  name: string;
  price: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type UnitItemCreate = Optional<
  UnitItemAttrs,
  "id" | "active" | "createdAt" | "updatedAt"
>;

export class UnitItem
  extends Model<UnitItemAttrs, UnitItemCreate>
  implements UnitItemAttrs
{
  declare id: number;
  declare name: string;
  declare price: number;
  declare active: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UnitItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    ...timestampAttributes,
  },
  {
    sequelize,
    tableName: "unit_items",
    timestamps: true,
    underscored: true,
  },
);

// ======================================================
// LAUNDRY TRANSACTION
// ======================================================

interface TxAttrs {
  id: number;
  invoiceNumber: string;
  customerId: number;
  packageId: number | null;
  serviceType: ServiceType;
  weightKg: number | null;
  totalKiloan: number;
  totalUnit: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  processStatus: ProcessStatus;
  notes: string | null;
  intakeAt: Date;
  estimatedFinish: Date | null;
  pickedUpAt: Date | null;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

type TxCreate = Optional<
  TxAttrs,
  | "id"
  | "packageId"
  | "weightKg"
  | "totalKiloan"
  | "totalUnit"
  | "discount"
  | "paidAmount"
  | "paymentStatus"
  | "processStatus"
  | "notes"
  | "intakeAt"
  | "estimatedFinish"
  | "pickedUpAt"
  | "createdBy"
  | "createdAt"
  | "updatedAt"
>;

export class LaundryTransaction
  extends Model<TxAttrs, TxCreate>
  implements TxAttrs
{
  declare id: number;
  declare invoiceNumber: string;
  declare customerId: number;
  declare packageId: number | null;
  declare serviceType: ServiceType;
  declare weightKg: number | null;
  declare totalKiloan: number;
  declare totalUnit: number;
  declare discount: number;
  declare totalAmount: number;
  declare paidAmount: number;
  declare paymentStatus: PaymentStatus;
  declare processStatus: ProcessStatus;
  declare notes: string | null;
  declare intakeAt: Date;
  declare estimatedFinish: Date | null;
  declare pickedUpAt: Date | null;
  declare createdBy: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

LaundryTransaction.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
      field: "invoice_number",
    },
    customerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "customer_id",
    },
    packageId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "package_id",
    },
    serviceType: {
      type: DataTypes.ENUM("kiloan", "unit", "dry_clean"),
      allowNull: false,
      field: "service_type",
    },
    weightKg: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      field: "weight_kg",
    },
    totalKiloan: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: "total_kiloan",
    },
    totalUnit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: "total_unit",
    },
    discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "total_amount",
    },
    paidAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: "paid_amount",
    },
    paymentStatus: {
      type: DataTypes.ENUM("unpaid", "partial", "paid"),
      allowNull: false,
      defaultValue: "unpaid",
      field: "payment_status",
    },
    processStatus: {
      type: DataTypes.ENUM(
        "waiting",
        "washing",
        "drying",
        "ironing",
        "ready",
        "picked_up",
      ),
      allowNull: false,
      defaultValue: "waiting",
      field: "process_status",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    intakeAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "intake_at",
    },
    estimatedFinish: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "estimated_finish",
    },
    pickedUpAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "picked_up_at",
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "created_by",
    },
    ...timestampAttributes,
  },
  {
    sequelize,
    tableName: "transactions",
    timestamps: true,
    underscored: true,
  },
);

// ======================================================
// LAUNDRY ORDER ITEM
// ======================================================

interface OrderItemAttrs {
  id: number;
  transactionId: number;
  unitItemId: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

type OrderItemCreate = Optional<
  OrderItemAttrs,
  "id" | "createdAt" | "updatedAt"
>;

export class LaundryOrderItem
  extends Model<OrderItemAttrs, OrderItemCreate>
  implements OrderItemAttrs
{
  declare id: number;
  declare transactionId: number;
  declare unitItemId: number;
  declare itemName: string;
  declare unitPrice: number;
  declare quantity: number;
  declare subtotal: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

LaundryOrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    transactionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "transaction_id",
    },
    unitItemId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "unit_item_id",
    },
    itemName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "item_name",
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "unit_price",
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    ...timestampAttributes,
  },
  {
    sequelize,
    tableName: "laundry_order_items",
    timestamps: true,
    underscored: true,
  },
);

// ======================================================
// PAYMENT
// ======================================================

interface PaymentAttrs {
  id: number;
  transactionId: number;
  amount: number;
  method: PaymentMethod;
  receivedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

type PaymentCreate = Optional<
  PaymentAttrs,
  "id" | "receivedBy" | "createdAt" | "updatedAt"
>;

export class Payment
  extends Model<PaymentAttrs, PaymentCreate>
  implements PaymentAttrs
{
  declare id: number;
  declare transactionId: number;
  declare amount: number;
  declare method: PaymentMethod;
  declare receivedBy: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    transactionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "transaction_id",
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM("cash", "transfer", "qris"),
      allowNull: false,
      defaultValue: "cash",
    },
    receivedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "received_by",
    },
    ...timestampAttributes,
  },
  {
    sequelize,
    tableName: "payments",
    timestamps: true,
    underscored: true,
  },
);

// ======================================================
// PROCESS HISTORY
// ======================================================

interface ProcessHistoryAttrs {
  id: number;
  transactionId: number;
  status: ProcessStatus;
  changedBy: number | null;
  note: string | null;
  createdAt: Date;
}

type ProcessHistoryCreate = Optional<
  ProcessHistoryAttrs,
  "id" | "changedBy" | "note" | "createdAt"
>;

export class ProcessHistory
  extends Model<ProcessHistoryAttrs, ProcessHistoryCreate>
  implements ProcessHistoryAttrs
{
  declare id: number;
  declare transactionId: number;
  declare status: ProcessStatus;
  declare changedBy: number | null;
  declare note: string | null;
  declare createdAt: Date;
}

ProcessHistory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    transactionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "transaction_id",
    },
    status: {
      type: DataTypes.ENUM(
        "waiting",
        "washing",
        "drying",
        "ironing",
        "ready",
        "picked_up",
      ),
      allowNull: false,
    },
    changedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "changed_by",
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ...createdAtAttribute,
  },
  {
    sequelize,
    tableName: "process_histories",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

// ======================================================
// ASSOCIATIONS
// ======================================================

Customer.hasMany(LaundryTransaction, {
  foreignKey: "customerId",
  as: "transactions",
});

LaundryTransaction.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "customer",
});

LaundryPackage.hasMany(LaundryTransaction, {
  foreignKey: "packageId",
  as: "transactions",
});

LaundryTransaction.belongsTo(LaundryPackage, {
  foreignKey: "packageId",
  as: "package",
});

LaundryTransaction.hasMany(LaundryOrderItem, {
  foreignKey: "transactionId",
  as: "items",
});

LaundryOrderItem.belongsTo(LaundryTransaction, {
  foreignKey: "transactionId",
  as: "transaction",
});

LaundryTransaction.hasMany(Payment, {
  foreignKey: "transactionId",
  as: "payments",
});

Payment.belongsTo(LaundryTransaction, {
  foreignKey: "transactionId",
  as: "transaction",
});

LaundryTransaction.hasMany(ProcessHistory, {
  foreignKey: "transactionId",
  as: "history",
});

ProcessHistory.belongsTo(LaundryTransaction, {
  foreignKey: "transactionId",
  as: "transaction",
});

LaundryOrderItem.belongsTo(UnitItem, {
  foreignKey: "unitItemId",
  as: "unitItem",
});

UnitItem.hasMany(LaundryOrderItem, {
  foreignKey: "unitItemId",
  as: "orderItems",
});

export { sequelize };
