# Azure Deployment Configuration for Reservaya

## Required GitHub Secrets

### Frontend Repository (reservaya)

1. **AZURE_CREDENTIALS** - Azure Service Principal credentials in JSON format
2. **AZURE_WEBAPP_NAME_STG** - Value: `reservaya-frontend-stg`
3. **AZURE_WEBAPP_NAME_PROD** - Value: `reservaya-frontend-prod`

### Backend Repository (reservaya-backend)

1. **AZURE_CREDENTIALS** - Same Azure Service Principal credentials
2. **AZURE_WEBAPP_NAME_STG** - Value: `reservaya-backend-stg`
3. **AZURE_WEBAPP_NAME_PROD** - Value: `reservaya-backend-prod`
4. **DATABASE_URL_STG** - PostgreSQL connection string for staging
5. **DATABASE_URL_PROD** - PostgreSQL connection string for production

## Creating Azure Service Principal

Run this command in Azure CLI:

```bash
az ad sp create-for-rbac \
  --name "reservaya-github-actions" \
  --role contributor \
  --scopes /subscriptions/e2948cf7-fe18-4588-977c-bc9422982b8c/resourceGroups/rsgreservayastg \
  --json-auth
```

The output will look like:
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "e2948cf7-fe18-4588-977c-bc9422982b8c",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

Copy the entire JSON output and save it as `AZURE_CREDENTIALS` secret in both repositories.

## Getting PostgreSQL Connection String

### Option 1: Azure Portal
1. Go to Azure Portal > Resource Group > rsgreservayastg
2. Select your PostgreSQL server
3. Go to Connection strings
4. Copy the connection string and replace {password} with actual password

### Option 2: Azure CLI
```bash
# List PostgreSQL servers
az postgres flexible-server list --resource-group rsgreservayastg -o table

# Get connection string (replace <server-name>)
az postgres flexible-server show-connection-string \
  --server-name <server-name> \
  --database-name reservaya \
  --admin-user <admin-user> \
  --admin-password <password>
```

The DATABASE_URL format should be:
```
postgresql://<user>:<password>@<server>.postgres.database.azure.com:5432/reservaya?sslmode=require
```

## Setting Secrets in GitHub

### Via GitHub CLI
```bash
# Frontend repo
cd ~/proyectos/reservaya
gh secret set AZURE_CREDENTIALS < azure-credentials.json
gh secret set AZURE_WEBAPP_NAME_STG -b "reservaya-frontend-stg"
gh secret set AZURE_WEBAPP_NAME_PROD -b "reservaya-frontend-prod"

# Backend repo
cd ~/proyectos/reservaya-backend
gh secret set AZURE_CREDENTIALS < azure-credentials.json
gh secret set AZURE_WEBAPP_NAME_STG -b "reservaya-backend-stg"
gh secret set AZURE_WEBAPP_NAME_PROD -b "reservaya-backend-prod"
gh secret set DATABASE_URL_STG -b "postgresql://..."
gh secret set DATABASE_URL_PROD -b "postgresql://..."
```

### Via GitHub Web UI
1. Go to repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add each secret with its name and value

## Re-triggering Workflows

After setting all secrets, re-run the workflows:

```bash
# Frontend
cd ~/proyectos/reservaya
git commit --allow-empty -m "Trigger deployment"
git push

# Backend
cd ~/proyectos/reservaya-backend
git commit --allow-empty -m "Trigger deployment"
git push
```

Or use GitHub CLI to re-run failed workflows:
```bash
gh run rerun <run-id>
```

## Environment Variables

### Frontend (set during build)
- `VITE_API_URL` - Backend API URL (e.g., `https://reservaya-backend-stg.azurewebsites.net`)

### Backend (set in Azure Web App)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS
- `NODE_ENV` - `production`

## Azure Web App Configuration

Make sure the following are configured in Azure Web Apps:

### Backend Web App
1. Go to Configuration > Application settings
2. Add:
   - `DATABASE_URL` = PostgreSQL connection string
   - `JWT_SECRET` = Your JWT secret
   - `NODE_ENV` = production
   - `FRONTEND_URL` = https://reservaya-frontend-stg.azurewebsites.net

### Frontend Web App
- No additional configuration needed (built with VITE_API_URL)
