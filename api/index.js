// src/modules/order/order.router.ts
import { Router } from "express";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum UserRole {\n  CUSTOMER\n  SELLER\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  BANNED\n}\n\nenum OrderStatus {\n  PROCESSING\n  SHIPPED\n  DELIVERED\n  CANCELLED\n}\n\nmodel MedicineCategory {\n  id          String     @id @default(uuid())\n  name        String\n  slug        String     @unique\n  description String?\n  image       String?\n  isActive    Boolean    @default(true)\n  createdAt   DateTime   @default(now())\n  updatedAt   DateTime   @updatedAt\n  medicines   Medicine[]\n\n  @@index([slug])\n  @@index([name])\n}\n\nmodel Medicine {\n  id           String           @id @default(uuid())\n  name         String\n  slug         String           @unique\n  brandName    String\n  genericName  String?\n  manufacturer String?\n  description  String?\n  isOtc        Boolean          @default(true)\n  thumbnail    String?\n  isActive     Boolean          @default(true)\n  rating       Float            @default(0)\n  totalRatings Int              @default(0)\n  createdAt    DateTime         @default(now())\n  updatedAt    DateTime         @updatedAt\n  categoryId   String\n  category     MedicineCategory @relation(fields: [categoryId], references: [id])\n  sellers      SellerMedicine[]\n  reviews      Review[]\n\n  @@index([name])\n  @@index([slug])\n  @@index([categoryId])\n  @@index([isActive])\n}\n\nmodel SellerMedicine {\n  id            String      @id @default(uuid())\n  price         Float\n  originalPrice Float?\n  stockQuantity Int         @default(0)\n  expiryDate    DateTime?\n  batchNumber   String?\n  isAvailable   Boolean     @default(true)\n  discount      Float       @default(0)\n  createdAt     DateTime    @default(now())\n  updatedAt     DateTime    @updatedAt\n  medicineId    String\n  medicine      Medicine    @relation(fields: [medicineId], references: [id], onDelete: Cascade)\n  sellerId      String\n  seller        User        @relation(fields: [sellerId], references: [id])\n  cartItems     CartItem[]\n  orderItems    OrderItem[]\n\n  @@unique([medicineId, batchNumber, sellerId])\n  @@index([medicineId])\n  @@index([sellerId])\n  @@index([isAvailable])\n}\n\nmodel Cart {\n  id        String     @id @default(uuid())\n  userId    String\n  user      User       @relation(fields: [userId], references: [id])\n  createdAt DateTime   @default(now())\n  updatedAt DateTime   @updatedAt\n  items     CartItem[]\n\n  @@index([userId])\n}\n\nmodel CartItem {\n  id               String         @id @default(uuid())\n  quantity         Int            @default(1)\n  cartId           String\n  cart             Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)\n  sellerMedicineId String\n  sellerMedicine   SellerMedicine @relation(fields: [sellerMedicineId], references: [id], onDelete: Cascade)\n\n  @@unique([cartId, sellerMedicineId])\n}\n\nmodel Order {\n  id              String      @id @default(uuid())\n  orderNumber     String      @unique\n  userId          String\n  user            User        @relation(fields: [userId], references: [id])\n  totalAmount     Float\n  discount        Float       @default(0)\n  finalAmount     Float\n  status          OrderStatus @default(PROCESSING)\n  shippingAddress String\n  paymentMethod   String      @default("COD")\n  notes           String?\n  createdAt       DateTime    @default(now())\n  updatedAt       DateTime    @updatedAt\n  items           OrderItem[]\n  orderLogs       OrderLog[]\n  reviews         Review[]\n\n  @@index([userId])\n  @@index([orderNumber])\n  @@index([status])\n  @@index([createdAt])\n}\n\nmodel OrderItem {\n  id               String         @id @default(uuid())\n  price            Float\n  quantity         Int\n  discount         Float          @default(0)\n  subtotal         Float\n  orderId          String\n  order            Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  sellerMedicineId String\n  sellerMedicine   SellerMedicine @relation(fields: [sellerMedicineId], references: [id])\n\n  @@index([orderId])\n}\n\nmodel OrderLog {\n  id        String      @id @default(uuid())\n  orderId   String\n  status    OrderStatus\n  notes     String?\n  createdAt DateTime    @default(now())\n  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  @@index([orderId])\n}\n\nmodel Review {\n  id         String   @id @default(uuid())\n  userId     String\n  user       User     @relation(fields: [userId], references: [id])\n  rating     Int\n  comment    String?\n  isVerified Boolean  @default(false)\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n  medicineId String\n  medicine   Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)\n  orderId    String?\n  order      Order?   @relation(fields: [orderId], references: [id])\n\n  @@unique([medicineId, orderId])\n  @@index([userId])\n  @@index([rating])\n}\n\nmodel User {\n  id              String           @id\n  name            String\n  email           String\n  emailVerified   Boolean          @default(false)\n  image           String?\n  role            UserRole         @default(CUSTOMER)\n  status          UserStatus       @default(ACTIVE)\n  createdAt       DateTime         @default(now())\n  updatedAt       DateTime         @updatedAt\n  sessions        Session[]\n  accounts        Account[]\n  carts           Cart[]\n  orders          Order[]\n  reviews         Review[]\n  sellerMedicines SellerMedicine[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"MedicineCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"medicines","kind":"object","type":"Medicine","relationName":"MedicineToMedicineCategory"}],"dbName":null},"Medicine":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"brandName","kind":"scalar","type":"String"},{"name":"genericName","kind":"scalar","type":"String"},{"name":"manufacturer","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"isOtc","kind":"scalar","type":"Boolean"},{"name":"thumbnail","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"rating","kind":"scalar","type":"Float"},{"name":"totalRatings","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"MedicineCategory","relationName":"MedicineToMedicineCategory"},{"name":"sellers","kind":"object","type":"SellerMedicine","relationName":"MedicineToSellerMedicine"},{"name":"reviews","kind":"object","type":"Review","relationName":"MedicineToReview"}],"dbName":null},"SellerMedicine":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"originalPrice","kind":"scalar","type":"Float"},{"name":"stockQuantity","kind":"scalar","type":"Int"},{"name":"expiryDate","kind":"scalar","type":"DateTime"},{"name":"batchNumber","kind":"scalar","type":"String"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"discount","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToSellerMedicine"},{"name":"sellerId","kind":"scalar","type":"String"},{"name":"seller","kind":"object","type":"User","relationName":"SellerMedicineToUser"},{"name":"cartItems","kind":"object","type":"CartItem","relationName":"CartItemToSellerMedicine"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"OrderItemToSellerMedicine"}],"dbName":null},"Cart":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"CartToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"items","kind":"object","type":"CartItem","relationName":"CartToCartItem"}],"dbName":null},"CartItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"cartId","kind":"scalar","type":"String"},{"name":"cart","kind":"object","type":"Cart","relationName":"CartToCartItem"},{"name":"sellerMedicineId","kind":"scalar","type":"String"},{"name":"sellerMedicine","kind":"object","type":"SellerMedicine","relationName":"CartItemToSellerMedicine"}],"dbName":null},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderNumber","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"totalAmount","kind":"scalar","type":"Float"},{"name":"discount","kind":"scalar","type":"Float"},{"name":"finalAmount","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"shippingAddress","kind":"scalar","type":"String"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"items","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"},{"name":"orderLogs","kind":"object","type":"OrderLog","relationName":"OrderToOrderLog"},{"name":"reviews","kind":"object","type":"Review","relationName":"OrderToReview"}],"dbName":null},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"discount","kind":"scalar","type":"Float"},{"name":"subtotal","kind":"scalar","type":"Float"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"sellerMedicineId","kind":"scalar","type":"String"},{"name":"sellerMedicine","kind":"object","type":"SellerMedicine","relationName":"OrderItemToSellerMedicine"}],"dbName":null},"OrderLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"notes","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderLog"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToReview"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToReview"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"carts","kind":"object","type":"Cart","relationName":"CartToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"sellerMedicines","kind":"object","type":"SellerMedicine","relationName":"SellerMedicineToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var UserRole = {
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
  ADMIN: "ADMIN"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED"
};
var OrderStatus = {
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/helpers/generateOrderNumber.ts
var generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1e3).toString().padStart(3, "0");
  return `ORD-${timestamp}-${random}`;
};
var generateOrderNumber_default = generateOrderNumber;

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/modules/order/order.service.ts
var getAllOrders = async () => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            sellerMedicine: {
              include: {
                medicine: true,
                seller: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });
    return {
      statusCode: 200,
      success: true,
      message: "All platform orders retrieved successfully",
      data: orders
    };
  } catch (error) {
    console.error("Get all orders error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve all orders",
      data: null
    };
  }
};
var createOrder = async (userId, data) => {
  try {
    const { items, shippingAddress, notes } = data;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        success: false,
        message: "Order must contain at least one item",
        data: null
      };
    }
    let totalAmount = 0;
    let discount = 0;
    for (const item of items) {
      const sellerMedicine = await prisma.sellerMedicine.findUnique({
        where: { id: item.sellerMedicineId },
        include: { medicine: true }
      });
      if (!sellerMedicine) {
        return {
          statusCode: 400,
          success: false,
          message: `Invalid item: ${item.sellerMedicineId}`,
          data: null
        };
      }
      if (!sellerMedicine.isAvailable) {
        return {
          statusCode: 400,
          success: false,
          message: `${sellerMedicine.medicine.name} is not available`,
          data: null
        };
      }
      if (sellerMedicine.stockQuantity < item.quantity) {
        return {
          statusCode: 400,
          success: false,
          message: `Insufficient stock for ${sellerMedicine.medicine.name}. Available: ${sellerMedicine.stockQuantity}`,
          data: null
        };
      }
      const itemPrice = sellerMedicine.price * item.quantity;
      const itemDiscount = sellerMedicine.discount * item.quantity;
      totalAmount += itemPrice;
      discount += itemDiscount;
    }
    const finalAmount = totalAmount - discount;
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber_default(),
          userId,
          totalAmount,
          discount,
          finalAmount,
          shippingAddress,
          notes,
          paymentMethod: "COD",
          status: OrderStatus.PROCESSING
        }
      });
      for (const item of items) {
        const sellerMedicine = await tx.sellerMedicine.findUnique({
          where: { id: item.sellerMedicineId }
        });
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            sellerMedicineId: item.sellerMedicineId,
            price: sellerMedicine.price,
            quantity: item.quantity,
            discount: sellerMedicine.discount * item.quantity,
            subtotal: sellerMedicine.price * item.quantity
          }
        });
        await tx.sellerMedicine.update({
          where: { id: item.sellerMedicineId },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });
      }
      await tx.orderLog.create({
        data: {
          orderId: newOrder.id,
          status: OrderStatus.PROCESSING,
          notes: "Order placed successfully"
        }
      });
      return newOrder;
    });
    return {
      statusCode: 201,
      success: true,
      message: "Order created successfully",
      data: order
    };
  } catch (error) {
    console.error("Create order error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to create order",
      data: null
    };
  }
};
var getUserOrders = async (userId) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            sellerMedicine: {
              include: {
                medicine: true
              }
            }
          }
        },
        orderLogs: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });
    return {
      statusCode: 200,
      success: true,
      message: "Orders retrieved successfully",
      data: orders
    };
  } catch (error) {
    console.error("Get user orders error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve orders",
      data: null
    };
  }
};
var getOrderDetails = async (orderId, userId, userRole) => {
  try {
    const id = { id: orderId };
    if (userRole !== UserRole.ADMIN) {
      if (userRole === UserRole.CUSTOMER) {
        id.userId = userId;
      } else if (userRole === UserRole.SELLER) {
        id.items = {
          some: {
            sellerMedicine: {
              sellerId: userId
            }
          }
        };
      }
    }
    const order = await prisma.order.findFirst({
      where: id,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            sellerMedicine: {
              include: {
                medicine: true,
                seller: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        orderLogs: {
          orderBy: { createdAt: "asc" }
        }
      }
    });
    if (!order) {
      return {
        statusCode: 404,
        success: false,
        message: "Order not found or you don't have permission to view it",
        data: null
      };
    }
    return {
      statusCode: 200,
      success: true,
      message: "Order details retrieved successfully",
      data: order
    };
  } catch (error) {
    console.error("Get order details error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve order details",
      data: null
    };
  }
};
var getSellerOrders = async (sellerId) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            sellerMedicine: {
              sellerId
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          where: {
            sellerMedicine: {
              sellerId
            }
          },
          include: {
            sellerMedicine: {
              include: {
                medicine: true
              }
            }
          }
        },
        orderLogs: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });
    return {
      statusCode: 200,
      success: true,
      message: "Seller orders retrieved successfully",
      data: orders
    };
  } catch (error) {
    console.error("Get seller orders error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve seller orders",
      data: null
    };
  }
};
var updateOrderStatus = async (orderId, sellerId, status, notes) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            sellerMedicine: {
              sellerId
            }
          }
        }
      }
    });
    if (!order) {
      return {
        statusCode: 404,
        success: false,
        message: "Order not found or you don't have permission to update it",
        data: null
      };
    }
    if (order.status === OrderStatus.CANCELLED) {
      return {
        statusCode: 400,
        success: false,
        message: "Cannot update cancelled order",
        data: null
      };
    }
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order2 = await tx.order.update({
        where: { id: orderId },
        data: { status }
      });
      await tx.orderLog.create({
        data: {
          orderId,
          status,
          notes: notes || `Status updated to ${status}`
        }
      });
      return order2;
    });
    return {
      statusCode: 200,
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder
    };
  } catch (error) {
    console.error("Update order status error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to update order status",
      data: null
    };
  }
};
var cancelOrder = async (orderId, userId) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      }
    });
    if (!order) {
      return {
        statusCode: 404,
        success: false,
        message: "Order not found",
        data: null
      };
    }
    if (order.status !== OrderStatus.PROCESSING) {
      return {
        statusCode: 400,
        success: false,
        message: `Cannot cancel order. Current status: ${order.status}`,
        data: null
      };
    }
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED }
      });
      await tx.orderLog.create({
        data: {
          orderId,
          status: OrderStatus.CANCELLED,
          notes: "Order cancelled by customer"
        }
      });
      const orderItems = await tx.orderItem.findMany({
        where: { orderId },
        include: { sellerMedicine: true }
      });
      for (const item of orderItems) {
        await tx.sellerMedicine.update({
          where: { id: item.sellerMedicineId },
          data: {
            stockQuantity: {
              increment: item.quantity
            }
          }
        });
      }
      return updatedOrder;
    });
    return {
      statusCode: 200,
      success: true,
      message: "Order cancelled successfully",
      data: cancelledOrder
    };
  } catch (error) {
    console.error("Cancel order error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to cancel order",
      data: null
    };
  }
};
var trackOrder = async (orderNumber, userId, userRole) => {
  try {
    const id = { orderNumber };
    if (userId && userRole !== UserRole.ADMIN) {
      if (userRole === UserRole.CUSTOMER) {
        id.userId = userId;
      } else if (userRole === UserRole.SELLER) {
        id.items = {
          some: {
            sellerMedicine: {
              sellerId: userId
            }
          }
        };
      }
    }
    const order = await prisma.order.findFirst({
      where: id,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        shippingAddress: true,
        orderLogs: {
          orderBy: { createdAt: "asc" },
          select: {
            status: true,
            notes: true,
            createdAt: true
          }
        },
        items: {
          select: {
            quantity: true,
            sellerMedicine: {
              select: {
                medicine: {
                  select: {
                    name: true,
                    thumbnail: true
                  }
                }
              }
            }
          }
        }
      }
    });
    if (!order) {
      return {
        statusCode: 404,
        success: false,
        message: "Order not found or you don't have permission to view it",
        data: null
      };
    }
    return {
      statusCode: 200,
      success: true,
      message: "Order tracking information retrieved",
      data: order
    };
  } catch (error) {
    console.error("Track order error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to track order",
      data: null
    };
  }
};
var orderService = {
  getAllOrders,
  createOrder,
  getUserOrders,
  getOrderDetails,
  getSellerOrders,
  updateOrderStatus,
  cancelOrder,
  trackOrder
};

