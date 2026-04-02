-- AlterTable
ALTER TABLE "users" ADD COLUMN     "fcm_token" TEXT;

-- CreateTable
CREATE TABLE "current_locations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "current_locations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "current_locations" ADD CONSTRAINT "current_locations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
