const validate = (schema) => (req, res, next) => {
  try {
    console.log("Validating request body:", req.body);
    
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      console.log("Validation errors:", result.error.errors);
      
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }
    
    // Add validated data to request
    req.validatedData = result.data;
    next();
  } catch (err) {
    console.error("Validation middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal validation error"
    });
  }
};

module.exports = validate;