// src/modules/order/order.controller.ts
var getAllOrders2 = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders();
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var createOrder2 = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const result = await orderService.createOrder(req.user.id, req.body);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var getUserOrders2 = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const result = await orderService.getUserOrders(req.user.id);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var getOrderDetails2 = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const result = await orderService.getOrderDetails(
      req.params.orderId,
      req.user.id,
      req.user.role
    );
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var getSellerOrders2 = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const result = await orderService.getSellerOrders(req.user.id);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var updateOrderStatus2 = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const { status, notes } = req.body;
    if (!status || !Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
        data: null
      });
    }
    const result = await orderService.updateOrderStatus(
      req.params.orderId,
      req.user.id,
      status,
      notes
    );
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var cancelOrder2 = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const result = await orderService.cancelOrder(
      req.params.orderId,
      req.user.id
    );
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var trackOrder2 = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const result = await orderService.trackOrder(orderNumber, userId, userRole);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var orderController = {
  getAllOrders: getAllOrders2,
  createOrder: createOrder2,
  getUserOrders: getUserOrders2,
  getOrderDetails: getOrderDetails2,
  getSellerOrders: getSellerOrders2,
  updateOrderStatus: updateOrderStatus2,
  cancelOrder: cancelOrder2,
  trackOrder: trackOrder2
};

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [process.env.APP_URL],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        default: "CUSTOMER",
        required: false,
        input: true
      },
      status: {
        type: "string",
        default: "ACTIVE",
        required: false,
        input: false
      }
    }
  }
});

