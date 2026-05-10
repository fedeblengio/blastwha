-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'starter', 'pro');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'scheduled', 'sending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('queued', 'sending', 'sent', 'delivered', 'read', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'free',
    "wa_session_id" VARCHAR(255),
    "wa_connected" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_lists" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "opted_out" BOOLEAN NOT NULL DEFAULT false,
    "list_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "message_body" TEXT NOT NULL,
    "media_url" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "user_id" INTEGER NOT NULL,
    "list_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_messages" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'queued',
    "sent_at" TIMESTAMP(3),
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_phone_list_id_key" ON "contacts"("phone", "list_id");

-- AddForeignKey
ALTER TABLE "contact_lists" ADD CONSTRAINT "contact_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "contact_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_messages" ADD CONSTRAINT "campaign_messages_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_messages" ADD CONSTRAINT "campaign_messages_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
