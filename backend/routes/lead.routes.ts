import express from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { Lead, LeadStatus } from '../models/lead.model';

const router = express.Router();

// Create lead (sales rep and managers)
router.post(
  '/', 
  AuthMiddleware.verifyToken,
  AuthMiddleware.hasRole([
    UserRole.SALES_REP, 
    UserRole.MANAGER
  ]),
  async (req, res) => {
    try {
      const leadData = new Lead({
        ...req.body,
        createdBy: req.user.uid,
        status: LeadStatus.NEW
      });

      await leadData.save();

      res.status(201).json({ 
        message: 'Lead created successfully', 
        lead: leadData 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get leads (role-based access)
router.get(
  '/', 
  AuthMiddleware.verifyToken,
  async (req, res) => {
    try {
      const user = await UserService.getUserByFirebaseUid(req.user.uid);
      
      let query = {};

      // Apply role-based filtering
      switch (user.role) {
        case UserRole.SALES_REP:
          query = { createdBy: req.user.uid };
          break;
        case UserRole.MANAGER:
          // Managers can see leads from their department
          query = { department: user.department };
          break;
        case UserRole.ADMIN:
          // Admins can see all leads
          break;
        default:
          // Restrict access for other roles
          return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const leads = await Lead.find(query)
        .populate('createdBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email');

      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;