// src/middlewares/auth.ts
var authMiddleware = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!"
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        status: session.user.status
      };
      if (req.user.status === UserStatus.BANNED) {
        return res.status(403).json({
          success: false,
          message: "Your account has been banned."
        });
      }
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You don't have permission to access this resource"
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = authMiddleware;

// src/modules/order/order.router.ts
var router = Router();
router.get(
  "/admin/all-orders",
  authMiddleware(UserRole.ADMIN),
  orderController.getAllOrders
);
router.post(
  "/",
  authMiddleware(UserRole.CUSTOMER),
  orderController.createOrder
);
router.get(
  "/my-orders",
  authMiddleware(UserRole.CUSTOMER),
  orderController.getUserOrders
);
router.get(
  "/:orderId",
  authMiddleware(UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN),
  orderController.getOrderDetails
);
router.patch(
  "/:orderId/cancel",
  authMiddleware(UserRole.CUSTOMER),
  orderController.cancelOrder
);
router.get(
  "/seller/orders",
  authMiddleware(UserRole.SELLER),
  orderController.getSellerOrders
);
router.patch(
  "/seller/orders/:orderId/status",
  authMiddleware(UserRole.SELLER),
  orderController.updateOrderStatus
);
router.get("/track/:orderNumber", orderController.trackOrder);
var orderRouter = router;

