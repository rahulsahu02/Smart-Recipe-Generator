from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from duckduckgo_search import DDGS
from googleapiclient.discovery import build
from google.api_core import exceptions
import json
import base64
from io import BytesIO
from PIL import Image

# --- CONFIGURATION ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CSE_API_KEY = os.getenv("GOOGLE_SEARCH_API_KEY")
GOOGLE_CSE_ID = os.getenv("CUSTOM_SEARCH_ENGINE_ID")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    vision_model = genai.GenerativeModel('gemini-1.5-flash')
    text_model = genai.GenerativeModel('gemini-1.5-flash')
else:
    print("WARNING: GOOGLE_API_KEY not set. The application will not work without it.")
    vision_model = None
    text_model = None

app = Flask(__name__)
CORS(app)

# --- LOAD RECIPE DATABASE ---
try:
    with open('recipes.json', 'r', encoding='utf-8') as f:
        recipe_database = json.load(f)
    print(f"--- Successfully loaded {len(recipe_database)} recipes from recipes.json ---")
except FileNotFoundError:
    print("--- WARNING: recipes.json not found. The recipe matching feature will be disabled. ---")
    recipe_database = []
except json.JSONDecodeError:
    print("--- ERROR: Could not decode recipes.json. Please ensure it is a valid JSON file. ---")
    recipe_database = []


# --- HELPER FUNCTIONS ---
def find_matching_recipes(user_ingredients, dietary_prefs, cuisine):
    print(f"--- Searching database for recipes with ingredients: {user_ingredients}, dietary: {dietary_prefs}, cuisine: {cuisine} ---")
    matches = []
    
    cuisine_pref = cuisine.lower() if cuisine else 'any'

    for recipe in recipe_database:
        if cuisine_pref != 'any' and recipe.get('cuisine', '').lower() != cuisine_pref:
            continue

        recipe_ingredients_lower = [ing['name'].lower() for ing in recipe.get('ingredients', [])]
        
        match_count = 0
        for user_ing in user_ingredients:
            user_ing_lower = user_ing.lower()
            if any(user_ing_lower in rec_ing for rec_ing in recipe_ingredients_lower):
                match_count += 1
        
        if match_count == len(user_ingredients):
            is_vegetarian = "vegetarian" in dietary_prefs
            is_vegan = "vegan" in dietary_prefs
            
            is_recipe_veg = all(meat.lower() not in ' '.join(recipe_ingredients_lower) for meat in ['chicken', 'beef', 'pork', 'lamb', 'shrimp', 'fish', 'salmon'])
            is_recipe_vegan = is_recipe_veg and all(dairy.lower() not in ' '.join(recipe_ingredients_lower) for dairy in ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'eggs'])
            
            if (is_vegetarian and not is_recipe_veg) or (is_vegan and not is_recipe_vegan):
                continue
                
            matches.append(recipe)
    
    print(f"--- Found {len(matches)} potential matches in the database. ---")
    matches.sort(key=lambda r: len(r.get('ingredients', [])), reverse=True)
    return matches[:3]


def search_web(query):
    results = []
    try:
        print("--- Searching DuckDuckGo... ---")
        with DDGS() as ddgs:
            ddgs_results = list(ddgs.text(query, max_results=5))
            if ddgs_results:
                results.extend([res.get('body', '') for res in ddgs_results])
        print(f"--- Found {len(ddgs_results)} results from DuckDuckGo. ---")
    except Exception as e:
        print(f"--- DuckDuckGo search failed: {e} ---")

    if GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID:
        try:
            print("--- Searching Google... ---")
            service = build("customsearch", "v1", developerKey=GOOGLE_CSE_API_KEY)
            res = service.cse().list(q=query, cx=GOOGLE_CSE_ID, num=5).execute()
            
            if 'items' in res:
                google_results = res['items']
                for item in google_results:
                    results.append(f"{item.get('title', '')}: {item.get('snippet', '')}")
                print(f"--- Found {len(google_results)} results from Google. ---")

        except exceptions.GoogleAPICallError as e:
             print(f"--- Google Search API call failed. Check your API key and CSE ID. Error: {e} ---")
        except Exception as e:
            print(f"--- An unexpected error occurred during Google Search: {e} ---")
    else:
        print("--- Google CSE API Key or ID not provided. Skipping Google Search. ---")
    return results


# --- API ENDPOINTS ---
@app.route('/recognize_ingredients', methods=['POST'])
def recognize_ingredients():
    if not vision_model:
        return jsonify({'error': 'Gemini API key not configured on the server.'}), 500
        
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'error': 'No image data provided.'}), 400

    try:
        print("\n\n--- Received image recognition request. ---")
        base64_image_data = data['image'].split(',')[1]
        image_bytes = base64.b64decode(base64_image_data)
        image = Image.open(BytesIO(image_bytes))

        prompt = "Analyze the image and identify all food ingredients. Return them as a simple comma-separated list. Example: tomatoes, onions, chicken breast."
        
        print("--- Sending image to Gemini for recognition... ---")
        response = vision_model.generate_content([prompt, image])
        
        recognized_text = response.text.strip().lower()
        print(f"--- Gemini recognition result: '{recognized_text}' ---")
        
        if not recognized_text:
            return jsonify([])

        ingredients_list = [ing.strip() for ing in recognized_text.split(',') if ing.strip()]
        print(f"--- Parsed ingredients: {ingredients_list} ---")
        
        return jsonify(ingredients_list)

    except Exception as e:
        print(f"--- Error during image recognition: {e} ---")
        return jsonify({'error': 'Failed to process the image.'}), 500


