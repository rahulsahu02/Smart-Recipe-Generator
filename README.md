# Smart Recipe Generator

A full-stack web application that generates personalized recipes using AI technology. The app combines Google's Gemini AI with web search capabilities to create unique recipes based on available ingredients, dietary preferences, and cuisine choices.

## 🚀 Features

- **AI-Powered Recipe Generation**: Uses Google Gemini AI to create personalized recipes
- **Ingredient-Based Search**: Find recipes based on ingredients you have available
- **Dietary Preferences**: Filter recipes by dietary restrictions and preferences
- **Cuisine Selection**: Choose from various cuisine types or let AI suggest
- **Image Recognition**: Upload food images to get recipe suggestions
- **User Authentication**: Secure user registration and login system
- **Recipe Storage**: Save and manage your favorite recipes
- **Web Search Integration**: Combines DuckDuckGo and Google Custom Search for comprehensive results

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Firebase** for additional services

### Backend
- **Flask** - Python web framework
- **MongoDB** with PyMongo for database
- **Google Gemini AI** for recipe generation
- **JWT** for authentication
- **CORS** enabled for cross-origin requests

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB database
- Google AI API key
- Google Custom Search Engine API key

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Smart-Recipe-Generator
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:
```env
GOOGLE_API_KEY=your_google_ai_api_key
GOOGLE_SEARCH_API_KEY=your_google_search_api_key
CUSTOM_SEARCH_ENGINE_ID=your_custom_search_engine_id
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret_key
```

### 3. Frontend Setup
```bash
npm install
```

### 4. Start the Application

**Backend:**
```bash
cd backend
python app.py
```
The backend will run on `http://localhost:5000`

**Frontend:**
```bash
npm start
```
The frontend will run on `http://localhost:3000`

## 🔧 API Endpoints

- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /generate-recipe` - Generate recipe from ingredients
- `POST /generate-recipe-from-image` - Generate recipe from image
- `GET /recipes` - Get user's saved recipes
- `POST /save-recipe` - Save a recipe
- `DELETE /recipes/<id>` - Delete a saved recipe

## 📱 Usage

1. **Register/Login**: Create an account or sign in
2. **Generate Recipe**: Enter available ingredients and preferences
3. **Upload Image**: Or upload a food image for recipe suggestions
4. **Save Recipes**: Store your favorite recipes for later
5. **Explore**: Discover new recipes based on your preferences

## 🌟 Key Features

- **Smart Ingredient Matching**: AI analyzes available ingredients and suggests optimal combinations
- **Dietary Accommodation**: Supports various dietary restrictions and preferences
- **Multi-Source Search**: Combines AI generation with web search results
- **User Personalization**: Learns from your preferences and saved recipes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🔒 Environment Variables

Make sure to set up the following environment variables:

- `GOOGLE_API_KEY`: Your Google AI API key for Gemini
- `GOOGLE_SEARCH_API_KEY`: Google Custom Search API key
- `CUSTOM_SEARCH_ENGINE_ID`: Google Custom Search Engine ID
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET_KEY`: Secret key for JWT token generation

## 📁 Project Structure

```
Smart-Recipe-Generator/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── seed_db.py          # Database seeding script
│   └── requirements.txt    # Python dependencies
├── src/                    # React frontend source
├── public/                 # Static assets
└── package.json           # Node.js dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

## 🔮 Future Enhancements

- Recipe rating and review system
- Social sharing features
- Meal planning and shopping lists
- Nutritional information integration
- Recipe scaling and unit conversion
