-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "tech_stack" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "show_on_portfolio" BOOLEAN NOT NULL DEFAULT false,
    "last_commit_at" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_show_on_portfolio_featured_idx" ON "projects"("show_on_portfolio", "featured");

-- CreateIndex
CREATE UNIQUE INDEX "projects_provider_repo_id_key" ON "projects"("provider", "repo_id");
