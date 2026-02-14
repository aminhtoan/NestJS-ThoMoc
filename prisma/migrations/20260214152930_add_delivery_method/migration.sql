-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryMethodId" INTEGER,
ADD COLUMN     "shippingFee" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DeliveryMethod" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "description" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryMethod_name_key" ON "DeliveryMethod"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryMethod_code_key" ON "DeliveryMethod"("code");

-- CreateIndex
CREATE INDEX "DeliveryMethod_deletedAt_idx" ON "DeliveryMethod"("deletedAt");

-- CreateIndex
CREATE INDEX "DeliveryMethod_isActive_deletedAt_idx" ON "DeliveryMethod"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "Order_deliveryMethodId_idx" ON "Order"("deliveryMethodId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryMethodId_fkey" FOREIGN KEY ("deliveryMethodId") REFERENCES "DeliveryMethod"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DeliveryMethod" ADD CONSTRAINT "DeliveryMethod_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DeliveryMethod" ADD CONSTRAINT "DeliveryMethod_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DeliveryMethod" ADD CONSTRAINT "DeliveryMethod_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
