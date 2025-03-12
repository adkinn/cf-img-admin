# Cloudflare Images Admin

A modern web application for managing your Cloudflare Images. Built with React, React Router, and TypeScript.

![screenshot of the cf-img-admin](https://imagedelivery.net/YuQ2fAVKRjZQ4TYu1_j8PQ/0271b93f-e8d6-40c2-cfad-33cbfb1eb300/public)

The current Cloudflare Images interface does not provide an easy way to see the images you have uploaded. So I've created this simple application as a way to enhance the browsing experience.

This is a simple application intended for use locally or internally not in production. 

## Features

- 📸 View and manage your Cloudflare Images
- 🔄 Upload new images
- 🗑️ Delete images with confirmation
- 🔍 View detailed image information including variants
- 🎨 Modern, responsive UI with Tailwind CSS
- 🔒 Secure handling of Cloudflare credentials

## Installation

1. Clone the repository:
```bash
git clone https://github.com/adkinn/cf-img-admin.git
cd cf-img-admin
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Cloudflare credentials:
```env
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ACCOUNT_HASH=your_account_hash
```

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| CLOUDFLARE_API_TOKEN | Your Cloudflare API token with Images permissions | Yes |
| CLOUDFLARE_ACCOUNT_ID | Your Cloudflare account ID | Yes |
| CLOUDFLARE_ACCOUNT_HASH | Your Cloudflare account hash for image URLs | Yes |

### Getting Your Credentials

1. **API Token**: Create a new API token at https://dash.cloudflare.com/profile/api-tokens with the following permissions:
   - Account > Cloudflare Images: Read & Edit
   - Account > Account Analytics: Read

2. **Account ID**: Found on your Cloudflare Images dashboard screen: `https://dash.cloudflare.com/<ACCOUNT_ID>/images`

3. **Account Hash**: Found on your Cloudflare Images dashboard screen

## Usage

### Viewing Images
- Navigate to the gallery page to view all your images. Currently limited to the first 100.
- Click on an image to view its details
- View variant configurations and URLs

### Uploading Images
1. Click the "Upload Image" button
2. Select an image file (supported formats: JPEG, PNG, GIF, WebP)
3. Click "Upload"
4. After upload, the gallery will refresh

### Deleting Images
1. Navigate to the image details page
2. Click the "Delete Image" button
3. Confirm the deletion
4. After upload, the gallery will refresh

## Development
This is tool is an experiment in using Cursor AI to lead the development of a project. The code and project structure are almost fully designed by Cursor AI. My input so far has been in selecting React Router as the framework, project design, testing and assisting the debugging of challenging bugs.

### Project Structure
```
app/
├── components/        # Reusable React components
├── lib/              # Utility functions and services
├── routes/           # Remix routes and pages
├── styles/           # CSS styles
└── types/           # TypeScript type definitions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript checks
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Co-developer [Cursor AI](https://cursor.com)
- Built with [React Router](https://reactrouter.com)
- Uses [Cloudflare Images API](https://developers.cloudflare.com/images/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
