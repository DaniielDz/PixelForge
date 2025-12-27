import { Request, Response, NextFunction } from 'express';

export const fileRequired = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'fail',
      error: 'File is required',
      message: 'Please upload an image file',
    });
  }
  next();
};
