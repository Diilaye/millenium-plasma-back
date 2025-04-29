import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
    status?: number;
}

export const errorHandler = (
    err: CustomError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error(`[Erreur] ${err.message}`);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Une erreur interne est survenue.",
    });
};
