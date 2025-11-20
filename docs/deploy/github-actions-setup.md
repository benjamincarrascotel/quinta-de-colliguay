# GitHub Actions Pipeline

How CI/CD is wired for this repository.

---

## Architecture

```
GitHub Actions Runner
    ↓
[Tests] + [Linter] → automatic validation on PRs
    ↓
[Deploy Dev] → GCP dev VM
    ↓
[Deploy Prod] → GCP prod VM
```

---

## Workflows

### 1. Tests (`.github/workflows/tests.yml`)

**Triggers:** push or pull request targeting `develop` or `main`.

**What it runs:**

- Composer install + npm install
- `npm run build`
- `php artisan key:generate`
- Pest test suite under PHP 8.4

### 2. Linter (`.github/workflows/lint.yml`)

**Triggers:** push or pull request targeting `develop` or `main`.

**What it runs:**

- Laravel Pint
- `npm run format`
- `npm run lint`

### 3. Deploy Dev (`.github/workflows/deploy-dev.yml`)

**Triggers:** push to `dev` _or_ manual `workflow_dispatch`.

**Behavior:**

- Authenticates with Google Cloud using the `INFOR` environment secrets.
- Forwards the GitHub deploy key via `ssh-agent`.
- SSHs into the dev VM, fetches the target branch, resets to `origin/<branch>`, and runs `./scripts/deploy/deploy.sh dev`.

### 4. Deploy Prod (`.github/workflows/deploy-prod.yml`)

**Triggers:** push to `main` _or_ manual `workflow_dispatch`.

**Behavior:** Same as dev but targets the prod VM and uses the `INFOR-PROD` environment (enforced manual approval).

---

## Secrets & Environment Variables

Configure them under **Settings → Environments**.

### Environment `INFOR` (dev)

| Secret | Description |
| :--- | :--- |
| `GCP_PROJECT_ID` | GCP project ID. |
| `GCP_SA_KEY` | JSON for the service account with `roles/compute.osLogin`. |
| `DEV_VM_NAME` | Compute Engine instance name (e.g. `infor-dev`). |
| `DEV_VM_ZONE` | Zone (e.g. `us-east1-c`). |
| `DEV_VM_SSH_USER` | Linux username on the VM. |
| `DEV_APP_DIRECTORY` | Repository path on the VM. |
| `GH_DEPLOY_KEY` | Private deploy key used for `git fetch` inside the VM. |

### Environment `INFOR-PROD`

Same keys as above but pointing to the production VM (`PROD_VM_NAME`, `PROD_VM_ZONE`, `PROD_VM_SSH_USER`, `PROD_APP_DIRECTORY`). Reuse `GCP_PROJECT_ID`, `GCP_SA_KEY`, and `GH_DEPLOY_KEY` if both environments live inside the same project.

---

## Setting Secrets with GitHub CLI

```bash
# Dev environment
gh secret set GCP_PROJECT_ID --env INFOR --body "infor-473321"
gh secret set GCP_SA_KEY --env INFOR --body "$(cat github-sa-key.json)"

# Production environment
gh secret set PROD_VM_NAME --env INFOR-PROD --body "infor-prod"
```

Use `gh secret list --env INFOR` (or `INFOR-PROD`) to verify names.

---

## Service Account Setup (GCP)

```bash
# Create service account
gcloud iam service-accounts create github-deploy-infor \
  --display-name="GitHub Actions Deploy" \
  --project=infor-473321

# Grant permissions
gcloud projects add-iam-policy-binding infor-473321 \
  --member="serviceAccount:github-deploy-infor@infor-473321.iam.gserviceaccount.com" \
  --role="roles/compute.osLogin"

gcloud projects add-iam-policy-binding infor-473321 \
  --member="serviceAccount:github-deploy-infor@infor-473321.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Generate JSON key
gcloud iam service-accounts keys create github-sa-key.json \
  --iam-account=github-deploy-infor@infor-473321.iam.gserviceaccount.com \
  --project=infor-473321
```

Upload the JSON to both environments as `GCP_SA_KEY`, then delete the local file.

---

## Deploy Key

```bash
ssh-keygen -t ed25519 -f github-deploy-key -N "" -C "infor-deploy"
# Add github-deploy-key.pub under Settings → Deploy keys (read-only)
# Store the private half as GH_DEPLOY_KEY in both environments
rm github-deploy-key github-deploy-key.pub
```

---

## Manual Workflow Dispatch

Both deploy workflows support manual triggers:

1. Go to **Actions → Deploy to Dev/Prod → Run workflow**.
2. Pick the branch and click **Run workflow**.

You can achieve the same via CLI:

```bash
gh workflow run deploy-dev.yml --ref dev
gh run watch
```

---

## Troubleshooting

| Error | Cause | Fix |
| :--- | :--- | :--- |
| `Permission denied (publickey)` | Deploy key missing or not loaded. | Ensure `GH_DEPLOY_KEY` is set and `webfactory/ssh-agent` loads it. |
| `Failed to authenticate to Google Cloud` | Malformed `GCP_SA_KEY`. | Upload a valid JSON (no extra whitespace). |
| `./scripts/deploy/deploy.sh: Permission denied` | Script not executable on the VM. | `chmod +x scripts/deploy/deploy.sh` (see prod workflow). |
| Workflow stuck waiting for approval | Production uses environment protection. | Approve the run under **Actions → Review deployments**. |

---

Keeping the modular scripts and workflows in sync ensures parity between manual SSH deployments and CI/CD.
