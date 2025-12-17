import { USE_MOCK_SERVICE } from '../config';
import { mockService } from './mockService';
import { realService } from './realService';
import { IService } from './types';

export const service: IService = USE_MOCK_SERVICE ? mockService : realService;
