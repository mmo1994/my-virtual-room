import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { authenticateToken } from '../middleware/auth';
import { validate, validateUuidParam, validatePagination } from '../middleware/validation';
import { createProjectSchema, updateProjectSchema, generateFurnitureVisualizationSchema } from '../utils/validation';

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

// Project CRUD operations
router.get('/', validatePagination, ProjectController.getProjects);
router.post('/', validate(createProjectSchema), ProjectController.createProject);
router.get('/:id', validateUuidParam('id'), ProjectController.getProject);
router.put('/:id', validateUuidParam('id'), validate(updateProjectSchema), ProjectController.updateProject);
router.delete('/:id', validateUuidParam('id'), ProjectController.deleteProject);

// Project image upload and generation
router.post('/upload-room', ProjectController.uploadRoomImage);
router.post('/generate', validate(generateFurnitureVisualizationSchema), ProjectController.generateVisualization);

// Dedicated furniture visualization endpoint (alternative to /generate)
router.post('/generate-furniture-room', validate(generateFurnitureVisualizationSchema), ProjectController.generateFurnitureRoom);

export default router; 