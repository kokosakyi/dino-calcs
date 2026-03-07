# 1. See what changed (optional but very useful)

git status

# 2. Add the files you want to commit

# (most people just do this to add everything changed/new)

git add .

# OR — more precise / safer:

# git add src/components/Button.jsx

# git add public/images/

# git add README.md

# 3. Create the commit

git commit -m "fix mobile menu not closing on outside click"

# Good commit message examples:

# "add user authentication flow"

# "refactor api service layer"

# "update tailwind config + add dark mode support"

# "fix bug: cannot type in search input on iOS"

# 4. Send it to GitHub

git push
