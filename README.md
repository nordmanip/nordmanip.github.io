# Nordic Robotic Manipulation Network Website

A simple, single-page website for the Nordic Robotic Manipulation Network built for GitHub Pages.

## 🚀 Deploying to GitHub Pages

### Option 1: Quick Setup (Recommended)

1. **Create a new GitHub repository**
   - Go to [github.com/new](https://github.com/new)
   - Name it something like `nordic-manipulation-network` or `nordmanip`
   - Make it public (required for free GitHub Pages)
   - Don't initialize with README (you'll push this code)

2. **Push this code to the repository**
   ```bash
   cd nordic-manipulation-network
   git init
   git add .
   git commit -m "Initial website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages** (in the left sidebar)
   - Under "Source", select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

4. **Access your site**
   - Your site will be live at: `https://YOUR_USERNAME.github.io/REPO_NAME/`
   - It may take 1-2 minutes to deploy

### Option 2: Using a Custom Domain

If you want a custom domain like `nordmanip.org`:

1. Complete Option 1 first
2. In **Settings** → **Pages**, enter your custom domain
3. Add these DNS records at your domain registrar:
   - For apex domain (`nordmanip.org`): A records pointing to GitHub's IPs
   - For subdomain (`www.nordmanip.org`): CNAME record pointing to `YOUR_USERNAME.github.io`

See [GitHub's custom domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) for details.

## 📁 File Structure

```
nordic-manipulation-network/
├── index.html      # The entire website (single-page)
└── README.md       # This file
```

## ✏️ Customizing the Website

The website is a single HTML file with embedded CSS. To customize:

### Update Contact Information
Search for `jens.lundell@utu.fi` and `jenslundell.ai` in `index.html` and replace with your details.

### Change Colors
Modify the CSS variables at the top of the `<style>` section:
```css
:root {
    --color-accent: #2d5a7b;      /* Main blue color */
    --color-accent-light: #4a8db7; /* Lighter blue */
    --color-highlight: #c9e4f6;    /* Light blue background */
    /* ... */
}
```

### Add/Remove Research Areas
Find the `research-grid` section and add or modify the `research-card` divs.

### Update Activities
Modify the `activities-grid` section to change reading group times or meetup details.

## 🔧 Local Development

To preview changes locally, simply open `index.html` in a web browser. No build step required.

For live reload during development, you can use a simple local server:
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000
```

## 📝 License

Feel free to use and modify this template for your research network.