// src/app.ts
import express2 from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

// src/middlewares/notFound.ts
var notFound = (req, res, next) => {
  const errorDetails = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get("User-Agent"),
    referrer: req.get("Referer"),
    contentType: req.get("Content-Type"),
    contentLength: req.get("Content-Length"),
    host: req.get("Host")
  };
  res.status(404).json({
    success: false,
    message: "Resource not found",
    error: errorDetails
  });
};

// src/modules/medicine/medicine.router.ts
import { Router as Router2 } from "express";

// src/modules/medicine/medicine.service.ts
var createMedicine = async (payload) => {
  try {
    const { name, brandName, price, stockQuantity, categoryId, sellerId } = payload;
    if (!name?.trim() || !brandName?.trim() || !categoryId?.trim() || !sellerId?.trim()) {
      return {
        statusCode: 400,
        success: false,
        message: "Name, brandName, categoryId, and sellerId are required",
        data: null
      };
    }
    if (price <= 0 || stockQuantity < 0) {
      return {
        statusCode: 400,
        success: false,
        message: "Price must be > 0 and stockQuantity >= 0",
        data: null
      };
    }
    const category = await prisma.medicineCategory.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      return {
        statusCode: 404,
        success: false,
        message: "Category not found",
        data: null
      };
    }
    const seller = await prisma.user.findUnique({
      where: { id: sellerId, role: "SELLER" }
    });
    if (!seller) {
      return {
        statusCode: 403,
        success: false,
        message: "Seller not found or not authorized",
        data: null
      };
    }
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const existingSlug = await prisma.medicine.findUnique({
      where: { slug }
    });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;
    const medicine = await prisma.medicine.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        brandName: brandName.trim(),
        categoryId
      }
    });
    const sellerMedicine = await prisma.sellerMedicine.create({
      data: {
        price,
        stockQuantity,
        sellerId,
        medicineId: medicine.id,
        isAvailable: stockQuantity > 0
      }
    });
    return {
      statusCode: 201,
      success: true,
      message: "Medicine created successfully",
      data: {
        medicine,
        sellerMedicine
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: error instanceof Error ? error.message : "Medicine creation failed",
      data: null
    };
  }
};
var getAllMedicines = async (filters = {}) => {
  try {
    const {
      search,
      category,
      manufacturer,
      minPrice,
      maxPrice,
      take = 50,
      skip = 0,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = filters;
    const where = {
      isActive: true
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brandName: { contains: search, mode: "insensitive" } },
        { genericName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } }
      ];
    }
    if (category) {
      where.categoryId = category;
    }
    if (manufacturer) {
      where.manufacturer = { contains: manufacturer, mode: "insensitive" };
    }
    if (minPrice !== void 0 || maxPrice !== void 0) {
      where.sellers = {
        some: {
          isAvailable: true,
          price: {
            ...minPrice !== void 0 && { gte: minPrice },
            ...maxPrice !== void 0 && { lte: maxPrice }
          }
        }
      };
    }
    const orderBy = {};
    if (sortBy !== "price") {
      orderBy[sortBy] = sortOrder;
    }
    const medicines = await prisma.medicine.findMany({
      where,
      take,
      skip,
      orderBy: sortBy === "price" ? void 0 : orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        sellers: {
          where: { isAvailable: true },
          take: 1,
          orderBy: { price: "asc" },
          select: {
            id: true,
            price: true,
            stockQuantity: true,
            discount: true,
            seller: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    });
    if (sortBy === "price") {
      medicines.sort((a, b) => {
        const priceA = a.sellers[0]?.price || Infinity;
        const priceB = b.sellers[0]?.price || Infinity;
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      });
    }
    const total = await prisma.medicine.count({ where });
    return {
      statusCode: 200,
      success: true,
      message: "Medicines fetched successfully",
      data: {
        medicines,
        total,
        pagination: {
          page: Math.floor(skip / take) + 1,
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        },
        filters: {
          applied: {
            search,
            category,
            manufacturer,
            minPrice,
            maxPrice
          },
          sort: {
            by: sortBy,
            order: sortOrder
          }
        }
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch medicines",
      data: null
    };
  }
};
var getSingleMedicine = async (id) => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id, isActive: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        sellers: {
          where: { isAvailable: true },
          select: {
            id: true,
            price: true,
            stockQuantity: true,
            discount: true,
            seller: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        reviews: {
          take: 10,
          where: { isVerified: true },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    });
    if (!medicine) {
      return {
        statusCode: 404,
        success: false,
        message: "Medicine not found",
        data: null
      };
    }
    return {
      statusCode: 200,
      success: true,
      message: "Medicine fetched successfully",
      data: medicine
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch medicine",
      data: null
    };
  }
};
var updateSellerMedicine = async (medicineId, sellerId, payload) => {
  try {
    const sellerMedicine = await prisma.sellerMedicine.findFirst({
      where: {
        medicineId,
        sellerId
      }
    });
    if (!sellerMedicine) {
      return {
        statusCode: 404,
        success: false,
        message: "Medicine not found in your inventory",
        data: null
      };
    }
    const updatedSellerMedicine = await prisma.sellerMedicine.update({
      where: { id: sellerMedicine.id },
      data: {
        ...payload,
        isAvailable: payload.stockQuantity !== void 0 ? payload.stockQuantity > 0 : sellerMedicine.isAvailable
      }
    });
    return {
      statusCode: 200,
      success: true,
      message: "Medicine updated successfully",
      data: updatedSellerMedicine
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: error instanceof Error ? error.message : "Failed to update medicine",
      data: null
    };
  }
};
var deleteSellerMedicine = async (medicineId, sellerId) => {
  try {
    const sellerMedicine = await prisma.sellerMedicine.findFirst({
      where: { medicineId, sellerId }
    });
    if (!sellerMedicine) {
      return { statusCode: 404, success: false, message: "Listing not found" };
    }
    await prisma.sellerMedicine.delete({
      where: { id: sellerMedicine.id }
    });
    return {
      statusCode: 200,
      success: true,
      message: "Medicine permanently removed from your inventory"
    };
  } catch (error) {
    if (error.code === "P2003") {
      return {
        statusCode: 400,
        success: false,
        message: "Cannot delete: This medicine is linked to existing orders. Try hiding it instead."
      };
    }
    return {
      statusCode: 500,
      success: false,
      message: error.message || "Failed to delete medicine"
    };
  }
};
var getSellerMedicines = async (sellerId) => {
  try {
    const sellerMedicines = await prisma.sellerMedicine.findMany({
      where: { sellerId },
      include: {
        medicine: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return {
      statusCode: 200,
      success: true,
      message: "Seller medicines fetched successfully",
      data: sellerMedicines
    };
  } catch (error) {
    return {
      statusCode: 500,
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch seller medicines",
      data: null
    };
  }
};
var medicineService = {
  createMedicine,
  getAllMedicines,
  getSingleMedicine,
  updateSellerMedicine,
  deleteSellerMedicine,
  getSellerMedicines
};

// src/modules/medicine/medicine.controller.ts
var createMedicine2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId || req.user?.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        error: "Only sellers can create medicines"
      });
    }
    const data = { ...req.body, sellerId };
    const result = await medicineService.createMedicine(data);
    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};
