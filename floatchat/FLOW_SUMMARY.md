# FloatChat - System Flow Summary

## **🏗️ Architecture Overview**
```
[User Query] → [Express.js] → [Gemini AI] → [FastAPI] → [PostgreSQL+pgvector] → [Plotly Charts]
                    ↓              ↓            ↓              ↓                    ↓
               Orchestration   Embedding   Vector Search   Data Retrieval    Visualization
```

---

## **📊 Data Flow**

### **1. ETL Pipeline (Offline)**
```
[NetCDF Files] → [Python ETL] → [Profile Summaries] → [Gemini Embeddings] → [PostgreSQL Storage]
     ↓               ↓                ↓                      ↓                     ↓
ARGO Raw Data   Extract Profiles   Generate Text       768-dim Vectors      Database Ready
```

### **2. Query Processing (Real-time)**
```
[User Question] → [Query Interpretation] → [Embedding Generation] → [Vector Search] → [Results]
      ↓                    ↓                       ↓                     ↓              ↓
"Show warm water"    Extract params/intent    Convert to 768-dim     Find similar     Return profiles
```

### **3. Visualization Pipeline**
```
[Selected Profiles] → [Fetch Measurements] → [Generate Plotly] → [Return HTML/JSON]
         ↓                    ↓                     ↓                    ↓
    Profile IDs        Temperature/Salinity    Interactive Charts    Client Display
```

---

## **🚀 Deployment Flow**

### **Services Setup**
```
[GitHub Repo] → [Render FastAPI] → [Environment Variables] → [Auto-Deploy]
                      ↓                       ↓                    ↓
               [Render Express] → [FASTAPI_URL + API_KEY] → [Live Services]
                      ↓
               [Supabase PostgreSQL] → [pgvector + Schema] → [Database Ready]
```

### **Development to Production**
```
[Local Development] → [Git Push] → [Render Auto-Deploy] → [Live Demo]
         ↓                ↓              ↓                   ↓
    localhost:5000/8001   GitHub    Cloud Services      Production URLs
```

---

## **🎯 User Interaction Flow**

### **Typical Query Journey**
```
1. User: "Find temperature profiles with deep mixing"
   ↓
2. Express: Interpret query → Extract: intent=search, variables=[temperature], concept=deep_mixing
   ↓  
3. Gemini: Generate embedding for "deep mixing temperature profiles"
   ↓
4. FastAPI: Vector search → Find similar profile summaries
   ↓
5. FastAPI: SQL query → Get measurement data for top matches
   ↓
6. FastAPI: Generate Plotly visualization → Temperature vs depth plots
   ↓
7. Express: Generate AI response → Explain findings + oceanographic significance
   ↓
8. User: Receives answer + interactive charts + profile data
```

---

## **🔧 Technical Stack Flow**

### **Backend Processing**
```
Express.js (Node) ←→ FastAPI (Python) ←→ PostgreSQL (pgvector)
      ↓                    ↓                       ↓
- Query orchestration   - Data processing      - Vector storage
- AI integration       - Visualization        - Profile/measurement data
- Response generation   - Database queries     - Similarity search
```

### **AI Integration**
```
[Gemini embedding-001] ←→ [Vector Database] ←→ [Similarity Search]
         ↓                        ↓                    ↓
    768-dim vectors         Cosine similarity    Ranked results
```

---

## **📋 Implementation Phases**

### **Day 1: Foundation**
```
[Setup Environment] → [Create Database] → [Build ETL] → [Load Sample Data]
```

### **Day 2: Backend Services**  
```
[FastAPI Endpoints] → [Express Orchestrator] → [AI Integration] → [Basic Testing]
```

### **Day 3: Deploy & Demo**
```
[Render Deployment] → [Production Testing] → [Demo Preparation] → [Presentation]
```

---

## **💡 Key Success Factors**

### **What Makes It Work**
1. **Semantic Search**: Gemini embeddings understand oceanographic concepts
2. **Multi-Service**: FastAPI (data) + Express (AI) separation of concerns  
3. **Interactive Viz**: Plotly generates publication-quality charts
4. **Real Data**: Actual ARGO profiles with scientific relevance
5. **Natural Language**: Users ask questions like talking to an expert

### **Demo Impact**
```
[Natural Question] → [AI Understanding] → [Data Discovery] → [Visual Answer] → [Scientific Insight]
        ↓                   ↓                  ↓               ↓                ↓
    "Show me..."      Semantic parsing    Vector search   Interactive plot   Expert response
```

---

## **🎪 Hackathon Winning Elements**
- **Full-Stack AI Application** (not just a chatbot)
- **Real Scientific Domain** (oceanography research impact)
- **Modern Architecture** (microservices, vector DB, cloud deployment)
- **Natural User Experience** (chat → instant visualization)
- **Free Implementation** (Gemini + Supabase + Render free tiers)