from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext

app = FastAPI()

# Allow frontend (React) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory "database"
users_db = {}

# Request model
class User(BaseModel):
    username: str
    password: str

@app.post("/signup")
def signup(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = pwd_context.hash(user.password)
    users_db[user.username] = hashed_pw

    return {"message": "User created successfully"}


@app.post("/signin")
def signin(user: User):
    if user.username not in users_db:
        raise HTTPException(status_code=400, detail="User not found")

    hashed_pw = users_db[user.username]

    if not pwd_context.verify(user.password, hashed_pw):
        raise HTTPException(status_code=400, detail="Incorrect password")

    return {"message": "Login successful"}