var getAllMedicines2 = async (req, res, next) => {
  try {
    const {
      search,
      category,
      manufacturer,
      minPrice,
      maxPrice,
      page = "1",
      limit = "50",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;
    const filters = {
      search,
      category,
      manufacturer,
      ...minPrice !== void 0 && minPrice !== null && minPrice !== "" ? { minPrice: parseFloat(minPrice) } : {},
      ...maxPrice !== void 0 && maxPrice !== null && maxPrice !== "" ? { maxPrice: parseFloat(maxPrice) } : {},
      take: limitNum,
      skip,
      sortBy,
      sortOrder
    };
    const result = await medicineService.getAllMedicines(filters);
    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};
var getSingleMedicine2 = async (req, res, next) => {
  try {
    const result = await medicineService.getSingleMedicine(
      req.params.id
    );
    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};
var updateSellerMedicine2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    const medicineId = req.params?.id;
    if (!sellerId || req.user?.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        error: "sellers can only update medicines"
      });
    }
    const result = await medicineService.updateSellerMedicine(
      medicineId,
      sellerId,
      req.body
    );
    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};
var deleteSellerMedicine2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    const medicineId = req.params?.id;
    if (!sellerId || req.user?.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        error: "Only sellers can delete medicines"
      });
    }
    const result = await medicineService.deleteSellerMedicine(
      medicineId,
      sellerId
    );
    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};
var getSellerMedicines2 = async (req, res, next) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId || req.user?.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        error: "Only sellers can view their medicines"
      });
    }
    const result = await medicineService.getSellerMedicines(sellerId);
    res.status(result.statusCode).json(result);
  } catch (e) {
    next(e);
  }
};
var medicineController = {
  createMedicine: createMedicine2,
  getAllMedicines: getAllMedicines2,
  getSingleMedicine: getSingleMedicine2,
  updateSellerMedicine: updateSellerMedicine2,
  deleteSellerMedicine: deleteSellerMedicine2,
  getSellerMedicines: getSellerMedicines2
};

// src/modules/medicine/medicine.router.ts
var router2 = Router2();
router2.get("/", medicineController.getAllMedicines);
router2.get("/:id", medicineController.getSingleMedicine);
router2.post(
  "/",
  auth_default(UserRole.SELLER),
  medicineController.createMedicine
);
router2.get(
  "/seller/inventory",
  auth_default(UserRole.SELLER),
  medicineController.getSellerMedicines
);
router2.put(
  "/seller/:id",
  auth_default(UserRole.SELLER),
  medicineController.updateSellerMedicine
);
router2.delete(
  "/seller/:id",
  auth_default(UserRole.SELLER),
  medicineController.deleteSellerMedicine
);
var medicineRouter = router2;

// src/modules/category/category.router.ts
import express from "express";