@app.route('/generate_recipes', methods=['POST'])
def generate_recipes():
    data = request.get_json()
    if not data or 'ingredients' not in data:
        return jsonify({'error': 'Missing ingredients'}), 400

    ingredients = data.get('ingredients', [])
    dietary = data.get('dietary', [])
    servings = data.get('servings', 2)
    cuisine = data.get('cuisine', 'any')
    print(f"\n\n--- Received recipe request with ingredients: {ingredients}, dietary: {dietary}, servings: {servings}, cuisine: {cuisine} ---")
    
    if not text_model:
        return jsonify({'error': 'Gemini API key not configured on the server.'}), 500
    
    final_recipes = []
    db_matches = []
    
    # 1. Find and format database matches
    if recipe_database:
        db_matches = find_matching_recipes(ingredients, dietary, cuisine)
        if db_matches:
            print(f"--- Found {len(db_matches)} matches in database. Formatting them. ---")
            for recipe in db_matches:
                final_recipes.append({
                    "title": recipe.get("title", "N/A"),
                    "description": recipe.get("description", f"A delicious {recipe.get('cuisine')} recipe from our database."),
                    "ingredients": [f"{ing['quantity']} {ing['name']}" for ing in recipe.get("ingredients", [])],
                    "instructions": recipe.get("steps", []),
                    "cookingTime": recipe.get("cooking_time", 0),
                    "difficulty": recipe.get("difficulty", "Medium"),
                    "nutritionalInfo": f"Calories: {recipe.get('nutrition', {}).get('calories', 'N/A')}, Protein: {recipe.get('nutrition', {}).get('protein', 'N/A')}g",
                    "servings": f"Serves {recipe.get('servings', 'N/A')}",
                    "substitution_suggestions": ["This is a curated recipe from our database."]
                })

    # 2. Always generate new recipes with AI, using context if available
    prompt = ""
    if db_matches:
        print("--- Using database matches as context to generate ADDITIONAL recipes. ---")
        db_matches_string = json.dumps(db_matches, indent=2)
        prompt = f"""
        You are a creative recipe assistant. A user wants to cook with: {', '.join(ingredients)}.
        They want a {cuisine} style recipe for {servings} people, with dietary preferences: {', '.join(dietary) if dietary else 'None'}.

        I have already found these recipes in my database:
        --- DATABASE RECIPES ---
        {db_matches_string}
        --- END DATABASE RECIPES ---

        Please generate 1-2 NEW and DIFFERENT creative recipes that also fit the user's request. Do NOT repeat the recipes I provided above.
        
        For each new recipe, provide: "title", "description", "ingredients" (list), "instructions" (list), "cookingTime" (integer), "difficulty", "nutritionalInfo", "servings", and "substitution_suggestions".
        Format the final output as a valid JSON array of recipe objects. Do not include markdown.
        """
    else:
        print("--- No database matches found. Generating recipes from scratch using web search. ---")
        search_query = f"{cuisine} recipes with {' '.join(ingredients)}" if cuisine and cuisine.lower() != 'any' else f"recipes with {' '.join(ingredients)}"
        if dietary:
            search_query += f" that are {' '.join(dietary)}"
        search_results = search_web(search_query)
        
        if not search_results:
            if final_recipes:
                return jsonify(final_recipes)
            return jsonify({'error': 'Could not find any information online for the given ingredients.'}), 500

        prompt = f"""
        Based on the following web search results, generate 2-3 unique recipes for {servings} servings using these main ingredients: {', '.join(ingredients)}.
        Cuisine: {cuisine}. Dietary preferences: {', '.join(dietary) if dietary else 'None'}.
        Adjust ingredient quantities for {servings} servings.

        For each recipe, provide: "title", "description", "ingredients" (list), "instructions" (list), "cookingTime" (integer), "difficulty", "nutritionalInfo", "servings", and "substitution_suggestions" (list of strings).
        
        Search results for context:
        ---
        {search_results}
        ---

        Format the output as a valid JSON array of recipe objects. Do not include markdown.
        """

    try:
        print("--- Generating additional recipes with Gemini... ---")
        response = text_model.generate_content(prompt)
        raw_response = response.text.strip()
        
        clean_response = raw_response.replace("```json", "").replace("```", "").strip()
        print(f"--- Cleaned Gemini Response ---\n{clean_response}\n--------------------------")
        
        ai_recipes = json.loads(clean_response)
        
        # 3. Combine and de-duplicate results
        existing_titles = {recipe['title'].lower() for recipe in final_recipes}
        for recipe in ai_recipes:
            if recipe['title'].lower() not in existing_titles:
                final_recipes.append(recipe)
                existing_titles.add(recipe['title'].lower())

    except Exception as e:
        print(f"--- Error generating or parsing AI recipes: {e} ---")
        if not final_recipes:
            return jsonify({'error': 'Failed to generate recipes.'}), 500

    print(f"--- Returning a total of {len(final_recipes)} combined recipes. ---")
    return jsonify(final_recipes)

# --- RUN THE APP ---
if __name__ == '__main__':
    app.run(debug=True, port=5001)

