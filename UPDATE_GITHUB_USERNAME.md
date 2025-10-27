# Update GitHub Username

After you push to GitHub, run this command to update all documentation with your actual GitHub username:

## Quick Update

```bash
# Replace mohideenhajamohideen with your actual GitHub username
# For example, if your username is "johndoe":

find . -type f \( -name "*.md" -o -name "*.json" \) -not -path "*/node_modules/*" -not -path "*/dist/*" -exec sed -i '' 's/mohideenhajamohideen/johndoe/g' {} +

# Then commit the changes
git add .
git commit -m "Update GitHub username in documentation"
git push
```

## Manual Update

Or manually replace in these files:

1. **README.md**
   - Line with: `git clone https://github.com/mohideenhajamohideen/cosmic-whiskers.git`
   - Line with: `**GitHub Repository:** [github.com/mohideenhajamohideen/cosmic-whiskers]`

2. **HACKATHON_SUBMISSION.md**
   - Repository URL section

3. **SUBMISSION_CHECKLIST.md**
   - GitHub repository field

## Example

If your GitHub username is `mohideen123`:

**Before:**
```
https://github.com/mohideenhajamohideen/cosmic-whiskers
```

**After:**
```
https://github.com/mohideen123/cosmic-whiskers
```

---

**Don't forget to commit and push after updating!**
