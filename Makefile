.PHONY: setup seed dev-backend dev-frontend build test ratings

setup:
	pip install -r backend/requirements.txt
	cd frontend && npm install

seed:
	cd backend && python -m pipeline.seed

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

test:
	cd backend && python -m pytest tests/ -q

ratings:
	cd backend && python -m pipeline.compute_ratings
