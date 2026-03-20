#!/bin/bash

echo "[1/4] Preparing Workspace..."
mkdir -p ~/PortofolioWebsite
cd ~/PortofolioWebsite

if [ ! -d ".git" ]; then
  git clone https://github.com/naradaagastyajiwanta/portofolio.git .
else
  echo "[*] Repo already exists. Pulling latest..."
  git reset --hard
  git pull origin main || git pull origin master
fi

echo "[2/4] Setting up .env file..."
cat << "EOF" > .env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/portfolio_db
GITHUB_TOKEN=${GITHUB_TOKEN}
PORT=3001
JWT_SECRET=xXxnbvsi6PdRMyEwwgP968Jhg1AHx-dQx4Ia-j1nlPzHnA_xghpeWa8HDdhmtjok
FRONTEND_URL=http://103.171.84.14:3000
NEXT_PUBLIC_API_URL=http://103.171.84.14:3001
LINKEDIN_SLUG=narada-607387219
LINKEDIN_LI_AT=AQEDATcM7qcDwDLEAAABnKdMBNAAAAGcy1iI0FYAMb7suGgaxqS-mHxL7S6K_Icop-_Hih97PB8ufFuyI7U7LWKLyzvGEBv5gtV4WN4si7XI0IigaGw6QFUmt8-T5sINIk9LxGa5B55-lHd0nWtZm-1H
LINKEDIN_JSESSIONID=ajax:3191858046048887959
EOF

echo "[3/4] Setup SSH Key for GitHub CI/CD Actions..."
if [ ! -f ~/.ssh/id_ed25519 ]; then
  ssh-keygen -t ed25519 -C "github-actions-deploy" -N "" -f ~/.ssh/id_ed25519
fi
# Remove potential duplicate before adding
touch ~/.ssh/authorized_keys
sed -i '/github-actions-deploy/d' ~/.ssh/authorized_keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

echo "[4/4] Starting/Building Docker Containers on VPS..."
docker-compose down
docker-compose up -d --build

echo ""
echo "=========================================================="
echo "🎯 SERVER SETUP COMPLETE!"
echo ""
echo "🔥 SSH_PRIVATE_KEY untuk GitHub Actions:"
cat ~/.ssh/id_ed25519
echo "=========================================================="
echo "Situs Anda mulai berjalan di: http://103.171.84.14:3000"
echo "=========================================================="