// src/modules/category/category.service.ts
var generateSlug = (text) => {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
};
var createCategory = async (payload) => {
  try {
    const { name, description, image } = payload;
    if (!name?.trim()) {
      return {
        success: false,
        statusCode: 400,
        message: "Category name is required",
        data: null
      };
    }
    const slug = generateSlug(name.trim());
    const existingCategory = await prisma.medicineCategory.findFirst({
      where: {
        OR: [{ name: name.trim() }, { slug }]
      }
    });
    if (existingCategory) {
      return {
        success: false,
        statusCode: 409,
        message: existingCategory.name === name.trim() ? "Category with this name already exists" : "Category with similar name already exists",
        data: null
      };
    }
    const category = await prisma.medicineCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        image: image || null
      }
    });
    return {
      success: true,
      statusCode: 201,
      message: "Category created successfully",
      data: category
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to create category",
      data: null
    };
  }
};
var getAllCategories = async () => {
  const categories = await prisma.medicineCategory.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { medicines: true }
      }
    }
  });
  const formattedCategories = categories.map((cat) => ({
    ...cat,
    medicineCount: cat._count.medicines,
    _count: void 0
  }));
  const totalCategories = await prisma.medicineCategory.count();
  console.log(totalCategories);
  return {
    success: true,
    statusCode: 200,
    message: "Categories fetched successfully",
    data: { totalCategories, categories: formattedCategories }
  };
};
var getSingleCategory = async (id) => {
  if (!id) {
    return {
      success: false,
      statusCode: 400,
      message: "Category id is required",
      data: null
    };
  }
  const category = await prisma.medicineCategory.findUnique({
    where: { id },
    include: {
      medicines: true
    }
  });
  if (!category) {
    return {
      success: false,
      statusCode: 404,
      message: "Category not found",
      data: null
    };
  }
  return {
    success: true,
    statusCode: 200,
    message: "Category fetched successfully",
    data: category
  };
};
var deleteSingleCategory = async (id) => {
  try {
    const medicinesCount = await prisma.medicine.count({
      where: {
        categoryId: id
      }
    });
    if (medicinesCount > 0) {
      return {
        success: false,
        message: `Cannot delete category. It has ${medicinesCount} medicine(s) associated. Move or delete the medicines first.`,
        data: null,
        statusCode: 400
      };
    }
    const deletedCategory = await prisma.medicineCategory.delete({
      where: {
        id
      }
    });
    return {
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
      statusCode: 200
    };
  } catch (error) {
    let message = "Failed to delete category";
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        message = "Cannot delete category with associated medicines";
        statusCode = 400;
      } else if (error.message.includes("Record to delete does not exist")) {
        message = "Category not found";
        statusCode = 404;
      }
    }
    return {
      success: false,
      message,
      data: null,
      statusCode
    };
  }
};
var updateCategory = async (id, payload) => {
  try {
    if (!id) {
      return {
        success: false,
        statusCode: 400,
        message: "Category ID is required",
        data: null
      };
    }
    const existingCategory = await prisma.medicineCategory.findUnique({
      where: { id }
    });
    if (!existingCategory) {
      return {
        success: false,
        statusCode: 404,
        message: "Category not found",
        data: null
      };
    }
    const updateData = {};
    if (payload.name !== void 0) {
      const newName = payload.name.trim();
      updateData.name = newName;
      const newSlug = generateSlug(newName);
      updateData.slug = newSlug;
      const duplicateCategory = await prisma.medicineCategory.findFirst({
        where: {
          OR: [{ name: newName }, { slug: newSlug }],
          NOT: { id }
        }
      });
      if (duplicateCategory) {
        return {
          success: false,
          statusCode: 409,
          message: duplicateCategory.name === newName ? "Another category already exists with this name" : "Another category already exists with similar name",
          data: null
        };
      }
    }
    if (payload.description !== void 0) {
      updateData.description = payload.description.trim();
    }
    if (payload.image !== void 0) {
      updateData.image = payload.image;
    }
    if (payload.isActive !== void 0) {
      updateData.isActive = payload.isActive;
    }
    const updatedCategory = await prisma.medicineCategory.update({
      where: { id },
      data: updateData
    });
    return {
      success: true,
      statusCode: 200,
      message: "Category updated successfully",
      data: updatedCategory
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Failed to update category",
      data: null
    };
  }
};
var categoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  deleteSingleCategory,
  updateCategory
};

// src/modules/category/category.controller.ts
var createCategory2 = async (req, res, next) => {
  try {
    const result = await categoryService.createCategory(req.body);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var getAllCategories2 = async (req, res, next) => {
  try {
    const result = await categoryService.getAllCategories();
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var getSingleCategory2 = async (req, res, next) => {
  try {
    const result = await categoryService.getSingleCategory(
      req.params.id
    );
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var deleteSingleCategory2 = async (req, res, next) => {
  try {
    const result = await categoryService.deleteSingleCategory(
      req.params.id
    );
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var updateCategory2 = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await categoryService.updateCategory(id, req.body);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var categoryController = {
  createCategory: createCategory2,
  getAllCategories: getAllCategories2,
  getSingleCategory: getSingleCategory2,
  deleteSingleCategory: deleteSingleCategory2,
  updateCategory: updateCategory2
};

// src/modules/category/category.router.ts
var router3 = express.Router();
router3.get("/", categoryController.getAllCategories);
router3.get("/:id", categoryController.getSingleCategory);
router3.post(
  "/",
  auth_default(UserRole.ADMIN),
  categoryController.createCategory
);
router3.delete(
  "/:id",
  auth_default(UserRole.ADMIN),
  categoryController.deleteSingleCategory
);
router3.put(
  "/:id",
  auth_default(UserRole.ADMIN),
  categoryController.updateCategory
);
var categoryRouter = router3;

// src/modules/admin/admin.router.ts
import { Router as Router3 } from "express";

// src/modules/admin/admin.service.ts
var getAllUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      image: true
    }
  });
  return {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: users
  };
};
var getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
          reviews: true,
          sellerMedicines: true
        }
      }
    }
  });
  if (!user) {
    return {
      statusCode: 404,
      success: false,
      message: "User not found",
      data: null
    };
  }
  return {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: user
  };
};
var banUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    return {
      statusCode: 404,
      success: false,
      message: "User not found",
      data: null
    };
  }
  if (user.role === UserRole.ADMIN) {
    return {
      statusCode: 403,
      success: false,
      message: "Cannot ban admin users",
      data: null
    };
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.BANNED },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true
    }
  });
  return {
    statusCode: 200,
    success: true,
    message: "User banned successfully",
    data: updatedUser
  };
};
var unbanUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    return {
      statusCode: 404,
      success: false,
      message: "User not found",
      data: null
    };
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: UserStatus.ACTIVE },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true
    }
  });
  return {
    statusCode: 200,
    success: true,
    message: "User unbanned successfully",
    data: updatedUser
  };
};
var getStats = async () => {
  const [
    totalUsers,
    totalCustomers,
    totalSellers,
    totalAdmins,
    activeUsers,
    bannedUsers,
    totalOrders,
    totalMedicines,
    totalCategories
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
    prisma.user.count({ where: { role: UserRole.SELLER } }),
    prisma.user.count({ where: { role: UserRole.ADMIN } }),
    prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
    prisma.user.count({ where: { status: UserStatus.BANNED } }),
    prisma.order.count(),
    prisma.medicine.count(),
    prisma.medicineCategory.count()
  ]);
  const stats = {
    users: {
      total: totalUsers,
      customers: totalCustomers,
      sellers: totalSellers,
      admins: totalAdmins,
      active: activeUsers,
      banned: bannedUsers
    },
    platform: {
      orders: totalOrders,
      medicines: totalMedicines,
      categories: totalCategories
    }
  };
  return {
    statusCode: 200,
    success: true,
    message: "Platform stats retrieved successfully",
    data: stats
  };
};
var adminService = {
  getAllUsers,
  getUserById,
  banUser,
  unbanUser,
  getStats
};

