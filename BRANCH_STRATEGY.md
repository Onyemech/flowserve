# 🌿 FlowServe AI - Git Branch Strategy

## 📋 Branch Structure

### Main Branches

**`main`** - Production Branch
- Always deployable
- Protected branch
- Requires pull request reviews
- Auto-deploys to production (Vercel)
- Only merge from `dev` after testing

**`dev`** - Development Branch
- Integration branch for features
- Deploy to staging/preview environment
- Merge feature branches here first
- Test before merging to `main`

---

## 🔄 Workflow

### For New Features:

```bash
# 1. Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# 2. Work on your feature
git add .
git commit -m "Add: your feature description"

# 3. Push feature branch
git push origin feature/your-feature-name

# 4. Create Pull Request to dev
# Review and merge on GitHub

# 5. After testing on dev, merge to main
git checkout main
git pull origin main
git merge dev
git push origin main
```

### For Bug Fixes:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/bug-description

# 2. Fix the bug
git add .
git commit -m "Fix: bug description"

# 3. Push and create PR to main
git push origin hotfix/bug-description

# 4. After merge, sync dev
git checkout dev
git merge main
git push origin dev
```

---

## 🏷️ Branch Naming Convention

**Features:**
- `feature/add-whatsapp-templates`
- `feature/payment-analytics`
- `feature/user-notifications`

**Bug Fixes:**
- `hotfix/payment-webhook-error`
- `hotfix/login-redirect-issue`
- `bugfix/image-upload-fail`

**Improvements:**
- `improve/dashboard-performance`
- `improve/mobile-responsiveness`
- `refactor/api-routes`

**Documentation:**
- `docs/api-documentation`
- `docs/deployment-guide`

---

## 📦 Current Branches

### Active Branches:
- ✅ `main` - Production (live)
- ✅ `dev` - Development (staging)

### Branch Status:
```bash
# View all branches
git branch -a

# View remote branches
git branch -r

# Switch branches
git checkout dev
git checkout main
```

---

## 🚀 Deployment Flow

```
feature/new-feature
    ↓
   dev (test here)
    ↓
  main (production)
    ↓
Vercel Auto-Deploy
```

---

## 🔒 Branch Protection Rules (Recommended)

### For `main` branch:
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict who can push

### For `dev` branch:
- ✅ Require pull request reviews (optional)
- ✅ Allow force pushes (for rebasing)

---

## 📝 Commit Message Convention

```bash
# Format: Type: Description

# Types:
Add:      # New feature
Fix:      # Bug fix
Update:   # Update existing feature
Remove:   # Remove feature/code
Refactor: # Code refactoring
Docs:     # Documentation
Style:    # Formatting, no code change
Test:     # Adding tests
Chore:    # Maintenance tasks

# Examples:
git commit -m "Add: WhatsApp template management"
git commit -m "Fix: Payment webhook signature verification"
git commit -m "Update: Dashboard analytics UI"
git commit -m "Docs: Add API documentation"
```

---

## 🔄 Syncing Branches

### Keep dev updated with main:
```bash
git checkout dev
git merge main
git push origin dev
```

### Keep feature branch updated:
```bash
git checkout feature/your-feature
git merge dev
git push origin feature/your-feature
```

---

## 🎯 Quick Commands

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# List all branches
git branch -a

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature

# Rename current branch
git branch -m new-branch-name

# View branch history
git log --oneline --graph --all

# Stash changes before switching
git stash
git checkout other-branch
git stash pop
```

---

## 📊 Current Setup

```
Repository: https://github.com/Onyemech/flowserve

Branches:
├── main (production)
│   └── Auto-deploys to Vercel
└── dev (development)
    └── For testing before production

Workflow:
1. Work on dev branch
2. Test thoroughly
3. Merge to main
4. Auto-deploy to production
```

---

## ✅ Best Practices

1. **Always pull before creating new branch**
   ```bash
   git pull origin dev
   ```

2. **Keep commits small and focused**
   - One feature/fix per commit
   - Clear commit messages

3. **Test before merging to main**
   - Test on dev branch first
   - Run build locally
   - Check for errors

4. **Never commit sensitive data**
   - Use .env files
   - Add to .gitignore
   - Use environment variables

5. **Regular syncing**
   - Keep dev updated with main
   - Keep feature branches updated with dev

---

## 🎉 You're All Set!

Your branch strategy is configured:
- ✅ `main` branch for production
- ✅ `dev` branch for development
- ✅ Ready for feature branches

**Start developing on the `dev` branch! 🚀**
