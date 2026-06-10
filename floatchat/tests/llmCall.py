

import google.generativeai as genai
from dotenv import dotenv_values

# Load API key from .env file
env = dotenv_values(".env")
GEMINI_API_KEY = env.get("GEMINI_API_KEY")

def test_gemini_llm():
    """Test basic Gemini LLM text generation"""
    
    genai.configure(api_key=GEMINI_API_KEY)
    
    print("Testing Gemini LLM...")
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("What are Agro float, explain in 1 sentence")
        
        print("SUCCESS: Gemini text generation working!")
        print(f"Response: {response.text}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Gemini text generation failed: {e}")
        return False

def test_gemini_embeddings():
    """Test Gemini embedding generation for FloatChat"""
    
    genai.configure(api_key=GEMINI_API_KEY)
    
    print("\nTesting Gemini Embeddings...")
    
    try:
        sample_text = "ARGO Float 5906527, Cycle 94. Location: -43.513°N, 35.468°E. Region: Indian Ocean - Southern. Date: 2025-01-01. Depth range: 4.4m to 1988.0m. Temperature profile: 1.87°C to 10.85°C (mean: 8.25°C). Salinity profile: 34.021 to 34.775 PSU (mean: 34.487 PSU)."
        
        result = genai.embed_content(
            model="models/embedding-001",
            content=sample_text,
            task_type="retrieval_document",
            output_dimensionality=768
        )
        
        embedding = result['embedding']
        
        print("SUCCESS: Gemini embeddings working!")
        print(f"Embedding dimensions: {len(embedding)}")
        print(f"Sample values: {embedding[:5]}...")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Gemini embeddings failed: {e}")
        return False

def test_search_query_embedding():
    """Test embedding generation for user search queries"""
    
    genai.configure(api_key=GEMINI_API_KEY)
    
    print("\nTesting Search Query Embeddings...")
    
    try:
        search_queries = [
            "Show me warm water profiles in the Indian Ocean",
            "Find temperature data deeper than 1000 meters", 
            "Compare salinity between different ocean regions"
        ]
        
        for query in search_queries:
            result = genai.embed_content(
                model="models/embedding-001", 
                content=query,
                task_type="retrieval_query",
                output_dimensionality=768
            )
            
            embedding = result['embedding']
            print(f"Query: {query}")
            print(f"  Embedding dimensions: {len(embedding)}")
            
        print("SUCCESS: Search query embeddings working!")
        return True
        
    except Exception as e:
        print(f"ERROR: Search query embeddings failed: {e}")
        return False

def main():
    """Run all LLM tests"""
    
    if not GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY not found in .env file")
        return
    
    print("="*60)
    print("GEMINI API TESTS FOR FLOATCHAT")
    print("="*60)
    
    llm_success = test_gemini_llm()
    embedding_success = test_gemini_embeddings()
    query_success = test_search_query_embedding()
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Gemini Text Generation: {'PASS' if llm_success else 'FAIL'}")
    print(f"Document Embeddings:    {'PASS' if embedding_success else 'FAIL'}")
    print(f"Search Query Embeddings: {'PASS' if query_success else 'FAIL'}")
    
    if llm_success and embedding_success and query_success:
        print(f"\nALL TESTS PASSED - FloatChat LLM integration ready!")
    else:
        print(f"\nSome tests failed - check API key and connection")
    
    print("="*60)

if __name__ == "__main__":
    main()