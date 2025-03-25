import express from 'express';
import { SearchController } from '../interfaces/http/controllers/SearchController'

const router = express.Router();
const searchController = new SearchController();

router.get('/scrape', (req, res) => searchController.scrape(req, res));

export default router; 