// src/modules/admin/admin.controller.ts
var getAllUsers2 = async (req, res, next) => {
  try {
    const result = await adminService.getAllUsers();
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var getUserById2 = async (req, res, next) => {
  try {
    const result = await adminService.getUserById(req.params.userId);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var banUser2 = async (req, res, next) => {
  try {
    const result = await adminService.banUser(req.params.userId);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var unbanUser2 = async (req, res, next) => {
  try {
    const result = await adminService.unbanUser(req.params.userId);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var getStats2 = async (req, res, next) => {
  try {
    const result = await adminService.getStats();
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var adminController = {
  getAllUsers: getAllUsers2,
  getUserById: getUserById2,
  banUser: banUser2,
  unbanUser: unbanUser2,
  getStats: getStats2
};

// src/modules/admin/admin.router.ts
var router4 = Router3();
router4.use(authMiddleware(UserRole.ADMIN));
router4.get("/users", adminController.getAllUsers);
router4.get("/users/:userId", adminController.getUserById);
router4.patch("/users/:userId/ban", adminController.banUser);
router4.patch("/users/:userId/unban", adminController.unbanUser);
router4.get("/stats", adminController.getStats);
var adminRouter = router4;

// src/modules/cart/cart.router.ts
import { Router as Router4 } from "express";

// src/modules/cart/cart.service.ts
var getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findFirst({
    where: { userId }
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId }
    });
  }
  return cart;
};
var addToCart = async (userId, sellerMedicineId, quantity = 1) => {
  try {
    const sellerMedicine = await prisma.sellerMedicine.findUnique({
      where: { id: sellerMedicineId },
      include: { medicine: true }
    });
    if (!sellerMedicine) {
      return {
        statusCode: 404,
        success: false,
        message: "Medicine not found",
        data: null
      };
    }
    if (!sellerMedicine.isAvailable) {
      return {
        statusCode: 400,
        success: false,
        message: "This medicine is currently unavailable",
        data: null
      };
    }
    if (sellerMedicine.stockQuantity < quantity) {
      return {
        statusCode: 400,
        success: false,
        message: `Insufficient stock. Only ${sellerMedicine.stockQuantity} available`,
        data: null
      };
    }
    const cart = await getOrCreateCart(userId);
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        sellerMedicineId
      }
    });
    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      if (sellerMedicine.stockQuantity < newQuantity) {
        return {
          statusCode: 400,
          success: false,
          message: `Cannot add ${quantity} more. Total would exceed available stock of ${sellerMedicine.stockQuantity}`,
          data: null
        };
      }
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity }
      });
      return {
        statusCode: 200,
        success: true,
        message: "Cart item quantity updated",
        data: updatedCartItem
      };
    } else {
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          sellerMedicineId,
          quantity
        }
      });
      return {
        statusCode: 201,
        success: true,
        message: "Item added to cart",
        data: cartItem
      };
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to add item to cart",
      data: null
    };
  }
};
var getCart = async (userId) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            sellerMedicine: {
              include: {
                medicine: {
                  select: {
                    id: true,
                    name: true,
                    thumbnail: true,
                    brandName: true,
                    genericName: true
                  }
                }
              }
            }
          }
        }
      }
    });
    if (!cart || cart.items.length === 0) {
      return {
        statusCode: 200,
        success: true,
        message: "Cart is empty",
        data: {
          cartId: cart?.id || null,
          items: [],
          summary: {
            totalItems: 0,
            totalAmount: 0,
            totalDiscount: 0,
            finalAmount: 0
          }
        }
      };
    }
    let totalItems = 0;
    let totalAmount = 0;
    let totalDiscount = 0;
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const sellerMedicine = await prisma.sellerMedicine.findUnique({
          where: { id: item.sellerMedicineId }
        });
        const itemPrice = sellerMedicine.price * item.quantity;
        const itemDiscount = sellerMedicine.discount * item.quantity;
        totalItems += item.quantity;
        totalAmount += itemPrice;
        totalDiscount += itemDiscount;
        return {
          id: item.id,
          quantity: item.quantity,
          sellerMedicine: {
            id: item.sellerMedicine.id,
            price: sellerMedicine.price,
            originalPrice: sellerMedicine.originalPrice,
            discount: sellerMedicine.discount,
            stockQuantity: sellerMedicine.stockQuantity,
            isAvailable: sellerMedicine.isAvailable,
            medicine: item.sellerMedicine.medicine
          },
          subtotal: itemPrice,
          discount: itemDiscount
        };
      })
    );
    const finalAmount = totalAmount - totalDiscount;
    return {
      statusCode: 200,
      success: true,
      message: "Cart retrieved successfully",
      data: {
        cartId: cart.id,
        items: itemsWithDetails,
        summary: {
          totalItems,
          totalAmount,
          totalDiscount,
          finalAmount
        }
      }
    };
  } catch (error) {
    console.error("Get cart error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve cart",
      data: null
    };
  }
};
var updateCartItem = async (cartItemId, quantity) => {
  try {
    if (quantity < 1) {
      return {
        statusCode: 400,
        success: false,
        message: "Quantity must be at least 1",
        data: null
      };
    }
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        sellerMedicine: true
      }
    });
    if (!cartItem) {
      return {
        statusCode: 404,
        success: false,
        message: "Cart item not found",
        data: null
      };
    }
    if (cartItem.sellerMedicine.stockQuantity < quantity) {
      return {
        statusCode: 400,
        success: false,
        message: `Insufficient stock. Only ${cartItem.sellerMedicine.stockQuantity} available`,
        data: null
      };
    }
    if (!cartItem.sellerMedicine.isAvailable) {
      return {
        statusCode: 400,
        success: false,
        message: "This medicine is no longer available",
        data: null
      };
    }
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity }
    });
    return {
      statusCode: 200,
      success: true,
      message: "Cart item updated",
      data: updatedCartItem
    };
  } catch (error) {
    console.error("Update cart item error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to update cart item",
      data: null
    };
  }
};
var removeCartItem = async (cartItemId) => {
  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    });
    if (!cartItem) {
      return {
        statusCode: 404,
        success: false,
        message: "Cart item not found",
        data: null
      };
    }
    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });
    return {
      statusCode: 200,
      success: true,
      message: "Item removed from cart",
      data: null
    };
  } catch (error) {
    console.error("Remove cart item error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to remove item from cart",
      data: null
    };
  }
};
var clearCart = async (userId) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { userId }
    });
    if (!cart) {
      return {
        statusCode: 200,
        success: true,
        message: "Cart is already empty",
        data: null
      };
    }
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
    return {
      statusCode: 200,
      success: true,
      message: "Cart cleared successfully",
      data: null
    };
  } catch (error) {
    console.error("Clear cart error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to clear cart",
      data: null
    };
  }
};
var cartService = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
};

