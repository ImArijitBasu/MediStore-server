import { NextFunction, Request, Response } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get("User-Agent"),
    referrer: req.get("Referer"),
    contentType: req.get("Content-Type"),
    contentLength: req.get("Content-Length"),
    host: req.get("Host"),
    };
    res.status(404).json({
      success: false,
      message: "Resource not found",
      error: errorDetails,
    });
};
