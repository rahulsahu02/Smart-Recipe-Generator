import React from 'react';

// --- TYPES ---
interface Recipe {
  id: number;
  title: string;
  imageUrl: string;
  ingredients: string[];
  cookingTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  dietary: string[];
  rating: number;
  description?: string;
  instructions?: string[];
  nutritionalInfo?: string;
  servings?: string;
}

interface DietaryPreferences {
  vegetarian: boolean;
  vegan: boolean;
  glutenfree: boolean;
}

// --- CONSTANTS ---
const popularIngredients: string[] = [
  'Chicken', 'Beef', 'Rice', 'Pasta', 'Tomatoes', 'Onions', 'Garlic', 'Bell Peppers', 'Cheese', 'Eggs', 'Potatoes', 'Carrots'
];

const cuisines: string[] = [
  'Any', 'Italian', 'Mexican', 'Indian', 'Asian', 'American', 'Mediterranean'
];

// --- SVG ICONS ---
const UtensilsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z" />
  </svg>
);

const XIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);


// --- COMPONENTS ---

const Header = () => (
  <header className="bg-white/80 backdrop-blur-sm shadow-sm fixed top-0 left-0 right-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center h-16">
        <div className="flex items-center space-x-2">
          <UtensilsIcon />
          <h1 className="text-2xl font-bold text-gray-800">Smart Recipe Generator</h1>
        </div>
      </div>
    </div>
  </header>
);

interface HomePageProps {
    onFindRecipes: (ingredients: string[], dietary: string[], servings: number, cuisine: string) => void;
}