// src/modules/cart/cart.controller.ts
var addToCart2 = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const { sellerMedicineId, quantity = 1 } = req.body;
    if (!sellerMedicineId) {
      return res.status(400).json({
        success: false,
        message: "sellerMedicineId is required",
        data: null
      });
    }
    const result = await cartService.addToCart(
      req.user.id,
      sellerMedicineId,
      quantity
    );
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var getCart2 = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const result = await cartService.getCart(req.user.id);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var updateCartItem2 = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const { quantity } = req.body;
    const { itemId } = req.params;
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required (minimum 1)",
        data: null
      });
    }
    const result = await cartService.updateCartItem(itemId, quantity);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var removeCartItem2 = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const { itemId } = req.params;
    const result = await cartService.removeCartItem(itemId);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var clearCart2 = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const result = await cartService.clearCart(req.user.id);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var cartController = {
  addToCart: addToCart2,
  getCart: getCart2,
  updateCartItem: updateCartItem2,
  removeCartItem: removeCartItem2,
  clearCart: clearCart2
};

// src/modules/cart/cart.router.ts
var router5 = Router4();
router5.use(authMiddleware(UserRole.CUSTOMER));
router5.post("/add", cartController.addToCart);
router5.get("/", cartController.getCart);
router5.patch("/:itemId", cartController.updateCartItem);
router5.delete("/:itemId", cartController.removeCartItem);
router5.delete("/", cartController.clearCart);
var cartRouter = router5;

// src/modules/review/review.router.ts
import { Router as Router5 } from "express";

// src/modules/review/review.service.ts
var createReview = async (userId, medicineId, orderId, rating, comment) => {
  try {
    if (rating < 1 || rating > 5) {
      return {
        statusCode: 400,
        success: false,
        message: "Rating must be between 1 and 5",
        data: null
      };
    }
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: "DELIVERED",
        items: {
          some: {
            sellerMedicine: {
              medicineId
            }
          }
        }
      }
    });
    if (!order) {
      return {
        statusCode: 400,
        success: false,
        message: "You can only review medicines from your delivered orders",
        data: null
      };
    }
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        medicineId,
        orderId
      }
    });
    if (existingReview) {
      return {
        statusCode: 400,
        success: false,
        message: "You have already reviewed this medicine from this order",
        data: null
      };
    }
    const review = await prisma.review.create({
      data: {
        userId,
        medicineId,
        orderId,
        rating,
        comment: comment ?? null,
        isVerified: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    const medicineReviews = await prisma.review.findMany({
      where: { medicineId }
    });
    const totalRating = medicineReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / medicineReviews.length;
    await prisma.medicine.update({
      where: { id: medicineId },
      data: {
        rating: averageRating,
        totalRatings: medicineReviews.length
      }
    });
    return {
      statusCode: 201,
      success: true,
      message: "Review submitted successfully",
      data: review
    };
  } catch (error) {
    console.error("Create review error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to create review",
      data: null
    };
  }
};
var getMedicineReviews = async (medicineId) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        medicineId,
        isVerified: true
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    return {
      statusCode: 200,
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews
    };
  } catch (error) {
    console.error("Get reviews error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Failed to retrieve reviews",
      data: null
    };
  }
};
var reviewService = {
  createReview,
  getMedicineReviews
};

// src/modules/review/review.controller.ts
var createReview2 = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null
      });
    }
    const { medicineId, orderId, rating, comment } = req.body;
    if (!medicineId || !orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: "medicineId, orderId, and rating are required",
        data: null
      });
    }
    const result = await reviewService.createReview(
      req.user.id,
      medicineId,
      orderId,
      rating,
      comment
    );
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var getMedicineReviews2 = async (req, res, next) => {
  try {
    const { medicineId } = req.params;
    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine ID is required",
        data: null
      });
    }
    const result = await reviewService.getMedicineReviews(medicineId);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
var reviewController = {
  createReview: createReview2,
  getMedicineReviews: getMedicineReviews2
};

// src/modules/review/review.router.ts
var router6 = Router5();
router6.post(
  "/",
  authMiddleware(UserRole.CUSTOMER),
  reviewController.createReview
);
router6.get("/medicine/:medicineId", reviewController.getMedicineReviews);
var reviewRouter = router6;

// src/app.ts
var app = express2();
app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true
  })
);
app.use(express2.json());
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/medicines", medicineRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", orderRouter);
app.use("/api/cart", cartRouter);
app.use("/api/reviews", reviewRouter);
app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Server is running",
    path: req.path
  });
});
app.use(notFound);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err?.statusCode || 500).json({
    success: false,
    message: err?.message || "Internal server error",
    data: null
  });
});
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
