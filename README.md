# SurveyForge 🚀

A powerful, integrable React-based survey management application that allows you to create, deploy, and analyze surveys with ease.

## ✨ Features

### 🎯 Core Functionality
- **Visual Survey Builder** - Drag-and-drop interface for creating surveys
- **Survey Viewer** - Responsive survey rendering with multiple display modes
- **Conditional Logic** - Show/hide questions based on previous answers
- **Multi-page Surveys** - Organize questions into logical pages
- **Real-time Preview** - See changes as you build

### 🔧 Integration Capabilities
- **Component Integration** - Use as a React component in your app
- **URL-based Integration** - Navigate to survey URLs with parameters
- **Iframe Support** - Embed surveys in any web application
- **Custom Styling** - Fully customizable appearance
- **Event Handling** - Track form submissions and question changes

### 📱 Responsive Design
- **Mobile-first** approach
- **Cross-browser** compatibility
- **Accessibility** features
- **Touch-friendly** interface

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/surveyforge.git
   cd surveyforge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Usage

### 1. Creating Surveys

Navigate to the **Visual Survey Builder** to create surveys:

- Drag and drop question types from the component library
- Configure question properties in the properties panel
- Add conditional logic to show/hide questions
- Preview your survey in real-time
- Export surveys as JSON

### 2. Integrating Surveys

#### Basic Component Integration

```jsx
import SurveyViewer from 'surveyforge/components/SurveyViewer';

function App() {
  const surveyData = {
    id: "my_survey",
    title: "My Survey",
    pages: [
      {
        id: "page1",
        name: "Page 1",
        questions: [
          {
            id: "q1",
            type: "text-input",
            title: "What's your name?",
            required: true
          }
        ]
      }
    ]
  };

  const handleSubmit = (data) => {
    console.log('Survey submitted:', data);
  };

  return (
    <SurveyViewer
      surveyData={surveyData}
      onSubmit={handleSubmit}
    />
  );
}
```

#### URL-based Integration

```bash
# Basic survey viewer
/survey-viewer/survey_123

# Form mode with custom styles
/survey-viewer/survey_123?mode=form&styles={"input":"border-red-300"}
```

#### Iframe Integration

```html
<iframe 
  src="/survey-viewer/survey_123?mode=form" 
  width="100%" 
  height="600px"
  frameborder="0">
</iframe>
```

### 3. Customization

#### Display Modes

- **Survey Mode** (default): Shows descriptions and progress indicators
- **Form Mode**: Clean, compact form layout

```jsx
<SurveyViewer
  surveyData={surveyData}
  mode="form"  // or "survey"
  onSubmit={handleSubmit}
/>
```

#### Custom Styling

```jsx
const customStyles = {
  input: "border-2 border-blue-300 rounded-lg px-4 py-3",
  label: "text-lg font-semibold text-blue-800 mb-3",
  button: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg",
  error: "text-red-700 font-medium"
};

<SurveyViewer
  surveyData={surveyData}
  customStyles={customStyles}
  onSubmit={handleSubmit}
/>
```

#### Conditional Questions

```jsx
{
  id: "q2",
  type: "text-input",
  title: "How many children do you have?",
  required: true,
  conditionalLogic: {
    enabled: true,
    dependsOn: "q1",
    condition: "equals",
    value: "yes"
  }
}
```

## 🏗️ Project Structure

```
surveyforge/
├── src/
│   ├── components/
│   │   ├── SurveyViewer.jsx          # Main survey viewer component
│   │   └── ui/                       # Reusable UI components
│   ├── pages/
│   │   ├── survey-builder-dashboard/ # Dashboard for managing surveys
│   │   ├── visual-survey-builder/    # Drag-and-drop survey builder
│   │   ├── survey-viewer/            # Survey viewer page
│   │   └── demo-integration/         # Integration examples
│   ├── util/
│   │   └── mockData.js               # Sample survey data and examples
│   └── Routes.jsx                    # Application routing
├── INTEGRATION_GUIDE.md              # Comprehensive integration guide
└── README.md                         # This file
```

## 🎨 Available Question Types

- **Text Input** - Single line text
- **Email** - Email address input
- **Textarea** - Multi-line text
- **Radio Buttons** - Single selection
- **Checkboxes** - Multiple selection
- **Rating** - Numeric rating scale
- **Dropdown** - Select from options

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=SurveyForge
```

### Build Configuration

```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

### Static Hosting (Netlify, Vercel, etc.)

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure redirects for SPA routing

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📚 Documentation

- **[Integration Guide](./INTEGRATION_GUIDE.md)** - Complete integration documentation
- **[API Reference](./docs/API.md)** - Component props and methods
- **[Examples](./src/util/mockData.js)** - Code examples and sample data

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🐛 Troubleshooting

### Common Issues

1. **Survey not loading**: Check survey data structure
2. **Styling not applied**: Verify customStyles object format
3. **Conditional logic not working**: Check dependsOn field names
4. **Build errors**: Ensure Node.js version is 16+

### Debug Mode

Enable debug logging:

```jsx
<SurveyViewer
  surveyData={surveyData}
  onSubmit={handleSubmit}
  debug={true}
/>
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Built with [Vite](https://vitejs.dev/)

## 📞 Support

- **Documentation**: [Integration Guide](./INTEGRATION_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/surveyforge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/surveyforge/discussions)

---

**Made with ❤️ for the developer community**

If you find this project helpful, please give it a ⭐ star!
