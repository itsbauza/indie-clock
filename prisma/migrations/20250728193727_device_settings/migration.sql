-- CreateTable
CREATE TABLE "device_settings" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_settings_deviceId_key" ON "device_settings"("deviceId");

-- AddForeignKey
ALTER TABLE "device_settings" ADD CONSTRAINT "device_settings_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