const HomePage = ({ onFindRecipes }: HomePageProps) => {
  const [ingredients, setIngredients] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [dietary, setDietary] = React.useState<DietaryPreferences>({
    vegetarian: false,
    vegan: false,
    glutenfree: false,
  });
  const [servings, setServings] = React.useState(2);
  const [cuisine, setCuisine] = React.useState('Any');

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = React.useState(false);
  const [recognitionError, setRecognitionError] = React.useState<string | null>(null);

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedIngredient = inputValue.trim().toLowerCase();
    if (formattedIngredient && !ingredients.includes(formattedIngredient)) {
      setIngredients([...ingredients, formattedIngredient]);
      setInputValue('');
    }
  };
  
  const addPopularIngredient = (ingredient: string) => {
      const lowerCaseIngredient = ingredient.toLowerCase();
      if (!ingredients.includes(lowerCaseIngredient)) {
          setIngredients([...ingredients, lowerCaseIngredient]);
      }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
  };

  const handleDietaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setDietary(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
          setRecognitionError(null);
      }
  };
  
  const handleRecognizeIngredients = async () => {
      if (!imageFile) return;
      setIsRecognizing(true);
      setRecognitionError(null);

      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
          try {
              const base64data = reader.result as string;
              const response = await fetch('http://localhost:5001/recognize_ingredients', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ image: base64data })
              });

              if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to recognize ingredients.');
              }

              const recognized = await response.json();
              const newIngredients = Array.from(new Set([...ingredients, ...recognized]));
              setIngredients(newIngredients);
              setImageFile(null);
              setImagePreview(null);
          } catch (err) {
              setRecognitionError(err instanceof Error ? err.message : 'An unknown error occurred.');
          } finally {
              setIsRecognizing(false);
          }
      };
  };

  const handleSearch = () => {
      const selectedDietary = (Object.keys(dietary) as Array<keyof DietaryPreferences>)
        .filter(key => dietary[key]);
      onFindRecipes(ingredients, selectedDietary, servings, cuisine);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center pt-16">
      <div 
        className="relative h-80 bg-cover bg-center" 
        style={{ backgroundImage: "url('https://placehold.co/1920x1080/27272a/FFFFFF?text=Delicious+Food')" }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-2">What's in your kitchen today?</h1>
          <p className="text-lg md:text-xl max-w-2xl">Enter the ingredients you have, and we'll suggest delicious recipes for you to cook!</p>
        </div>
      </div>

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl space-y-8">

          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Upload a photo of your ingredients</h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="flex-1 w-full flex flex-col items-center px-4 py-6 bg-white text-emerald-600 rounded-lg shadow-md border border-dashed border-gray-300 cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 transition">
                    <CameraIcon />
                    <span className="mt-2 text-base leading-normal">{imageFile ? imageFile.name : 'Select a photo'}</span>
                    <input type='file' className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
                {imagePreview && (
                    <div className="flex-shrink-0">
                        <img src={imagePreview} alt="Ingredient preview" className="w-24 h-24 rounded-lg object-cover shadow-sm"/>
                    </div>
                )}
            </div>
            {imageFile && (
                <div className="mt-4">
                    <button 
                        onClick={handleRecognizeIngredients}
                        disabled={isRecognizing}
                        className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors shadow flex items-center justify-center gap-2 disabled:bg-blue-300"
                    >
                        {isRecognizing && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>}
                        {isRecognizing ? 'Recognizing...' : 'Find Ingredients from Photo'}
                    </button>
                </div>
            )}
            {recognitionError && <p className="text-red-600 text-sm mt-2 text-center">{recognitionError}</p>}
          </div>

          <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center"><span className="bg-white px-2 text-sm text-gray-500">OR</span></div></div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">1. Add ingredients manually</h2>
            <form onSubmit={handleAddIngredient} className="flex items-center gap-2">
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="e.g., chicken, tomatoes, rice" className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"/>
              <button type="submit" className="bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-600 transition-colors shadow">Add</button>
            </form>
          </div>
          
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {ingredients.map(ing => (
              <span key={ing} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium animate-fade-in">
                {ing.charAt(0).toUpperCase() + ing.slice(1)}
                <button onClick={() => handleRemoveIngredient(ing)} className="text-gray-500 hover:text-gray-800"><XIcon className="w-4 h-4"/></button>
              </span>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-600 mb-3">Or, select from popular choices:</h3>
            <div className="flex flex-wrap gap-2">
              {popularIngredients.map(ing => (
                <button key={ing} onClick={() => addPopularIngredient(ing)} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-emerald-100 border border-transparent hover:border-emerald-300 transition-colors text-sm">{ing}</button>
              ))}
            </div>
          </div>

          {/* --- CUISINE SELECTION --- */}
          <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">2. Choose a Cuisine (optional)</h2>
              <select 
                  value={cuisine} 
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              >
                  {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">3. Any dietary preferences?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(Object.keys(dietary) as Array<keyof DietaryPreferences>).map(key => (
                  <label key={key} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" name={key} checked={dietary[key]} onChange={handleDietaryChange} className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"/>
                      <span className="ml-3 text-md font-medium text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1).replace('glutenfree', 'Gluten-Free')}</span>
                  </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3 text-center">4. How many servings?</h2>
            <div className="flex items-center justify-center gap-4">
                <button onClick={() => setServings(s => Math.max(1, s - 1))} className="bg-gray-200 text-gray-800 font-bold w-12 h-12 rounded-full text-2xl hover:bg-gray-300 transition-colors disabled:opacity-50" disabled={servings <= 1}>-</button>
                <span className="text-3xl font-bold text-gray-800 w-16 text-center">{servings}</span>
                <button onClick={() => setServings(s => s + 1)} className="bg-gray-200 text-gray-800 font-bold w-12 h-12 rounded-full text-2xl hover:bg-gray-300 transition-colors">+</button>
            </div>
          </div>
          
          <div className="text-center pt-4">
            <button onClick={handleSearch} disabled={ingredients.length === 0} className="w-full sm:w-auto bg-emerald-600 text-white font-bold py-4 px-10 rounded-xl hover:bg-emerald-700 transition-transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100">Find Recipes!</button>
          </div>

        </div>
      </main>
    </div>
  );
};

interface RecipeCardProps {
    recipe: Recipe;
    onClick: () => void;
}

const RecipeCard = ({ recipe, onClick }: RecipeCardProps) => (
    <div onClick={onClick} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 cursor-pointer animate-fade-in">
        <img className="h-48 w-full object-cover" src={`https://placehold.co/600x400/52525b/FFFFFF?text=${recipe.title.replace(/\s/g, '+')}`} alt={recipe.title} />
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{recipe.title}</h3>
            <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden">{recipe.description}</p>
            <div className="flex items-center justify-between text-gray-600 text-sm">
                <div className="flex items-center gap-2"><ClockIcon /><span>{recipe.cookingTime} min</span></div>
                 <div className="flex items-center gap-2"><UsersIcon /><span>{recipe.servings || 'N/A'}</span></div>
            </div>
             <div className="mt-4">
                 <span className={`px-3 py-1 text-xs font-semibold rounded-full ${recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{recipe.difficulty}</span>
            </div>
        </div>
    </div>
);

interface RecipeModalProps {
    recipe: Recipe;
    onClose: () => void;
}

const RecipeModal = ({ recipe, onClose }: RecipeModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in-fast">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-gray-100 rounded-full p-2 z-10"><XIcon className="w-6 h-6" /></button>
                <img className="h-64 w-full object-cover rounded-t-2xl" src={`https://placehold.co/1200x800/52525b/FFFFFF?text=${recipe.title.replace(/\s/g, '+')}`} alt={recipe.title} />
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{recipe.title}</h2>
                    <p className="text-gray-600 mb-6">{recipe.description}</p>
                    <div className="flex flex-wrap gap-4 text-center mb-8 border-y py-4">
                        <div className="flex-1 min-w-[100px]"><p className="text-sm text-gray-500">Time</p><p className="font-bold text-lg">{recipe.cookingTime} min</p></div>
                        <div className="flex-1 min-w-[100px]"><p className="text-sm text-gray-500">Difficulty</p><p className="font-bold text-lg">{recipe.difficulty}</p></div>
                        <div className="flex-1 min-w-[100px]"><p className="text-sm text-gray-500">Servings</p><p className="font-bold text-lg">{recipe.servings}</p></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-700">Ingredients</h3>
                            <ul className="space-y-2 list-disc list-inside text-gray-600">{recipe.ingredients?.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
                        </div>
                         <div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-700">Nutritional Info</h3>
                            <p className="text-gray-600">{recipe.nutritionalInfo}</p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold mb-3 text-gray-700">Instructions</h3>
                        <ol className="space-y-4 text-gray-600">
                            {recipe.instructions?.map((step, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="bg-emerald-500 text-white rounded-full h-6 w-6 text-sm flex-shrink-0 flex items-center justify-center font-bold">{i + 1}</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface RecipesPageProps {
    ingredients: string[];
    dietary: string[];
    servings: number;
    cuisine: string;
    onBack: () => void;
    onRecipeSelect: (recipe: Recipe) => void;
}

const RecipesPage = ({ ingredients, dietary, servings, cuisine, onBack, onRecipeSelect }: RecipesPageProps) => {
    const [recipes, setRecipes] = React.useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [difficultyFilter, setDifficultyFilter] = React.useState<string[]>([]);
    const [maxTimeFilter, setMaxTimeFilter] = React.useState<number>(120);
    const [filteredRecipes, setFilteredRecipes] = React.useState<Recipe[]>([]);

    React.useEffect(() => {
        const fetchRecipes = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:5001/generate_recipes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ingredients, dietary, servings, cuisine }),
                });

                if (!response.ok) {
                    try {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to fetch recipes from the server.');
                    } catch (e) {
                         throw new Error(`Server returned status ${response.status}: ${await response.text()}`);
                    }
                }
                
                const responseText = await response.text();
                const cleanedText = responseText.replace(/^```json\s*/, '').replace(/```$/, '');
                const parsedRecipes = JSON.parse(cleanedText);
                
                const recipesWithIds = parsedRecipes.map((recipe: Omit<Recipe, 'id'>, index: number) => ({...recipe, id: index}));
                setRecipes(recipesWithIds);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecipes();
    }, [ingredients, dietary, servings, cuisine]);

    React.useEffect(() => {
        let tempRecipes = [...recipes];
        if (difficultyFilter.length > 0) {
            tempRecipes = tempRecipes.filter(recipe => difficultyFilter.includes(recipe.difficulty));
        }
        tempRecipes = tempRecipes.filter(recipe => recipe.cookingTime <= maxTimeFilter);
        setFilteredRecipes(tempRecipes);
    }, [recipes, difficultyFilter, maxTimeFilter]);

    const handleDifficultyToggle = (difficulty: string) => {
        setDifficultyFilter(prev => prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty]);
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <button onClick={onBack} className="mb-8 bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-50 transition flex items-center gap-2">&larr; Back to Ingredients</button>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Recipe Suggestions</h1>
                    <p className="text-gray-600">Based on your ingredients: <span className="font-medium">{ingredients.join(', ')}</span></p>
                </div>

                {!isLoading && !error && recipes.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6 items-center">
                            <div>
                                <label className="block text-md font-semibold text-gray-700 mb-2">Filter by Difficulty</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Easy', 'Medium', 'Hard'].map(d => (
                                        <button key={d} onClick={() => handleDifficultyToggle(d)} className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${difficultyFilter.includes(d) ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'}`}>{d}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="time-filter" className="block text-md font-semibold text-gray-700 mb-2">Max Cooking Time: <span className="font-bold text-emerald-600">{maxTimeFilter} min</span></label>
                                <input id="time-filter" type="range" min="10" max="120" step="5" value={maxTimeFilter} onChange={(e) => setMaxTimeFilter(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"/>
                            </div>
                        </div>
                    </div>
                )}
                
                {isLoading && (
                    <div className="flex flex-col justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
                        <p className="mt-4 text-gray-600 text-lg">Generating creative recipes for you...</p>
                    </div>
                )}
                {error && (<div className="text-center bg-red-100 text-red-800 p-8 rounded-xl shadow"><h2 className="text-2xl font-bold">An Error Occurred</h2><p className="mt-2">{error}</p></div>)}
                {!isLoading && !error && filteredRecipes.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRecipes.map(recipe => (<RecipeCard key={recipe.id} recipe={recipe} onClick={() => onRecipeSelect(recipe)} />))}
                    </div>
                )}
                {!isLoading && !error && (recipes.length > 0 && filteredRecipes.length === 0) && (<div className="text-center bg-white p-12 rounded-xl shadow"><h2 className="text-2xl font-bold text-gray-700">No Recipes Match Your Filters</h2><p className="text-gray-500 mt-2">Try adjusting your difficulty or cooking time filters to see more results.</p></div>)}
                {!isLoading && !error && recipes.length === 0 && (<div className="text-center bg-white p-12 rounded-xl shadow"><h2 className="text-2xl font-bold text-gray-700">No Recipes Found</h2><p className="text-gray-500 mt-2">We couldn't generate any recipes with your ingredients. Try a different combination.</p></div>)}
            </div>
        </div>
    );
};

export default function App() {
  const [page, setPage] = React.useState('home'); 
  const [searchParams, setSearchParams] = React.useState<{ ingredients: string[]; dietary: string[]; servings: number; cuisine: string }>({ ingredients: [], dietary: [], servings: 2, cuisine: 'Any' });
  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null);

  const handleFindRecipes = (ingredients: string[], dietary: string[], servings: number, cuisine: string) => {
    setSearchParams({ ingredients, dietary, servings, cuisine });
    setPage('recipes');
  };

  const handleBackToHome = () => {
    setPage('home');
  };

  return (
    <>
      <Header />
      {page === 'home' && <HomePage onFindRecipes={handleFindRecipes} />}
      {page === 'recipes' && (
        <RecipesPage 
          ingredients={searchParams.ingredients} 
          dietary={searchParams.dietary}
          servings={searchParams.servings}
          cuisine={searchParams.cuisine}
          onBack={handleBackToHome}
          onRecipeSelect={setSelectedRecipe}
        />
      )}
      {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
    </>
  );
}

