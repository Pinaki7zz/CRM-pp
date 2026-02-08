const ticketCategoryService = require('../services/ticketCategories.service');

class TicketCategoryController {
  /**
   * Create a new Ticket Category
   * POST /api/ticket-categories
   */
  async createTicketCategory(req, res) {
    try {
      const { catalogName, ticketCategoryId, status, validFrom, validTo } = req.body;

      // Validate required fields
      if (!catalogName || !ticketCategoryId || !validFrom) {
        return res.status(400).json({
          success: false,
          message:
            'Missing required fields: catalogName, ticketCategoryId, validFrom',
        });
      }

      // Validate user is authenticated
      // if (!req.user?.id) {
      //   return res.status(401).json({
      //     success: false,
      //     message: 'User not authenticated',
      //   });
      // }

      // Validate date format
      const validFromDate = new Date(validFrom);
      if (Number.isNaN(validFromDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid validFrom date format',
        });
      }

      const validToDate = validTo ? new Date(validTo) : undefined;
      if (validTo && Number.isNaN(validToDate?.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid validTo date format',
        });
      }

      const ticketCategory = await ticketCategoryService.createTicketCategory(
        {
          catalogName,
          ticketCategoryId,
          status: status || 'In Preparation',
          validFrom: validFromDate,
          validTo: validToDate,
          //createdById: req.user.id,
        }
      );

      return res.status(201).json({
        success: true,
        message: 'Ticket Category created successfully',
        data: ticketCategory,
      });
    } catch (error) {
      console.error('Error creating ticket category:', error);

      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Get Ticket Category by ID
   * GET /api/ticket-categories/:id
   */
  async getTicketCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Ticket Category ID is required',
        });
      }

      const ticketCategory = await ticketCategoryService.getTicketCategoryById(
        id
      );

      return res.status(200).json({
        success: true,
        data: ticketCategory,
      });
    } catch (error) {
      console.error('Error fetching ticket category:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Get all Ticket Categories with pagination and filters
   * GET /api/ticket-categories?skip=0&take=10&status=Active&catalogName=IT
   */
  async getAllTicketCategories(req, res) {
    try {
      const { skip = 0, take = 10, status, catalogName, ticketCategoryId } =
        req.query;

      const skipNum = Math.max(0, parseInt(skip) || 0);
      const takeNum = Math.max(1, Math.min(100, parseInt(take) || 10));

      const result = await ticketCategoryService.getAllTicketCategories(
        skipNum,
        takeNum,
        {
          status,
          catalogName,
          ticketCategoryId,
        }
      );

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          hasMore: result.page * result.pageSize < result.total,
        },
      });
    } catch (error) {
      console.error('Error fetching ticket categories:', error);

      return res.status(500).json({
        route: 'getAllTicketCategories',
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Update Ticket Category
   * PUT /api/ticket-categories/:id
   */
  async updateTicketCategory(req, res) {
    try {
      const { id } = req.params;
      const { catalogName, status, validFrom, validTo } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Ticket Category ID is required',
        });
      }

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      // Validate and parse dates if provided
      let validFromDate;
      let validToDate;

      if (validFrom) {
        validFromDate = new Date(validFrom);
        if (Number.isNaN(validFromDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid validFrom date format',
          });
        }
      }

      if (validTo !== undefined) {
        if (validTo) {
          validToDate = new Date(validTo);
          if (Number.isNaN(validToDate.getTime())) {
            return res.status(400).json({
              success: false,
              message: 'Invalid validTo date format',
            });
          }
        } else {
          validToDate = null;
        }
      }

      const ticketCategory = await ticketCategoryService.updateTicketCategory(
        id,
        {
          catalogName,
          status,
          validFrom: validFromDate,
          validTo: validToDate,
          changedById: req.user.id,
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Ticket Category updated successfully',
        data: ticketCategory,
      });
    } catch (error) {
      console.error('Error updating ticket category:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Delete Ticket Category (soft delete)
   * DELETE /api/ticket-categories/:id
   */
  async deleteTicketCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Ticket Category ID is required',
        });
      }

      await ticketCategoryService.deleteTicketCategory(id);

      return res.status(200).json({
        success: true,
        message: 'Ticket Category deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting ticket category:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * Search Ticket Categories
   * GET /api/ticket-categories/search?q=IT
   */
  async searchTicketCategories(req, res) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      const results = await ticketCategoryService.searchTicketCategories(q);

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error('Error searching ticket categories:', error);

      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }
}

module.exports = new TicketCategoryController();
